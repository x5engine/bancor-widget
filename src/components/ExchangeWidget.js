import React, { useState, useEffect } from 'react';
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

import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';

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
const toFixed = (x) => +x.toFixed(2);
const formatDecimal = (x) => (x - Math.floor(x) > 0 ? x.toFixed(2) : x);
const formatInput = (x, raw) =>
    x === 0 && raw !== '.' && raw !== '.0' ? '' : formatDecimal(x);

export default function ExchangeWidget({tokens}) {
    const classes = useStyles();
    const [balance1, setBalance1] = useState(0.1);
    const [currency1, setCurrency1] = useState(ETH);
    const [currency2, setCurrency2] = useState(BNT);
    const [balance2, setBalance2] = useState(0.1);
    const [amount, setAmount] = useState(0);
    const loading = tokens && !tokens.length;

    console.log(window.contracts);
    console.log('=============ExchangeWidget=======================');
    console.log(tokens);
    console.log('====================================');
    useEffect(() => {
        
        // setCurrencies()
    }, []);
    return (
        <Card className={classes.root} >
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Bancor Exchange
                </Typography>
                <FormControl className={classes.formControl} variant="outlined" fullWidth>
                    <OutlinedInput
                        classes={{ root: classes.input}}
                        value={formatInput(balance1)}
                        onChange={setBalance1}
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
                                            {loading ? <CircularProgress color="blue" size={10} /> : null}
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
                        value={formatInput(balance2)}
                        onChange={setBalance2}
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
                                setCurrency1(newValue);
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
                                            {loading ? <CircularProgress color="green" size={10} /> : null}
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
                    You Get : {amount} {currency2.symbol}
                </Typography>
                <Typography variant="h5" component="h3" color="textSecondary">
                    Fee: {amount}
                </Typography>
            </CardContent>
            <CardActions className={classes.actions}>
                <Button size="large" color="primary" className={classes.button} variant="contained">Convert</Button>
            </CardActions>
        </Card>
    );
}