import React, { useState, useEffect } from 'react';

import { Eth } from "web3x-es/eth";
import BigNumber from "bignumber.js";
import { LegacyProviderAdapter } from "web3x-es/providers";
import _bancorSdk from "bancor-sdk";
import { addresses } from "../env";

window.bancor = {
    eth : undefined,// ethereum instance
    installed : false,// metamask is installed on user's browser
    accepted : false,// user has accepted this website on metamask
    account : undefined,// current account address
    networkId : undefined,// current networkId
    bancorSdk : _bancorSdk,// bancor sdk's instance
    isLoggedIn : (v) => !!v,// is user logged in (account exists)
    bytecodes: {},
    abis: {},
    normal_abis: {},
}


export let networkId = window.bancor.networkId
export let eth = window.bancor.eth

export const getEth = async () => {
    let _eth = undefined;

    if (window.ethereum) {
        console.log(`Injected ethereum detected.`);
        _eth = new Eth(new LegacyProviderAdapter(window.ethereum));
    } else if (window.web3) {
        console.log(`Injected web3 detected.`);
        _eth = new Eth(new LegacyProviderAdapter(window.web3.currentProvider));
    }

    if (_eth) {
        window.bancor.eth = _eth;
        window.bancor.installed = true;
    }

    return _eth;
};

export const getNetworkId = async () => {
    const _eth = window.bancor.eth;
    if (!_eth) return undefined;

    return _eth.getId();
};

export const getAccept = async () => {
    const _accepted = await new Promise(resolve => {
        if (window.ethereum) {
            console.log("Requesting accept.");

            return window.ethereum
                .enable()
                .then(() => {
                    console.log(`Accepted.`);

                    resolve(true);
                })
                .catch(error => {
                    console.error(error);
                    console.log(`Rejected.`);

                    resolve(false);
                });
        }

        resolve(true);
    });

    if (_accepted) {
        window.bancor.accepted = _accepted
        await sync();
    }

    return _accepted;
};

export const getAccount = async () => {
    const accounts = (await window.bancor.eth.getAccounts()) || [];

    return accounts[0] || undefined;
};

// check and update data
export const sync = async () => {
  console.log('check and update data');
    const _networkId = await getNetworkId();
    window.bancor.networkId = _networkId
    const _account = await getAccount();
    window.bancor.account = _account
    console.log('got network', _account, _networkId, addresses[_networkId]);
    await window.bancor.bancorSdk.init({
        ethereumNodeEndpoint:
            _networkId == 1 ? "https://mainnet.infura.io/v3/ec2c4801bcf44d9daa49f2e541851706" : "https://ropsten.infura.io/v3/ec2c4801bcf44d9daa49f2e541851706",
            ethereumContractRegistryAddress: addresses[_networkId]
    });
};

// initialize and subscribe to ethereum events
export const init = async () => {
    console.log('init app');

    const _eth = await getEth();
    await sync();

    if (window.ethereum) {
        window.ethereum.on("accountsChanged", accounts => {
            window.bancor.account = accounts[0] || undefined
        });

        window.ethereum.on("networkChanged", _networkId => {
            console.log('networkChanged',_networkId);
            window.bancor.networkId = _networkId
        });
    } else {
        setInterval(sync, 1e3);
    }

    return _eth;
};


export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const fromDecimals = (amount, decimals) => {
    return new BigNumber(amount).dividedBy(10 ** Number(decimals)).toString(10);
};

export const toDecimals = (amount, decimals) => {
    return new BigNumber(amount)
        .multipliedBy(10 ** Number(decimals))
        .toString(10);
};

export const toFixed = amount => {
    const amountInt = Number(amount);

    if (!amount || amountInt === 0) {
        return "0";
    } else if (amountInt > 0.001) {
        return String(amountInt.toFixed(5));
    } else {
        return "<0.001";
    }
};

function jsonParse(txt){
    if (txt) {
        try {
            return JSON.parse(txt)
        } catch (e) {
            return []
        }
    }
    else return []
}

export const useStateWithLocalStorage = localStorageKey => {
    const [item, setItem] = React.useState(
        jsonParse(localStorage.getItem(localStorageKey)) || []
    );
    React.useEffect(() => {
        console.log('item updated', item);
        localStorage.setItem(localStorageKey, JSON.stringify(item));
    }, [item]);

    return [item, setItem];
};
