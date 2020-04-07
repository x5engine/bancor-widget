import React, { useState, useEffect }  from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import { AppBar, Tabs, Tab, Box, Typography, IconButton, Badge   } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExchangeWidget from './components/ExchangeWidget';
import NewToken from './components/NewToken';
import { makeStyles } from '@material-ui/core/styles';
import * as ethStore from "./utils/eth";
import {
  init as registryInit,
  tokens as tokensMap,
  bntToken as bntTokenInstance,
  fetchingTokens
} from "./utils/tokens";
import { addresses as defaultAddresses } from "./env";
import getWeb3 from './utils/getWeb3';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider);
let tokenSend = "ETH";
let tokenReceive = "BNT";
// let colors = defaultColors;
let showRelayTokens = false;
let addresses = defaultAddresses;
let affiliate = undefined;

const useStyles = makeStyles(theme => ({
  root: {
    width: 350,
  },
  logo: {
    width: 170,
  }, 
  tabs: {
    backgroundColor:"#0f59d1"
  },
  button: {
    backgroundColor: "#0f59d1"
  },
  box: {
    padding:0
  }
}));


async function fetchData(getToken) {
  // when network changes, reinitialize

  // initialize ethStore
  const _eth = await ethStore.init()
  console.log(ethStore.networkId, _eth);
  
  if (window.bancor.networkId) {
    const tokens = await registryInit(_eth, {
      showRelayTokens,
      addresses
    }, getToken);
    console.log('====================================');
    console.log("app tokens", tokens);
    console.log('====================================');
    return tokens
  }

  // window.ethereum.on("networkChanged", _networkId => {
  //   if (_networkId) {
  //     console.log('sub eth');
      
  //     registryInit(_eth, {
  //       showRelayTokens,
  //       addresses
  //     });
  //   }
  // });
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box className={classes.box} p={3}>{children}</Box>}
    </Typography>
  );
}

function App() {
  const classes = useStyles();
  const [loader, setLoader] = useState(true);
  const [tabIndex, setTab] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [xweb3, setWeb3] = useState({});
  const [account, setAccount] = useState("");
  const [localTokens, setLocalTokens] = ethStore.useStateWithLocalStorage("BancorExchangeTokens");

  useEffect( () => {
    getWeb3().then((x) => {
      setWeb3(x);
      // window.bancor.web3 = x;
      web3.eth.getAccounts()
        .then((c) => {
          console.log("account ",c); 
          if(c && c.length)
            {
              setAccount(c[0])
              x.eth.getBalance(c[0]).then((balance) =>{
                console.log(balance, x.utils.fromWei(balance, "ether") +" ETH" )
              });
            }
        });
      })
    console.log("localTokens", localTokens, !localTokens || !localTokens.length);
      
      if(!localTokens || !localTokens.length)
        fetchData().then((tkx) => { 
          console.log("tkx", tkx);
          
          setTokens(tkx); setLoader(false); setLocalTokens(tkx)
        } )
      else 
        fetchData(false).then((tkx) => { setLoader(false); })
    // setTimeout(() => setLoader(false), 500)
  }, []);

  return (
    <Grid 
      container
      justify="center"
      spacing={0}
      direction="column"
      alignItems="center"
      className={"BancorWidget"}
      >
      <Backdrop className={classes.backdrop} open={loader} onClick={setLoader}>
        <img alt="bancor" src="/bancor.png" className={classes.logo} />
      </Backdrop>
      <Grid item className={classes.root} style={{ display: loader ? "none" : "block" }}>
        <AppBar position="static" >
          <Tabs className={classes.tabs}
            value={tabIndex}
            onChange={(e,v) => setTab(v)} aria-label="bancor widget"
            
            >
            <Tab label="Exchange"  />
            <Tab label="Add Token"  />
            <Tab label="Send" />
          </Tabs>
        </AppBar>
        <TabPanel value={tabIndex} index={0}>
          <ExchangeWidget tokens={!localTokens || !localTokens.length ? tokens : localTokens} ready={!loader} account={account} web={xweb3} />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <NewToken web={xweb3} />
        </TabPanel>
      </Grid>
    </Grid>
  );
}

export default App;
//@TODO add router to make link work for wallet