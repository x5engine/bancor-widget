import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Authereum from 'authereum';
import Torus from "@toruslabs/torus-embed";

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: '1a3489db693d46ceb5ef9006f5ada61f'
        }
    },
    authereum: {
        package: Authereum,
        options: {}
    },
    torus: {
        package: Torus,
        options: {}
    },
};

const getWeb3 = () => (
    new Promise(async (resolve, reject) => {
        try {
            const web3Modal = new Web3Modal({
                network: 'mainnet',
                cacheProvider: true,
                providerOptions
            })
            // web3Modal.clearCachedProvider()
            // if (web3Modal.cachedProvider) {
            //     await web3Modal.connect();
            // }

            const provider = await web3Modal.connect()
            let web3 = new Web3(provider)
            window.bancor.web3 = web3;
            return resolve(web3)
        } catch (e) {
            return resolve(e)
        }
    })
);

export default getWeb3;