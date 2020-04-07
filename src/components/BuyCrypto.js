import React, {useState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import Wyre from 'react-wyre'


export default function BuyCrypto({open, account}) {

  console.log('account',account);
  return (<Paper>
    <Wyre
      config={{
        env: 'test',
        accountId: 'AC_TYGBBFEVAHC',
        auth: {
          type: 'secretKey',
          secretKey: 'SK-66788RGG-8QWT9BXU-6PLHMMMU-6R8YUF2Z'
        },
        operation: {
          type: 'debitcard',
          destCurrency: 'ETH',
          destAmount: 0.01,
          dest: account
        },
        style: {
          primaryColor: '#0055ff'
        }
      }}
      onReady={() => console.log('ready')}
      onClose={event => console.log('close', event)}
      onComplete={event => console.log('complete', event)}
      open={open}>
      <Button  variant="outlined" color="secondary" onClick={console.log}>
        Buy Crypto
      </Button>
    </Wyre>
  </Paper>)

}


// API key
//
// AK-34AJND3C-U3NYUC7P-QH7WULLU-FYN9FQZA
//
// Secret key
//
// SK-66788RGG-8QWT9BXU-6PLHMMMU-6R8YUF2Z
