import React, { useEffect } from "react";
import { connect } from "react-redux";
import { setAlert } from "../../../redux/commonReducers/commonReducers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function GlobalAlert({ alert, setAlert }) {
  useEffect(() => {
    if (alert.open) {
      // Clear any existing toasts before showing a new one
      toast.dismiss();

      switch (alert.type) {
        case "success":
          toast.success(alert.message, { icon: "✅" });
          break;
        case "error":
          toast.error(alert.message, { icon: "❌" });
          break;
        case "warning":
          toast.warning(alert.message, { icon: "⚠️" });
          break;
        case "info":
          toast.info(alert.message, { icon: "ℹ️" });
          break;
        default:
          toast(alert.message);
      }

      // Reset redux state so it doesn’t loop
      setAlert({ open: false, message: "", type: "" });
    }
  }, [alert, setAlert]);

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="light"  // gives the colored style like your screenshot
      limit={1}        // ensures only ONE toast shows at a time
    />
  );
}

const mapStateToProps = (state) => ({
  alert: state.common.alert,
});

export default connect(mapStateToProps, { setAlert })(GlobalAlert);



// import React from 'react';
// import { setAlert } from '../../../redux/commonReducers/commonReducers';
// import { connect } from 'react-redux';
// import Components from '../../muiComponents/components';

// function GlobalAlert({ alert, setAlert }) {

//   const handleClose = (event, reason) => {
//     if (reason === 'clickaway') {
//       return;
//     }
//     setAlert({ open: false, message: '', type: '' })
//   };
  
//   return (
//     <div>
//       <Components.Snackbar open={alert.open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
//         <Components.Alert
//           onClose={handleClose}
//           severity={alert.type}
//           variant="filled"
//           sx={{ width: '100%' }}
//         >
//           {alert.message}
//         </Components.Alert>
//       </Components.Snackbar>
//     </div>
//   );
// }

// const mapStateToProps = (state) => ({
//   alert: state.common.alert,
// });

// const mapDispatchToProps = {
//   setAlert,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(GlobalAlert);