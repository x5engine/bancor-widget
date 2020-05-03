import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { green } from '@material-ui/core/colors';
import NumberFormatInput from './NumberFormatInput';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormHelperText from '@material-ui/core/FormHelperText';


const toFixed = (x) => {
  const y = parseFloat(x)
  if (y) {
    return y.toFixed(5).toString()
  }
  else return x
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
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
  walletBalance: {
    cursor: "pointer"
  }
}));

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

export default function AddLiquidty({ tokens }) {
    const classes = useStyles();
    const [spinner, setSpinner] = useState(true);
    const [balance1, setBalance1] = useState(0.1);
    const [currency1, setCurrency1] = useState(ETH);
    const [currency2, setCurrency2] = useState(BNT);
    const [balance2, setBalance2] = useState(0.1);
    const [amountLoading, setLoading] = useState(0);
    const loading = tokens && !tokens.length;
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        // setTimeout(() => setSpinner(false), 500)
    }, []);


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

    return <div item className={classes.root}>

      <h2>AddLiquidty</h2>
      <FormControl className={classes.formControl} variant="outlined" fullWidth>
        <OutlinedInput
          classes={{ root: classes.input }}
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
        {walletBalance ? <FormHelperText id="component-helper-text1" className={classes.walletBalance} onClick={() => setBalance1(walletBalance.toFixed(3))}>You have {walletBalance.toFixed(3)} {currency1 && currency1.symbol}</FormHelperText> : null}

      </FormControl>
    </div>;
}
