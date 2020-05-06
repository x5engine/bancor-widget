import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Torus from "@toruslabs/torus-embed";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";


const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: '1a3489db693d46ceb5ef9006f5ada61f'
        }
    },
    torus: {
        package: Torus,
        options: {
            config: {
                enableLogging: false, // optional
                buttonPosition: "bottom-left", // optional
                buildEnv: "production", // optional
                showTorusButton: true, // optional
                enabledVerifiers: {
                    // optional
                    google: true,
                    facebook: true,
                    twitch: true,
                    reddit: true,
                    discord: true,

                }
            }
        }
    },
    portis: {
        package: Portis, // required
        options: {
            id: "PORTIS_ID" // required
        }
    },
    fortmatic: {
        package: Fortmatic, // required
        options: {
            key: "FORTMATIC_KEY" // required
        }
    },
};

export const getNetworkId = async () => {
    const _eth = window.bancor.eth;
    if (!_eth) return undefined;

    return _eth.getId();
};

const getWeb3 = async () => {
    const networkId = await getNetworkId()
        try {
            const web3Modal = new Web3Modal({
                network: networkId == 1 ? 'mainnet' : "ropsten",
                cacheProvider: true,
                providerOptions
            })
            // web3Modal.clearCachedProvider()
            // if (web3Modal.cachedProvider) {
            //     await web3Modal.connect();
            // }

            const provider = await web3Modal.connect()
            let web3 = new Web3(provider)
            window.bancor.provider = provider
            window.bancor.web3 = web3
            return web3
        } catch(e) {
            return new Web3(Web3.givenProvider)

        }
};

export default getWeb3;
