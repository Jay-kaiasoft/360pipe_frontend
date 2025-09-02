import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';

const SelectMultiple = forwardRef(({ size = "small", label, placeholder, error, helperText, value, onChange, options }, ref) => {
    const theme = useTheme();
    const selectOptions = Array.isArray(options) && options.length > 0 ? options : [];

    return (
        <Components.Autocomplete
            multiple={true}
            options={selectOptions}
            size={size}
            getOptionLabel={(option) => option?.title || ''}
            value={selectOptions.filter((option) => (value || []).includes(option.id))}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(event, newValue) => {
                onChange(newValue.map((option) => option.id));                
            }}
            noOptionsText={'No data found'}
            renderInput={(params) => (
                <Components.TextField
                    {...params}
                    label={label || 'Options'}
                    placeholder={placeholder || 'Select options'}
                    error={!!error}
                    helperText={helperText}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '0.5rem',
                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            '& fieldset': {
                                borderColor: error ? theme.palette.error.main : theme.palette.secondary.main,
                            },
                            '&:hover fieldset': {
                                borderColor: error ? theme.palette.error.main : theme.palette.secondary.main,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: error ? theme.palette.error.main : theme.palette.secondary.main,
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: error ? theme.palette.error.main : theme.palette.text.primary,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: error ? theme.palette.error.main : theme.palette.text.primary,
                        },
                        '& .MuiInputBase-input': {
                            color: theme.palette.text.primary,
                        },
                        '& .Mui-disabled': {
                            color: theme.palette.text.disabled,
                        },
                        '& .MuiFormHelperText-root': {
                            color: theme.palette.error.main,
                            fontSize: '14px',
                            fontWeight: '500',
                            marginX: 0.5,
                        },
                        fontFamily: '"Inter", sans-serif',
                    }}
                />
            )}
            componentsProps={{
                paper: {
                    sx: {
                        '& .MuiAutocomplete-option': {
                            padding: '0.5rem 1rem',
                            '&:hover': {
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.disabled,
                            },
                        },
                    },
                },
            }}
            limitTags={2}
            id="multiple-limit-tags"
        />
    );
});

export default SelectMultiple;