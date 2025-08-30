import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';

const Input = forwardRef(({ disabled = false, multiline = false, rows = 2, name, label, placeholder, type, error, helperText, value, onChange, endIcon, InputLabelProps, onFocus, onBlur,}, ref) => {
    const theme = useTheme();
    return (
        <Components.TextField
            variant="outlined"
            multiline={multiline}
            rows={rows}
            fullWidth
            disabled={disabled}
            size='small'
            name={name}
            label={label}
            placeholder={placeholder}
            value={type === 'date' ? value || new Date().toISOString().split('T')[0] : value}
            type={type}
            onChange={onChange}
            inputRef={ref}
            error={!!error}
            helperText={helperText}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                    '& fieldset': {
                        borderColor: error ? theme.palette.error.main : theme.palette.secondary?.main,
                    },
                    '&:hover fieldset': {
                        borderColor: error ? theme.palette.error.main : theme.palette.secondary?.main,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: error ? theme.palette.error.main : theme.palette.secondary?.main,
                    },
                },
                '& .MuiInputLabel-root': {
                    color: error ? theme.palette.error.main : theme.palette.text.primary ,
                    textTransform: "capitalize"
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: error ? theme.palette.error.main : theme.palette.text.primary ,
                },
                '& .MuiInputBase-input': {
                    color: theme.palette.text.primary ,
                },
                '& .Mui-disabled': {
                    color: theme.palette.text.primary ,
                },
                '& .MuiFormHelperText-root': {
                    color: theme.palette.error.main,
                    fontSize: '14px',
                    fontWeight: '500',
                    marginX: 0.5
                },
                fontFamily: '"Inter", sans-serif'
            }}
            InputLabelProps={InputLabelProps}
            InputProps={{
                endAdornment: endIcon
            }}
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
});
export default Input;
