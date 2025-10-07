import * as React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';

const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "contained", color = "primary", size = "large", ...rest }, ref) => {
    return (
      <Button
        ref={ ref }
        variant={ variant }
        color={ color }
        size={ size }
        disableElevation
        { ...rest }
      >
        { children }
      </Button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;