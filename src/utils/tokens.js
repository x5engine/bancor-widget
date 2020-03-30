import { bufferToHex, utf8ToHex } from "web3x-es/utils";
// import * as ethStore from "./eth";
import { safeFetch } from "./safeFetch";
import Contract from "./Contract";
import resolve from "./resolve";
import { fromDecimals, toDecimals } from "./eth";
window.contracts = {
    contractRegistry : undefined,// contractRegistry instance
    converterRegistry : undefined,// converterRegistry instance
    bancorNetwork : undefined,// bancorNetwork instance
    bntToken : undefined,// bancorNetwork's token instance
    fetchingTokens: false,// are we currently fetching tokens
    tokens: new Map(),// all tokens keyed by address
}

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

// get relevant token data
export const getTokenData = async (eth, address) => {
    const _bancorNetwork = get("bancorNetwork");
    const _bntToken = get("bntToken");

    const token = await Contract(eth, "ERC20Token", address);

    const [name, symbol, decimals = 18, isEth] = await allSkippingErrors([
        token.methods.name().call(),
        token.methods.symbol().call(),
        token.methods.decimals().call(),
        _bancorNetwork.methods.etherTokens(token.address).call(),
        // getTokenImgByBancor(symbol)
    ]);

    const img = await getTokenImgByBancor(symbol);
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
    { showRelayTokens = false, addresses = {} }, getTokens
) => {
    set('tokens', new Map())
    console.log('init tokens');
    
    const _networkId = window.bancor.networkId;
    // only mainnet or localhost
    if (!addresses[_networkId]) return;

    const ContractRegistryAddr = addresses[_networkId];

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
