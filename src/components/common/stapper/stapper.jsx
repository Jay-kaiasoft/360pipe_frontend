import { StepConnector, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomIcons from '../icons/CustomIcons';
import Components from '../../muiComponents/components';

export default function Stapper({ steps, activeStep, orientation = "vertical", labelFontSize, width = null, show }) {
  const theme = useTheme();

  const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: ownerState.completed ? theme.palette.secondary.main : '',
    zIndex: 1,
    color: '#fff',
    width: 24,
    height: 24,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: ownerState.active ? 6 : 4,
    borderColor: ownerState.completed ? theme.palette.secondary.main : ownerState.active ? theme.palette.secondary.main : '#E0E7FF',
  }));

  function CustomStepIcon(props) {
    const { active, completed, icon, className } = props;

    return (
      <CustomStepIconRoot ownerState={{ completed, active }} className={className}>
        {completed ? (
          <CustomIcons iconName="fa-solid fa-check" css="cursor-pointer text-xs" />
        ) : active ? (
          <div className="w-2 h-2 bg-white rounded-full" />
        ) : (
          <span style={{ fontSize: 12, color: "#000000", fontWeight: 800 }}>{icon}</span>
        )}
      </CustomStepIconRoot>
    );
  }


  const CustomConnector = styled(StepConnector)(({ theme }) => ({
    [`&.MuiStepConnector-root`]: {
      marginLeft: orientation !== "horizontal" ? 11 : 0,
    },
    [`& .MuiStepConnector-line`]: {
      borderWidth: orientation !== "horizontal" ? 0 : 3,
      borderLeftWidth: orientation !== "horizontal" ? 3 : 0,
      minHeight: orientation !== "horizontal" ? 24 : 5,
      transition: 'border-color 0.3s ease',
      borderColor: '#E0E7FF',
    },
    // When the step is active
    [`&.Mui-active .MuiStepConnector-line`]: {
      borderColor: theme.palette.secondary.main,
    },
    // When the step is completed
    [`&.Mui-completed .MuiStepConnector-line`]: {
      borderColor: theme.palette.secondary.main,
    },
  }));

  return (
    <Components.Box sx={{ width: { sm: width !== null ? width : '100%' } }}>
      <Components.Stepper
        activeStep={activeStep}
        orientation={orientation}
        connector={<CustomConnector />}
      >
        {steps?.map((label, index) => (
          <Components.Step key={index}>
            <Components.StepLabel
              StepIconComponent={CustomStepIcon}
              sx={{
                '& .MuiStepLabel-label': {
                  color: activeStep >= index
                    ? theme.palette.text.primary   // ✅ fixed
                    : theme.palette.text.disabled,
                  fontSize: labelFontSize || '0.875rem',
                  textTransform: 'capitalize',
                  fontFamily: '"Inter", sans-serif',
                },
              }}
            >
              {/* {label || index + 1} */}
            </Components.StepLabel>
          </Components.Step>
        ))}
      </Components.Stepper>
    </Components.Box>
  );
}
