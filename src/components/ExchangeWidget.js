import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import NumberFormatInput from './NumberFormatInput';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import { toBN } from "web3x-es/utils";

import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import { toDecimals, fromDecimals } from "../utils/eth"

const useStyles = makeStyles(theme =>({
    root: {
        justifyContent: 'center'
    },
    actions: {
        justifyContent: 'center'
    },
    widget: {
        padding: theme.spacing(3, 2),
        margin: theme.spacing(3, 2),
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
        marginTop: 12,
    },
    button: {
        backgroundColor: "#0f59d1"
    },
    rootAuto:{
        width: 40
    },
    autoc:{
        width: "100%",
        padding:0
    },
    currencyElement: {
        width: 70,
        height: 40,
        flexShrink: 0,
        borderRadius: 3,
        marginRight: 8,
        marginTop: 2,
    },
    input: {
       paddingRight: 0
    },
    close: {
        opacity: 0.6,
        width: 18,
        height: 18,
    },
    inputRoot:{
        padding:0
    }
}));


const affiliateAccount = "0x691c63aa114b7305f012dbe45cf20a602a3bd8ac";
let affiliateFeePPM = 2 // 2%
let affiliateFee = '0'


const left = ({ sign, balance }) => ` ${sign} ${balance}`;
const getTokens = () => Array.from(window.contracts.tokens.values());

const ETH = {
    address: "0xc0829421c1d260bd3cb3e0f06cfe2d52db2ce315",
    name: "Ether Token",
    symbol: "ETH",
    img: "https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/aea83e97-13a3-4fe7-b682-b2a82299cdf2_200w.png",
    decimals: "18",
    isEth: true,
    isBNT: false
};
const BNT = {
    address: "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c",
    name: "Bancor Network Token",
    symbol: "BNT",
    img: "https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/f80f2a40-eaf5-11e7-9b5e-179c6e04aa7c_200w.png",
    decimals: "18",
    isEth: false,
    isBNT: true
};


const toFixed = (x) => {
    const y = parseFloat(x)
    if(y){
        return y.toFixed(3).toString()
    }
    else return x
}

// const formatDecimal = (x) => (x - Math.floor(x) > 0 ? x.toFixed(2) : x);

// const formatInput = (x, raw) =>
//     x === 0 && raw !== '.' && raw !== '.0' ? '' : formatDecimal(x);
// // const formatInput = (x, raw) => x

export const zeroAddress = "0x0000000000000000000000000000000000000000";


const getPath = (tokenSendAddress, tokenReceiveAddress) => {
    if (window.bancor && window.bancor.bancorSdk)
    return window.bancor
        .bancorSdk
        .generatePath(
            {
                blockchainType: "ethereum",
                blockchainId: tokenSendAddress
            },
            {
                blockchainType: "ethereum",
                blockchainId: tokenReceiveAddress
            }
        )
        .then(res => res.paths[0].path);
};


/**
 * Debounce a function by time
 * @param {Function} func
 * @param {Number} delay
 */

const useDebounce = (func, delay) => {
    const [id, setId] = useState(null)
    return useMemo(
        (...args) => {
            if (id) {
                clearTimeout(id)
            } else {
                setId(
                    setTimeout(() => {
                        setId(null)
                        func(...args)
                    }, delay)
                )
            }
        },
        [func]
    )
}



export default function ExchangeWidget({ tokens, account, web3, ready}) {
    const classes = useStyles();
    const [balance1, setBalance1] = useState(0.1);
    const [currency1, setCurrency1] = useState(ETH);
    const [currency2, setCurrency2] = useState(BNT);
    const [balance2, setBalance2] = useState(0.1);
    const [amountLoading, setLoading] = useState(0);
    const [fee, setFee] = useState(0);
    const loading = tokens && !tokens.length;

    console.log(window.contracts);
    const _bancorNetwork = window.contracts.bancorNetwork;

    console.log('=============ExchangeWidget=======================', web3);
    // console.log(tokens);
    console.log("balance2", balance2);
    console.log('====================================');
    useEffect(() => {
        if (ready)
            updateReturn()
        // setCurrencies()
    }, [tokens, ready, balance1]);


    const toWei = (x) => toDecimals(x,18);

    const convertToken = async () => {
        console.log("convertToken", window.contracts.bancorNetwork);
        if (!window.bancor || !window.bancor.web3) return false;
        const a = window.bancor.web3; 
        const accounts = await a.eth.getAccounts()
        if (!accounts || !accounts.length) return null;
        const weiAmount = toDecimals(balance1,18) // 1000000000000000000; //convert eth to wei
        const fn = currency1.symbol == "ETH" ? "convert2" : "claimAndConvert2";
        const ethAmount = currency1.symbol == "ETH" ? weiAmount : undefined;
        // const $affiliate = affiliate;
        const $affiliateFee = affiliateFee;
        const precision = 1e18;

        // const affiliateAccount = $affiliate ? $affiliate.account : zeroAddress;
        const affiliateFeePPM = 10000 * 2; //2%
            // $affiliate && $affiliateFee
            //     ? toBN(String($affiliate.fee * precision))
            //         .mul(toBN(1e6))
            //         .div(toBN(String(100 * precision)))
            //         .toString()
            //     : "0";
        const _tokenSend = currency1
        const _tokenReceive = currency2
        const path = await getPath(_tokenSend.address, _tokenReceive.address);

        return _bancorNetwork.methods[fn](
            path,
            weiAmount,
            1,
            affiliateAccount,
            affiliateFeePPM
        ).send({
            from: accounts[0],
            value: ethAmount
        });
        
        // onSuccess: () => {
        //     success.update(() => true);
        //     stepsStore.reset();
        //     updateBalance(tokenSend);
        // }
            
    }

    const changeB1 = (e) => {
        console.log("changeb1",e);
        // clearTimeout(timeOutId);
        // setTimeOut(null)
        setBalance1(e.target.value)
        // useDebounce(updateReturn, 300)
        setLoading(true)
        // updateReturn()
        // setTimeOut(setTimeout(() => updateReturn(), 300))
    }

    const changeB2 = (e) => {
        console.log("changeb2",e);
        setBalance2(e.target.value)
        // updateOrigin()
    }

    const updateReturn = async () => {
        // if(localTokens){
        //     setTokens(tokens)
        // }
        // reset affiliate fee
        affiliateFee = "0";
        const sendAmount = toWei(balance1); 

        if (!sendAmount || sendAmount === "0" || !tokens || !tokens.length ) {
            return null;
        }
        
        const tokenSend = currency1
        const tokenReceive = currency2
        // loading.update(() => true);
        console.log("updateReturn =============={{{{{{{{{{", tokens, tokenSend, tokenReceive);

        const currentPath = await getPath(
            tokenSend.address,
            tokenReceive.address
        );


        const {
            receiveAmountWei = "0",
            receiveAmount = "0",
            fee = "0"
        } = await _bancorNetwork.methods
            .getReturnByPath(currentPath, sendAmount)
            .call()
            .then(res => {
                const result =   {
                    receiveAmountWei: res["0"],
                    // receiveAmount: tokenReceive.toDisplayAmount(res["0"]),
                    fee: res["1"]
                }
                console.log("getReturnByPath", result, res, fromDecimals(res[0], 18), toFixed(fromDecimals(res[0], 18)));
                setBalance2(fromDecimals(res[0],18))
                setFee(toFixed(fromDecimals(res[1], 18)))
                setLoading(false)
                return result
            })
            .catch(error => {
                console.error(error);
                // resetInputs();
                return {};
            });

        // update fees
        // if (!get(tokenSend).isBNT && !get(tokenReceive).isEth) {
        //     affiliateFee.update(() => {
        //         const $affiliate = get(affiliate);
        //         const precision = 1e18;

        //         return $affiliate
        //             ? toBN(receiveAmountWei)
        //                 .mul(toBN(String($affiliate.fee * precision)))
        //                 .div(toBN(String(100 * precision)))
        //                 .toString()
        //             : "0";
        //     });
        // }

        // inputReceive.update(() => receiveAmount);
        // loading.update(() => false);
    };

    return (
        <Card className={classes.root} >
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Bancor Exchange
                </Typography>
                <FormControl className={classes.formControl} variant="outlined" fullWidth>
                    <OutlinedInput
                        classes={{ root: classes.input}}
                        value={toFixed(balance1)}
                        onChange={changeB1}
                        autoFocus
                        id="source-pocket-input"
                        inputComponent={NumberFormatInput}
                        endAdornment={<Autocomplete
                            id="combo-box-demo"
                            options={tokens}
                            size={'medium'}
                            className={classes.autoc}
                            value={currency1}
                            onChange={(event, newValue) => {
                                console.log('================newValue====================');
                                console.log(newValue);
                                console.log('====================================');
                                setCurrency1(newValue);
                            }}
                            getOptionSelected={(option, value) => option.symbol === currency1.symbol}
                            getOptionLabel={option => option.symbol}
                            // renderOption={(option, { selected }) => (
                            //     <span className={classes.currencyElement}>
                            //         <img
                            //             className={classes.currency}
                            //             src={option.img}
                            //             alt={option.symbol}
                            //             style={{ visibility: selected ? 'visible' : 'hidden' }}
                            //         />
                            //         <b>{option.symbol}</b>
                            //         <br />
                            //         {option.name}
                            //     </span>
                            // )}
                            renderInput={params => <TextField
                                 {...params} 
                                 value={params.symbol} 
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading ? <CircularProgress color="secondary" size={10} /> : null}
                                        </React.Fragment>
                                    ),
                                }}
                                 variant="outlined"
                                 />}
                        />}
                        aria-describedby="current-balance"
                        labelWidth={0}
                        inputProps={{
                            // prefix: inputs.current ? '﹣' : '',
                            // validateChange: validateCurrentChange,
                        }}
                    />
                </FormControl>
                <Divider style={{margin:40}} />
                <FormControl className={classes.formControl} variant="outlined" fullWidth>
                    <OutlinedInput
                        classes={{ root: classes.input}}
                        value={toFixed(balance2)}
                        onChange={changeB2}
                        autoFocus
                        id="source-pocket-input"
                        inputComponent={NumberFormatInput}
                        endAdornment={<Autocomplete
                            id="combo-box-demo"
                            options={tokens}
                            size={'medium'}
                            className={classes.autoc}
                            value={currency2}
                            onChange={(event, newValue) => {
                                console.log('================newValue====================');
                                console.log(newValue);
                                console.log('====================================');
                                setCurrency2(newValue);
                            }}
                            getOptionSelected={(option, value) => option.symbol === currency2.symbol}
                            getOptionLabel={option => option.symbol}
                            renderInput={params => <TextField
                                 {...params} 
                                 value={params.symbol} 
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading ? <CircularProgress color="secondary" size={10} /> : null}
                                        </React.Fragment>
                                    ),
                                }}
                                 variant="outlined"
                                 />}
                        />}
                        aria-describedby="current-balance"
                        labelWidth={0}
                        inputProps={{
                            // prefix: inputs.current ? '﹣' : '',
                            // validateChange: validateCurrentChange,
                        }}
                    />
                </FormControl>
               
                <Typography className={classes.pos} color="textSecondary">
                    Exchange Rate:
                </Typography>
                <Typography variant="h5" component="h2">
                    You get: {amountLoading ? <CircularProgress color="secondary" size={20} /> : toFixed(balance2,3)+ " " + currency2.symbol}
                </Typography>
                <Typography variant="h5" component="h3" color="textSecondary">
                    Fee {affiliateFeePPM}%: {fee} BNT
                </Typography>
            </CardContent>
            <CardActions className={classes.actions}>
                <Button size="large" color="primary" className={classes.button} onClick={convertToken} variant="contained">Convert</Button>
            </CardActions>
        </Card>
    );
}