# jcc-ethereum-utils

Toolkit of crossing chain from Ethereum to SWTC chain

![npm](https://img.shields.io/npm/v/jcc-ethereum-utils.svg)
[![Build Status](https://travis-ci.com/JCCDex/jcc-ethereum-utils.svg?branch=master)](https://travis-ci.com/JCCDex/jcc-ethereum-utils)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc-ethereum-utils/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc-ethereum-utils?branch=master)
[![Dependencies](https://img.shields.io/david/JCCDex/jcc-ethereum-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-ethereum-utils)
[![DevDependencies](https://img.shields.io/david/dev/JCCDex/jcc-ethereum-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-ethereum-utils?type=dev)
[![npm downloads](https://img.shields.io/npm/dm/jcc-ethereum-utils.svg)](http://npm-stat.com/charts.html?package=jcc-ethereum-utils)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Description

Transfer token automatically from [Ethereum](https://www.ethereum.org/) to [SWTC](http://swtc.top/index.html#/) chain. Support ether and erc20 tokens.

e.g. you transfer 1 `eth` to [Ethereum Fingate](https://etherscan.io/address/0x3907acb4c1818adf72d965c08e0a79af16e7ffb8) from your ethereum address, If success the contract will automatically transfer 1 `jeth` to your swtc address from [Jingtum Fingate](https://swtcscan.jccdex.cn/#/wallet/?wallet=jsk45ksJZUB7durZrLt5e86Eu2gtiXNRN4) in a few minutes.

## Support token list of erc20

* [USDT](https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7)
* [JCC](https://etherscan.io/address/0x9BD4810a407812042F938d2f69f673843301cfa6)
* [EKT](https://etherscan.io/address/0xBAb165dF9455AA0F2AeD1f2565520B91DDadB4c8)
* [DABT](https://etherscan.io/address/0x1C6890825880566dd6Ad88147E0a6acE7930b7c0)
* [BIZ](https://etherscan.io/address/0x399f9A95305114efAcB91d1d6C02CBe234dD36aF)
* [SLASH](https://etherscan.io/address/0xE222e2e3517f5AF5e3abc667adF14320C848D6dA)
* [GSGC](https://etherscan.io/address/0x0ec2a5ec6a976d6d4c101fb647595c9d8d21779e)

***If you wanna we support other erc20 token, please contact us.***

## Installtion

```shell
npm i jcc-ethereum-utils
```

## Usage

```javascript

// demo
import { EtherFingate, Erc20Fingate } from "jcc-ethereum-utils";

// Ethereum node
const node = "https://eth626892d.jccdex.cn";

// Production network or not
const production = true;

// Your ethereum secret
const ethereumSecret = '';

// Your ethereum address
const ethereumAddress = '';

// Your swtc address
const swtcAddress = '';

// Deposit amount
const amount = 1;

// Ethereum fingate contract address, don't change it.
const scAddress = '0x3907acb4c1818adf72d965c08e0a79af16e7ffb8';

try {
    // deposit 1 ETH
    const inst = new EtherFingate(node, production);
    inst.initEtherContract(scAddress);

    // Check if has pending order, if has don't call the next deposit api
    const state = await inst.depositState(moacAddress);

    if (inst.isPending(state)) {
        return;
    }

    // start to transfer 1 ETH to fingate address
    const hash = await inst.deposit(ethereumSecret, swtcAddress, amount);
    console.log(hash);
} catch (error) {
    console.log(error);
}

// deposit erc20 token

try {
    // deposit 1 JCC

    // JCC contract address
    const jccContractAddress = "0x9BD4810a407812042F938d2f69f673843301cfa6";

    const inst = new Erc20Fingate(node, production);

    inst.initErc20Contract(scAddress, jccContractAddress);

    // Check if has pending order, if has don't call transfer api
    const state = await inst.depositState(ethereumAddress, jccContractAddress);

    if (inst.isPending(state)) {
        return;
    }
    // Please set decimals of erc20 token, if not will throw an error.
    inst.decimals = 18;

    // The first step to transfer 1 JCC to jcc contract address.
    const transferHash = await inst.transfer(amount, secret);

    // The next step to submit previous transfer hash.
    const depositHash = await inst.depositToken(swtcAddress, amount, transferHash, ethereumSecret);
    console.log(depositHash);

    // Warning:
    // This is not an atomic operating to deposit erc20 tokens for now,
    // If the first step is successful but next step is failed, please contact us.
    // The next version will make it an atomic operating after the next version of solidity contract upgrade.
} catch (error) {
    console.log(error);
}

```
