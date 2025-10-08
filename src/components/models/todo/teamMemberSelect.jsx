import React, { forwardRef } from 'react';
import { useTheme, ListSubheader } from '@mui/material';
import Components from '../../muiComponents/components';

const TeamMemberSelect = forwardRef(
    (
        {
            size = 'small',
            label,
            placeholder,
            error,
            helperText,
            value,
            onChange,
            options,
            disabled = false,
        },
        ref
    ) => {
        const theme = useTheme();
        // Handle grouped data: teams + individuals
        const groupedOptions = React.useMemo(() => {
            if (!options) return [];

            const { teams = [], individuals = [] } = options;

            // Flatten into a single array for Autocomplete, but include a "group" label
            const allOptions = [];

            teams.forEach((team) => {
                allOptions.push({ group: team.name, isHeader: true });
                team.members.forEach((member) => {
                    allOptions.push({
                        group: team.name,
                        title: member.name,
                        id: member.id,
                        isHeader: false,
                    });
                });
            });

            if (individuals.length > 0) {
                allOptions.push({ group: 'Other Members', isHeader: true });
                individuals.forEach((ind) => {
                    allOptions.push({
                        group: 'Other Members',
                        title: ind.name,
                        id: ind.id,
                        isHeader: false,
                    });
                });
            }

            return allOptions;
        }, [options]);

        // Find currently selected value
        const selectedOption = groupedOptions?.find((opt) => opt.id === value) || null;
        return (
            <Components.Autocomplete
                options={groupedOptions?.filter((o) => !o.isHeader)} // only members selectable
                size={size}
                disabled={disabled}
                getOptionLabel={(option) => option?.title || ''}
                value={selectedOption}
                isOptionEqualToValue={(option, val) => option?.id === val?.id}
                onChange={(_, newValue) => onChange(newValue || '')}
                groupBy={(option) => option.group || ''}
                noOptionsText="No data found"
                renderGroup={(params) => [
                    <ListSubheader
                        key={params.group}
                        sx={{
                            position: 'static',
                            pointerEvents: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            bgcolor: '#f5f5f5',
                            fontFamily: '"Inter", sans-serif',
                        }}
                    >
                        {params.group}
                    </ListSubheader>,
                    params.children,
                    // <div key={params.key} className='ml-6'>
                    //     {params.children}
                    // </div>
                ]}
                renderInput={(params) => (
                    <Components.TextField
                        {...params}
                        inputRef={ref}
                        label={label || 'Options'}
                        placeholder={placeholder || 'Select options'}
                        error={!!error}
                        helperText={helperText}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '0.5rem',
                                transition:
                                    'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
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
                                color: error
                                    ? theme.palette.error.main
                                    : theme.palette.text.primary,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: error
                                    ? theme.palette.error.main
                                    : theme.palette.text.primary,
                            },
                            '& .MuiInputBase-input': {
                                color: theme.palette.text.primary,
                            },
                            '& .Mui-disabled': {
                                color: theme.palette.text.primary,
                                borderColor: error
                                    ? theme.palette.error.main
                                    : theme.palette.secondary.main,
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
                                    backgroundColor: `${theme.palette.custom.default2} !important`,
                                    color: `${theme.palette.text.primary} !important`,
                                },
                                '&[aria-selected="true"]': {
                                    backgroundColor: `${theme.palette.secondary.main} !important`,
                                    color: '#ffffff !important',
                                    '&:hover': {
                                        backgroundColor: `${theme.palette.secondary.main} !important`,
                                    },
                                },
                            },
                        },
                    },
                }}
            />
        );
    }
);

export default TeamMemberSelect;
