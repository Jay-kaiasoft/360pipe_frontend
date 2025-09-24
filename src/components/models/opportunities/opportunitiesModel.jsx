import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, set, useFieldArray, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';

import { createOpportunity, getOpportunityDetails, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import { getAllAccounts } from '../../../service/account/accountService';
import { opportunityStages, partnerRoles } from '../../../service/common/commonService';
import { createOpportunitiesPartner, updateOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function OpportunitiesModel({ setAlert, open, handleClose, opportunityId, handleGetAllOpportunities, setSyncingPushStatus }) {
    const theme = useTheme()
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            closeDate: null,
            nextSteps: null,
            accountId: null,
            salesforceOpportunityId: null,
            opportunityPartnerDetails: [{
                id: null,
                salesforceOpportunityPartnerId: null,
                opportunityId: null,
                accountToId: null,
                accountId: null,
                role: null,
                roleid: null,
                isPrimary: false,
                isDeleted: false,
            }],
        },
    });
    const { fields: opportunityPartnerDetails, append, remove } = useFieldArray({
        control,
        name: 'opportunityPartnerDetails',
    });

    const onClose = () => {
        setLoading(false);
        reset({
            accountId: null,
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            closeDate: null,
            nextSteps: null,
            salesforceOpportunityId: null,
            opportunityPartnerDetails: [{
                id: null,
                salesforceOpportunityPartnerId: null,
                opportunityId: null,
                accountToId: null,
                accountId: null,
                role: null,
                roleid: null,
                isPrimary: false,
                isDeleted: false,
            }],
        });
        handleClose();
    };

    const handleGetOpportunityDetails = async () => {
        if (opportunityId && open) {
            const res = await getOpportunityDetails(opportunityId);
            if (res?.status === 200) {
                reset(res?.result);
                setValue("salesStage", opportunityStages?.find(stage => stage.title === res?.result?.salesStage)?.id || null);
                if (res?.result?.opportunityPartnerDetails?.length > 0) {
                    const formattedDetails = res?.result?.opportunityPartnerDetails?.map((item) => ({
                        ...item,
                        roleid: partnerRoles?.find(role => role.title === item.role)?.id || null,
                        opportunityId: opportunityId,
                    }));
                    setValue('opportunityPartnerDetails', formattedDetails);
                } else {
                    setValue('opportunityPartnerDetails', [{
                        id: null,
                        salesforceOpportunityPartnerId: null,
                        opportunityId: null,
                        accountToId: null,
                        accountId: null,
                        role: null,
                        roleid: null,
                        isPrimary: false,
                        isDeleted: false,
                    }]);
                }
            }
        }
    }

    const handleGetAllAccounts = async () => {
        if (open) {
            setLoading(true);
            const res = await getAllAccounts();
            if (res?.status === 200) {
                const data = res?.result?.map((acc) => ({
                    title: acc.accountName,
                    id: acc.id,
                    salesforceAccountId: acc.salesforceAccountId
                }));
                setAccounts(data);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        handleGetAllAccounts()
        handleGetOpportunityDetails()
    }, [open])

    const submit = async (data) => {
        setLoading(true);
        const newData = {
            ...data,
            salesStage: opportunityStages?.find(stage => stage.id === parseInt(data.salesStage))?.title || null,
        }
        const opportunityPartnerDetails = watch("opportunityPartnerDetails")
        opportunityPartnerDetails.map(async (item) => {
            if (item.id) {
                await updateOpportunitiesPartner(item.id, item);
            } else {
                await createOpportunitiesPartner(item);
            }
        });
        try {
            if (opportunityId) {
                const res = await updateOpportunity(opportunityId, newData);
                if (res?.status === 200) {
                    if (watch("salesforceOpportunityId") !== null && watch("salesforceOpportunityId") !== "") {
                        setSyncingPushStatus(true);
                    }
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: "Opportunity updated successfully",
                        type: "success"
                    });
                    handleGetAllOpportunities();
                    // handleGetAllSyncRecords();
                    onClose();
                } else {
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to update opportunity",
                        type: "error"
                    });
                }
            } else {
                const res = await createOpportunity(newData);
                if (res?.status === 201) {
                    setSyncingPushStatus(true);
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: "Opportunity created successfully",
                        type: "success"
                    });
                    handleGetAllOpportunities();
                    // handleGetAllSyncRecords();
                    onClose();
                } else {
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to create opportunity",
                        type: "error"
                    });
                }
            }
        } catch (err) {
            setLoading(false);
            setAlert({
                open: true,
                message: err.message || "Something went wrong",
                type: "error"
            })
        }
    }

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    {opportunityId ? "Update" : "Create"} Opportunity
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
                        <div className='grid grid-cols-3 gap-4'>
                            <Controller
                                name="accountId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={accounts}
                                        label={"Account"}
                                        placeholder="Select Account"
                                        value={parseInt(watch("accountId")) || null}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) {
                                                field.onChange(newValue.id);
                                            } else {
                                                setValue("accountId", null);
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="opportunity"
                                control={control}
                                rules={{
                                    required: "Opportunity name is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Opportunity Name"
                                        type={`text`}
                                        error={errors.opportunity}
                                        onChange={(e) => {
                                            field.onChange(e);
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="dealAmount"
                                control={control}
                                rules={{
                                    required: "Deal amount is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Deal Amount"
                                        type={`text`}
                                        error={errors.dealAmount}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="salesStage"
                                control={control}
                                rules={{
                                    required: "Sales stage is required",
                                }}
                                render={({ field }) => (
                                    <Select
                                        options={opportunityStages}
                                        label={"Stage"}
                                        placeholder="Select Stage"
                                        value={parseInt(watch("salesStage")) || null}
                                        error={errors.salesStage}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) {
                                                field.onChange(newValue.id);
                                            } else {
                                                setValue("salesStage", null);
                                            }
                                        }}
                                    />
                                )}
                            />
                            <DatePickerComponent setValue={setValue} control={control} name='closeDate' label={`Close Date`} minDate={new Date()} maxDate={null} required={true} />
                            <Controller
                                name="nextSteps"
                                control={control}
                                rules={{
                                    required: "Next steps is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Next Steps"
                                        type={`text`}
                                        error={errors.nextSteps}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <div className='font-semibold my-5'>Opportunity Partner Details</div>
                            {opportunityPartnerDetails?.map((item, index) => (
                                <div className='grid grid-cols-3 gap-4' key={index}>
                                    <div className='mb-3'>
                                        <Controller
                                            name={`opportunityPartnerDetails.${index}.accountId`}
                                            control={control}
                                            rules={{
                                                required: "Account is required",
                                            }}
                                            render={({ field }) => (
                                                <Select
                                                    options={accounts}
                                                    label={"Account"}
                                                    placeholder="Select Account"
                                                    value={parseInt(watch(`opportunityPartnerDetails.${index}.accountId`)) || null}
                                                    error={errors?.opportunityPartnerDetails?.[index]?.accountId}
                                                    onChange={(_, newValue) => {
                                                        if (newValue?.id) {
                                                            field.onChange(newValue.id);
                                                            setValue(`opportunityPartnerDetails.${index}.accountToId`, newValue.salesforceAccountId || null);
                                                        } else {
                                                            setValue(`opportunityPartnerDetails.${index}.accountToId`, null);
                                                            setValue(`opportunityPartnerDetails.${index}.accountId`, null);
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <Controller
                                            name={`opportunityPartnerDetails.${index}.role`}
                                            control={control}
                                            rules={{
                                                required: "Role is required",
                                            }}
                                            render={({ field }) => (
                                                <Select
                                                    options={partnerRoles}
                                                    label={"Role"}
                                                    placeholder="Select Role"
                                                    value={parseInt(watch(`opportunityPartnerDetails.${index}.roleid`)) || null}
                                                    error={errors?.opportunityPartnerDetails?.[index]?.role}
                                                    onChange={(_, newValue) => {
                                                        if (newValue?.id) {
                                                            field.onChange(newValue.id);
                                                            setValue(`opportunityPartnerDetails.${index}.roleid`, newValue.id);
                                                            setValue(`opportunityPartnerDetails.${index}.role`, newValue.title);
                                                        } else {
                                                            setValue(`opportunityPartnerDetails.${index}.role`, null);
                                                            setValue(`opportunityPartnerDetails.${index}.roleid`, null);
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <div className='flex items-center justify-start gap-2'>
                                            <div className='bg-blue-600 h-8 w-8 rounded-full text-white'>
                                                <Components.IconButton onClick={() => append({
                                                    id: null,
                                                    salesforceOpportunityPartnerId: null,
                                                    opportunityId: opportunityId,
                                                    accountToId: null,
                                                    accountId: null,
                                                    role: null,
                                                    roleid: null,
                                                    isPrimary: false,
                                                    isDeleted: false,
                                                })}>
                                                    <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-4 w-4' />
                                                </Components.IconButton>
                                            </div>
                                            <div>
                                                {
                                                    opportunityPartnerDetails?.length > 1 && (
                                                        <div className='bg-red-600 h-8 w-8 rounded-full text-white'>
                                                            <Components.IconButton onClick={() => remove(index)}>
                                                                <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                                            </Components.IconButton>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={opportunityId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(OpportunitiesModel)
