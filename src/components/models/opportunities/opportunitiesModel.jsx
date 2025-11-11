import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';

import { createOpportunity, deleteOpportunityLogo, getOpportunityDetails, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import { getAllAccounts } from '../../../service/account/accountService';
import { opportunityStages, opportunityStatus, partnerRoles, uploadFiles } from '../../../service/common/commonService';
import { deleteOpportunitiesPartner, getAllOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';
import AlertDialog from '../../common/alertDialog/alertDialog';
import OpportunitiesPartnersModel from "./opportunityPartnerModel";
import { deleteOpportunitiesProducts, getAllOpportunitiesProducts } from '../../../service/opportunities/OpportunityProductsService';
import OpportunitiesProductsModel from './opportunitiesProductsModel';
import { deleteOpportunitiesContact, getAllOpportunitiesContact, updateOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import Checkbox from '../../common/checkBox/checkbox';
import OpportunityContactModel from './opportunityContactModel';
import FileInputBox from '../../fileInputBox/fileInputBox';
import { getUserDetails } from '../../../utils/getUserDetails';
import { Tooltip } from '@mui/material';
import Stapper from '../../common/stapper/stapper';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const steps = [
    "Opportunity Details",
    "Partner Details",
    "Contact Details",
    "Product & Service Details",
]
function OpportunitiesModel({ setAlert, open, handleClose, opportunityId, handleGetAllOpportunities, setSyncingPushStatus }) {
    const userdata = getUserDetails();
    const [activeStep, setActiveStep] = useState(0)

    const theme = useTheme()
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productTotalAmount, setProductTotalAmount] = useState(0)

    const [opportunitiesPartner, setOpportunitiesPartner] = useState([]);
    const [opportunitiesProducts, setOpportunitiesProducts] = useState([]);
    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);

    const [openPartnerModel, setOpenPartnerModel] = useState(false);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedOppPartnerId, setSelectedOppPartnerId] = useState(null);

    const [openProductModel, setOpenProductModel] = useState(false);
    const [dialogProduct, setDialogProduct] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [initialIsKey, setInitialIsKey] = useState({});         // id -> original isKey
    const [editedContacts, setEditedContacts] = useState([]);     // [{ id, isKey }, ...]
    const [openContactModel, setOpenContactModel] = useState(false);
    const [dialogContact, setDialogContact] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [dialogLogo, setDialogLogo] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleBack = () => {
        setActiveStep((prev) => prev - 1)
    }

    const handleNext = () => {
        setActiveStep((prev) => prev + 1)
    }

    const handleOpenContactModel = () => {
        setOpenContactModel(true);
    };

    const handleCloseContactModel = () => {
        setOpenContactModel(false);
    };

    const handleOpenPartnerModel = (id) => {
        setSelectedOppPartnerId(id);
        setOpenPartnerModel(true);
    };

    const handleClosePartnerModel = () => {
        setSelectedOppPartnerId(null);
        setOpenPartnerModel(false);
    };

    const handleOpenDeleteLogoDialog = () => {
        setDialogLogo({ open: true, title: 'Delete Logo', message: 'Are you sure! Do you want to delete this logo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteLogoDialog = () => {
        setDialogLogo({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenDeleteDialog = (id) => {
        setSelectedOppPartnerId(id);
        setDialog({ open: true, title: 'Delete Partner', message: 'Are you sure! Do you want to delete this logo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedOppPartnerId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenProductModel = (id) => {
        setSelectedProductId(id);
        setOpenProductModel(true);
    };

    const handleCloseProductModel = () => {
        setSelectedProductId(null);
        setOpenProductModel(false);
    };

    const handleOpenDeleteProductDialog = (id) => {
        setSelectedProductId(id);
        setDialogProduct({ open: true, title: 'Delete Product', message: 'Are you sure! Do you want to delete this product?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteProductDialog = () => {
        setSelectedProductId(null);
        setDialogProduct({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenDeleteContactDialog = (id) => {
        setSelectedContactId(id);
        setDialogContact({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this contact?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteContactDialog = () => {
        setSelectedContactId(null);
        setDialogContact({ open: false, title: '', message: '', actionButtonText: '' });
    }

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
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            closeDate: null,
            nextSteps: null,
            accountId: null,
            salesforceOpportunityId: null,
            status: 1,
            logo: null,
            newLogo: null
        },
    });

    const handleDeleteOppLogo = async () => {
        if (opportunityId && watch("logo")) {
            const res = await deleteOpportunityLogo(opportunityId);
            if (res?.status === 200) {
                setValue("newLogo", null)
                setValue("logo", null)
                handleCloseDeleteLogoDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity logo",
                    type: "error"
                });
            }
        }
        if (watch("newLogo")) {
            setValue("newLogo", null)
            handleCloseDeleteLogoDialog()
        }
    }

    const handleDeletePartner = async () => {
        if (selectedOppPartnerId) {
            const res = await deleteOpportunitiesPartner(selectedOppPartnerId);
            if (res?.status === 200) {
                setSyncingPushStatus(true);
                handleGetAllOpportunitiesPartner()
                handleCloseDeleteDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity partner",
                    type: "error"
                });
            }
        }
    }

    const handleDeleteProduct = async () => {
        if (selectedProductId) {
            const res = await deleteOpportunitiesProducts(selectedProductId);
            if (res?.status === 200) {
                setSyncingPushStatus(true);
                handleGetOppProduct()
                handleCloseDeleteProductDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity product",
                    type: "error"
                });
            }
        }
    }

    const handleDeleteContact = async () => {
        if (selectedContactId) {
            const res = await deleteOpportunitiesContact(selectedContactId);
            if (res?.status === 200) {
                setSyncingPushStatus(true)
                handleGetOppContacts()
                handleCloseDeleteContactDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity contact",
                    type: "error"
                });
            }
        }
    }

    const onClose = () => {
        setLoading(false);
        reset({
            id: null,
            accountId: null,
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            closeDate: null,
            nextSteps: null,
            salesforceOpportunityId: null,
            status: 1,
            logo: null,
            newLogo: null
        });
        setActiveStep(0)
        handleClose();
    };

    const handleGetOpportunityDetails = async () => {
        if (opportunityId && open) {
            const res = await getOpportunityDetails(opportunityId);
            if (res?.status === 200) {
                // reset(res?.result);
                setValue("accountId", res?.result?.accountId || null);
                setValue("opportunity", res?.result?.opportunity || null);
                setValue("dealAmount", res?.result?.dealAmount || null);
                setValue("closeDate", res?.result?.closeDate ? res?.result?.closeDate : null);
                setValue("nextSteps", res?.result?.nextSteps || null);
                setValue("salesforceOpportunityId", res?.result?.salesforceOpportunityId || null);
                setValue("salesStage", opportunityStages?.find(stage => stage.title === res?.result?.salesStage)?.id || null);
                setValue("status", opportunityStatus?.find(stage => stage.title === res?.result?.status)?.id || null);
                setValue("logo", res?.result?.logo)
                setValue("id", res?.result?.id)
                if (res?.result?.opportunityPartnerDetails?.length > 0) {
                    const formattedDetails = res?.result?.opportunityPartnerDetails?.map((item) => ({
                        ...item,
                        roleid: partnerRoles?.find(role => role.title === item.role)?.id || null,
                        partnerId: item.id
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
            const res = await getAllAccounts("fetchType=Options");
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

    const handleGetAllOpportunitiesPartner = async () => {
        if (open && (watch("id") || opportunityId)) {
            const res = await getAllOpportunitiesPartner(watch("id") || opportunityId)
            setOpportunitiesPartner(res?.result)
        }
    }

    const handleGetOppProduct = async () => {
        if (open && (watch("id") || opportunityId)) {
            const res = await getAllOpportunitiesProducts(watch("id") || opportunityId)
            setOpportunitiesProducts(res.result)
            const total = res.result?.reduce((sum, item) => {
                const price = parseFloat(parseFloat(item?.qty) * parseFloat(item?.price)) || 0;
                return sum + price;
            }, 0);
            setProductTotalAmount(Number(total.toFixed(2)));
        }
    }

    const handleGetOppContacts = async () => {
        if (open && (watch("id") || opportunityId)) {
            const res = await getAllOpportunitiesContact(watch("id") || opportunityId);
            const list = Array.isArray(res?.result) ? res.result : [];

            // ✅ Sort: isKey === true first
            const sortedList = [...list].sort((a, b) => {
                // true values should come first
                if (a.isKey === b.isKey) return 0;
                return a.isKey ? -1 : 1;
            });

            setOpportunitiesContacts(sortedList);

            const map = {};
            sortedList.forEach(c => {
                if (c?.id != null) map[c.id] = !!c.isKey;
            });

            setInitialIsKey(map);
            setEditedContacts([]);
        }
    };


    const handleToggleKeyContact = (rowId) => {
        const current = opportunitiesContacts.find(r => r.id === rowId);
        if (!current) return;

        const newVal = !current.isKey;
        const keyCount = opportunitiesContacts.filter(c => c.isKey).length;

        // 🧠 Prevent enabling beyond 4
        if (newVal && keyCount >= 4) {
            setAlert({
                open: true,
                type: "warning",
                message: "You can select up to 4 key contacts only.",
            });
            return;
        }

        // ✅ Update UI state
        setOpportunitiesContacts(prev =>
            prev.map(r => (r.id === rowId ? { ...r, isKey: newVal } : r))
        );

        // ✅ Track edits
        setEditedContacts(prev => {
            const originally = initialIsKey[rowId];
            const existsIdx = prev.findIndex(e => e.id === rowId);

            if (newVal === originally) {
                if (existsIdx >= 0) {
                    const copy = prev.slice();
                    copy.splice(existsIdx, 1);
                    return copy;
                }
                return prev;
            }

            if (existsIdx >= 0) {
                const copy = prev.slice();
                copy[existsIdx] = { id: rowId, isKey: newVal };
                return copy;
            }
            return [...prev, { id: rowId, isKey: newVal }];
        });
    };

    const handleBulkUpdateKeyContacts = async () => {
        try {
            const res = await updateOpportunitiesContact(editedContacts)
            if (res.status === 200) {
                setSyncingPushStatus(true)
                setAlert({ open: true, type: "success", message: "Contacts updated" });
                await handleGetOppContacts();
            } else {
                setAlert({ open: true, type: "error", message: "Fail to update contacts" });
            }
        } catch (e) {
            setAlert({ open: true, type: "error", message: "Failed to update contacts" });
        }
    };

    useEffect(() => {
        handleGetOppProduct()
        handleGetAllOpportunitiesPartner()
        handleGetAllAccounts()
        handleGetOppContacts()
        handleGetOpportunityDetails()
    }, [open])

    useEffect(() => {
        if (productTotalAmount > Number(parseFloat(watch("dealAmount")).toFixed(2))) {
            setValue("dealAmount", productTotalAmount)
        }
    }, [productTotalAmount])

    const handleImageChange = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);                    // <-- send the File object
        formData.append("folderName", "oppLogo");
        formData.append("userId", String(userdata?.userId || ""));

        // IMPORTANT: don't set Content-Type; the browser sets multipart boundary
        uploadFiles(formData).then((res) => {
            if (res.data.status === 200) {
                const { imageURL } = res?.data?.result?.[0] || {};
                setValue("logo", null)
                setValue("newLogo", imageURL || "");
            } else {
                setAlert({ open: true, message: res?.data?.message, type: "error" });
            }
        });
    };

    const submit = async (data) => {
        const newData = {
            ...data,
            salesStage: opportunityStages?.find(stage => stage.id === parseInt(data.salesStage))?.title || null,
            status: opportunityStatus?.find(row => row.id === parseInt(data.status))?.title || null,
            newLogo: watch("newLogo")
        }
        try {
            if (activeStep === 0) {
                setLoading(true);
                if (watch("id")) {
                    const res = await updateOpportunity(watch("id"), newData);
                    if (res?.status === 200) {
                        if (watch("salesforceOpportunityId") !== null && watch("salesforceOpportunityId") !== "") {
                            setSyncingPushStatus(true);
                        }
                        setLoading(false);
                        handleNext()
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
                        setValue("id", res?.result?.id)
                        setSyncingPushStatus(true);
                        setLoading(false);
                        handleNext()
                    } else {
                        setLoading(false);
                        setAlert({
                            open: true,
                            message: res?.message || "Failed to create opportunity",
                            type: "error"
                        });
                    }
                }
            } else if (activeStep === 3) {
                onClose()
                setLoading(false);
            }
            else {
                setLoading(false);
                handleNext()
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
                // fullScreen={opportunityId != null}
                // maxWidth={opportunityId ? 'xl' : "xl"}
                maxWidth={"lg"}
                fullWidth
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
                        <div className='flex justify-center mb-10'>
                            <div className='w-[800px]'>
                                <Stapper steps={steps} activeStep={activeStep} orientation={`horizontal`} labelFontSize="14px" />
                            </div>
                        </div>
                        {
                            activeStep === 0 && (
                                <div className='grid grid-cols-5 gap-4'>
                                    <div className='flex justify-center items-center mb-5'>
                                        <FileInputBox
                                            onFileSelect={handleImageChange}
                                            onRemove={handleOpenDeleteLogoDialog}
                                            value={watch("logo") || watch("newLogo")}
                                            text="Upload opportunity Logo"
                                            size="100x100"
                                        />
                                    </div>

                                    <div className={`grid ${opportunityId != null ? "md:grid-cols-4" : "md:grid-cols-3"}  gap-4 mb-4 col-span-4`}>
                                        <div className='col-span-2'>
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
                                        </div>
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
                                                    type="text"
                                                    error={errors.dealAmount}
                                                    onChange={(e) => {
                                                        let value = e.target.value;
                                                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                                                            field.onChange(value);
                                                        }
                                                    }}
                                                    startIcon={
                                                        <CustomIcons
                                                            iconName={"fa-solid fa-dollar-sign"}
                                                            css={"text-lg text-black mr-2"}
                                                        />
                                                    }
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
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    options={opportunityStatus}
                                                    label={"Status"}
                                                    placeholder="Select status"
                                                    value={parseInt(watch("status")) || null}
                                                    onChange={(_, newValue) => {
                                                        if (newValue?.id) {
                                                            field.onChange(newValue.id);
                                                        } else {
                                                            setValue("status", null);
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 1 && (
                                <div>
                                    <div className='border-r-2 border-gray-600 pr-6'>
                                        <div className='h-56 overflow-y-auto'>
                                            <table className="min-w-full border-collapse border">
                                                <thead className="bg-gray-50 sticky top-0 z-10">
                                                    <tr>
                                                        <th colSpan={4} className="text-center px-4 py-2 text-lg font-semibold tracking-wide bg-gray-100 sticky top-0 border-b">
                                                            <div className='flex items-center'>
                                                                <p className='w-full text-left'>
                                                                    Partners
                                                                </p>
                                                                <Tooltip title="Add" arrow>
                                                                    <div className='bg-green-600 h-7 w-7 flex justify-end items-center rounded-full text-white'>
                                                                        <Components.IconButton onClick={() => handleOpenPartnerModel()}>
                                                                            <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-3 w-3' />
                                                                        </Components.IconButton>
                                                                    </div>
                                                                </Tooltip>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                            #
                                                        </th>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                            Name
                                                        </th>
                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                            Role
                                                        </th>
                                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {opportunitiesPartner?.length > 0 ? (
                                                        opportunitiesPartner.map((row, i) => (
                                                            <tr key={i} className="hover:bg-gray-50">
                                                                <td className="px-4 py-1 text-sm text-gray-800 font-bold">{i + 1}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">{row.accountName || "—"}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">{row.role || "—"}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">
                                                                    <div className='flex items-center gap-2 justify-end h-full'>
                                                                        <Tooltip title="Edit" arrow>
                                                                            <div className='bg-[#1072E0] h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                <Components.IconButton onClick={() => handleOpenPartnerModel(row.id)}>
                                                                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-3 w-3' />
                                                                                </Components.IconButton>
                                                                            </div>
                                                                        </Tooltip>
                                                                        <Tooltip title="Delete" arrow>
                                                                            <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                <Components.IconButton onClick={() => handleOpenDeleteDialog(row.id)}>
                                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                                                </Components.IconButton>
                                                                            </div>
                                                                        </Tooltip>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="hover:bg-gray-50">
                                                            <td colSpan={4} className="px-4 py-3 text-sm text-gray-800 font-bold text-center">
                                                                No records
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 2 && (
                                <div>
                                    <div className="max-h-56 overflow-y-auto">
                                        <table className="min-w-full border-collapse border">
                                            <thead className="bg-gray-50 sticky top-0 z-10 ">
                                                <tr>
                                                    <th colSpan={4} className="text-center px-4 py-2 text-lg font-semibold tracking-wide bg-gray-100 sticky top-0 border-b">
                                                        <div className='flex items-center'>
                                                            <p className='w-full text-left'>
                                                                Contacts
                                                            </p>
                                                            <div className='flex justify-end items-center gap-3'>
                                                                {editedContacts.length > 0 && (
                                                                    <Tooltip title="Save" arrow>
                                                                        <div className='bg-[#1072E0] h-7 w-7 px-3 flex justify-center items-center rounded-full text-white'>
                                                                            <Components.IconButton onClick={handleBulkUpdateKeyContacts} title="Update key contacts">
                                                                                <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                                                                            </Components.IconButton>
                                                                        </div>
                                                                    </Tooltip>
                                                                )}
                                                                <Tooltip title="Add" arrow>
                                                                    <div className='bg-green-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                        <Components.IconButton onClick={() => handleOpenContactModel()}>
                                                                            <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-3 w-3' />
                                                                        </Components.IconButton>
                                                                    </div>
                                                                </Tooltip>
                                                            </div>
                                                        </div>
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        #
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        Name
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        Key Contact
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            {
                                                opportunitiesContacts?.length > 0 ? (
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {opportunitiesContacts?.map((row, i) => (
                                                            <tr key={i} className="hover:bg-gray-50">
                                                                <td className="px-4 py-1 text-sm text-gray-800 font-bold">{i + 1}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">{row.contactName || "—"}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">
                                                                    <div className='w-10'>
                                                                        <Checkbox
                                                                            checked={!!row.isKey}
                                                                            disabled={
                                                                                opportunitiesContacts.filter(c => c.isKey).length >= 4 && !row.isKey
                                                                            }
                                                                            onChange={() => handleToggleKeyContact(row.id)}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">
                                                                    <div className='flex items-center gap-2 justify-end h-full'>
                                                                        <Tooltip title="Delete" arrow>
                                                                            <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                <Components.IconButton onClick={() => handleOpenDeleteContactDialog(row.id)}>
                                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                                                </Components.IconButton>
                                                                            </div>
                                                                        </Tooltip>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                ) : (
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        <tr className="hover:bg-gray-50">
                                                            <td colSpan={4} className="px-4 py-3 text-sm text-gray-800 font-bold text-center">
                                                                No records
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )
                                            }
                                        </table>
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 3 && (
                                <div>
                                    <div className="max-h-56 overflow-y-auto">
                                        <table className="min-w-full border-collapse border">
                                            <thead className="bg-gray-50 sticky top-0 z-10 ">
                                                <tr>
                                                    <th colSpan={6} className="px-4 py-2 text-lg font-semibold tracking-wide bg-gray-100 sticky top-0 border-b">
                                                        <div className='flex items-center'>
                                                            <p className='w-full text-left'>
                                                                Product & Service
                                                            </p>
                                                            <Tooltip title="Add" arrow>
                                                                <div className='bg-green-600 h-7 w-7 flex justify-end items-center rounded-full text-white'>
                                                                    <Components.IconButton onClick={() => handleOpenProductModel()}>
                                                                        <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-3 w-3' />
                                                                    </Components.IconButton>
                                                                </div>
                                                            </Tooltip>
                                                        </div>
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        #
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        Name
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        Qty
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        Price
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        Total Price
                                                    </th>
                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            {
                                                opportunitiesProducts?.length > 0 ? (
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {opportunitiesProducts?.map((row, i) => (
                                                            <tr key={i} className="hover:bg-gray-50">
                                                                <td className="px-4 py-1 text-sm text-gray-800 font-bold">{i + 1}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">{row.name || "—"}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">{row.qty || "—"}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">${row.price?.toLocaleString() || "—"}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">${parseFloat(parseFloat(row.qty) * parseFloat(row.price))?.toLocaleString() || "—"}</td>
                                                                <td className="px-4 py-1 text-sm text-gray-800">
                                                                    <div className='flex items-center gap-2 justify-end h-full'>
                                                                        <div className='bg-[#1072E0] h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                            <Tooltip title="Edit" arrow>
                                                                                <Components.IconButton onClick={() => handleOpenProductModel(row.id)}>
                                                                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-3 w-3' />
                                                                                </Components.IconButton>
                                                                            </Tooltip>
                                                                        </div>
                                                                        <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                            <Tooltip title="Delete" arrow>
                                                                                <Components.IconButton onClick={() => handleOpenDeleteProductDialog(row.id)}>
                                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                                                </Components.IconButton>
                                                                            </Tooltip>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                ) : (
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        <tr className="hover:bg-gray-50">
                                                            <td colSpan={6} className="px-4 py-3 text-sm text-gray-800 font-bold text-center">
                                                                No records
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )
                                            }
                                        </table>
                                    </div>
                                </div>
                            )
                        }
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            {
                                activeStep != 0 && (
                                    <Button onClick={handleBack} type={`button`} text={"back"} isLoading={loading} />
                                )
                            }
                            <Button type={`submit`} text={activeStep === 3 ? "Submit" : "Next"} isLoading={loading} />
                            <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeletePartner()}
                handleClose={() => handleCloseDeleteDialog()}
            />
            <AlertDialog
                open={dialogProduct.open}
                title={dialogProduct.title}
                message={dialogProduct.message}
                actionButtonText={dialogProduct.actionButtonText}
                handleAction={() => handleDeleteProduct()}
                handleClose={() => handleCloseDeleteProductDialog()}
            />
            <AlertDialog
                open={dialogContact.open}
                title={dialogContact.title}
                message={dialogContact.message}
                actionButtonText={dialogContact.actionButtonText}
                handleAction={() => handleDeleteContact()}
                handleClose={() => handleCloseDeleteContactDialog()}
            />
            <AlertDialog
                open={dialogLogo.open}
                title={dialogLogo.title}
                message={dialogLogo.message}
                actionButtonText={dialogLogo.actionButtonText}
                handleAction={() => handleDeleteOppLogo()}
                handleClose={() => handleCloseDeleteLogoDialog()}
            />
            <OpportunitiesPartnersModel open={openPartnerModel} handleClose={handleClosePartnerModel} id={selectedOppPartnerId} opportunityId={opportunityId || watch("id")} handleGetAllOpportunitiesPartners={handleGetAllOpportunitiesPartner} />
            <OpportunitiesProductsModel open={openProductModel} handleClose={handleCloseProductModel} id={selectedProductId} opportunityId={opportunityId || watch("id")} handleGetAllOpportunitiesProducts={handleGetOppProduct} />
            <OpportunityContactModel open={openContactModel} handleClose={handleCloseContactModel} opportunityId={opportunityId || watch("id")} handleGetAllOppContact={handleGetOppContacts} />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(OpportunitiesModel)



//    <div className='grid grid-cols-5 gap-4'>
//                             <div className='flex justify-center items-center'>
//                                 <FileInputBox
//                                     onFileSelect={handleImageChange}
//                                     onRemove={handleOpenDeleteLogoDialog}
//                                     value={watch("logo") || watch("newLogo")}
//                                     text="Upload opportunity Logo"
//                                     size="100x100"
//                                 />
//                             </div>
//                             <div className={`grid ${opportunityId != null ? "md:grid-cols-4" : "md:grid-cols-3"}  gap-4 mb-4 col-span-4`}>
//                                 <div className='col-span-2'>
//                                     <Controller
//                                         name="accountId"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <Select
//                                                 options={accounts}
//                                                 label={"Account"}
//                                                 placeholder="Select Account"
//                                                 value={parseInt(watch("accountId")) || null}
//                                                 onChange={(_, newValue) => {
//                                                     if (newValue?.id) {
//                                                         field.onChange(newValue.id);
//                                                     } else {
//                                                         setValue("accountId", null);
//                                                     }
//                                                 }}
//                                             />
//                                         )}
//                                     />
//                                 </div>
//                                 <Controller
//                                     name="opportunity"
//                                     control={control}
//                                     rules={{
//                                         required: "Opportunity name is required",
//                                     }}
//                                     render={({ field }) => (
//                                         <Input
//                                             {...field}
//                                             label="Opportunity Name"
//                                             type={`text`}
//                                             error={errors.opportunity}
//                                             onChange={(e) => {
//                                                 field.onChange(e);
//                                             }}
//                                         />
//                                     )}
//                                 />
//                                 <Controller
//                                     name="dealAmount"
//                                     control={control}
//                                     rules={{
//                                         required: "Deal amount is required",
//                                     }}
//                                     render={({ field }) => (
//                                         <Input
//                                             {...field}
//                                             label="Deal Amount"
//                                             type="text"
//                                             error={errors.dealAmount}
//                                             onChange={(e) => {
//                                                 let value = e.target.value;
//                                                 if (/^\d*\.?\d{0,2}$/.test(value)) {
//                                                     field.onChange(value);
//                                                 }
//                                             }}
//                                             startIcon={
//                                                 <CustomIcons
//                                                     iconName={"fa-solid fa-dollar-sign"}
//                                                     css={"text-lg text-black mr-2"}
//                                                 />
//                                             }
//                                         />
//                                     )}
//                                 />
//                                 <Controller
//                                     name="salesStage"
//                                     control={control}
//                                     rules={{
//                                         required: "Sales stage is required",
//                                     }}
//                                     render={({ field }) => (
//                                         <Select
//                                             options={opportunityStages}
//                                             label={"Stage"}
//                                             placeholder="Select Stage"
//                                             value={parseInt(watch("salesStage")) || null}
//                                             error={errors.salesStage}
//                                             onChange={(_, newValue) => {
//                                                 if (newValue?.id) {
//                                                     field.onChange(newValue.id);
//                                                 } else {
//                                                     setValue("salesStage", null);
//                                                 }
//                                             }}
//                                         />
//                                     )}
//                                 />
//                                 <DatePickerComponent setValue={setValue} control={control} name='closeDate' label={`Close Date`} minDate={new Date()} maxDate={null} required={true} />
//                                 <Controller
//                                     name="nextSteps"
//                                     control={control}
//                                     rules={{
//                                         required: "Next steps is required",
//                                     }}
//                                     render={({ field }) => (
//                                         <Input
//                                             {...field}
//                                             label="Next Steps"
//                                             type={`text`}
//                                             error={errors.nextSteps}
//                                             onChange={(e) => {
//                                                 field.onChange(e.target.value);
//                                             }}
//                                         />
//                                     )}
//                                 />
//                                 <Controller
//                                     name="status"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <Select
//                                             options={opportunityStatus}
//                                             label={"Status"}
//                                             placeholder="Select status"
//                                             value={parseInt(watch("status")) || null}
//                                             onChange={(_, newValue) => {
//                                                 if (newValue?.id) {
//                                                     field.onChange(newValue.id);
//                                                 } else {
//                                                     setValue("status", null);
//                                                 }
//                                             }}
//                                         />
//                                     )}
//                                 />
//                             </div>
//                         </div>

//                         {opportunityId != null && (
//                             <div className="border-b-2 border-gray-600 my-6"></div>
//                         )}
//                         {
//                             opportunityId != null && (
//                                 <div className='grid md:grid-cols-2 gap-6'>
//                                     <div className='border-r-2 border-gray-600 pr-6'>
//                                         <div className="max-h-56 overflow-y-auto">
//                                             <table className="min-w-full border-collapse border">
//                                                 <thead className="bg-gray-50 sticky top-0 z-10">
//                                                     <tr>
//                                                         <th colSpan={4} className="text-center px-4 py-2 text-lg font-semibold tracking-wide bg-gray-100 sticky top-0 border-b">
//                                                             <div className='flex items-center'>
//                                                                 <p className='w-full text-left'>
//                                                                     Partners
//                                                                 </p>
//                                                                 <Tooltip title="Add" arrow>
//                                                                     <div className='bg-green-600 h-7 w-7 flex justify-end items-center rounded-full text-white'>
//                                                                         <Components.IconButton onClick={() => handleOpenPartnerModel()}>
//                                                                             <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-3 w-3' />
//                                                                         </Components.IconButton>
//                                                                     </div>
//                                                                 </Tooltip>
//                                                             </div>
//                                                         </th>
//                                                     </tr>
//                                                     <tr>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                                                             #
//                                                         </th>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                                                             Name
//                                                         </th>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                                                             Role
//                                                         </th>
//                                                         <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                                                             Actions
//                                                         </th>
//                                                     </tr>
//                                                 </thead>

//                                                 <tbody className="divide-y divide-gray-200 bg-white">
//                                                     {opportunitiesPartner?.length > 0 ? (
//                                                         opportunitiesPartner.map((row, i) => (
//                                                             <tr key={i} className="hover:bg-gray-50">
//                                                                 <td className="px-4 py-1 text-sm text-gray-800 font-bold">{i + 1}</td>
//                                                                 <td className="px-4 py-1 text-sm text-gray-800">{row.accountName || "—"}</td>
//                                                                 <td className="px-4 py-1 text-sm text-gray-800">{row.role || "—"}</td>
//                                                                 <td className="px-4 py-1 text-sm text-gray-800">
//                                                                     <div className='flex items-center gap-2 justify-end h-full'>
//                                                                         <Tooltip title="Edit" arrow>
//                                                                             <div className='bg-[#1072E0] h-7 w-7 flex justify-center items-center rounded-full text-white'>
//                                                                                 <Components.IconButton onClick={() => handleOpenPartnerModel(row.id)}>
//                                                                                     <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-3 w-3' />
//                                                                                 </Components.IconButton>
//                                                                             </div>
//                                                                         </Tooltip>
//                                                                         <Tooltip title="Delete" arrow>
//                                                                             <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
//                                                                                 <Components.IconButton onClick={() => handleOpenDeleteDialog(row.id)}>
//                                                                                     <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
//                                                                                 </Components.IconButton>
//                                                                             </div>
//                                                                         </Tooltip>
//                                                                     </div>
//                                                                 </td>
//                                                             </tr>
//                                                         ))
//                                                     ) : (
//                                                         <tr className="hover:bg-gray-50">
//                                                             <td colSpan={4} className="px-4 py-3 text-sm text-gray-800 font-bold text-center">
//                                                                 No records
//                                                             </td>
//                                                         </tr>
//                                                     )}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </div>

//                                     <div>
//                                         <div className="max-h-56 overflow-y-auto">
//                                             <table className="min-w-full border-collapse border">
//                                                 <thead className="bg-gray-50 sticky top-0 z-10 ">
//                                                     <tr>
//                                                         <th colSpan={4} className="text-center px-4 py-2 text-lg font-semibold tracking-wide bg-gray-100 sticky top-0 border-b">
//                                                             <div className='flex items-center'>
//                                                                 <p className='w-full text-left'>
//                                                                     Contacts
//                                                                 </p>
//                                                                 <div className='flex justify-end items-center gap-3'>
//                                                                     {editedContacts.length > 0 && (
//                                                                         <Tooltip title="Save" arrow>
//                                                                             <div className='bg-[#1072E0] h-7 w-7 px-3 flex justify-center items-center rounded-full text-white'>
//                                                                                 <Components.IconButton onClick={handleBulkUpdateKeyContacts} title="Update key contacts">
//                                                                                     <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
//                                                                                 </Components.IconButton>
//                                                                             </div>
//                                                                         </Tooltip>
//                                                                     )}
//                                                                     <Tooltip title="Add" arrow>
//                                                                         <div className='bg-green-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
//                                                                             <Components.IconButton onClick={() => handleOpenContactModel()}>
//                                                                                 <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-3 w-3' />
//                                                                             </Components.IconButton>
//                                                                         </div>
//                                                                     </Tooltip>
//                                                                 </div>
//                                                             </div>
//                                                         </th>
//                                                     </tr>
//                                                     <tr>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             #
//                                                         </th>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             Name
//                                                         </th>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             Key Contact
//                                                         </th>
//                                                         <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             Actions
//                                                         </th>
//                                                     </tr>
//                                                 </thead>
//                                                 {
//                                                     opportunitiesContacts?.length > 0 ? (
//                                                         <tbody className="divide-y divide-gray-200 bg-white">
//                                                             {opportunitiesContacts?.map((row, i) => (
//                                                                 <tr key={i} className="hover:bg-gray-50">
//                                                                     <td className="px-4 py-1 text-sm text-gray-800 font-bold">{i + 1}</td>
//                                                                     <td className="px-4 py-1 text-sm text-gray-800">{row.contactName || "—"}</td>
//                                                                     <td className="px-4 py-1 text-sm text-gray-800">
//                                                                         <div className='w-10'>
//                                                                             <Checkbox
//                                                                                 checked={!!row.isKey}
//                                                                                 disabled={
//                                                                                     opportunitiesContacts.filter(c => c.isKey).length >= 4 && !row.isKey
//                                                                                 }
//                                                                                 onChange={() => handleToggleKeyContact(row.id)}
//                                                                             />
//                                                                         </div>
//                                                                     </td>
//                                                                     <td className="px-4 py-1 text-sm text-gray-800">
//                                                                         <div className='flex items-center gap-2 justify-end h-full'>
//                                                                             <Tooltip title="Delete" arrow>
//                                                                                 <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
//                                                                                     <Components.IconButton onClick={() => handleOpenDeleteContactDialog(row.id)}>
//                                                                                         <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
//                                                                                     </Components.IconButton>
//                                                                                 </div>
//                                                                             </Tooltip>
//                                                                         </div>
//                                                                     </td>
//                                                                 </tr>
//                                                             ))}
//                                                         </tbody>
//                                                     ) : (
//                                                         <tbody className="divide-y divide-gray-200 bg-white">
//                                                             <tr className="hover:bg-gray-50">
//                                                                 <td colSpan={4} className="px-4 py-3 text-sm text-gray-800 font-bold text-center">
//                                                                     No records
//                                                                 </td>
//                                                             </tr>
//                                                         </tbody>
//                                                     )
//                                                 }
//                                             </table>
//                                         </div>
//                                     </div>

//                                     <div className='col-span-2'>
//                                         <div className="border-b-2 border-gray-600 my-4"></div>
//                                         <div className="max-h-56 overflow-y-auto">
//                                             <table className="min-w-full border-collapse border">
//                                                 <thead className="bg-gray-50 sticky top-0 z-10 ">
//                                                     <tr>
//                                                         <th colSpan={6} className="px-4 py-2 text-lg font-semibold tracking-wide bg-gray-100 sticky top-0 border-b">
//                                                             <div className='flex items-center'>
//                                                                 <p className='w-full text-left'>
//                                                                     Product & Service
//                                                                 </p>
//                                                                 <Tooltip title="Add" arrow>
//                                                                     <div className='bg-green-600 h-7 w-7 flex justify-end items-center rounded-full text-white'>
//                                                                         <Components.IconButton onClick={() => handleOpenProductModel()}>
//                                                                             <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-3 w-3' />
//                                                                         </Components.IconButton>
//                                                                     </div>
//                                                                 </Tooltip>
//                                                             </div>
//                                                         </th>
//                                                     </tr>
//                                                     <tr>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             #
//                                                         </th>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             Name
//                                                         </th>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             Qty
//                                                         </th>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             Price
//                                                         </th>
//                                                         <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             Total Price
//                                                         </th>
//                                                         <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
//                                                             Actions
//                                                         </th>
//                                                     </tr>
//                                                 </thead>
//                                                 {
//                                                     opportunitiesProducts?.length > 0 ? (
//                                                         <tbody className="divide-y divide-gray-200 bg-white">
//                                                             {opportunitiesProducts?.map((row, i) => (
//                                                                 <tr key={i} className="hover:bg-gray-50">
//                                                                     <td className="px-4 py-1 text-sm text-gray-800 font-bold">{i + 1}</td>
//                                                                     <td className="px-4 py-1 text-sm text-gray-800">{row.name || "—"}</td>
//                                                                     <td className="px-4 py-1 text-sm text-gray-800">{row.qty || "—"}</td>
//                                                                     <td className="px-4 py-1 text-sm text-gray-800">${row.price?.toLocaleString() || "—"}</td>
//                                                                     <td className="px-4 py-1 text-sm text-gray-800">${parseFloat(parseFloat(row.qty) * parseFloat(row.price))?.toLocaleString() || "—"}</td>
//                                                                     <td className="px-4 py-1 text-sm text-gray-800">
//                                                                         <div className='flex items-center gap-2 justify-end h-full'>
//                                                                             <div className='bg-[#1072E0] h-7 w-7 flex justify-center items-center rounded-full text-white'>
//                                                                                 <Tooltip title="Edit" arrow>
//                                                                                     <Components.IconButton onClick={() => handleOpenProductModel(row.id)}>
//                                                                                         <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-3 w-3' />
//                                                                                     </Components.IconButton>
//                                                                                 </Tooltip>
//                                                                             </div>
//                                                                             <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
//                                                                                 <Tooltip title="Delete" arrow>
//                                                                                     <Components.IconButton onClick={() => handleOpenDeleteProductDialog(row.id)}>
//                                                                                         <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
//                                                                                     </Components.IconButton>
//                                                                                 </Tooltip>
//                                                                             </div>
//                                                                         </div>
//                                                                     </td>
//                                                                 </tr>
//                                                             ))}
//                                                         </tbody>
//                                                     ) : (
//                                                         <tbody className="divide-y divide-gray-200 bg-white">
//                                                             <tr className="hover:bg-gray-50">
//                                                                 <td colSpan={6} className="px-4 py-3 text-sm text-gray-800 font-bold text-center">
//                                                                     No records
//                                                                 </td>
//                                                             </tr>
//                                                         </tbody>
//                                                     )
//                                                 }
//                                             </table>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )
//                         }