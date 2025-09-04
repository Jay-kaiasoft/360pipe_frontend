import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';
import Checkbox from '../checkBox/checkbox';

const CheckBoxSelect = forwardRef(
  (
    {
      size = "small",
      label,
      placeholder,
      error,
      helperText,
      value = [],
      onChange,
      options,
      disabled = false,
      checkAll = false,
    },
    ref
  ) => {
    const theme = useTheme();
    const selectOptions = Array.isArray(options) && options.length > 0 ? options : [];

    // Add virtual "Select All" item only for rendering, not stored in value
    const finalOptions = checkAll
      ? [{ id: "__all__", title: "Select All" }, ...selectOptions]
      : selectOptions;

    const handleChange = (event, newValue) => {
      // Handle "Select All" click
      const allOption = newValue.find((opt) => opt.id === "__all__");

      if (allOption) {
        if (value.length === selectOptions.length) {
          // if already all selected → clear all
          onChange(event, []);
        } else {
          // otherwise select all
          onChange(event, [...selectOptions]);
        }
        return;
      }

      // Otherwise, normal multiple selection
      onChange(event, newValue);
    };

    return (
      <Components.Autocomplete
        multiple
        disableCloseOnSelect
        options={finalOptions}
        size={size}
        disabled={disabled}
        getOptionLabel={(option) => option?.title || ""}
        value={value}
        isOptionEqualToValue={(option, val) => option?.id === val?.id}
        onChange={handleChange}
        noOptionsText={"No data found"}
        renderOption={(props, option, { selected }) => {
          // Render "Select All" state
          if (option.id === "__all__") {
            const isAllChecked = value.length === selectOptions.length;
            return (
              <li {...props}>
                <Checkbox checked={isAllChecked} />
                <Components.ListItemText secondary={option.title} />
              </li>
            );
          }

          // Normal option
          return (
            <li {...props}>
              <Checkbox checked={selected} />
              <Components.ListItemText secondary={option.title} />
            </li>
          );
        }}
        componentsProps={{
          paper: {
            sx: {
              '& .MuiAutocomplete-option': {
                padding: '0.5rem 1rem',
                color: `${theme.palette.text.primary} !important`,
                '&:hover': {
                  backgroundColor: `${theme.palette.custom.default2} !important`,
                },
                '&[aria-selected="true"]': {
                  backgroundColor: `${theme.palette.secondary.main} !important`,
                  color: `#ffffff !important`,
                  '& .MuiCheckbox-root': {
                    color: `#ffffff !important`,
                  },
                },
              },
            },
          },
        }}
        renderInput={(params) => (
          <Components.TextField
            {...params}
            label={label || "Options"}
            placeholder={placeholder || "Select options"}
            error={!!error}
            helperText={helperText}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '0.5rem',
                // backgroundColor: `${theme.palette.se.main} !important`, // Input background color
                color: `${theme.palette.text.primary} !important`, // Input text color
                '& fieldset': {
                  borderColor: error
                    ? theme.palette.error.main
                    : theme.palette.secondary.main,
                },
                '&:hover fieldset': {
                  borderColor: error
                    ? theme.palette.error.main
                    : theme.palette.secondary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: error
                    ? theme.palette.error.main
                    : theme.palette.secondary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: `${theme.palette.text.primary} !important`, 
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: `${theme.palette.text.primary} !important`, // Focused input label color
              },
              '& .MuiInputBase-input': {
                color: `${theme.palette.text.primary} !important`, // Input text color
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
      />
    );
  }
);

export default CheckBoxSelect;
