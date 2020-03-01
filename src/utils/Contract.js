/*
  create a contract instance of name and address
  abi is downloaded from Bancor's github
  abi is cached
*/

import { Contract as EthContract, ContractAbi } from "web3x-es/contract";
import {safeFetch, textFetch} from "./safeFetch";
import { commit } from "../env";

const abis = {};

const Contract = async (eth, name, address) => {
    if (!window.bancor.abis[name]) {
        const url = `https://rawcdn.githack.com/bancorprotocol/contracts/${commit}/solidity/build/${name}.abi`;

        window.bancor.abis[name] = await safeFetch(url).then(abi => new ContractAbi(abi));
        window.bancor.normal_abis[name] = await safeFetch(url).then(abi => abi);
    }
    // console.log(abis,eth,address);

    if (!address && !window.bancor.bytecodes[name]) {
        const url = `https://rawcdn.githack.com/bancorprotocol/contracts/${commit}/solidity/build/${name}.bin`;

        window.bancor.bytecodes[name] = await safeFetch(url)
            .then(res => res.text())
            .then(bytecode => "0x" + bytecode);
    }
    const contract = new EthContract(eth, window.bancor.abis[name], address, {});
    // console.log('============contract========================');
    // console.log(contract);
    // console.log('====================================');
    return contract
};

export const getBytecode = async (name) => {
    if (!window.bancor.bytecodes[name]) {
        // const url = `https://rawcdn.githack.com/bancorprotocol/contracts/${commit}/solidity/build/${name}.bin`;
        const url = `https://raw.githubusercontent.com/bancorprotocol/contracts/master/solidity/build/${name}.bin`;

        let res = await fetch(url)
        res = await res.text()
        window.bancor.bytecodes[name] = "0x"+res
            // .then(res => {
            //     console.log("bytecodes",res);
                
            //     res.text()
            // })
            // .then(bytecode => "0x" +bytecode);
        // console.log("bytecodes", window.bancor.bytecodes[name]);
        return window.bancor.bytecodes[name]
    }
    else 
        return window.bancor.bytecodes[name]
};
export const getAbi = name => window.bancor.abis[name];
export const getNomralAbi = async (name) => {
    if (!window.bancor.normal_abis[name]) {
        const url = `https://raw.githubusercontent.com/bancorprotocol/contracts/master/solidity/build/${name}.abi`; 
        let res = await fetch(url)
        res = await res.json()
        console.log(res,'abi');
        
        window.bancor.normal_abis[name] = res
        return res
    }
    else return window.bancor.normal_abis[name]
};

export default Contract;
