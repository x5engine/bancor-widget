import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';


const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
}));

export default function RemoveLiquidity() {
    const classes = useStyles();
    const [spinner, setSpinner] = useState(true);


    useEffect(() => {
        // setTimeout(() => setSpinner(false), 500)
    }, []);

    return <div item className={classes.root}>

      <h2>Remove Liquidity</h2>
      <h5>Coming Soon</h5>

    </div>;
}
