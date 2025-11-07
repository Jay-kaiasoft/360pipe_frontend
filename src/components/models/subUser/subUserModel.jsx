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
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';
import dayjs from 'dayjs';
import { createQuota, deleteQuota, getAllCustomerQuotas, getQuota, updateQuota } from '../../../service/customerQuota/customerQuotaService';
import AlertDialog from '../../common/alertDialog/alertDialog';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const calendarType = [
    { id: 1, title: "Calendar Year" },
    { id: 2, title: "Financial Year" },
]

const terms = [
    { id: 1, title: 'Monthly', value: 1, kind: 'monthly' },
    { id: 2, title: 'Quarter 1', value: 3, kind: 'q1' },
    { id: 3, title: 'Quarter 2', value: 3, kind: 'q2' },
    { id: 4, title: 'Quarter 3', value: 3, kind: 'q3' },
    { id: 5, title: 'Quarter 4', value: 3, kind: 'q4' },
    { id: 6, title: 'Semi-Annual', value: 6, kind: 'semi' },
    { id: 7, title: 'Yearly', value: 12, kind: 'yearly' },
];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function parseStartMonthIndex(startEvalPeriod) {
    try {
        if (!startEvalPeriod) return 0;
        // Expect "MM/DD/YYYY, ..." — take the first part before comma
        const datePart = String(startEvalPeriod).split(',')[0]?.trim(); // "MM/DD/YYYY"
        const mm = parseInt((datePart || '').split('/')[0], 10);
        if (Number.isFinite(mm) && mm >= 1 && mm <= 12) return mm - 1; // 0-based
        return 0;
    } catch {
        return 0;
    }
}

function getIndicesForKind(kind) {
    switch (kind) {
        case 'q1': return [1, 2, 3];
        case 'q2': return [4, 5, 6];
        case 'q3': return [7, 8, 9];
        case 'q4': return [10, 11, 12];
        case 'semi': return [1, 2, 3, 4, 5, 6];
        case 'yearly': return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        case 'monthly':
        default: return [1];
    }
}

function buildMonthLabels({ kind, count, startMonthIndex }) {

    // Offsets per term kind
    const ranges = {
        monthly: [0],
        q1: [0, 1, 2],
        q2: [3, 4, 5],
        q3: [6, 7, 8],
        q4: [9, 10, 11],
        semi: [0, 1, 2, 3, 4, 5],
        yearly: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    };

    const offsets = ranges[kind] || Array.from({ length: count }, (_, i) => i);
    return offsets.slice(0, count).map(off => {
        const idx = (startMonthIndex + off) % 12;
        return MONTHS[idx];
    });
}

function SubUserModel({ setSyncingPushStatus, setAlert, open, handleClose, id, handleGetAllUsers }) {
    const theme = useTheme()
    const [validEmail, setValidEmail] = useState(null);
    const [validUsername, setValidUsername] = useState(null);

    const [subUsersTypes, setSubUsersTypes] = useState([]);
    const [emailAddress, setEmailAddress] = useState(null);
    const [isEmailExits, setIsEmailExits] = useState(false);
    const [customerQuotaDtos, setCustomerQuotaDto] = useState([])
    // const [openModel, setOpenModel] = useState(false)
    const [selectedQuotaId, setSelectedQuotaId] = useState(null)
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

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

            quotaId: null,
            quota: '',
            term: '',
            amount1: '',
            amount2: '',
            amount3: '',
            amount4: '',
            amount5: '',
            amount6: '',
            amount7: '',
            amount8: '',
            amount9: '',
            amount10: '',
            amount11: '',
            amount12: '',
        },
    });

    // const handleOpenModel = (id = null) => {
    //     setSelectedQuotaId(id)
    //     setOpenModel(true)
    // }

    // const handleCloseModel = () => {
    //     setSelectedQuotaId(null)
    //     setOpenModel(false)
    // }

    const handleOpenDeleteDialog = (id) => {
        setSelectedQuotaId(id);
        setDialog({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this quota?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedQuotaId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleResetQuota = () => {
        setValue("quotaId", null)
        setValue("quota", null)
        setValue("term", null)
        setValue("amount1", null)
        setValue("amount2", null)
        setValue("amount3", null)
        setValue("amount4", null)
        setValue("amount5", null)
        setValue("amount6", null)
        setValue("amount7", null)
        setValue("amount8", null)
        setValue("amount9", null)
        setValue("amount10", null)
        setValue("amount11", null)
        setValue("amount12", null)
    }

    const handleDeleteQuota = async () => {
        const res = await deleteQuota(selectedQuotaId);
        if (res.status === 200) {
            handleResetQuota()
            handleGetUserQuota();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete contact",
                type: "error"
            });
        }
    }

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

            quotaId: null,
            quota: '',
            term: '',
            amount1: '',
            amount2: '',
            amount3: '',
            amount4: '',
            amount5: '',
            amount6: '',
            amount7: '',
            amount8: '',
            amount9: '',
            amount10: '',
            amount11: '',
            amount12: '',
        });
        setValidEmail(null);
        setValidUsername(null);
        setIsEmailExits(false);
        setEmailAddress(null);
        handleClose();
    };

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

            }
        }
    }

    const handleGetUserQuota = async () => {
        if (id && open) {
            const response = await getAllCustomerQuotas(id);
            if (response?.status === 200) {
                if (response?.result) {
                    setCustomerQuotaDto(response?.result)
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

    useEffect(() => {
        handleGetSubUserTypes();
        handleGetUser();
        handleGetUserQuota()
    }, [open]);

    useEffect(() => {
        const t = Number(watch("calendarYearType"));
        if (t === 1) {
            const now = new Date();
            const y = now.getFullYear();
            const start = new Date(y, 0, 1, 0, 0, 0, 0);
            const end = new Date(y, 11, 31, 23, 59, 59, 999);

            setValue("startEvalPeriod", start);
            setValue("endEvalPeriod", end);
        } else {
            setValue("startEvalPeriod", null);
            setValue("endEvalPeriod", null);
        }
    }, [watch("calendarYearType")]);


    const handleSetQuota = async (id) => {
        if (id) {
            const response = await getQuota(id);
            if (response?.result) {
                const r = response.result;
                setValue('quotaId', r?.id || '');
                setValue('quota', r?.quota || '');
                // Map incoming term title back to our id
                const termData = terms.find(item => item.title === r?.term);
                setValue('term', termData?.id || '');
                for (let i = 1; i <= 12; i++) {
                    setValue(`amount${i}`, r?.[`amount${i}`] ?? '');
                }
            }
        }
    };

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

    const submitQuota = async () => {
        const selectedTerm = terms.find(t => t.id === parseInt(watch('term')));
        if (!selectedTerm || !watch("quota")) return;

        const quotaData = {
            id: watch("quotaId"),
            quota: watch("quota"),
            term: selectedTerm.title, // fix: use our terms array
            amount1: watch("amount1"),
            amount2: watch("amount2"),
            amount3: watch("amount3"),
            amount4: watch("amount4"),
            amount5: watch("amount5"),
            amount6: watch("amount6"),
            amount7: watch("amount7"),
            amount8: watch("amount8"),
            amount9: watch("amount9"),
            amount10: watch("amount10"),
            amount11: watch("amount11"),
            amount12: watch("amount12"),
            customerId: id,
        };

        if (watch("quotaId")) {
            const response = await updateQuota(watch("quotaId"), quotaData);
            if (response?.status === 200) {
                handleResetQuota()
                handleGetUserQuota();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
            }
        } else {
            const response = await createQuota(quotaData);
            if (response?.status === 201) {
                handleResetQuota()
                handleGetUserQuota();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
            }
        }
    };

    const selectedTerm = terms?.find(t => t.id === parseInt(watch('term')));

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
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
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
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
                          
                            {
                                id && (
                                    <>
                                        <div className='col-span-3 grid grid-cols-3 gap-4'>
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
                                        </div>


                                        <div>
                                            <Controller
                                                name="quota"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Quota"
                                                        type="text"
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
                                                        label="Period"
                                                        placeholder="Select period"
                                                        value={parseInt(watch('term')) || null}
                                                        onChange={(_, newValue) => {
                                                            // Clear all amount fields when term changes
                                                            for (let i = 1; i <= 12; i++) setValue(`amount${i}`, null, { shouldDirty: true });
                                                            // Set new term
                                                            field.onChange(newValue?.id || null);
                                                        }}
                                                    />

                                                )}
                                            />
                                        </div>

                                        {(() => {
                                            if (!selectedTerm) return null;

                                            // Which amount slots to use for this term (e.g., q2 -> [4,5,6])
                                            const slotIndices = getIndicesForKind(selectedTerm.kind);

                                            // Build labels that *align* with the offsets of the chosen term
                                            // (q1 uses offsets [0,1,2], q2 [3,4,5], etc., already handled by buildMonthLabels)
                                            const startMonthIndex = parseStartMonthIndex(watch("startEvalPeriod"));
                                            const monthLabels = buildMonthLabels({
                                                kind: selectedTerm.kind,
                                                count: slotIndices.length,
                                                startMonthIndex,
                                            });

                                            return (
                                                <>
                                                    {slotIndices.map((slotNumber, i) => {
                                                        const fieldName = `amount${slotNumber}`;
                                                        const labelMonth = monthLabels[i] || `Month ${i + 1}`;
                                                        return (
                                                            <div key={fieldName}>
                                                                <Controller
                                                                    name={fieldName}
                                                                    control={control}
                                                                    rules={{
                                                                        required: watch('term') ? `${labelMonth} amount is required` : false,
                                                                    }}
                                                                    render={({ field }) => (
                                                                        <Input
                                                                            {...field}
                                                                            label={`${labelMonth} Amount`}
                                                                            type="text"
                                                                            onChange={(e) => {
                                                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                                field.onChange(numericValue);
                                                                            }}
                                                                            error={errors?.[fieldName]}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            );
                                        })()}

                                        <div>
                                            <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                <Components.IconButton onClick={() => submitQuota()}>
                                                    <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-4 w-4' />
                                                </Components.IconButton>
                                            </div>
                                        </div>

                                        <div className='col-span-3'>
                                            <div className="max-h-56 overflow-y-auto">
                                                <table className="min-w-full border-collapse border">
                                                    <thead className="bg-gray-200 sticky top-0 z-10 ">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-100 sticky top-0">
                                                                #
                                                            </th>
                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-100 sticky top-0">
                                                                Term
                                                            </th>
                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-100 sticky top-0">
                                                                Quota
                                                            </th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-100 sticky top-0">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    {
                                                        customerQuotaDtos?.length > 0 ? (
                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                {customerQuotaDtos?.map((row, i) => (
                                                                    <tr key={i} className="hover:bg-gray-50">
                                                                        <td className="px-4 py-1 text-sm text-gray-800 font-bold">{i + 1}</td>
                                                                        <td className="px-4 py-1 text-sm text-gray-800">{row.term || "—"}</td>
                                                                        <td className="px-4 py-1 text-sm text-gray-800">{row.quota || "—"}</td>
                                                                        <td className="px-4 py-1 text-sm text-gray-800">
                                                                            <div className='flex items-center gap-2 justify-end h-full'>
                                                                                <div className='bg-[#1072E0] h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                                    <Components.IconButton onClick={() => handleSetQuota(row.id)}>
                                                                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                                                                    </Components.IconButton>
                                                                                </div>
                                                                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                                    <Components.IconButton onClick={() => handleOpenDeleteDialog(row.id)}>
                                                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                                                                    </Components.IconButton>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        ) : (
                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                <tr className="hover:bg-gray-50">
                                                                    <td colSpan={5} className="px-4 py-3 text-sm text-gray-800 font-bold text-center">
                                                                        No records
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        )
                                                    }
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )
                            }

                        </div>
                        <div className='w-60 mt-5'>
                            {
                                id && (
                                    <Button disabled={!isEmailExits} type={`button`} text={"Send Invitation"} useFor='success' onClick={() => handleSendInvitation()} />
                                )
                            }
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className={`flex justify-end items-center gap-4`}>

                            <div>
                                <Button type={`submit`} text={id ? "Update" : "Submit"} />
                            </div>
                            <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
            {/* <AddQuotaModel open={openModel} handleClose={handleCloseModel} customerId={id} id={selectedQuotaId} startEvalPeriod={watch("startEvalPeriod")} endEvalPeriod={watch("endEvalPeriod")} handleGetUser={handleGetUser} handleGetAllQuota={handleGetUserQuota} /> */}
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteQuota()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus,
};

export default connect(null, mapDispatchToProps)(SubUserModel)