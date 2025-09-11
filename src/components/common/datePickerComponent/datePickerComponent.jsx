import React from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";
import { useTheme } from '@mui/material';
import { createTheme, ThemeProvider } from "@mui/material/styles";

const DatePickerComponent = ({ name, setValue, control, label, minDate, maxDate, required = false }) => {
  const theme = useTheme();

  const customTheme = createTheme({
    components: {
      MuiDayCalendar: {
        styleOverrides: {
          weekDayLabel: {
            color: '#000000',
          }
        }
      },
      MuiPickersDay: {
        styleOverrides: {
          root: {
            color: "#000000",
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
              color: "#ffffff",
            },
            "&.Mui-selected": {
              backgroundColor: `${theme.palette.secondary.main} !important`,
              color: "#ffffff !important",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            color: "#000000",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: theme.palette.text.primary,
          },
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          root: {
            color: "#000000",
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: "#000000",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={customTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Controller
          name={name}
          control={control}
          rules={{
            required: required
          }}
          render={({ field, fieldState }) => (
            <DatePicker
              {...field}
              label={label}
              format="MM/DD/YYYY"
              value={field.value ? dayjs(field.value) : dayjs(maxDate)}
              onChange={(date) => {
                setValue(name, date ? dayjs(date).format("MM/DD/YYYY") : null);
              }}
              minDate={minDate ? dayjs(minDate) : null}
              maxDate={maxDate ? dayjs(maxDate) : null}             
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  error: !!fieldState.error,
                  // helperText: fieldState.error ? "This field is required" : null,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0.5rem',
                      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                      '& fieldset': {
                        borderColor: fieldState.error
                          ? theme.palette.error.main
                          : theme.palette.secondary.main,
                      },
                      '&:hover fieldset': {
                        borderColor: fieldState.error
                          ? theme.palette.error.main
                          : theme.palette.secondary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: fieldState.error
                          ? theme.palette.error.main
                          : theme.palette.secondary.main,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: fieldState.error
                        ? theme.palette.error.main
                        : theme.palette.text.primary,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: fieldState.error
                        ? theme.palette.error.main
                        : theme.palette.text.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: theme.palette.text.primary,
                      height: 7,
                    },
                    '& .Mui-disabled': {
                      color: theme.palette.text.primary,
                    },
                    '& .MuiFormHelperText-root': {
                      color: theme.palette.error.main,
                      fontSize: '14px',
                      fontWeight: '500',
                      marginX: 0.5,
                    },
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;',
                  },
                },
              }}
            />
          )}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default DatePickerComponent;