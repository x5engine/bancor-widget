import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Steps from './Steps';
import SplitButton from './SplitButton';
import AddLiquidty from './AddLiquidty';
import RemoveLiquidity from './RemoveLiquidity';

const useStyles = makeStyles(theme => ({
    root: {
        width: 350,
    },
    logo: {
        width: 170,
    },
    demo: {
        padding: theme.spacing(3, 2),
    },
}));

export default function Pool({ tokens, account }) {
    const classes = useStyles();
    const [spinner, setSpinner] = useState(true);
    const [action, setAction] = useState(2);
    useEffect(() => {
        // setTimeout(() => setSpinner(false), 500)
    }, []);

    return <Grid item className={classes.root}>
        <Paper className={classes.demo}>
            <SplitButton action={action} setAction={setAction} />
            {action == 9 && <AddLiquidty />}
            {action == 9 && <RemoveLiquidity />}
            {action == 2 && <Steps />}

        </Paper>
    </Grid>;
}
