import * as React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const PrimaryInput = React.forwardRef<HTMLInputElement, TextFieldProps>(
    ({ variant = "outlined", fullWidth = true, required = false, name = "", type = "text", slotProps, ...rest }, ref) => {
        // password input functions
        const isPassword = type === "password";
        const [showPassword, setShowPassword] = React.useState(false);
        const handleClickShowPassword = () => setShowPassword((show) => !show);
        const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
        };
        const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
        };

        return (
            <TextField
                inputRef={ref}
                type={type}
                variant={variant}
                fullWidth={fullWidth}
                required={required}
                slotProps={{
                    ...slotProps,
                    inputLabel: {
                    shrink: true,
                    ...(slotProps?.inputLabel || {}),
                    },
                    input: {
                        type: isPassword ? (showPassword ? "text" : "password") : type,
                        endAdornment: isPassword ? 
                            (<InputAdornment position="end">
                                <IconButton
                                aria-label={
                                    showPassword ? 'hide the password' : 'display the password'
                                }
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                                >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>)
                            :
                            null
                    }
                }}
                {...rest}
            />
        );
    }
);

PrimaryInput.displayName = "PrimaryInput";

export default PrimaryInput;