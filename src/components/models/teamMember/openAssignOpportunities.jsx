import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { getAllSubUsers } from '../../../service/customers/customersService';
import { getAllOpportunities } from '../../../service/opportunities/opportunitiesService';
import CheckBoxSelect from '../../common/select/checkBoxSelect';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function OpenAssignOpportunities({ open, handleClose, selectedMember, members, append, update }) {
  const theme = useTheme()

  const [opportunities, setOpportunities] = useState([]);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      teamMemberId: null,
      memberId: null,
      memberName: null,
      opportunities: null,
      role: null,
      assignMemberName: null,
    },
  });

  const onClose = () => {
    reset({
      teamMemberId: null,
      memberId: null,
      memberName: null,
      opportunities: null,
      role: null,
      assignMemberName: null,
    });
    handleClose();
  };

  const handleGetAllOpportunities = async () => {
    if (open) {
      const res = await getAllOpportunities()
      const data = res?.result?.map((item) => {
        return {
          id: item.id,
          title: item.opportunity
        }
      })
      setOpportunities(data)
    }
  }

  useEffect(() => {
    handleGetAllOpportunities();
  }, [open])

  useEffect(() => {
    if (selectedMember && open) {
      setValue("teamMemberId", selectedMember.teamMemberId || null);
      setValue("memberId", selectedMember.memberId || null);
      setValue("memberName", selectedMember.memberName || null);
      setValue("role", selectedMember.role || null);
      setValue("opportunities", selectedMember.opportunities || []);
      setValue("assignMemberName", selectedMember.assignMemberName || null);
    }
  }, [selectedMember])

  const submit = async (data) => {
    if (selectedMember) {
      // Update existing member - find the index and update
      const index = members.findIndex(field =>
        field.teamMemberId === selectedMember.teamMemberId
      );

      if (index !== -1 && update) {
        update(index, {
          teamMemberId: selectedMember.teamMemberId,
          memberId: data.memberId,
          memberName: data.memberName,
          role: data.role,
          opportunities: data.opportunities
        });
      }
    } else {
      append({
        memberId: data.memberId,
        memberName: data.memberName,
        opportunities: data.opportunities,
        role: data.role
      });
    }
    onClose();
  }

  return (
    <React.Fragment>
      <BootstrapDialog
        open={open}
        aria-labelledby="customized-dialog-title"
        fullWidth
        maxWidth='sm'
      >
        <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
          Assign Opportunities To {selectedMember?.memberName}
        </Components.DialogTitle>

        <Components.IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.primary.icon,
          })}
        >
          <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
        </Components.IconButton>

        <form noValidate onSubmit={handleSubmit(submit)}>
          <Components.DialogContent dividers>
            <div className='grid grid-cols-1 gap-4'>          
              <div>
                <Controller
                  name="opportunities"
                  control={control}
                  render={({ field }) => {
                    const selectedOptions = opportunities.filter((opp) =>
                      (field.value || []).includes(opp.id)
                    );

                    return (
                      <CheckBoxSelect
                        options={opportunities}
                        label="Select Opportunities"
                        value={selectedOptions}
                        onChange={(event, newValue) => {
                          const newIds = newValue.map((opt) => opt.id);
                          field.onChange(newIds);
                        }}
                        checkAll={true}
                      />
                    );
                  }}
                />
              </div>
            </div>
          </Components.DialogContent>

          <Components.DialogActions>
            <div className='flex justify-end'>
              <Button type={`submit`} text={"Assign"} />
            </div>
          </Components.DialogActions>
        </form>
      </BootstrapDialog>
    </React.Fragment>
  );
}

export default OpenAssignOpportunities;