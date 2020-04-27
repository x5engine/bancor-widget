import React, {useState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Alert from '@material-ui/lab/Alert';
// import Wyre from 'react-wyre'
import Iframe from 'react-iframe'
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider);

export default function BuyCrypto({ open, account, goBack }) {
  const [currency, setCurrency] = useState('ETH');
  const [amount, setAmount] = React.useState('0.1');
  const [platform, setPlatform] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [showWyre, setShowWyre] = React.useState(false);

  const handleChange = (event) => {
    setCurrency(event.target.value);
  }

  const getCrypto = () => {
    if(platform == 1)
    {
      setShowWyre(true);setLoading(true)
    }
    else{
      handleSubmitButtonClick()
    }

  }

  const handleSubmitButtonClick = () => {
      let weiAmount;
      // try {
          weiAmount = web3.utils.toWei(amount.toString());
          console.log(amount,weiAmount);
      // }
      // catch (e) {
      //     console.error('Supplied amount is not a valid number');
      //     return;
      // }
      new RampInstantSDK({
          hostAppName: 'Bancor Widget',
          hostLogoUrl: 'http://bancor.x5engine.com/bancor.png',
          variant: 'auto',
          swapAmount: weiAmount,
          swapAsset: currency,
          userAddress: account
      }).show();
  }

  console.log('account',account);

  const url = "https://pay.sendwyre.com/?dest=ethereum:"+account+"&destCurrency="+currency+"&sourceAmount="+amount+"&accountId=AC-7AG3W4XH4N2&paymentMethod=debit-card"

  return ( <Card item className={'something'} style={{padding: 24}}>
    <div syle={{
        justifyContent: 'center',
        padding: 24
    }}>
    <h4>Buy Crypto with Fiat</h4>
    {!loading && <div className="LoadOptions">
      <FormControl component="fieldset">
        <FormLabel component="legend">Select platform:</FormLabel>
        <RadioGroup aria-label="platform" name="platform" value={platform} onChange={(event) => {
            console.log('platform', event.target.value);
            setPlatform(Number(event.target.value));
        }}>
          <FormControlLabel value={1} control={<Radio />} label="Wyre" />
          <FormControlLabel value={2} control={<Radio />} label="Ramp Instant" />
        </RadioGroup>
        <FormLabel component="legend">Currency</FormLabel>
        <RadioGroup aria-label="currency" name="currency" value={currency} onChange={handleChange}>
          <FormControlLabel value="ETH" control={<Radio />} label="ETH" />
          <FormControlLabel value="DAI" control={<Radio />} label="DAI" />
          <FormControlLabel value="USDC" disabled={platform != 1} control={<Radio />} label="USDC" />
          <FormControlLabel value="BTC" disabled control={<Radio />} label="BTC" />
        </RadioGroup>
        <TextField
          id="standard-number"
          label="Number"
          type="number"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value)
          }}
          InputLabelProps={{
            shrink: true,
          }}
          helperText="Some platforms might have a maximum"
        />
      </FormControl>
      <Button style={{marginBottom:20}} variant="contained" color="primary" onClick={getCrypto}>Buy Crypto</Button>
    </div>}
    {showWyre && <Iframe url={url}
      width="350px"
      height="550px"
      id="wyreCrypto"
      className="wyreX"
      display="initial"
      position="relative"
    />}
    <Button variant="outlined" color="primary" onClick={goBack}>
      Back To Exchange
    </Button>
  </div>
</Card>)

}

// export default function BuyCrypto({open, account}) {
//
//   console.log('account',account);
//   return (<Paper>
//     <Wyre
//       config={{
//         env: 'test',
//         accountId: 'AC_TYGBBFEVAHC',
//         auth: {
//           type: 'secretKey',
//           secretKey: 'SK-66788RGG-8QWT9BXU-6PLHMMMU-6R8YUF2Z'
//         },
//         operation: {
//           type: 'debitcard',
//           destCurrency: 'ETH',
//           destAmount: 0.01,
//           dest: account
//         },
//         style: {
//           primaryColor: '#0055ff'
//         }
//       }}
//       onReady={() => console.log('ready')}
//       onClose={event => console.log('close', event)}
//       onComplete={event => console.log('complete', event)}
//       open={open}>
//       <Button  variant="outlined" color="secondary" onClick={console.log}>
//         Buy Crypto
//       </Button>
//     </Wyre>
//   </Paper>)
//
// }


// API key
//
// AK-34AJND3C-U3NYUC7P-QH7WULLU-FYN9FQZA
//
// Secret key
//
// SK-66788RGG-8QWT9BXU-6PLHMMMU-6R8YUF2Z
