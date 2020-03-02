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
import { bufferToHex, utf8ToHex } from "web3x-es/utils";
import CircularProgress from '@material-ui/core/CircularProgress';
import Slider from '@material-ui/core/Slider';

import Contract, { getBytecode, getNomralAbi } from "../utils/Contract";
import Web3 from 'web3';
const web3 = new Web3(Web3.givenProvider);

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    buttonNext: {
        display:"none",
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    addressInput:{
        marginTop: theme.spacing(2),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
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
function allSkippingErrors(promises) {
    return Promise.all(
        promises.map(p => p.catch(error => null))
    )
}
const stepsButton = ["Create Relay Token", "Deploy Converter", "Funding & Issue Supply", "Finish" ]

function GetStepContent(step, nextButton) {
    const [address, setAddress] = React.useState("");
    const [customToken, setCustomToken] = React.useState({ symbol:"AAA"});
    const [transactionHash, setHash] = React.useState("");
    const [maxFee, setMaxFee] = React.useState(3);//3*10000 = 30000
    const [weight, setWeight] = React.useState(50);//50*10000=500000
    const classes = useStyles();
    const eth = window.bancor.eth

    const setFetchAddress = async (e) => {
        const address = e.target.value
        setAddress(address)
        //test KH token     0xcb182bcfbc6e3b71dc11ca7e5a3273842ae71421
        const userToken = await Contract( eth, "ERC20Token", address)
        const [ name, symbol, decimals ] = await allSkippingErrors([
            userToken.methods.name().call(),
            userToken.methods.symbol().call(),
            userToken.methods.decimals().call(),
        ])
        const customToken = { name, symbol, decimals } 
        console.log('================userToken====================');
        console.log(address, userToken, customToken, name, symbol, decimals);
        console.log('====================================');
        setCustomToken(customToken)
    }

    function valuetext(value) {
        return `${value}%`;
    }

    function valueWeight(value) {
        return `${value}/${value}`;
    }

    const createSmartToken = async () => {
        // var myContract = new web3.eth.Contract({}, '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {
        //     from: '0x1234567890123456789012345678901234567891', // default from address
        //     gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
        // });

        const text = `Create ${customToken.name}USDB Relay Token.`;
        // const contract = await Contract( eth, "SmartToken")
        // console.log('==============contract== SmartToken====================');
        // console.log(contract);
        // console.log('====================================');
        const name = customToken.symbol + "BNT Smart Relay Token";
        const symbol = customToken.symbol + "BTN";
        const decimals = customToken.decimals;
        // const bytecode = await window.bancor.eth.getCode(address);
        // constructor(string _name, string _symbol, uint8 _decimals)
        // contract
        // .deployBytecode(
        //     getBytecode("SmartToken"),
        //     name,
        //     symbol,
        //     decimals
        // )
        const account = web3.eth.accounts[0]
        const smAddress = await window.contracts.contractRegistry.methods
            .addressOf(utf8ToHex("SmartToken"))
            .call()
        const nabi = await getNomralAbi("SmartToken")
        console.log(smAddress, nabi);
        const bytesCode = await getBytecode("SmartToken")
        const MyContract = new web3.eth.Contract(nabi)
        // const MyContract = new web3.eth.Contract(nabi, smAddress.toString())
        // const MyContract = new eth.Contract(getBytecode("SmartToken"), contract.address, { gasPrice: '12345678', from: window.bancor.account });

        // const gas = await MyContract.deploy({
        //     data: getBytecode("SmartToken"),
        //     arguments: [name, symbol, decimals] 
        // }).estimateGas()

        //test KH token     0xcb182bcfbc6e3b71dc11ca7e5a3273842ae71421
        console.log("MyContract", MyContract, name, symbol, Number(decimals) );
        
        const gas = await MyContract.deploy({
            data: bytesCode,
            arguments: [name, symbol, Number(decimals)] ,
            from: window.bancor.account.toString(),
        }).estimateGas();
        
        /* Data field of the transaction. */
        // const transactionData = contractDeployInfo.encodeABI();
        /* Then I estimate the gas, using the provided method. */

        console.log('===============current gas=====================');
        console.log(gas);
        console.log('====================================');

        MyContract.deploy({
            data: bytesCode,
            arguments: [name, symbol, Number(decimals)]
        }).send({
            from: window.bancor.account.toString(),
            // gas: gas,
        })
        .on('error', (error) => {
            console.log(error)
        })
        .on('transactionHash', (transactionHash) => {
            console.log(transactionHash)
            setHash(transactionHash)
        })
        .on('receipt', (receipt) => {
            // receipt will contain deployed contract address
            console.log(receipt)
            // const address = bufferToHex(receipt.contractAddress).substring(2);
            // const relay = await Contract(eth, "SmartToken", address);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log(receipt)
        }).then(function (newContractInstance) {
            console.log(newContractInstance.options.address) // instance with the new contract address
            window.bancor.relayToken = newContractInstance;
            setHash("")
            nextButton()
        });
        
    }

    const createConverter = async () => {

        const account = web3.eth.accounts[0]
        const nabi = await getNomralAbi("BancorConverter")
        // const nabi = window.contracts.converterRegistry.contractAbi
        console.log("normal abi converter", nabi);
        const bytesCode = await getBytecode("BancorConverter")
        const MyContract = new web3.eth.Contract(nabi)
        // const text = `Create ${xTokenSymbol}BNT Converter.`;
        console.log(MyContract, nabi, bytesCode);
        //REMOOOVE
        // window.bancor.relayToken = "0x55ec81204382af2f29525a18866c8d3fbb17bd0e"

        MyContract.deploy({
            data: bytesCode,
            arguments: [
                window.bancor.relayToken,
                window.contracts.contractRegistry.address,
                maxFee,
                window.contracts.bancorNetwork.address,
                weight*10000]
        }).send({
            from: window.bancor.account.toString()
        })
        .on('error', (error) => {
            console.log(error)
        })
        .on('transactionHash', (transactionHash) => {
            console.log(transactionHash)
            setHash(transactionHash)
        })
        .on('receipt', (receipt) => {
            // receipt will contain deployed contract address
            console.log(receipt)
            // const address = bufferToHex(receipt.contractAddress).substring(2);
            // const relay = await Contract(eth, "SmartToken", address);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log(receipt)
        }).then( (newConverter) =>{
            console.log(newConverter.options.address) // instance with the new contract address
            window.bancor.converterToken = newConverter;
            // addConnector to converter
            //1 enable conversion
            newConverter.methods.methods.conversionsEnabled()
                .call().then((result) => {
                    newConverter.methods
                        .addConnector(address, weight, false)
                        .send({
                            from: account
                        }).then((result) => {
                            console.log("done");
                            setHash("")
                            nextButton()
                        })
                })
        }); 
    }

    function fundAndIssue (){
        const account = web3.eth.accounts[0]
        window.bancor.relayToken.methods
            .issue(account, 1, "ether")
            .send({
                from: account
            }).then((result) => {
                // transferOwnership
                window.bancor.relayToken.methods
                    .transferOwnership(window.bancor.converterToken.options.address)
                    .send({
                        from: account
                    }).then((result) => {
                        // accept ownership
                        window.bancor.converterToken.methods.acceptTokenOwnership().send({
                            from: account
                        }).then((result) => {

                        })
                    })
            })
    }

    switch (step) {
        case 0:
            return <div style={{marginBottom:10}}>
                    <Typography variant="h4" gutterBottom>
                        {customToken.symbol+"BNT"} Smart Relay Token Deployment
                    </Typography>
                    <Typography variant="body2" component="p">
                        We are creating a relay token AAABNT between your AAA token and BTN token.
                        <br />
                        Relay tokens are a bridge between your token and the Bancor BNT trade network.
                    </Typography>
                    <TextField 
                        className={classes.addressInput}
                        id="outlined-basic" 
                        label="Token Address" 
                        value={address}
                        onChange={setFetchAddress}
                        variant="outlined"
                        placeholder="0x...."
                        helperText="Enter the Address of your token - the token you want to add to Bancor:" 
                    />
                    {!!transactionHash && 
                    <Button
                        variant="outlined"
                        color="secondary"
                        href={"https://etherscan.io/tx/"+transactionHash}
                        className={classes.button}
                        target="_blank"
                    >
                        Pending Transaction  <CircularProgress color="green" size={15} />
                    </Button>}
                    {!transactionHash && <Button
                        variant="contained"
                        color="primary"
                        onClick={createSmartToken}
                        className={classes.button}
                    >
                        {stepsButton[step]}
                    </Button>}
                </div>;
        case 1:
            return <div style={{ marginBottom: 10 }}>
                    <Typography variant="h4" gutterBottom>
                        {customToken.symbol + "BNT"} Converter Deployment
                    </Typography>
                    <Typography variant="body2" component="p">
                        Now it's time to deploy the converter that will handle the actual conversions.
                    </Typography>
                    <Typography id="discrete-slider-always" gutterBottom>
                        Max Fee: {maxFee}%
                    </Typography>
                    <Slider
                        getAriaValueText={valuetext}
                        valueLabelFormat={valuetext}
                        aria-labelledby="discrete-slider-always"
                        valueLabelDisplay="auto"
                        value={maxFee}
                        min={0}
                        max={100}
                        onChange={(e,v) => setMaxFee(v)}
                    />
                    <Typography id="discrete-slider-always2" gutterBottom>
                    Adjustable Reserve Ratio (Weight): {weight + "/" + weight}
                    </Typography>
                    <Slider
                        getAriaValueText={valueWeight}
                        valueLabelFormat={valueWeight}
                        aria-labelledby="discrete-slider-always2"
                        valueLabelDisplay="auto"
                        value={weight}
                        min={30}
                        max={50}
                        onChange={(e, v) => setWeight(v)}
                    />
                    {!!transactionHash &&
                        <Button
                            variant="outlined"
                            color="secondary"
                            href={"https://etherscan.io/tx/" + transactionHash}
                            className={classes.button}
                            target="_blank"
                        >
                            Pending Transaction <CircularProgress color="green" size={15} />
                        </Button>}
                    {!transactionHash && <Button
                        variant="contained"
                        color="primary"
                        onClick={createConverter}
                        className={classes.button}
                    >
                        {stepsButton[step]}
                    </Button>}
                </div>;
        case 2:
            return <div style={{ marginBottom: 10 }}>
                    <Typography variant="h4" gutterBottom>
                        Funding & Initial Supply
                    </Typography>
                    <Typography variant="body2" component="p">
                        Our converter is deployed and set up, Now let's fund it and issue the relay token initial supply.
                        then Activate it:
                        <br />
                        Activation means transferring the token ownership to the converter.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={fundAndIssue}
                        className={classes.button}
                    >
                        {stepsButton[step]}
                    </Button>
                </div>;
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
                            <Typography component="div">{GetStepContent( index, handleNext )}</Typography>
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
                                        className={classes.buttonNext}
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