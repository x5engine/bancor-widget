import { bufferToHex, utf8ToHex } from "web3x-es/utils";
// import * as ethStore from "./eth";
import { safeFetch } from "./safeFetch";
import Contract from "./Contract";
import resolve from "./resolve";
import { fromDecimals, toDecimals } from "./eth";

import Web3 from 'web3';
const web3 = new Web3(Web3.givenProvider);
const Decimal = require('decimal.js');
const BigNumber = require('bignumber.js');

const BancorConverter = require('../abis/BancorConverter.json');
const ERC20Token = require('../abis/ERC20Token.json');
const EtherToken = require('../abis/EtherToken.json');

window.contracts = {
    contractRegistry : undefined,// contractRegistry instance
    converterRegistry : undefined,// converterRegistry instance
    bancorNetwork : undefined,// bancorNetwork instance
    bntToken : undefined,// bancorNetwork's token instance
    fetchingTokens: false,// are we currently fetching tokens
    tokens: new Map(),// all tokens keyed by address
    web3,
}

let eth = window.bancor.eth

let contractRegistry = window.contracts.contractRegistry
const get = key => window.contracts[key]
const set = (key, val) => {window.contracts[key] = val}


// using Bancor's API, get token's img url
export const getTokenImgByBancor = async symbol => {
    return safeFetch(`https://api.bancor.network/0.1/currencies/${symbol}`).then(
        res => {
            if (!res || !res.data) return;

            const imgFile = res.data.primaryCommunityImageName || "";
            const [name, ext] = imgFile.split(".");


            const img = `https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/${name}_200w.${ext}`;
            // console.log('====================================');
            // console.log(res.data,img);
            // console.log('====================================');
            return img
        }
    );
};

function allSkippingErrors(promises) {
    return Promise.all(
        promises.map(p => p.catch(error => null))
    )
}

export const getSmartTokenData = async (address) => {
    const smartToken = new web3.eth.Contract(window.bancor.normal_abis.SmartToken, address)
    console.log("smarToken", smartToken);
    const [totalSupply, symbol, decimals = 18, owner ] = await allSkippingErrors([
        smartToken.methods.totalSupply().call(),
        smartToken.methods.symbol().call(),
        smartToken.methods.decimals().call(),
        smartToken.methods.owner().call(),
    ]);

    return {
        totalSupply,
        symbol,
        decimals,
        owner
    }
}

export const getSmartTokenSymbol = async (address) => {
    const smartToken = new web3.eth.Contract(window.bancor.normal_abis.SmartToken, address)
    // console.log("smarToken", smartToken);

    const [symbol] = await allSkippingErrors([
        smartToken.methods.symbol().call(),
    ]);
    return symbol
}

// get relevant token data
export const getTokenData = async (eth, address, noImage = false) => {
    const _bancorNetwork = get("bancorNetwork");
    const _bntToken = get("bntToken");
    let img = '';
    const token = await Contract(eth, "ERC20Token", address);

    const [name, symbol, decimals = 18, isEth] = await allSkippingErrors([
        token.methods.name().call(),
        token.methods.symbol().call(),
        token.methods.decimals().call(),
        _bancorNetwork.methods.etherTokens(token.address).call(),
        // getTokenImgByBancor(symbol)
    ]);

    if(!noImage)
        img = await getTokenImgByBancor(symbol);
    // const img = `https://rawcdn.githack.com/crypti/cryptocurrencies/ed13420a6b22b25bbed53e2cbe6d8db302ec0c6a/images/${symbol}.png`;

    return {
        address,
        name,
        symbol,
        img,
        decimals,
        toSmallestAmount: amount => toDecimals(amount, decimals),
        toDisplayAmount: amount => fromDecimals(amount, decimals),
        isEth,
        isBNT: token.address === _bntToken.address
    };
};

export const init = async (
    eth,
    { showRelayTokens = false, addresses = {} }, getTokens = true
) => {
    set('tokens', new Map())
    console.log('init tokens');

    const _networkId = window.bancor.networkId;
    // only mainnet or localhost
    console.log("addresses", addresses);
    if (!addresses[_networkId]) return;


    const ContractRegistryAddr = addresses[_networkId];
    console.log("addresses", ContractRegistryAddr);
    // initialize contracts
    const _contractRegistry = await Contract(
        eth,
        "ContractRegistry",
        ContractRegistryAddr
    );
    set("contractRegistry", _contractRegistry)
    // get other contract's addresses using contractRegistry
    const [
        BancorNetworkAddr,
        BNTTokenAddr,
        ConverterRegistryAddr
    ] = await Promise.all([
        _contractRegistry.methods
            .addressOf(utf8ToHex("BancorNetwork"))
            .call()
            .then(res => bufferToHex(res.buffer)),
        _contractRegistry.methods
            .addressOf(utf8ToHex("BNTToken"))
            .call()
            .then(res => bufferToHex(res.buffer)),
        _contractRegistry.methods
            .addressOf(utf8ToHex("BancorConverterRegistry"))
            .call()
            .then(res => bufferToHex(res.buffer))
            .then(res => {
                // TODO: remove hardcoded address
                return "0xf6E2D7F616B67E46D708e4410746E9AAb3a4C518";
            })
    ]);

    const _bancorNetwork = await Contract(
        eth,
        "BancorNetwork",
        BancorNetworkAddr
    );
    set('bancorNetwork', _bancorNetwork)

    const _bntToken = await Contract(eth, "SmartToken", BNTTokenAddr);
    set('bntToken', _bntToken)

    const _converterRegistry = await Contract(
        eth,
        "BancorConverterRegistry",
        ConverterRegistryAddr
    );
    set('converterRegistry', _converterRegistry)

    try {
        set('fetchingTokens', true)
        // console.log("fetchingTokens");
        let tokensAddress = []
        // fetch all erc20 tokens
        if (getTokens) {
            tokensAddress = await _converterRegistry.methods
            .getConvertibleTokens()
            .call()
            .then(res => {
                return res.map(res => bufferToHex(res.buffer)).reverse();
            });
        }
        // fetch all relay tokens
        if (showRelayTokens ) {
            tokensAddress = tokensAddress.concat(
                await _converterRegistry.methods
                    .getSmartTokens()
                    .call()
                    .then(res => {
                        return res.map(res => bufferToHex(res.buffer));
                    })
            );
        }

        const tokens = await Promise.all(tokensAddress.map(async (tokenAddress, i) => await getTokenData(eth, tokenAddress)))
        return tokens
        // return resolve(
        //     tokensAddress.map(async (tokenAddress, i) => await getTokenData(eth, tokenAddress))
        //     // tokensAddress.map((tokenAddress, i) => ({
        //     //     id: i,
        //     //     fn: async () => {
        //     //         const data = await getTokenData(eth, tokenAddress);
        //     //         // console.log("getTokenData",data);

        //     //         window.contracts.tokens.set(tokenAddress, data);
        //     //     }
        //     // }))
        // );
    } catch (error) {
        console.error(error);
    } finally {
        set('fetchingTokens', false)
        console.log('tokens loaded', window.contracts.tokens);
    }
};

export const getConverterData = async(address) => {
    const BCC = new web3.eth.Contract(BancorConverter, address);

    const [connectorTokenCount, token1 ] = await allSkippingErrors([
        BCC.methods.connectorTokenCount().call(),
        BCC.methods.connectorTokens(0).call(),
        BCC.methods.decimals().call(),
    ]);

    const [connectorReserveRatio, connectorReserveBalance] = await allSkippingErrors([
        BCC.methods.getReserveRatio(token1).call(),
        BCC.methods.getReserveBalance(token1).call(),
    ]);
    console.log("token1 converter data", token1);

    return {
        connectorBalance: fromDecimals(connectorReserveBalance, 18),
        connectorWeight: connectorReserveRatio / 10000,
        numConnectors: connectorTokenCount,
        connectorAdress: token1,
    };
}



export const getER20Data = async(address) => {
  const token = new web3.eth.Contract(ERC20Token, address);
  const senderAddress = web3.currentProvider.selectedAddress;

  const [decimals, symbol] = await allSkippingErrors([
      token.methods.decimals().call(),
      token.methods.symbol().call(),
  ]);

  const [ balance ] = await allSkippingErrors([
       token.methods.balanceOf(senderAddress).call()
  ]);
// symbol = 'ETH' ? web3.eth.getBalance(senderAddress) :
  return {
    decimals,
    symbol,
    balance
  }
}

export const getPoolReserves = async(address) => {
    const BCC = new web3.eth.Contract(BancorConverter, address);

    const [connectorTokenCount] = await allSkippingErrors([
        BCC.methods.connectorTokenCount().call(),
    ]);

    if( !connectorTokenCount || isNaN(connectorTokenCount) || parseInt(connectorTokenCount) == 0) return {
      connectorTokenCount,
    };

    let tokens = await allSkippingErrors([...Array(parseInt(connectorTokenCount)).keys()].map((index)=>{
      return BCC.methods.connectorTokens(index).call()
    }))

    let tokensInfo = await allSkippingErrors(tokens.map((tokenAddress)=>{
      return getER20Data(tokenAddress)
    }));

    console.log('tokensInfo', tokensInfo);

    const tokenBalances = await allSkippingErrors(tokens.flatMap( (t, index)=>{
      return  [ BCC.methods.getReserveBalance(t).call() ]
    }))

    const tokenRatios = await allSkippingErrors(tokens.flatMap( (t, index)=>{
      return [ BCC.methods.getReserveRatio(t).call() ]
    }))

    // console.log("token1 converter data", token1);
    let result = tokens.map((t,index)=>{
      return {
        address: t,
        ...tokensInfo[index],
        reserveRatio: tokenRatios[index],
        reserveBalance: tokenBalances[index],
      }
    })
    return result
    // return {
    //   tokens,
    //   tokensInfo,
    //   tokensData
    // };
}

export const getBalanceOfToken = async (tokenAddress, isEth) => {
    const web3 = window.web3;
    const senderAddress = web3.currentProvider.selectedAddress;

    if (senderAddress === undefined || senderAddress === null) {
        return "0";
    }
    if (!isEth) {
        const erc20Contract = new web3.eth.Contract(ERC20Token, tokenAddress);
        // const erc20Contract = await Contract(eth, "ERC20Token", tokenAddress);
        const addressBalanceResponse = await erc20Contract.methods.balanceOf(senderAddress).call()
        return addressBalanceResponse
    } else {
        return await web3.eth.getBalance(senderAddress)
    }
}

export const submitPoolBuy = (args, setAllDone) => {
  const senderAddress = web3.currentProvider.selectedAddress;
  const ConverterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);
  setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval'})
  let resNeededApproval = args.reservesNeeded.map(function(item){
    let reserveContract = {};
    if (item.symbol === 'ETH') {
      reserveContract = new web3.eth.Contract(EtherToken, item.address);
      const reserveAmount = item.neededMin;

      // if amount to deposit is > balance then deposit remainder
      return reserveContract.methods.balanceOf(senderAddress).call().then(function(userBalance){
      if ((new Decimal(userBalance)).lessThan(new Decimal(reserveAmount))) {

      return reserveContract.methods.deposit().send({from: senderAddress, value: reserveAmount}, (err, txHash)=>{
              setPoolTransactionStatus({type: 'pending', message: 'Depositing Ether into contract.'})
      }).then(function(response){
        return getApproval(reserveContract, senderAddress, args.converterAddress, reserveAmount).then((res)=>{
          setAllDone(true)
          return response;
        });

      });

      } else {
           return getApproval(reserveContract, senderAddress, args.converterAddress, reserveAmount).then((res)=>{
             setAllDone(true)
          return res;
        });
      }
      });
    } else {
      reserveContract = new web3.eth.Contract(ERC20Token, item.address);
      const reserveAmount = item.neededMin;
      return getApproval(reserveContract, senderAddress,  args.converterAddress, reserveAmount).then((res)=>{
        setAllDone(true)
        return res;
      })
    }
  });

  Promise.all(resNeededApproval).then(function(approvalResponse){
      ConverterContract.methods.fund(args.poolTokenProvided).send({
        from: senderAddress
      }, function(err, txHash){
        setPoolTransactionStatus({type: 'pending', message: 'Funding pool with reserve tokens'})
      }).then(function(fundRes){
        setPoolTransactionStatus({type: 'success', message: 'Successfully Funded pool with reserve tokens'})
      })
  })


}

const setPoolTransactionStatus = (msg) =>{
  console.log('msg',msg);
}
export const getApproval = (contract, owner, spender, amount) => {

  return contract.methods.decimals().call().then(function(amountDecimals){
  return contract.methods.allowance(owner, spender).call().then(function(allowance) {
    if (!allowance || typeof allowance === undefined) {
      allowance = 0;
    }
    let minAmount = amount;
    let minAllowance = allowance;

    let diff = new BigNumber(minAllowance).minus(new BigNumber(minAmount));

    const amountAllowed = new Decimal(minAllowance);
    const amountNeeded = new Decimal(minAmount);

    if (amountNeeded.greaterThan(amountAllowed) &&  amountAllowed.isPositive() && !amountAllowed.isZero()) {
      setPoolTransactionStatus({type: 'pending', message: 'Previous user allowance found. reseting allowance'})
      return contract.methods.approve(web3.utils.toChecksumAddress(spender), 0).send({
        from: owner
      }).then(function(approveResetResponse){
      setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval for token transfer'})
    return contract.methods.approve(web3.utils.toChecksumAddress(spender), amount).send({
       from: owner
    }, function(err, txHash){
      setPoolTransactionStatus({type: 'pending', message: 'Appoving token transfer'})
    }).then(function(allowanceResponse){
        setPoolTransactionStatus({type: 'pending', message: 'Token transfer approved.'})
      return allowanceResponse;
    })
    });
    } else if (amountNeeded.greaterThan(amountAllowed) &&  amountAllowed.isZero()) {
      setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval for token transfer'})
        return contract.methods.approve(web3.utils.toChecksumAddress(spender), amount).send({
           from: owner
        }, function(err, txHash){
          setPoolTransactionStatus({type: 'pending', message: 'Appoving token transfer'})
        }).then(function(allowanceResponse){
            setPoolTransactionStatus({type: 'pending', message: 'Token transfer approved.'})
          return allowanceResponse;
        })
    } else {
      return null;
    }
  });
  });
}

const addLiquidity = () => {
    const x = window.contracts.converterRegistry
    // const b1 = await x.methods.getConvertibleTokens().call()
    // const b2 = await x.methods.getConvertersBySmartTokens(smt).call()
    // https://github.com/pRoy24/katanapools/blob/7823606424d295aa4e315c5c8e308bd8761b2eaf/src/utils/RegistryUtils.js#L194
}

// https://etherscan.io/token/images/sirin_28.png
// https://xnation.io/eth/pool/DAIBNT
