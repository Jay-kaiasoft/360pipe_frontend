import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../common/select/select';
import { createSubUser, getCustomer, sendRegisterInvitation, updateSubUser, verifyEmail } from '../../../service/customers/customersService';
import { getAllSubUserTypes } from '../../../service/subUserType/subUserTypeService';


const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function SubUserModel({ setAlert, open, handleClose, id, handleGetAllUsers }) {
    const theme = useTheme()
    const [validEmail, setValidEmail] = useState(null);
    const [subUsersTypes, setSubUsersTypes] = useState([]);
    const [emailAddress, setEmailAddress] = useState(null);
    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: "",
            name: "",
            emailAddress: "",
            subUserTypeId: "",
        },
    });

    const onClose = () => {
        reset({
            id: "",
            name: "",
            emailAddress: "",
            subUserTypeId: "",
        });
        setValidEmail(null);
        handleClose();
    };

    const handleVerifyEmail = async () => {
        const email = watch("emailAddress");
        if (email) {
            const response = await verifyEmail(email);
            if (response?.data?.status === 200) {
                setValidEmail(true);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
                setValidEmail(false);
            }
        }
    };

    const handleGetUser = async () => {
        if (id && open) {
            const response = await getCustomer(id);
            if (response?.data?.status === 200) {
                setValue("id", response?.data?.result?.id || "");
                setValue("name", response?.data?.result?.name || "");
                setValue("emailAddress", response?.data?.result?.emailAddress || "");
                setEmailAddress(response?.data?.result?.emailAddress || null);
                setValue("subUserTypeId", response?.data?.result?.subUserTypeId || "");
            }
        }
    }

    const handleGetSubUserTypes = async () => {
        if (open) {
            const response = await getAllSubUserTypes();
            if (response?.status === 200) {
                const formattedSubUserTypes = response?.data?.result?.map((type) => ({
                    title: type.name,
                    id: type.id,
                }));
                setSubUsersTypes(formattedSubUserTypes);
            }
        }
    }

    const handleSendInvitation = async () => {
        const data = {
            email: watch("emailAddress"),
            name: watch("name"),
            userId: watch("id"),
        }
        const response = await sendRegisterInvitation(data);
        if (response?.data?.status === 200) {
            setAlert({
                open: true,
                type: "success",
                message: response?.data?.message || "Invitation sent successfully.",
            });
            onClose();
        } else {
            setAlert({
                open: true,
                type: "error",
                message: response?.data?.message || "An error occurred. Please try again.",
            });
        }
    }

    useEffect(() => {
        handleGetSubUserTypes();
        handleGetUser();
    }, [open]);

    const submit = async (data) => {
        if ((id && watch("emailAddress") === emailAddress) || validEmail) {
            if (id) {
                const res = await updateSubUser(id, data);
                if (res?.data.status === 200) {
                    setAlert({
                        open: true,
                        type: "success",
                        message: "Sub-user updated successfully.",
                    });
                    handleGetAllUsers();
                    onClose();
                } else {
                    setAlert({
                        open: true,
                        type: "error",
                        message: res?.data?.message || "An error occurred. Please try again.",
                    });
                }
            } else {
                const res = await createSubUser(data);
                if (res?.data.status === 201) {
                    setAlert({
                        open: true,
                        type: "success",
                        message: "Sub-user created successfully.",
                    });
                    handleGetAllUsers();
                    onClose();
                } else {
                    setAlert({
                        open: true,
                        type: "error",
                        message: res?.data?.message || "An error occurred. Please try again.",
                    });
                }
            }
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Email is not valid or already registered.",
            });
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
                    {id ? "Update" : "Create"} Sub User
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
                            <div className="mb-3">
                                <Controller
                                    name="subUserTypeId"
                                    control={control}
                                    rules={{ required: "Sub User Type is required" }}
                                    render={({ field }) => (
                                        <Select
                                            options={subUsersTypes}
                                            label="Sub User Type"
                                            placeholder="Select Sub User Type"
                                            value={parseInt(watch("subUserTypeId")) || null}
                                            onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                            error={errors?.subUserTypeId}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="emailAddress"
                                    control={control}
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Email"
                                            type={`text`}
                                            error={errors?.emailAddress}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            onBlur={() => {
                                                if (emailAddress !== watch("emailAddress")) {
                                                    handleVerifyEmail();
                                                } else {
                                                    setValidEmail(true);
                                                }
                                            }}
                                            endIcon={
                                                validEmail === true ? (
                                                    <CustomIcons iconName={'fa-solid fa-check'} css={`text-green-500`} />
                                                ) : validEmail === false ? (
                                                    <CustomIcons iconName={'fa-solid fa-xmark'} css={`text-red-500`} />
                                                ) : null
                                            }
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{
                                        required: "Name is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Name"
                                            type={`text`}
                                            error={errors.name}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4 w-[380px]'>
                            {
                                id && (
                                    <Button type={`button`} text={"Send Invitation"} useFor='success' onClick={() => handleSendInvitation()} />
                                )
                            }
                            <Button type={`submit`} text={id ? "Update" : "Submit"} />
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

export default connect(null, mapDispatchToProps)(SubUserModel)