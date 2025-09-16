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
import { verifyEmail } from '../../../service/customers/customersService';
import { getAllSubUserTypes } from '../../../service/subUserType/subUserTypeService';
import { use } from 'react';


const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function SubUserModel({ setSyncingPushStatus, setAlert, open, handleClose, id, handleGetAllUsers }) {
    const theme = useTheme()
    const [validEmail, setValidEmail] = useState(null);
    const [subUsersTypes, setSubUsersTypes] = useState([]);

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
            username: "",
            password: "",
            accountOwner: "",
            managerId: "",
            name: "",
            title: "",
            roleId: "",
            emailAddress: "",
            cellPhone: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
            quota: "",
            evalPeriod: "",
            calendarYearType: "",
            question1: "",
            question2: "",
            question3: "",
            answer1: "",
            answer2: "",
            answer3: "",
            billingAddress1: "",
            billingAddress2: "",
            billingCity: "",
            billingState: "",
            billingCountry: "",
            billingZipcode: "",
            billingPhone: "",
            dateRegistered: "",
            subUserTypeId: "",
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            id: "",
            username: "",
            password: "",
            accountOwner: "",
            managerId: "",
            name: "",
            title: "",
            roleId: "",
            emailAddress: "",
            cellPhone: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
            quota: "",
            evalPeriod: "",
            calendarYearType: "",
            question1: "",
            question2: "",
            question3: "",
            answer1: "",
            answer2: "",
            answer3: "",
            billingAddress1: "",
            billingAddress2: "",
            billingCity: "",
            billingState: "",
            billingCountry: "",
            billingZipcode: "",
            billingPhone: "",
            dateRegistered: "",
            subUserTypeId: ""
        });
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

    useEffect(() => {
        handleGetSubUserTypes();
    }, []);

    const submit = async (data) => {
        console.log("Submitted data:", data);
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
                    {accountId ? "Update" : "Create"} Sub User
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
                                                handleVerifyEmail();
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
                        </div>

                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
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