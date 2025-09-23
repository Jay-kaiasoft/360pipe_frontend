import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';

import { getAllOpportunities } from '../../../service/opportunities/opportunitiesService';
import { createContact, getContactDetails, updateContact } from '../../../service/contact/contactService';
import { opportunityContactRoles } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function ContactModel({ setSyncingPushStatus, setAlert, open, handleClose, contactId, handleGetAllContacts }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);
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
            id: null,
            opportunityId: null,
            salesforceContactId: null,
            firstName: null,
            middleName: null,
            lastName: null,
            linkedinProfile: null,
            title: null,
            emailAddress: null,
            role: null,
            notes: null,
            keyContact: null,
            recordStatus: null,
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            id: null,
            opportunityId: null,
            salesforceContactId: null,
            firstName: null,
            middleName: null,
            lastName: null,
            linkedinProfile: null,
            title: null,
            emailAddress: null,
            role: null,
            notes: null,
            keyContact: null,
            recordStatus: null,
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

    const handleGetContactDetails = async () => {
        if (contactId && open) {
            const res = await getContactDetails(contactId);
            if (res?.status === 200) {
                reset(res?.result);
                if (res?.result?.role != null && res?.result?.role !== "") {
                    setValue("role", opportunityContactRoles.find(role => role.title === res?.result?.role)?.id || null);
                }
            }
        }
    }

    useEffect(() => {
        handleGetAllOpportunities()
        handleGetContactDetails()
    }, [open])

    const submit = async (data) => {
        setLoading(true);
        const newData = {
            ...data,
            role: data?.role ? opportunityContactRoles.find(role => role.id === data.role)?.title : null,
        }
        try {
            if (contactId) {
                const res = await updateContact(contactId, newData);
                if (res?.status === 200) {
                    if (watch("salesforceContactId") !== null && watch("salesforceContactId") !== "") {
                        setSyncingPushStatus(true);
                    }
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: "Contact updated successfully",
                        type: "success"
                    });
                    handleGetAllContacts();
                    onClose();
                } else {
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to update contact",
                        type: "error"
                    });
                }
            } else {
                const res = await createContact(newData);
                if (res?.status === 201) {
                    setSyncingPushStatus(true);
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: "Contact created successfully",
                        type: "success"
                    });
                    handleGetAllContacts();
                    onClose();
                } else {
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to create contact",
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
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    {contactId ? "Update" : "Add New"} Contact
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
                                    name="opportunityId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={opportunities}
                                            label={"Opportunity"}
                                            placeholder="Select Opportunity"
                                            value={parseInt(watch("opportunityId")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("opportunityId", null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            <Controller
                                name="firstName"
                                control={control}
                                rules={{
                                    required: "First name is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="First Name"
                                        type={`text`}
                                        error={errors.firstName}
                                    />
                                )}
                            />
                            <Controller
                                name="lastName"
                                control={control}
                                rules={{
                                    required: "Last name is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Last Name"
                                        type={`text`}
                                        error={errors.lastName}
                                    />
                                )}
                            />
                            <Controller
                                name="title"
                                control={control}
                                rules={{
                                    required: "Title is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Title"
                                        type={`text`}
                                        error={errors.title}
                                    />
                                )}
                            />
                            <Controller
                                name="emailAddress"
                                control={control}
                                rules={{
                                    required: "Email address is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Email address is invalid",
                                    },
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Email Address"
                                        type={`text`}
                                        error={errors.emailAddress}
                                    />
                                )}
                            />
                            {/* <div>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={opportunityContactRoles}
                                            label={"Role"}
                                            placeholder="Select Role"
                                            value={parseInt(watch("role")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("role", null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div> */}
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={contactId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(ContactModel)
