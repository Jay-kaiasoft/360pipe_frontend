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
import { createSubUser, getCustomer, sendRegisterInvitation, updateSubUser, verifyEmail, verifyUsername } from '../../../service/customers/customersService';
import { getAllSubUserTypes } from '../../../service/subUserType/subUserTypeService';
// import { getAllCRM } from '../../../service/crm/crmService';
import { createQuota, updateQuota } from '../../../service/customerQuota/customerQuotaService';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';
import dayjs from 'dayjs';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const terms = [
    { id: 1, title: "Monthly", value: 1 },
    { id: 2, title: "Quarterly", value: 3 },
    { id: 3, title: "Semi-Annual", value: 6 },
    { id: 4, title: "Yearly", value: 12 },
]

const calendarType = [
    { id: 1, title: "Calendar Year" },
    { id: 2, title: "Financial Year" },
]

function SubUserModel({ setSyncingPushStatus, setAlert, open, handleClose, id, handleGetAllUsers }) {
    const theme = useTheme()
    const [validEmail, setValidEmail] = useState(null);
    const [validUsername, setValidUsername] = useState(null);

    const [subUsersTypes, setSubUsersTypes] = useState([]);
    const [emailAddress, setEmailAddress] = useState(null);
    const [isEmailExits, setIsEmailExits] = useState(false);
    // const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    // const [showPasswordRequirement, setShowPasswordRequirement] = useState(false);

    // const [crm, setCrm] = useState([]);


    // const [passwordError, setPasswordError] = useState([
    //     {
    //         condition: (value) => value.length >= 8,
    //         message: 'Minimum 8 characters long',
    //         showError: true,
    //     },
    //     {
    //         condition: (value) => /[a-z]/.test(value),
    //         message: 'At least one lowercase character',
    //         showError: true,
    //     },
    //     {
    //         condition: (value) => /[A-Z]/.test(value),
    //         message: 'At least one uppercase character',
    //         showError: true,
    //     },
    //     {
    //         condition: (value) => /[\d@$!%*?&]/.test(value),
    //         message: 'At least one number or special character',
    //         showError: true,
    //     },
    // ]);

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
            crmId: null,
            username: "",
            password: "",
            cellPhone: "",
            calendarYearType: "",

            startEvalPeriod: null,
            endEvalPeriod: null,
            quotaId: "",
            quota: "",
            term: "",
            amount1: "",
            amount2: "",
            amount3: "",
            amount4: "",
            amount5: "",
            amount6: "",
            amount7: "",
            amount8: "",
            amount9: "",
            amount10: "",
            amount11: "",
            amount12: "",
        },
    });

    // const validatePassword = (value) => {
    //     const updatedErrors = passwordError.map((error) => ({
    //         ...error,
    //         showError: !error.condition(value),
    //     }));
    //     setPasswordError(updatedErrors);
    //     return updatedErrors.every((error) => !error.showError) || 'Password does not meet all requirements.';
    // };

    // const togglePasswordVisibility = () => {
    //     setIsPasswordVisible((prev) => !prev);
    // };

    const onClose = () => {
        reset({
            id: "",
            name: "",
            emailAddress: "",
            subUserTypeId: "",
            crmId: null,
            username: "",
            password: "",
            cellPhone: "",
            calendarYearType: "",
            
            startEvalPeriod: null,
            endEvalPeriod: null,
            quotaId: "",
            quota: "",
            term: "",
            amount1: "",
            amount2: "",
            amount3: "",
            amount4: "",
            amount5: "",
            amount6: "",
            amount7: "",
            amount8: "",
            amount9: "",
            amount10: "",
            amount11: "",
            amount12: "",
        });
        setValidEmail(null);
        setValidUsername(null);
        setIsEmailExits(false);
        setEmailAddress(null);
        handleClose();
    };

    // const handleVerifyUsername = async () => {
    //     const username = watch("username");
    //     if (username) {
    //         const response = await verifyUsername(username);
    //         if (response?.data?.status === 200) {
    //             setValidUsername(true);
    //         } else {
    //             setAlert({
    //                 open: true,
    //                 type: "error",
    //                 message: response?.data?.message || "An error occurred. Please try again.",
    //             });
    //             setValidUsername(false);
    //         }
    //     }
    // };

    const handleVerifyEmail = async () => {
        const email = watch("emailAddress");
        const accId = id || null;
        const type = "subuser";
        if (email) {
            const response = await verifyEmail(email, type, accId);
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
                if (response?.data?.result?.emailAddress) {
                    setIsEmailExits(true);
                }
                setValue("id", response?.data?.result?.id || "");
                setValue("name", response?.data?.result?.name || "");
                setValue("emailAddress", response?.data?.result?.emailAddress || "");
                setEmailAddress(response?.data?.result?.emailAddress || null);
                setValue("subUserTypeId", response?.data?.result?.subUserTypeId || "");
                setValue("username", response?.data?.result?.username || "");
                setValue("password", response?.data?.result?.password || "");
                setValue("cellPhone", response?.data?.result?.cellPhone || "");
                setValue("calendarYearType", response?.data?.result?.calendarYearType ? calendarType?.find((item) => item.title === response?.data?.result?.calendarYearType)?.id : null);
                if (response?.data?.result?.calendarYearType) {
                    setValue("startEvalPeriod", response?.data?.result?.startEvalPeriod)
                    setValue("endEvalPeriod", response?.data?.result?.endEvalPeriod)
                } else {
                    const currentYear = dayjs().year();
                    const firstDay = dayjs(`${currentYear}-01-01`).format("MM/DD/YYYY");
                    const lastDay = dayjs(`${currentYear}-12-31`).format("MM/DD/YYYY");
                    setValue("startEvalPeriod", firstDay);
                    setValue("endEvalPeriod", lastDay);
                }

                // setValue("crmId", response?.data?.result?.crmId || null);
                if (response?.data?.result?.customerQuotaDto) {
                    setValue("quotaId", response?.data?.result?.customerQuotaDto?.id || "");
                    setValue("quota", response?.data?.result?.customerQuotaDto?.quota || "");
                    const termData = terms?.find((item) => item.title === response?.data?.result?.customerQuotaDto?.term);
                    setValue("term", termData?.id || "");
                    setValue("amount1", response?.data?.result?.customerQuotaDto?.amount1 || "");
                    setValue("amount2", response?.data?.result?.customerQuotaDto?.amount2 || "");
                    setValue("amount3", response?.data?.result?.customerQuotaDto?.amount3 || "");
                    setValue("amount4", response?.data?.result?.customerQuotaDto?.amount4 || "");
                    setValue("amount5", response?.data?.result?.customerQuotaDto?.amount5 || "");
                    setValue("amount6", response?.data?.result?.customerQuotaDto?.amount6 || "");
                    setValue("amount7", response?.data?.result?.customerQuotaDto?.amount7 || "");
                    setValue("amount8", response?.data?.result?.customerQuotaDto?.amount8 || "");
                    setValue("amount9", response?.data?.result?.customerQuotaDto?.amount9 || "");
                    setValue("amount10", response?.data?.result?.customerQuotaDto?.amount10 || "");
                    setValue("amount11", response?.data?.result?.customerQuotaDto?.amount11 || "");
                    setValue("amount12", response?.data?.result?.customerQuotaDto?.amount12 || "");
                }
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
        if (watch("emailAddress") !== "" && watch("emailAddress") != null) {
            const response = await sendRegisterInvitation(data);
            if (response?.data?.status === 200) {
                setAlert({
                    open: true,
                    type: "success",
                    message: response?.data?.message || "Invitation sent successfully.",
                });
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
            }
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Email is required to send invitation.",
            });
        }
    }

    // const handleGetAllCrm = async () => {
    //     if (open) {
    //         const res = await getAllCRM()
    //         const data = res?.result?.map((item) => {
    //             return {
    //                 id: item.crmId,
    //                 title: item.name
    //             }
    //         })
    //         setCrm(data)
    //     }
    // }

    useEffect(() => {
        handleGetSubUserTypes();
        handleGetUser();
    }, [open]);


    const submit = async (data) => {
        const newData = {
            name: watch("name") || "",
            emailAddress: watch("emailAddress") || "",
            subUserTypeId: watch("subUserTypeId") || "",
            crmId: watch("crmId") || null,
            username: watch("username") || "",
            password: watch("password") || "",
            cellPhone: watch("cellPhone") || "",
            calendarYearType: calendarType?.find((item) => item.id === watch("calendarYearType"))?.title || "",
            startEvalPeriod: watch("startEvalPeriod"),
            endEvalPeriod: watch("endEvalPeriod"),
        }
        if ((id && watch("emailAddress") === emailAddress) || validEmail || validUsername) {
            if (id) {
                const res = await updateSubUser(id, newData);
                if (res?.data.status === 200) {
                    if (watch("term") !== "" && watch("term") !== null && watch("quota") !== undefined) {
                        const quotaData = {
                            customerId: watch("id"),
                            quota: watch("quota") || "",
                            term: terms?.find((item) => item.id === watch("term"))?.title || null,
                            amount1: watch("amount1") || "",
                            amount2: watch("amount2") || "",
                            amount3: watch("amount3") || "",
                            amount4: watch("amount4") || "",
                            amount5: watch("amount5") || "",
                            amount6: watch("amount6") || "",
                            amount7: watch("amount7") || "",
                            amount8: watch("amount8") || "",
                            amount9: watch("amount9") || "",
                            amount10: watch("amount10") || "",
                            amount11: watch("amount11") || "",
                            amount12: watch("amount12") || "",
                        };
                        if (watch("quotaId")) {
                            const response = await updateQuota(watch("quotaId"), quotaData);
                            if (response?.status === 200) {
                                handleGetAllUsers();
                                onClose();
                            } else {
                                setAlert({
                                    open: true,
                                    type: "error",
                                    message: response?.message || "An error occurred while updating quota. Please try again.",
                                });
                                return;
                            }
                        } else {
                            const response = await createQuota(quotaData);
                            if (response?.status === 201) {
                                handleGetAllUsers();
                                onClose();
                            } else {
                                setAlert({
                                    open: true,
                                    type: "error",
                                    message: response?.message || "An error occurred while creating quota. Please try again.",
                                });
                                return;
                            }
                        }
                    }
                    setSyncingPushStatus(true);
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
                const res = await createSubUser(newData);
                if (res?.data.status === 201) {
                    setValue("id", res?.data?.result?.id || "");
                    setSyncingPushStatus(true);
                    if (watch("term") !== "" && watch("term") !== null && watch("quota") !== undefined) {
                        const quotaData = {
                            customerId: res?.data?.result?.id,
                            quota: watch("quota") || "",
                            term: watch("term") || null,
                            amount1: watch("amount1") || "",
                            amount2: watch("amount2") || "",
                            amount3: watch("amount3") || "",
                            amount4: watch("amount4") || "",
                            amount5: watch("amount5") || "",
                            amount6: watch("amount6") || "",
                            amount7: watch("amount7") || "",
                            amount8: watch("amount8") || "",
                            amount9: watch("amount9") || "",
                            amount10: watch("amount10") || "",
                            amount11: watch("amount11") || "",
                            amount12: watch("amount12") || "",
                        };
                        const response = await createQuota(quotaData);
                        if (response?.status === 201) {
                            handleGetAllUsers();
                            onClose();
                        } else {
                            setAlert({
                                open: true,
                                type: "error",
                                message: response?.message || "An error occurred while creating quota. Please try again.",
                            });
                            return;
                        }
                    }
                    handleGetAllUsers();
                    onClose();
                } else {
                    setAlert({
                        open: true,
                        type: "error",
                        message: res?.data?.message || "An error occurred. Please try again.",
                    });
                    return;
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
                    {id ? "Update" : "Create"} Member
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
                        <div className='grid grid-cols-2 md:grid-cols-2 gap-4'>
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

                            <div>
                                <Controller
                                    name="subUserTypeId"
                                    control={control}
                                    rules={{ required: "Sub User Type is required" }}
                                    render={({ field }) => (
                                        <Select
                                            options={subUsersTypes}
                                            label="Member Role"
                                            placeholder="Select role"
                                            value={parseInt(watch("subUserTypeId")) || null}
                                            onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                            error={errors?.subUserTypeId}
                                        />
                                    )}
                                />
                            </div>

                            {/* <div>
                                <Controller
                                    name="username"
                                    control={control}
                                    // rules={{
                                    //     required: "Username is required",
                                    //     pattern: {
                                    //         value: /^\S+$/, // no spaces allowed
                                    //         message: "Username cannot contain spaces"
                                    //     }
                                    // }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Username"
                                            type="text"
                                            // error={errors?.username}
                                            onChange={(e) => {
                                                // remove spaces as user types
                                                const value = e.target.value.replace(/\s/g, "");
                                                field.onChange(value);
                                            }}
                                            onBlur={() => {
                                                handleVerifyUsername();
                                            }}
                                            endIcon={
                                                validUsername === true ? (
                                                    <CustomIcons iconName={'fa-solid fa-check'} css={`text-green-500`} />
                                                ) : validUsername === false ? (
                                                    <CustomIcons iconName={'fa-solid fa-xmark'} css={`text-red-500`} />
                                                ) : null
                                            }
                                        />
                                    )}
                                />
                            </div> */}
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
                                                const value = e.target.value.replace(/\s/g, "");
                                                field.onChange(value);
                                            }}
                                            onBlur={() => {
                                                if (emailAddress !== watch("emailAddress")) {
                                                    handleVerifyEmail();
                                                    setIsEmailExits(false);
                                                } else {
                                                    setIsEmailExits(true);
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

                            {/* <div className="relative">
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: (watch("username") != null && watch("username") !== "") ? "Password is required" : false,
                                        validate: (watch("username") != null && watch("username") !== "") ? {
                                            minLength: (value) =>
                                                value.length >= 8 || "Minimum 8 characters long",
                                            hasLowercase: (value) =>
                                                /[a-z]/.test(value) || "At least one lowercase character",
                                            hasUppercase: (value) =>
                                                /[A-Z]/.test(value) || "At least one uppercase character",
                                            hasNumberOrSpecial: (value) =>
                                                /[\d@$!%*?&]/.test(value) || "At least one number or special character",
                                        } : undefined
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Password"
                                            type={isPasswordVisible ? "text" : "password"}
                                            error={errors?.password?.message}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\s/g, "");
                                                field.onChange(value);
                                                validatePassword(value);
                                            }}
                                            onFocus={() => setShowPasswordRequirement(true)}
                                            onBlur={() => setShowPasswordRequirement(false)}
                                            endIcon={
                                                <span
                                                    onClick={togglePasswordVisibility}
                                                    style={{ cursor: "pointer", color: "black" }}
                                                >
                                                    {isPasswordVisible ? (
                                                        <CustomIcons iconName="fa-solid fa-eye" css="cursor-pointer text-black" />
                                                    ) : (
                                                        <CustomIcons iconName="fa-solid fa-eye-slash" css="cursor-pointer text-black" />
                                                    )}
                                                </span>
                                            }
                                        />
                                    )}
                                />

                                {
                                    showPasswordRequirement && (
                                        <div
                                            className={`absolute -top-44 border-2 bg-white shadow z-[9999] md:w-96 rounded-md p-2 transform ${showPasswordRequirement ? 'translate-y-12 opacity-100' : 'translate-y-0 opacity-0'}`}
                                        >
                                            {passwordError.map((error, index) => (
                                                <div key={index} className="flex items-center">
                                                    <p className="grow text-black text-sm">{error.message}</p>
                                                    <p>
                                                        {error.showError ? (
                                                            <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-red-600' />
                                                        ) : (
                                                            <CustomIcons iconName={'fa-solid fa-check'} css='cursor-pointer text-green-600' />
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                    )
                                }
                            </div> */}

                            <div>
                                <Controller
                                    name="cellPhone"
                                    control={control}
                                    rules={{
                                        required: "Phone is required",
                                        maxLength: {
                                            value: 10,
                                            message: 'Enter valid phone number',
                                        },
                                        minLength: {
                                            value: 10,
                                            message: 'Enter valid phone number',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Phone"
                                            type={`text`}
                                            error={errors?.cellPhone}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div className="flex items-center my-0.5 col-span-2 md:col-span-2">
                                <div className="flex-grow border-t border-black"></div>
                                <span className="mx-4 text-black font-medium">Quota Details</span>
                                <div className="flex-grow border-t border-black"></div>
                            </div>

                            <div className='col-span-2'>
                                <Controller
                                    name="calendarYearType"
                                    control={control}
                                    rules={{ required: "Calendar Year Type is required" }}
                                    render={({ field }) => (
                                        <Select
                                            options={calendarType}
                                            label="Calendar Type"
                                            placeholder="Select calendar type"
                                            value={parseInt(watch("calendarYearType")) || null}
                                            onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                            error={errors?.calendarYearType}
                                        />
                                    )}
                                />
                            </div>

                            {
                                watch("calendarYearType") && (
                                    <div>
                                        <DatePickerComponent setValue={setValue} control={control} name='startEvalPeriod' label={`Start Eval Period`} minDate={null} maxDate={null} required={true} />
                                    </div>
                                )
                            }

                            {
                                watch("calendarYearType") && (
                                    <div>
                                        <DatePickerComponent setValue={setValue} control={control} name='endEvalPeriod' label={`End Eval Period`} minDate={null} maxDate={null} required={true} />
                                    </div>
                                )
                            }
                            <div>
                                <Controller
                                    name="quota"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Quota"
                                            type={`text`}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="term"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={terms}
                                            label="Term"
                                            placeholder="Select term"
                                            value={parseInt(watch("term")) || null}
                                            onChange={(_, newValue) => {
                                                field.onChange(newValue?.id || null)
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            {(() => {
                                const selectedTerm = terms.find(t => t.id === parseInt(watch("term")));
                                const count = selectedTerm?.value || 0;

                                return Array.from({ length: count }, (_, index) => (
                                    <div key={index}>
                                        <Controller
                                            name={`amount${index + 1}`}
                                            control={control}
                                            rules={{
                                                required: watch("term") ? `Amount ${index + 1} is required` : false
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label={`Amount ${index + 1}`}
                                                    type="text"
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                        field.onChange(numericValue);
                                                    }}
                                                    error={errors?.[`amount${index + 1}`]}
                                                />
                                            )}
                                        />
                                    </div>
                                ));
                            })()}

                            {/* <div>
                                <Controller
                                    name="crmId"
                                    control={control}
                                    rules={{
                                        required: "CRM is required"
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            options={crm}
                                            label={"CRM"}
                                            placeholder="Select CRM"
                                            value={parseInt(watch("crmId")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("crmId", null);
                                                }
                                            }}
                                            error={errors?.crmId}
                                        />
                                    )}
                                />
                            </div> */}
                        </div>

                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className={`flex justify-end items-center gap-4`}>
                            <div>
                                {
                                    id && (
                                        <Button disabled={!isEmailExits} type={`button`} text={"Send Invitation"} useFor='success' onClick={() => handleSendInvitation()} />
                                    )
                                }
                            </div>
                            <div>
                                <Button type={`submit`} text={id ? "Update" : "Submit"} />
                            </div>
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus,
};

export default connect(null, mapDispatchToProps)(SubUserModel)