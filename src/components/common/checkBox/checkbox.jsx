import React from "react";
import Components from "../../muiComponents/components";
import { useTheme } from "@mui/material";

const Checkbox = ({ text, onChange, checked = false, disabled }) => {
    const theme = useTheme();

    return (
        <Components.FormGroup>
            <Components.FormControlLabel
                control={
                    <Components.Checkbox
                        disabled={disabled}
                        size="small"
                        sx={{
                            "&.Mui-checked": {
                                color: theme.palette.secondary.main,
                            },
                            "&.MuiSvgIcon-root": {
                                color: theme.palette.secondary.main,
                            },
                            color: theme.palette.secondary.main,
                            paddingY: 0,
                        }}
                        checked={checked}
                        onChange={onChange}
                        
                    />
                }                
                label={text}
                sx={{
                    color: theme.palette.secondary.main,
                    margin: 0,
                }}
            />            
        </Components.FormGroup>
    );
};

export default Checkbox;
