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
      value = [],
      onChange,
      options,
      disabled = false,
      checkAll = false,
      maxVisibleChips = 2, // Add this prop
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

    // Function to render custom input with limited chips
    const renderCustomInput = (params) => {
      const selectedCount = value.length;
      const visibleChips = value.slice(0, maxVisibleChips);

      return (
        <Components.TextField
          {...params}
          // label={label || "Options"}
          placeholder={placeholder || "Select options"}
          error={!!error}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {visibleChips.map((option, index) => (
                  <Components.Chip
                    key={option.id}
                    label={option.title}
                    // size="small"
                    onDelete={() => {
                      const newValue = value.filter(item => item.id !== option.id);
                      onChange({}, newValue);
                    }}
                    // deleteIcon={<CustomIcons iconName={'fa fa-solid fa-xmark'}/>}
                    sx={{
                      margin: '1px',
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
                    }}
                  />
                ))}
                {selectedCount > maxVisibleChips && (
                  <Components.Chip
                    label={`+${selectedCount - maxVisibleChips} more`}
                    size="small"
                    variant="outlined"
                    sx={{
                      margin: '2px',
                      borderColor: theme.palette.secondary.main,
                      color: theme.palette.secondary.main,
                    }}
                  />
                )}
              </>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              color: `${theme.palette.text.primary} !important`,
              minHeight: '40px',
              alignItems: 'flex-start',
              paddingTop: '8px',
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
              color: `${theme.palette.text.primary} !important`,
            },
            '& .MuiInputBase-input': {
              color: `${theme.palette.text.primary} !important`,
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
      );
    };

    return (
      <div>
        <p className='mb-2 text-black text-left'>
          {label}
        </p>
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
                  <Components.ListItemText
                    secondary={option.title}
                    sx={{
                      '& .MuiTypography-root': {
                        color: isAllChecked ? '#ffffff !important' : 'inherit',
                      }
                    }}
                  />
                </li>
              );
            }

            // Normal option
            return (
              <li {...props}>
                <Checkbox checked={selected} />
                <Components.ListItemText
                  secondary={option.title}
                  sx={{
                    '& .MuiTypography-root': {
                      color: selected ? '#ffffff !important' : 'inherit',
                    }
                  }}
                />
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
          renderInput={renderCustomInput}
        />
      </div>
    );
  }
);

export default CheckBoxSelect;  