import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
    tokenAddress: {
        marginTop: 10
    }
}));

function getSteps() {
    return ['Create Liquidity Pool Token', 'Liquidity Pool Converter', 'Fund the Pool & Transfer Ownership '];
}

const stepsButton = ["Create Relay Token", "Deploy Converter", "Funding & Issue Supply", "Finish" ]

function GetStepContent(step) {
    const [address, setAddress] = React.useState("");
    
    const createSmartToken = () => {
        // var myContract = new web3.eth.Contract({}, '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {
        //     from: '0x1234567890123456789012345678901234567891', // default from address
        //     gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
        // });

        const text = `Create ${xTokenSymbol}USDB Relay Token.`;
        return Contract(eth, "SmartToken").then(contract => {
            const name = xTokenName + " Smart Relay Token";
            const symbol = xTokenSymbol + "USDB";
            const decimals = xTokenDecimals;

            return contract
                .deployBytecode(
                    getBytecode("SmartToken"),
                    name,
                    symbol,
                    decimals
                )
                .send({
                    from: account
                });
        });
    }
    
    switch (step) {
        case 0:
            return <div style={{marginBottom:10}}>
                <Typography variant="h4" gutterBottom>
                    Smart Relay Token Deployment
                </Typography>
                <Typography variant="body2" component="p">
                    We are creating a relay token AAABNT between your AAA token and BTN token.
                    <br />
                    Relay tokens are a bridge between your token and the Bancor BNT trade network.
                </Typography>
                <TextField 
                    className={{root:{ marginTop: 10}}} 
                    id="outlined-basic" 
                    label="Token Address" 
                    value={address}
                    onChange={setAddress}
                    variant="outlined"
                    placeholder="0x...."
                    helperText="Enter the Address of your token - the token you want to add to Bancor:" />
                </div>;
        case 1:
            return "Now it's time to deploy the converter that will handle the actual conversions.";
        case 2:
            return "Our converter is deployed and set up, Now let's fund it and issue the relay token initial supply.";
        default:
            return 'Unknown step';
    }
}

export default function Steps() {
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <div className={classes.root}>
            <Typography variant="h4" gutterBottom>
                Adding a Token to Bancor Network
            </Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            <Typography>{GetStepContent(index)}</Typography>
                            <div className={classes.actionsContainer}>
                                <div>
                                    <Button
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        className={classes.button}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleNext}
                                        className={classes.button}
                                    >
                                        {activeStep === steps.length - 1 ? 'Finish' : stepsButton[activeStep]}
                                    </Button>
                                </div>
                            </div>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            {activeStep === steps.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                    <Typography>All steps completed - you&apos;re finished</Typography>
                    <Button onClick={handleReset} className={classes.button}>
                        Reset
          </Button>
                </Paper>
            )}
        </div>
    );
}

// create liquidity pool token, liquidity pool converter, fund the pool and transfer ownership 