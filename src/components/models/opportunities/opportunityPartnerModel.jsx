import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';

import { getAllAccounts } from '../../../service/account/accountService';
import { partnerRoles } from '../../../service/common/commonService';
import { createOpportunitiesPartner, getOpportunitiesPartner, updateOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function OpportunitiesPartnersModel({ setAlert, open, handleClose, id, opportunityId, handleGetAllOpportunitiesPartners, setSyncingPushStatus }) {
    const theme = useTheme()
    const [accounts, setAccounts] = useState([])

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: null,
            salesforceOpportunityPartnerId: null,
            opportunityId: null,
            accountToId: null,
            accountId: null,
            role: null,
            roleid: null,
            isPrimary: false,
            isDeleted: false,
        },
    });

    const onClose = () => {
        reset({
            id: null,
            salesforceOpportunityPartnerId: null,
            opportunityId: null,
            accountToId: null,
            accountId: null,
            role: null,
            roleid: null,
            isPrimary: false,
            isDeleted: false,
        });
        handleClose();
    };

    const handleGetAllAccounts = async () => {
        if (open && opportunityId) {
            const res = await getAllAccounts("fetchType=Options");
            if (res?.status === 200) {
                const data = res?.result?.map((acc) => ({
                    title: acc.accountName,
                    id: acc.id,
                    salesforceAccountId: acc.salesforceAccountId
                }));
                setAccounts(data);
            }
        }
    };

    const handleGetOppPartner = async () => {
        if (open && id) {
            const res = await getOpportunitiesPartner(id);
            if (res?.status === 200) {                
                reset(res.result)
            }
        }
    };

    useEffect(() => {
        handleGetAllAccounts()
        handleGetOppPartner()
    }, [open])

    const submit = async (data) => {
        const newData = {
            ...data,
            opportunityId: opportunityId
        }
        if (id) {
            const res = await updateOpportunitiesPartner(id, newData)
            if (res.status === 200) {
                if (watch("salesforceOpportunityPartnerId") !== null && watch("salesforceOpportunityPartnerId") !== "") {
                    setSyncingPushStatus(true);
                }
                handleGetAllOpportunitiesPartners()
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: res.message || "Fail to update opportunity partner"
                })
            }
        } else {
            const res = await createOpportunitiesPartner(newData);
            if (res.status === 201) {
                handleGetAllOpportunitiesPartners()
                setSyncingPushStatus(true);
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: res.message || "Fail to add opportunity partner"
                })
            }
        }
        // setSyncingPushStatus(true);

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
                    {id ? "Update" : "Create"} Opportunity Partner
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

                <form noValidate onSubmit={handleSubmit(submit)} className='h-full'>
                    <Components.DialogContent dividers>
                        <div className='grid md:grid-cols-2 gap-4'>
                            <div className='mb-3'>
                                <Controller
                                    name={`accountId`}
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={accounts || []} // Prevent selecting the same account in both fields
                                            label={"Account"}
                                            placeholder="Select Account"
                                            value={parseInt(watch(`accountId`)) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                    setValue(`accountToId`, newValue.salesforceAccountId || null);
                                                } else {
                                                    setValue(`accountToId`, null);
                                                    setValue(`accountId`, null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name={`role`}
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={partnerRoles}
                                            label={"Role"}
                                            placeholder="Select Role"
                                            value={parseInt(watch(`roleid`)) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                    setValue(`roleid`, newValue.id);
                                                    setValue(`role`, newValue.title);
                                                } else {
                                                    setValue(`role`, null);
                                                    setValue(`roleid`, null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            <Button type={`submit`} text={id ? "Update" : "Submit"} />
                            <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(OpportunitiesPartnersModel)