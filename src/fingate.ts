import BigNumber from "bignumber.js";
import fingateABI from "./abi/fingateABI";
import PromisifyBatchRequest from "./promisifyBatchRequest";
import ERC20 from "./erc20";
import Ethereum from "./ethereum";
import SmartContract from "./smartContract";
import { isValidAmount, isValidEthereumAddress, isValidEthereumSecret, isValidHash, isValidJingtumAddress, validate } from "./validator";

/**
 * Toolkit of Erc20Fingate
 *
 * @export
 * @class Erc20Fingate
 * @extends {EthereumFingate}
 */
class Fingate extends SmartContract {
  /**
   * ether gas limit
   *
   * @private
   * @type {number}
   * @memberof Fingate
   */
  private _etherGasLimit: number;

  private _erc20: ERC20;

  /**
   * Creates an instance of ERC20
   * @memberof Fingate
   */
  constructor() {
    super();
    this._etherGasLimit = 150000;
  }

  /**
   * set & get _etherGasLimit
   *
   * @memberof EtherFingate
   */
  public set etherGasLimit(v: number) {
    this._etherGasLimit = v;
  }

  public get etherGasLimit(): number {
    return this._etherGasLimit;
  }

  /**
   * init erc20 contract
   *
   * @param {string} etherContractAddress ether fingate address
   * @param {string} tokenContractAddress contract address of erc20 token
   * @memberof Erc20Fingate
   */
  @validate
  public init(@isValidEthereumAddress fingateAddress: string, ethereum: Ethereum) {
    super.init(fingateAddress, ethereum, fingateABI);
  }

  public initErc20(erc20: ERC20) {
    this._erc20 = erc20;
  }

  /**
   * destroy instance of contract
   *
   * @memberof Fingate
   */
  public destroy() {
    super.destroy();
  }

  /**
   * check state if pending
   *
   * @param {((BigNumber | string)[])} state
   * @returns {boolean} return true if state is pending
   * @memberof Fingate
   */
  public isPending(state: (BigNumber | string)[]): boolean {
    return state[0].toString(10) !== "0" || state[1] !== "";
  }

  /**
   * request deposit state
   *
   * @param {string} address ethereum address
   * @param {string} [contractAddress="0x0000000000000000000000000000000000000000"] contract address
   * @returns {(Promise<(BigNumber | string)[]>)}
   * @memberof Fingate
   */
  @validate
  public async depositState(@isValidEthereumAddress address: string, @isValidEthereumAddress contractAddress = "0x0000000000000000000000000000000000000000"): Promise<(BigNumber | string)[]> {
    address = Ethereum.prefix0x(address);
    const state = await super.callABI("depositState", contractAddress, address);
    return state;
  }

  /**
   * deposit ether
   *
   * @param {string} secret ethereum secret
   * @param {string} jingtumAddress jingtum address
   * @param {string} amount deposit value
   * @param {string} [nonce] nonce
   * @returns {Promise<string>} resolve hash if success
   * @memberof Fingate
   */
  @validate
  public async deposit(@isValidEthereumSecret secret: string, @isValidJingtumAddress jingtumAddress: string, @isValidAmount amount: string, nonce?: number): Promise<string> {
    const address = Ethereum.getAddress(secret);
    const calldata = await super.callABI("deposit", jingtumAddress);
    const gasPrice = await this.ethereum.getGasPrice();
    nonce = new BigNumber(nonce).isInteger() ? nonce : await this.ethereum.getNonce(address);
    const tx = this.ethereum.getTx(address, this.contractAddress, nonce, this.etherGasLimit, gasPrice, amount, calldata);
    const sign = await this.ethereum.signTransaction(tx, secret);
    const hash = await this.ethereum.sendSignedTransaction(sign);
    return hash;
  }

  /**
   * deposit erc20 token
   *
   * @param {string} jtAddress swtc address
   * @param {string} tokenAddress erc20 contract address
   * @param {number} decimals token decimals
   * @param {string} amount amount of deposit
   * @param {string} hash generated by `transfer` api of ERC20
   * @param {string} secret ethereum secret
   * @param {string} [nonce] nonce
   * @returns {Promise<string>} reslove hash of transaction if success
   * @memberof Fingate
   */
  @validate
  public async depositToken(@isValidJingtumAddress jtAddress: string, @isValidEthereumAddress tokenAddress: string, decimals: number, @isValidAmount amount: string, @isValidHash hash: string, @isValidEthereumSecret secret: string, nonce?: number): Promise<string> {
    const value = this.ethereum.getWeb3().utils.numberToHex(new BigNumber(amount).multipliedBy(10 ** decimals).toString(10));
    const address = Ethereum.getAddress(secret);
    nonce = new BigNumber(nonce).isInteger() ? nonce : await this.ethereum.getNonce(address);
    const gasPrice = await this.ethereum.getGasPrice();
    const calldata = await super.callABI("depositToken", jtAddress, tokenAddress, value, hash);
    const tx = this.ethereum.getTx(address, this.contractAddress, nonce, 450000, gasPrice, "0", calldata);
    const sign = await this.ethereum.signTransaction(tx, secret);
    const txHash = await this.ethereum.sendSignedTransaction(sign);
    return txHash;
  }

  /**
   * deposit erc20
   *
   * @param {string} secret ethereum secret
   * @param {string} jtAddress jingtum address
   * @param {string} amount deposit value
   * @param {string} [nonce] nonce
   * @returns {Promise<string[]>} resolve hashs if success
   * @memberof Fingate
   */
  @validate
  public async depositErc20(@isValidEthereumSecret secret: string, @isValidJingtumAddress jtAddress: string, @isValidAmount amount: string, nonce?: number): Promise<string[]> {
    const decimals = await this._erc20.decimals();
    const web3 = this.ethereum.getWeb3();
    const sender = Ethereum.getAddress(secret);
    const value = web3.utils.toHex(new BigNumber(amount).multipliedBy(10 ** decimals).toString(10));
    const gasPrice = await this.ethereum.getGasPrice();
    nonce = new BigNumber(nonce).isInteger() ? nonce : await this.ethereum.getNonce(sender);
    const calldata = await this._erc20.callABI("transfer", this.contractAddress, value);
    const tx = this.ethereum.getTx(sender, this._erc20.contractAddress, nonce, 90000, gasPrice, "0", calldata);
    const sign = await this.ethereum.signTransaction(tx, secret);
    const hash = web3.utils.sha3(sign);

    const calldata1 = await super.callABI("depositToken", jtAddress, this._erc20.contractAddress, value, hash);
    const tx1 = this.ethereum.getTx(sender, this.contractAddress, nonce + 1, 450000, gasPrice, "0", calldata1);
    const sign1 = await this.ethereum.signTransaction(tx1, secret);

    const batch = new PromisifyBatchRequest(web3.BatchRequest);
    batch.add(web3.eth.sendSignedTransaction.request, sign);
    batch.add(web3.eth.sendSignedTransaction.request, sign1);
    const receipts = await batch.execute();
    return receipts;
  }
}

export default Fingate;
