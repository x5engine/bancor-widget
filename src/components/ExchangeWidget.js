import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Wyre from "wyre-widget";
import { Link } from 'react-router-dom';
import FormHelperText from '@material-ui/core/FormHelperText';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import Autocomplete from '@material-ui/lab/Autocomplete';
import NumberFormatInput from './NumberFormatInput';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Snackbar from '@material-ui/core/Snackbar';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import SettingsIcon from '@material-ui/icons/Settings';

import Alert from '@material-ui/lab/Alert';
import Divider from '@material-ui/core/Divider';
import { toBN } from "web3x-es/utils";
import { green } from '@material-ui/core/colors';
import Contract from "../utils/Contract";

import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import { toDecimals, fromDecimals } from "../utils/eth"

const useStyles = makeStyles(theme => ({
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
    rootAuto: {
        width: 40
    },
    autoc: {
        width: "100%",
        padding: 0
    },
    currency: {
        width: 20,
        height: 20,
        marginRight: 8,
        marginTop: 3,
    },
    currencyElement: {
        // width: 70,
        height: 50,
        overflow: "hidden",
        flexShrink: 0,
        borderRadius: 3,
        marginRight: 0,
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
    inputRoot: {
        padding: 0
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    },
    buttonSuccess: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    fabProgress: {
        color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    walletBalance:{
        cursor:"pointer"
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
    if (y) {
        return y.toFixed(5).toString()
    }
    else return x
}

// const formatDecimal = (x) => (x - Math.floor(x) > 0 ? x.toFixed(2) : x);

// const formatInput = (x, raw) =>
//     x === 0 && raw !== '.' && raw !== '.0' ? '' : formatDecimal(x);
// // const formatInput = (x, raw) => x

export const zeroAddress = "0x0000000000000000000000000000000000000000";


const getRate = async (tokenSendAddress, tokenReceiveAddress) => {
    // get the rate between DAI and ENJ
    const sourceToken = {
        blockchainType: 'ethereum',
        blockchainId: tokenSendAddress
    };
    const targetToken = {
        blockchainType: 'ethereum',
        blockchainId: tokenReceiveAddress
    };
    console.log("getRate", sourceToken, targetToken);

    const rate = await window.bancor
        .bancorSdk.getRate(sourceToken, targetToken, "1.0");
    return rate
}

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



export default function ExchangeWidget({ tokens, account, web3, ready, balance }) {
    const classes = useStyles();
    const [balance1, setBalance1] = useState(0.1);
    const [currency1, setCurrency1] = useState(ETH);
    const [currency2, setCurrency2] = useState(BNT);
    const [balance2, setBalance2] = useState(0.1);
    const [amountLoading, setLoading] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [fee, setFee] = useState(0);
    const [converting, setConverting] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [buyCrypto, setBuyCrypto] = useState(false);
    const [error, setError] = useState("");
    const [txn, setTx] = useState("");
    const [anchorEl, setAnchorEl] = React.useState(null);
    const loading = tokens && !tokens.length;

    // console.log(window.contracts);
    const _bancorNetwork = window.contracts.bancorNetwork;

    console.log('=============ExchangeWidget=======================', web3);
    // console.log(tokens);
    console.log("balance2", balance2);
    console.log('====================================');
    useEffect(() => {
        if (ready && !converting)
            updateReturn()
        // const timeout = setTimeout(() => {
        //     if (ready)
        //         updateReturn()
        // }, 300)
        // return () => clearTimeout(timeout)
    }, [tokens, ready, balance1, currency1, currency2]);


    const toWei = (x, d = 18) => toDecimals(x, 18);

    const convertToken = async () => {
        console.log("convertToken", window.contracts.bancorNetwork);
        if (!window.bancor || !window.bancor.web3 || !currency1 || !currency2) return resetInputs()
        setConverting(true)
        const a = window.bancor.web3;
        const accounts = await a.eth.getAccounts()
        if (!accounts || !accounts.length) return null;
        const weiAmount = toDecimals(balance1, 18) // 1000000000000000000; //convert eth to wei
        const fn = currency1.isEth ? "convert2" : "claimAndConvert2";
        let token = {}
        if (!currency1.isEth){
            token = await Contract(window.bancor.eth, "ERC20Token", currency1.address);
            console.log("erc20Token", token);
            
            // const balance = await token.methods.balanceOf(account).call();
            const [balance, allowance] = await Promise.all([
                token.methods.balanceOf(account).call(),
                // _eth.getBalance(_account),
                token.methods.allowance(account, _bancorNetwork.address).call()
            ]);
            console.log("erc20Token allowance balance", balance, allowance);
            // await token.methods.approve(_bancorNetwork.address, (weiAmount + toDecimals(fee,currency2.decimals)).toString()).send({
            
            const totalCheck = parseFloat(weiAmount) + parseFloat(toDecimals(fee, currency2.decimals))
            console.log("check allowance", weiAmount, toDecimals(fee, currency2.decimals), totalCheck, allowance);
            if (totalCheck > allowance)
                {
                    
                    // const gas = await token.methods.approve(_bancorNetwork.address, (balance).toString()).estimateGas({
                    //     from: account
                    // });
                    const done = await token.methods.approve(_bancorNetwork.address, (balance).toString()).send({
                        from: account,
                        gas: 500000
                    });
                }
        }
        // const fn = "convert2";
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
        console.log(path, currency1, currency2, path,
            weiAmount,
            // 1,
            // affiliateAccount,
            // affiliateFeePPM,
            // {
            //     from: accounts[0],
            //     value: ethAmount,
            //     gasPrice: 20,
            // // gasLimit: 90000
            // // gasLimit: a.eth.getBlock("latest").gasLimit
            // }
        );


        // const xresult = await _bancorNetwork.methods[fn](
        const xresult = await window.bancor._bancorNetwork.methods[fn](
            path,
            weiAmount,
            1,
            affiliateAccount,
            affiliateFeePPM
        ).send({
            from: accounts[0],
            value: ethAmount,
            // gasPrice: '300000000'
            // gasPrice: 20,
            // gasLimit: 900000
            // gasLimit: a.eth.getBlock("latest").gasLimit
        })
        // console.log("dadadadadadaaaaaaaaaaaa", xresult);
        // const hash = await xresult.txHashPromise
        // console.log("dadadadadadaaaaaaaaaaaa", hash);
        // setTx(hash)
        // .then((balance,c) => {
        //  })
        .on('transactionHash', function (hash) {
            console.log("transactionHash", hash);
            setTx(hash)
            resetInputs()
        })
        .once('confirmation', (confirmationNumber, receipt) => {
            console.log("confirmation", confirmationNumber, receipt);
            setConfirmed(true)
        })
        .on('receipt', (receipt) =>{
            // receipt example
            console.log(receipt);
        })
        .on('error', (error) =>{
            console.log("error=========", error);
            let erMsg = "An error has occured :"
            if(error)
                erMsg += error.message
            setError(erMsg)
            setConverting(false)
        }); // If there's an out of gas error the second parameter is the receipt.
        
        
        // , (e, r) => {
        //     console.log("converting",e, r);
        //     setConverting(false)
        //     //setError
        //     resetInputs();
        //     // success.update(() => true);
        //     // stepsStore.reset();
        //     // updateBalance(tokenSend);
        // });

        // onSuccess: () => {
        //     success.update(() => true);
        //     stepsStore.reset();
        //     updateBalance(tokenSend);
        // }

    }

    const changeB1 = (e) => {
        console.log("changeb1", e);
        // clearTimeout(timeOutId);
        // setTimeOut(null)
        setBalance1(e.target.value)
        // useDebounce(updateReturn, 300)
        setLoading(true)
        // updateReturn()
        // setTimeOut(setTimeout(() => updateReturn(), 300))
    }

    const resetInputs = () => {
        console.log("resetInputs");
        
        setBalance1(0)
        setBalance2(0)
        setFee(0)
        setLoading(false)
        setConverting(false)
    }

    const changeB2 = (e) => {
        console.log("changeb2", e);
        setBalance2(e.target.value)
        // updateOrigin()
    }

    const updateReturn = async () => {
        // if(localTokens){
        //     setTokens(tokens)
        // }
        // reset affiliate fee
        setLoading(true)
        if (!currency1 || !currency2) return resetInputs();

        if (currency1.address == currency2.address) {
            setBalance2(balance1)
            setFee(0)
            setLoading(false)
            return true
        }
        if(!currency1.isEth)
        {
            const token = await Contract(window.bancor.eth, "ERC20Token", currency1.address);
            console.log(" currency1 erc20Token", token);
            // const balance = await token.methods.balanceOf(account).call();
            const balance = await token.methods.balanceOf(account).call();
            setWalletBalance(parseFloat(fromDecimals(balance,currency1.decimals)))
        }

        affiliateFee = "0";
        const decimals = parseInt(currency1.decimals) ? parseInt(currency1.decimals) : 18
        const sendAmount = toWei(balance1, decimals);

        if (!sendAmount || sendAmount === "0" || !tokens || !tokens.length) {
            return null;
        }

        const tokenSend = currency1
        const tokenReceive = currency2
        // loading.update(() => true);
        console.log("updateReturn =============={{{{{{{{{{", balance1, tokenSend, tokenReceive);

        const currentPath = await getPath(
            tokenSend.address,
            tokenReceive.address
        );
        console.log(currentPath, tokenSend, tokenReceive);

        // const rate = await getRate(tokenSend.address, tokenReceive.address, balance1)
        // console.log("rate", rate);

        const {
            receiveAmountWei = "0",
            receiveAmount = "0",
            fee = "0"
        } = await _bancorNetwork.methods
            .getReturnByPath(currentPath, sendAmount)
            .call()
            .then(res => {
                const result = {
                    receiveAmountWei: res["0"],
                    // receiveAmount: tokenReceive.toDisplayAmount(res["0"]),
                    fee: res["1"]
                }
                console.log("getReturnByPath", result, res, fromDecimals(res[0], 18), toFixed(fromDecimals(res[0], 18)));
                setBalance2(fromDecimals(res[0], 18) + 20)
                setFee(toFixed(fromDecimals(res[1], 18)))
                setLoading(false)
                return result
            })
            .catch(error => {
                console.error(error);
                resetInputs();
                return false;
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

    const openSettings = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Card className={classes.root} >
            <Wyre
                config={{
                    env: "test",
                    accountId: "AC_TYGBBFEVAHC", // put your account number here
                    auth: {
                        type: "secretKey",
                        secretKey: 'SK-66788RGG-8QWT9BXU-6PLHMMMU-6R8YUF2Z' // make an API key, put the secret here :)
                    },
                    operation: {
                        type: "debitcard",
                        destCurrency: "ETH", //change type: can be ETH, DAI, BTC
                        destAmount: 0.01,
                        dest: account // if payment goes through this account will receive the crypto balance
                    },
                    style: {
                        primaryColor: "#0055ff"
                    }
                }}
                onReady={() => console.log("ready")}
                onClose={event => console.log("close", event)}
                onComplete={event => console.log("complete", event)}
                open={buyCrypto}
            >
                <div />
            </Wyre>
            {!!account && <CardHeader
                avatar={
                    <Tooltip title="Address QR Code" aria-label="QR">
                        <Avatar aria-label="recipe" alt="Address Qr Code" variant="square" src={"https://avatars.dicebear.com/v2/code/"+account+".svg"} className={classes.avatar}>
                            {account}
                        </Avatar>
                    </Tooltip>
                }
                action={
                    <IconButton aria-label="settings" onClick={openSettings}>
                        <MoreVertIcon />
                    </IconButton>
                }
                title={account.substr(0,20)+"..."}
                subheader={balance+" ETH"}
            />}
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => setBuyCrypto(true)}>
                    <ListItemIcon>
                        <AttachMoneyIcon fontSize="small" />
                    </ListItemIcon>
                    Buy Crypto
                </MenuItem>
                <MenuItem to={"https://etherscan.io/address/"+account}>
                    <ListItemIcon>
                        <AccountBalanceWalletIcon fontSize="small" />
                    </ListItemIcon>
                    Wallet
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
            </Menu>
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Bancor Exchange
                </Typography>
                <FormControl className={classes.formControl} variant="outlined" fullWidth>
                    <OutlinedInput
                        classes={{ root: classes.input }}
                        value={toFixed(balance1)}
                        onChange={changeB1}
                        autoFocus
                        helperText={currency1 && (currency1.symbol == "DAI" || currency1.symbol == 'ETH') ? "Buy " + currency1.symbol + " with your credit Card" : null}
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
                            getOptionSelected={(option, value) => currency1 && option.symbol === currency1.symbol}
                            getOptionLabel={option => option.symbol ? option.symbol : ''}
                            renderOption={(option, { selected }) => (
                                <div className={classes.currencyElement}>
                                    {option.img && <img
                                        className={classes.currency}
                                        src={option.img}
                                        alt={option.symbol}
                                    />}
                                    <b>{option.symbol}</b>
                                    <br />
                                    {option.name}
                                </div>
                            )}
                            renderInput={params => <TextField
                                {...params}
                                value={params ? params.symbol : ''}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading ? <CircularProgress color="secondary" size={10} /> : null}
                                        </React.Fragment>
                                    ),
                                }}
                                helperText={params && (params.symbol == "DAI" || params.symbol == 'ETH') ? "Buy " + params.symbol + " with your credit Card" : null}
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
                    {walletBalance ? <FormHelperText id="component-helper-text" className={classes.walletBalance} onClick={() => setBalance1(walletBalance.toFixed(3))}>You have {walletBalance.toFixed(3)} {currency1 && currency1.symbol}</FormHelperText> : null}
                    
                </FormControl>

                {amountLoading ? <LinearProgress variant="query" thickness={1} style={{ margin: 40 }} /> : <Divider style={{ margin: 40 }} />}
                <FormControl className={classes.formControl} variant="outlined" fullWidth>
                    <OutlinedInput
                        classes={{ root: classes.input }}
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
                            getOptionSelected={(option, value) => currency2 && option.symbol === currency2.symbol}
                            getOptionLabel={option => option.symbol ? option.symbol : ''}
                            renderOption={(option, { selected }) => (
                                <div className={classes.currencyElement}>
                                    {option.img && <img
                                        className={classes.currency}
                                        src={option.img}
                                        alt={option.symbol}
                                    />}
                                    <b>{option.symbol}</b>
                                    <br />
                                    {option.name}
                                </div>
                            )}
                            renderInput={params => <TextField
                                {...params}
                                value={params.symbol ? params.symbol : ""}
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
                    You get: {amountLoading ? <CircularProgress color="secondary" size={20} thickness={2} /> : toFixed(balance2, 3) + " " + (currency2 ? currency2.symbol : "")}
                </Typography>
                <Typography variant="h6" gutterBottom color="textSecondary">
                    Fee {affiliateFeePPM}%: {fee} BNT
                </Typography>
            </CardContent>
            <CardActions className={classes.actions}>
                <div className={classes.wrapper}>
                    <Button size="large" color="primary"
                        className={classes.button} 
                        onClick={convertToken}
                        variant="contained"
                        disabled={amountLoading || !currency1 || !currency2 || !balance1 || !balance2 || currency2.symbol == currency1.symbol || converting}>
                        Convert
                        {converting && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </Button>
                </div>
            </CardActions>
            {!!error && <Alert onClose={() => setError("")} severity="warning">{error}</Alert>}
            {!!txn && 
                <Alert onClose={() => { setTx(""); setConfirmed(false)}} severity={confirmed ? "info" : 'success'}>
                    {confirmed ?"Transaction Successfully Confirmed!" :"Your Transaction is processing" }<a target="_blank" href={"https://etherscan.io/tx/"+txn}> here </a>
                </Alert>}
        </Card>
    );
}