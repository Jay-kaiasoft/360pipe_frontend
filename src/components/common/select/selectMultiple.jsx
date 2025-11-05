import React, { forwardRef } from "react";
import { useTheme } from "@mui/material";
import Components from "../../muiComponents/components";

const SelectMultiple = forwardRef(
    (
        {
            size = "small",
            label,
            placeholder,
            error,
            helperText,
            value,
            onChange,
            options,
        },
        ref
    ) => {
        const theme = useTheme();
        const selectOptions =
            Array.isArray(options) && options.length > 0 ? options : [];

        return (
            <Components.Autocomplete
                multiple
                options={selectOptions}
                size={size}
                getOptionLabel={(option) => option?.title || ""}
                value={selectOptions.filter((option) =>
                    (value || []).includes(option.id)
                )}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                onChange={(event, newValue) => {
                    onChange(newValue.map((option) => option.id));
                }}
                noOptionsText={"No data found"}
                renderInput={(params) => (
                    <Components.TextField
                        {...params}
                        label={label || "Options"}
                        placeholder={placeholder || "Select options"}
                        error={!!error}
                        helperText={helperText}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "0.5rem",
                                transition:
                                    "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                                "& fieldset": {
                                    borderColor: error
                                        ? theme.palette.error.main
                                        : theme.palette.secondary.main,
                                },
                                "&:hover fieldset": {
                                    borderColor: error
                                        ? theme.palette.error.main
                                        : theme.palette.secondary.main,
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: error
                                        ? theme.palette.error.main
                                        : theme.palette.secondary.main,
                                },
                            },
                            "& .MuiInputLabel-root": {
                                color: error
                                    ? theme.palette.error.main
                                    : theme.palette.text.primary,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: error
                                    ? theme.palette.error.main
                                    : theme.palette.text.primary,
                            },
                            "& .MuiInputBase-input": {
                                color: theme.palette.text.primary,
                            },
                            "& .Mui-disabled": {
                                color: theme.palette.text.disabled,
                            },
                            "& .MuiFormHelperText-root": {
                                color: theme.palette.error.main,
                                fontSize: "14px",
                                fontWeight: "500",
                                marginX: 0.5,
                            },
                            fontFamily: '"Inter", sans-serif',
                        }}
                    />
                )}
                // ✅ Use `slotProps` instead of deprecated `componentsProps`
                // slotProps={{
                //     paper: {
                //         sx: {
                //             "& .MuiAutocomplete-option": {
                //                 padding: "0.5rem 1rem",
                //                 transition: "background-color 0.2s, color 0.2s",
                //                 // hover effect
                //                 "&:hover": {
                //                     backgroundColor: theme.palette.secondary.main,
                //                     color: "#fff",
                //                 },
                //                 // when focused by keyboard
                //                 "&.Mui-focused": {
                //                     backgroundColor: theme.palette.secondary.main,
                //                     color: "#fff",
                //                 },
                //                 // when selected
                //                 "&[aria-selected='true'], &.Mui-selected": {
                //                     backgroundColor: theme.palette.secondary.main,
                //                     color: "#fff",
                //                     "&:hover": {
                //                         backgroundColor: theme.palette.secondary.main,
                //                         color: "#fff",
                //                     },
                //                 },
                //             },
                //         },
                //     },
                // }}
                componentsProps={{
                    paper: {
                        sx: {
                            '& .MuiAutocomplete-option': {
                                padding: '0.5rem 1rem',
                                color: `${theme.palette.text.primary} !important`,
                                '&:hover': {
                                    backgroundColor: `${theme.palette.secondary.main} !important`,
                                    color: `#ffffff !important`,
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
                limitTags={2}
                id="multiple-limit-tags"
            />
        );
    }
);

export default SelectMultiple;
