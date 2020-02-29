import React from 'react';
import NumberFormat from 'react-number-format';

const NumberFormatInput = (props) => {
    const { inputRef, onChange, validateChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={values =>
                onChange({
                    target: {
                        value: values.value,
                    },
                })
            }
            style={{paddingRight:0}}
            isAllowed={values => validateChange(values.value)}
            thousandSeparator
            allowNegative={false}
            decimalScale={2}
        />
    );
};
export default NumberFormatInput