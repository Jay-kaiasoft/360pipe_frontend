import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { getAllSubUsers } from '../../../service/customers/customersService';
import { getAllOpportunities } from '../../../service/opportunities/opportunitiesService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddTeamMemberModel({ open, handleClose, selectedMember, append }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
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
            memberId: null,
            oppId: null,
            memberName: '',
            oppName: '',
            role: ''
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            memberId: null,
            oppId: null,
            memberName: '',
            oppName: '',
            role: ''
        });
        handleClose();
    };

    const handleGetAllCustomers = async () => {
        if (open) {
            const res = await getAllSubUsers()
            const data = res?.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.name,
                    role: item.subUserTypeDto?.name || ''
                }
            })
            setCustomers(data)
        }
    }

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
        handleGetAllCustomers();
        handleGetAllOpportunities();
    }, [open])

    const submit = async (data) => {
        console.log(data)
        append({
            memberId: data.memberId,
            memberName: data.memberName,
            oppId: data.oppId,
            oppName: data.oppName,
            role: data.role
        });
        handleClose();
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
                    {selectedMember ? "Update" : "Add"} Member
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
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Controller
                                    name="memberId"
                                    control={control}
                                    rules={{
                                        required: "Member is required"
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            options={customers}
                                            label={"Account"}
                                            placeholder="Select account"
                                            value={parseInt(watch("memberId")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                    setValue("memberName", newValue.title);
                                                    setValue("role", newValue.role);
                                                } else {
                                                    setValue("memberId", null);
                                                    setValue("memberName", '');
                                                    setValue("role", '');
                                                }
                                            }}
                                            error={errors?.memberId}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="oppId"
                                    control={control}
                                    rules={{
                                        required: "Opportunity is required"
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            options={opportunities}
                                            label={"Opportunity"}
                                            placeholder="Select opportunity"
                                            value={parseInt(watch("oppId")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                    setValue("oppName", newValue.title);
                                                } else {
                                                    setValue("oppId", null);
                                                    setValue("oppName", '');
                                                }
                                            }}
                                            error={errors?.oppId}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={selectedMember ? "Update" : "Submit"} isLoading={loading} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

export default AddTeamMemberModel;