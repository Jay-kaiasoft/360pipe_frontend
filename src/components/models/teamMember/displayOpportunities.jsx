// import React, { useEffect, useState } from 'react';
// import { styled, useTheme } from '@mui/material/styles';
// import { Chip, Grid, Typography } from '@mui/material';

// import Components from '../../muiComponents/components';
// import CustomIcons from '../../common/icons/CustomIcons';
// import { getAllOpportunities } from '../../../service/opportunities/opportunitiesService';

// const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
//     '& .MuiDialogContent-root': {
//         padding: theme.spacing(2),
//     },
//     '& .MuiDialogActions-root': {
//         padding: theme.spacing(1),
//     },
// }));

// function OpenDisplayOpportunities({ open, handleClose, selectedMember }) {
//     const theme = useTheme();
//     const [opportunities, setOpportunities] = useState([]);

//     const onClose = () => {
//         setOpportunities([]);
//         handleClose();
//     };

//     const handleGetAllOpportunities = async () => {
//         if (open) {
//             const res = await getAllOpportunities();
//             const data = res?.result
//                 ?.map((item) => ({
//                     id: item.id,
//                     title: item.opportunity,
//                 }))
//                 .filter((opportunity) =>
//                     selectedMember?.opportunities?.includes(opportunity.id)
//                 );
//             setOpportunities(data);
//         }
//     };

//     useEffect(() => {
//         handleGetAllOpportunities();
//     }, [open]);

//     return (
//         <React.Fragment>
//             <BootstrapDialog
//                 open={open}
//                 aria-labelledby="customized-dialog-title"
//                 fullWidth
//                 maxWidth="sm"
//             >
//                 <Components.DialogTitle
//                     sx={{ m: 0, p: 2, color: theme.palette.text.primary }}
//                     id="customized-dialog-title"
//                 >
//                     Assigned Opportunities To {selectedMember?.memberName}
//                 </Components.DialogTitle>

//                 <Components.IconButton
//                     aria-label="close"
//                     onClick={onClose}
//                     sx={{
//                         position: 'absolute',
//                         right: 8,
//                         top: 8,
//                         color: theme.palette.primary.icon,
//                     }}
//                 >
//                     <CustomIcons
//                         iconName={'fa-solid fa-xmark'}
//                         css="cursor-pointer text-black w-5 h-5"
//                     />
//                 </Components.IconButton>

//                 <Components.DialogContent dividers>
//                     <div className="w-full">
//                         {opportunities.length > 0 ? (
//                             <>                               
//                                 <Components.Grid container spacing={1}>
//                                     {opportunities.map((opportunity) => (
//                                         <Components.Grid item key={opportunity.id}>
//                                             <Components.Chip
//                                                 label={opportunity.title}
//                                                 color="primary"
//                                                 variant="outlined"
//                                                 sx={{ fontWeight: 500, color: "black",borderColor: "black" }}
//                                             />
//                                         </Components.Grid>
//                                     ))}
//                                 </Components.Grid>
//                             </>
//                         ) : (
//                             <Components.Typography variant="body2" color="text.secondary">
//                                 No opportunities assigned.
//                             </Components.Typography>
//                         )}
//                     </div>
//                 </Components.DialogContent>
//             </BootstrapDialog>
//         </React.Fragment>
//     );
// }

// export default OpenDisplayOpportunities;


import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';

import Components from '../../muiComponents/components';
import CustomIcons from '../../common/icons/CustomIcons';
import { getAllOpportunities } from '../../../service/opportunities/opportunitiesService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function OpenDisplayOpportunities({ open, handleClose, selectedMember, type }) {
  const theme = useTheme();
  const [opportunities, setOpportunities] = useState([]);

  const onClose = () => {
    setOpportunities([]);
    handleClose();
  };

  const handleGetAllOpportunities = async () => {
    if (open) {
      const res = await getAllOpportunities();
      const data = res?.result
        ?.map((item) => ({
          id: item.id,
          title: item.opportunity,
        }))
        .filter((opportunity) =>
          selectedMember?.opportunities?.includes(opportunity.id)
        );
      setOpportunities(data);
    }
  };

  useEffect(() => {
    handleGetAllOpportunities();
  }, [open]);

  return (
    <React.Fragment>
      <BootstrapDialog
        open={open}
        aria-labelledby="customized-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <Components.DialogTitle
          sx={{ m: 0, p: 2, color: theme.palette.text.primary }}
          id="customized-dialog-title"
        >
          Assigned Opportunities To {type === "Team" ? "Team" : selectedMember?.memberName}
        </Components.DialogTitle>

        <Components.IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.primary.icon,
          }}
        >
          <CustomIcons
            iconName={'fa-solid fa-xmark'}
            css="cursor-pointer text-black w-5 h-5"
          />
        </Components.IconButton>

        <Components.DialogContent dividers>
          {opportunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                      #
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                      Opportunity Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opportunity, index) => (
                    <tr
                      key={opportunity.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2 border-b text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 border-b text-sm text-gray-800 font-medium">
                        {opportunity.title}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No opportunities assigned.</p>
          )}
        </Components.DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );
}

export default OpenDisplayOpportunities;
