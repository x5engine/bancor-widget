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
import Web3 from 'web3';
import StarIcon from '@material-ui/icons/Star';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { FixedSizeList } from 'react-window';

import {
  getSmartTokenData,
  getSmartTokenSymbol,
  getConverterData
} from "../utils/tokens";

import {
  fromDecimals,
  toDecimals
} from "../utils/eth";


const web3 = new Web3(Web3.givenProvider);
const BancorConverter = require('../abis/BancorConverter.json');
const BigNumber = require('bignumber.js');
const Decimal = require('decimal.js');

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
  list: {
    width: '100%',
    height: 200,
    maxWidth: 300,
    backgroundColor: theme.palette.background.paper,
    marginBottom: 8
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

export default function AddLiquidty({ tokens, ready }) {
    const classes = useStyles();
    const [spinner, setSpinner] = useState(true);
    const [balance1, setBalance1] = useState(1);
    const [currency1, setCurrency1] = useState(ETH);
    const [currency2, setCurrency2] = useState(BNT);
    const [balance2, setBalance2] = useState(0.1);
    const [smCount, setSMCount] = useState(0);
    const [smData, setSMData] = useState({});
    const [pools, setPools] = useState([]);
    const [smartTokens, setSmartTokens] = useState([]);
    const [selectedTokens, setCTokens] = useState([]);
    const [selectedSM, setSelectedSM] = useState(null);
    const [amountLoading, setLoading] = useState(0);
    const loading = tokens && !tokens.length;
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
      console.log("AddLiquidty TOKENNNNNNNNNNNNNNNN", tokens, tokens);
        if(ready)
          getPools()
    }, [ready]);


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

  const addLiquidity = () => {

  }

  const getPools = async () => {
    
    const x = window.contracts.converterRegistry
    const pools = await x.methods.getLiquidityPools().call()
    // const count = await x.methods.getSmartTokenCount().call()
    console.log('getPools loaded', pools);
    let smartTokensSymbols = await Promise.all(pools.map(async (t) => {
      // smartTokensSymbols[t.toString()] = await getSmartTokenSymbol(t.toString())
      return {
        address: t.toString(),
        symbol: await getSmartTokenSymbol(t.toString())
      }
    }))
    //set loading pools
    console.log('smartTokensSymbols loaded', smartTokensSymbols);
    setPools(smartTokensSymbols)
    setSMCount(pools.length)
    //end loading pool
    
    // const b2 = await x.methods.getConvertersBySmartTokens(smt).call()
    // https://github.com/pRoy24/katanapools/blob/7823606424d295aa4e315c5c8e308bd8761b2eaf/src/utils/RegistryUtils.js#L194
  }

  const getSelectedPools = async (givenTokens) => {
    console.log('getting pools');
    const x = window.contracts.converterRegistry
    // const tokens = givenTokens.map((t)=> t.address)

    if ( !!givenTokens && !!givenTokens.address ){
      let smartTokensResult = await x.methods.getConvertibleTokenSmartTokens(givenTokens.address).call();
      // const pools = await x.methods.getConvertersBySmartTokens(tokens).call();
      smartTokensResult = smartTokensResult.map( (t) => t.toString())
      // const smartTokensSyms = await Promise.all(smartTokensResult.map(async (t) => await getSmartTokenData(t.toString())))
      // const newTokens = ltokens.filter((t) => pools.includes(t.address))
      // setTokens(newTokens)
      console.log('getPools loaded', smartTokensResult, givenTokens ,web3);
      setSMCount(smartTokensResult.length)
      setSmartTokens(smartTokensResult)
      let smartTokensSymbols = {}
      await Promise.all(smartTokensResult.map(async (t) => {
        // smartTokensSymbols[t.toString()] = await getSmartTokenSymbol(t.toString())
        smartTokensSymbols[t.toString()] = await getSmartTokenData(t.toString())
      }))
      setSMData(smartTokensSymbols)
    }
  }

  const calculateFundingAmount = (inputFund) => {
    const currentSelectedPool = selectedSM;

    if (!isNaN(inputFund) && parseFloat(inputFund) > 0) {
      const totalSupply = new Decimal(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals));
      const addSupply = new Decimal(inputFund);
      const pcIncreaseSupply = addSupply.dividedBy(totalSupply);

      const currentReserves = currentSelectedPool.reserves;
      const reservesNeeded = currentReserves.map(function (item) {
        const currentReserveSupply = new Decimal(item.reserveBalance);
        const currentReserveNeeded = pcIncreaseSupply.times(currentReserveSupply);
        const currentReserveNeededMin = toDecimals(currentReserveNeeded.toFixed(2, Decimal.ROUND_UP), item.decimals);
        const currentReserveNeededDisplay = currentReserveNeeded.toFixed(6, Decimal.ROUND_UP);
        return Object.assign({}, item, { neededMin: currentReserveNeededMin, neededDisplay: currentReserveNeededDisplay });
      });
      this.setState({ reservesNeeded: reservesNeeded });
    }
  }

  const getTotalSupply = ( value, decimals ) => {
    return toFixed(fromDecimals(value, decimals))
  }

  const selectSM = async (address) => {
    if(!address) return false
    const ConverterContract = new web3.eth.Contract(BancorConverter, address);
    const converterData = await getConverterData(address)
    setSelectedSM({ ...converterData, address})
    console.log('you selected this convereter', address, converterData, ConverterContract);
  }

  function renderRow(props) {
    const { index, style, data } = props;
    
    const xdata = smData[data[index]] ? smData[data[index]] : { symbol: data[index], owner: "" }
    return (
      <ListItem button style={style} key={index} onClick={() => selectSM(xdata.owner)}>
        {selectedSM && selectedSM == data[index] && <ListItemIcon>
          <StarIcon />
        </ListItemIcon>}
        <ListItemText 
          primary={`${xdata.symbol}`}
          secondary={xdata.totalSupply ? "Total Supply: " + getTotalSupply(xdata.totalSupply, xdata.decimals) : ""}
         />
      </ListItem>
    );
  }

    return <div className={classes.root}>

      <h2>Add Liquidty</h2>

      <Autocomplete
        value={selectedTokens}
        onChange={(event, newValue) => {
          console.log("pool", newValue);
          
          // getSelectedPools(newValue)
          setCTokens(newValue);
        }}
        id="multiple-limit-tags"
        options={pools}
        getOptionSelected={(option, value) => selectedTokens && option.symbol === selectedTokens.symbol }
        getOptionLabel={option => option.symbol ? option.symbol : ''}
        // defaultValue={[tokens[194], tokens[191]]}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Find Liquidity Pool" placeholder="Tokens" />
        )}
      />
      
      {!!smCount && <h5>
        Available Pools : {smCount}
      </h5>}

      {!!smartTokens.length && <div className={classes.list}>
        <FixedSizeList height={200} width={300} itemSize={46} itemCount={smartTokens.length} itemData={smartTokens}>
          {renderRow}
        </FixedSizeList>
      </div>}

      <TextField
        id="outlined-number"
        label="Amout to Add"
        type="number"
        value={balance1}
        fullWidth
        onChange={(event) => {
          // calculateFundingAmount(event.target.value)
          setBalance1(event.target.value);
        }}
        InputLabelProps={{
          shrink: true,
        }}
        variant="outlined"
      />


    </div>;
}

//show smart tokens with symbols done

//get pool token address and reserve 

// when click then let user fund the amount they want and calculate the result they'd get


//apporve tokens for each token (with allowence)

//get the funds from the pool
// https://thegraph.com/explorer/subgraph/blocklytics/bancor?query=All%20Smart%20Tokens