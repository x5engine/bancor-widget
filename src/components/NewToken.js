import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Steps from './Steps';

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

export default function NewToken() {
    const classes = useStyles();
    const [spinner, setSpinner] = useState(true);
    useEffect(() => {
        // setTimeout(() => setSpinner(false), 500)
    }, []);

    return <Grid item className={classes.root}>
        <Paper className={classes.demo}>
            <Steps />
        </Paper>
    </Grid>;
}