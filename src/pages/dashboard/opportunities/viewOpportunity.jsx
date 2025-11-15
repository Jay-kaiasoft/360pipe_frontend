import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Checkbox from '../../../components/common/checkBox/checkbox';
import Select from '../../../components/common/select/select';
import Input from '../../../components/common/input/input';
import { Controller, useForm } from 'react-hook-form';
import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CustomIcons from '../../../components/common/icons/CustomIcons';
import FileInputBox from '../../../components/fileInputBox/fileInputBox';

import { getOpportunityDetails, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import { getAllAccounts } from '../../../service/account/accountService';
import { getAllOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';
import { getAllOpportunitiesProducts } from '../../../service/opportunities/OpportunityProductsService';
import { getAllOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import { opportunityStages, opportunityStatus, partnerRoles } from '../../../service/common/commonService';
import Button from '../../../components/common/buttons/button';
import { Chip, Tooltip } from '@mui/material';
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import Components from '../../../components/muiComponents/components';

const ViewOpportunity = ({ setAlert, setSyncingPushStatus }) => {
    const { opportunityId } = useParams()
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState([]);
    const [productTotalAmount, setProductTotalAmount] = useState(0)

    const [opportunitiesPartner, setOpportunitiesPartner] = useState([]);
    const [opportunitiesProducts, setOpportunitiesProducts] = useState([]);
    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);

    const {
        control,
        reset,
        watch,
        setValue,
        getValues,
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
            status: null,
            logo: null,
            newLogo: null,
        },
    });

    const handleGetOpportunityDetails = async () => {
        if (opportunityId) {
            const res = await getOpportunityDetails(opportunityId);
            if (res?.status === 200) {
                // The original logic to map API response fields to form fields
                setValue("accountId", res?.result?.accountId || null);
                setValue("opportunity", res?.result?.opportunity || null);
                setValue("closeDate", res?.result?.closeDate ? res?.result?.closeDate : null);
                setValue("nextSteps", res?.result?.nextSteps || null);
                setValue("salesforceOpportunityId", res?.result?.salesforceOpportunityId || null);
                // Important: Map stage/status titles from API back to the local ID for `watch()`
                setValue("salesStage", opportunityStages?.find(stage => stage.title === res?.result?.salesStage)?.title || null);
                setValue("status", opportunityStatus?.find(stage => stage.title === res?.result?.status)?.title || null);
                setValue("logo", res?.result?.logo)
                setValue("id", res?.result?.id)
                // Assuming 'dealOwner' comes from the API or needs to be set

                if (productTotalAmount > Number(res?.result?.dealAmount?.toFixed(2))) {
                    setValue("dealAmount", productTotalAmount)
                } else {
                    setValue("dealAmount", res?.result?.dealAmount || null);
                }

                // Original logic for opportunityPartnerDetails (keeping it for context, though not strictly needed for the view)
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
        if (opportunityId) {
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

    const handleGetAllOpportunitiesPartner = async () => {
        if (watch("id") || opportunityId) {
            const res = await getAllOpportunitiesPartner(watch("id") || opportunityId)
            setOpportunitiesPartner(res?.result)
        }
    }

    const handleGetOppProduct = async () => {
        if (watch("id") || opportunityId) {
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
        if (watch("id") || opportunityId) {
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

        }
    };

    useEffect(() => {
        handleGetOppProduct()
        handleGetAllOpportunitiesPartner()
        handleGetAllAccounts()
        handleGetOppContacts()
        handleGetOpportunityDetails()
    }, [])

    // --- Helper Functions and Components for View UI ---

    // 1. Helper to get the display name from an ID in an options array
    const getDisplayName = (id, options) => {
        const option = options.find(opt => opt.id === id);
        return option ? option.title : '—';
    };

    // 2. Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        // Use 'en-US' locale for consistent display or replace with your desired locale
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // 3. API save handlers
    const handleSaveField = async (fieldName, newValue) => {
        try {
            const opportunityId = watch("id");
            if (opportunityId) {
                const currentValues = getValues(); // Get all current form values
                const updateData = { ...currentValues, [fieldName]: newValue };
                const res = await updateOpportunity(opportunityId, updateData);
                if (res?.status === 200) {
                    setValue(fieldName, newValue);
                    // Optionally refresh data or show success message
                } else {
                    setAlert({
                        open: true,
                        message: "Failed to update opportunity",
                        type: "error"
                    })
                }
            }
        } catch (error) {
            setAlert({
                open: true,
                message: error || "Failed to update opportunity",
                type: "error"
            })
        }
    };

    const OpportunityField = ({ label, value, type = 'text', options = [], onSave, className = '', required = false }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(value);

        const handleDoubleClick = () => {
            setIsEditing(true);
            if (label === "Deal Amount") {
                setEditValue(value.replace(/[$,]/g, ''));
            } else {
                setEditValue(value);
            }
        };

        const handleSave = async () => {
            if (editValue !== value && onSave) {
                await onSave(type === 'select' ? label === "Account" ? options?.find((row) => (row.title === editValue || row.id === editValue))?.id : options?.find((row) => (row.title === editValue || row.id === editValue))?.title : editValue);
            }
            setIsEditing(false);
        };

        const handleCancel = () => {
            setEditValue(value);
            setIsEditing(false);
        };

        const handleChange = (e) => {
            setEditValue(e.target.value);
        };

        const handleSelectChange = (selectedOption) => {
            setEditValue(selectedOption.id);
        };

        const handleDateChange = (date) => {
            setEditValue(date ? dayjs(date).format("MM/DD/YYYY") : null);
        };

        const displayValue = value || '—';

        return (
            <div className={`flex justify-start items-center text-sm py-1 ${className}`}>
                <span className="font-medium text-gray-500 tracking-wider text-sm w-52">{label}</span>
                <div className="text-gray-900 font-semibold text-base text-right max-w-[60%] break-words">
                    {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                            {type === 'select' ? (
                                <div className='w-80'>
                                    <Select
                                        value={options?.find((row) => (row.title === editValue || row.id === editValue))?.id || null}
                                        options={options}
                                        onChange={(_, newValue) => handleSelectChange(newValue)}
                                        className="flex-1"
                                        autoFocus
                                        error={required}
                                    />
                                </div>
                            ) : type === 'date' ? (
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        value={editValue ? dayjs(editValue) : null}
                                        onChange={handleDateChange}
                                        format="MM/DD/YYYY"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: "outlined",
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        '& fieldset': {
                                                            borderColor: '#d1d5db',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: '#9ca3af',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#3b82f6',
                                                        },
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        height: 7,
                                                        fontSize: '14px',
                                                    },
                                                },
                                            },
                                        }}
                                        className="flex-1"
                                        error={required}
                                    />
                                </LocalizationProvider>
                            ) : (
                                <Input
                                    value={editValue || ''}
                                    onChange={handleChange}
                                    className="flex-1 text-right"
                                    autoFocus
                                    error={required}
                                />
                            )}
                            <div className='flex items-center gap-3'>
                                <Tooltip title="Save" arrow>
                                    <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleSave()}>
                                            <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>

                                <Tooltip title="Cancel" arrow>
                                    <div className='bg-gray-800 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleCancel()}>
                                            <CustomIcons iconName={'fa-solid fa-close'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    ) : (
                        <span
                            onDoubleClick={handleDoubleClick}
                            className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                        >
                            {displayValue}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const StageTimeline = ({ stages, currentStageId }) => {
        return (
            <div className="bg-white px-3 py-4 mb-0">
                <div className="flex flex-wrap xl:justify-evenly gap-3 md:gap-2 overflow-x-auto pb-1">
                    {stages?.map((stage) => {
                        const isActive = stage.id === currentStageId;
                        const isCompleted =
                            currentStageId !== null && stage.id < currentStageId;

                        let pillClasses = "";

                        if (isActive) {
                            // current stage
                            pillClasses =
                                "bg-[#1072E0] text-white border-[#1072E0]";
                        } else if (isCompleted) {
                            // completed stage
                            pillClasses =
                                "bg-[#E3F2FD] text-[#1072E0] border-[#B3D7FF]";
                        } else {
                            // upcoming stage
                            pillClasses = "bg-white text-gray-700 border-gray-300";
                        }

                        return (
                            <div
                                key={stage.id}
                                className={`inline-flex items-center justify-center px-3 py-2 text-xs font-semibold border rounded-full whitespace-nowrap cursor-default transition-colors duration-150 ${pillClasses}`}
                            >
                                <span className="truncate">
                                    {stage.title}
                                </span>

                                {isCompleted && (
                                    <CustomIcons
                                        iconName="fa-solid fa-check"
                                        css="h-3 w-3 inline-block ml-2"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const PartnersSection = ({ list = [] }) => {
        return (
            <>
                {
                    list?.length > 0 && (
                        <section className="mt-8">
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="mx-4 font-semibold text-gray-700">Partners</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>


                            <div className="grid grid-cols-2 md:grid-cols-4 4k:grid-cols-6 gap-4">
                                {list.map((row, i) => (
                                    <div
                                        key={row.id ?? i}
                                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <p className="font-semibold text-gray-800 text-lg">
                                            {row.accountName || "—"}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {row.role || "—"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                }
            </>
        );
    };

    const ContactsSection = ({ list = [] }) => {
        return (
            <>
                {
                    list.length > 0 && (
                        <section className="mt-8">
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="mx-4 font-semibold text-gray-700">Contacts</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>


                            <div className="grid md:grid-cols-2 lg:grid-cols-4 4k:grid-cols-6 gap-4">
                                {list.map((row, i) => (
                                    <div
                                        key={row.id ?? i}
                                        className={`
                                    bg-white border rounded-xl p-4 shadow-sm flex gap-3 cursor-pointer
                                    ${row.isKey ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                                    hover:shadow-md transition-shadow
                                `}
                                    >
                                        <div className={`w-10 h-10 rounded-full ${row.isKey ? 'bg-blue-600' : 'bg-gray-300'} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                                            {(row.contactName || "—").charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col">
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {row.contactName || "—"}
                                                </p>
                                                {row.isKey && (
                                                    <Chip
                                                        label="Key Contact"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#1072E0",
                                                            color: "#fff",
                                                            fontSize: 10,
                                                            height: 20,
                                                            mt: 0.5,
                                                            width: 'fit-content'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            {row.email && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {row.email}
                                                </p>
                                            )}
                                            {row.phone && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {row.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                }
            </>
        );
    };

    const ProductsSection = ({ list = [] }) => {
        const items = Array.isArray(list) ? list : [];
        const grandTotal = items.reduce((sum, row) => {
            const qty = parseFloat(row?.qty) || 0;
            const price = parseFloat(row?.price) || 0;
            return sum + qty * price;
        }, 0);

        return (
            <>
                {
                    items.length > 0 && (
                        <section className="mt-8">
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="mx-4 font-semibold text-gray-700">
                                    Products &amp; Services
                                </span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl shadow-md">
                                {/* Header for Alignment Reference (Optional, but helpful) */}
                                <div className="hidden sm:flex px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                    <div className="flex-1 min-w-0">Product Name</div>
                                    <div className="flex justify-end w-[250px] sm:w-[350px]">
                                        <span className="w-1/4 text-right">Qty</span>
                                        <span className="w-1/4 text-right">Price</span>
                                        <span className="w-1/2 text-right">Total</span>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {items.map((row, i) => {
                                        const qty = parseFloat(row?.qty) || 0;
                                        const price = parseFloat(row?.price) || 0;
                                        const total = qty * price;

                                        return (
                                            <div
                                                key={row.id ?? i}
                                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                {/* Product Name (Left Aligned) */}
                                                <div className="flex-1 min-w-0 pr-4 pb-2 sm:pb-0">
                                                    <p className="font-semibold text-gray-800 text-base break-words">
                                                        {row.name || "—"}
                                                    </p>
                                                </div>

                                                {/* Qty, Price, Total (Right Aligned, Columnar Structure) */}
                                                <div className="flex justify-between sm:justify-end w-full sm:w-[250px] lg:w-[350px] text-sm text-gray-700">
                                                    {/* Qty Column */}
                                                    <div className="flex sm:block w-1/3 sm:w-1/4 text-right">
                                                        <span className="sm:hidden text-xs text-gray-500 mr-2">Qty:</span>
                                                        <span className="font-semibold">{qty || "—"}</span>
                                                    </div>

                                                    {/* Price Column */}
                                                    <div className="flex sm:block w-1/3 sm:w-1/4 text-right">
                                                        <span className="sm:hidden text-xs text-gray-500 mr-2">Price:</span>
                                                        <span className="font-semibold">{price ? `$${price.toLocaleString()}` : "—"}</span>
                                                    </div>

                                                    {/* Total Column (Blue, prominent) */}
                                                    <div className="flex sm:block w-1/3 sm:w-1/2 text-right">
                                                        <span className="sm:hidden text-xs text-blue-600 mr-2">Total:</span>
                                                        <span className="font-bold text-blue-600 text-base">
                                                            {total ? `$${total.toLocaleString()}` : "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Grand Total Footer */}
                                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-[#F9FAFB] rounded-b-xl">
                                    <p className="text-base font-bold text-gray-700">
                                        Total Expected Revenue
                                    </p>
                                    <p className="text-lg font-extrabold text-[#1072E0]">
                                        {grandTotal
                                            ? `$${grandTotal.toLocaleString()}`
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                        </section>
                    )
                }
            </>
        );
    };


    return (
        <div className='mx-auto relative p-4 sm:p-6 bg-white rounded-xl shadow-lg'>

            {/* Back Button */}
            <div className='absolute top-1 left-5'>
                <div className='w-10 h-10 p-2 cursor-pointer flex items-center justify-center' onClick={() => navigate("/dashboard/opportunities")}>
                    <CustomIcons iconName="fa-solid fa-arrow-left" css="h-5 w-5 text-gray-600" />
                </div>
            </div>

            {/* Stage Timeline (Top Bar) */}
            <StageTimeline
                stages={opportunityStages}
                currentStageId={opportunityStages.find(stage => stage.title === watch("salesStage"))?.id}
            />

            <div className='grid grid-cols-1 md:grid-cols-5 gap-6 pt-4 border-t border-gray-200'>

                {/* Logo Section */}
                <div className='flex justify-center md:justify-start items-start md:col-span-1'>
                    <div className="w-32 h-32 border border-dashed border-gray-400 rounded-full overflow-hidden flex items-center justify-center">
                        <a href={watch("logo")} target='_blank' className='block w-full h-full'>
                            {watch("logo") ? (
                                <img
                                    src={watch("logo")}
                                    alt="Opportunity Logo"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-6xl">
                                    <CustomIcons iconName="fa-solid fa-image" css="w-5 h-5" />
                                </div>
                            )}
                        </a>
                    </div>
                </div>

                {/* Main Opportunity Fields (Responsive Grid) */}
                <div className='grid md:grid-cols-2 gap-y-5 w-full md:col-span-4'>
                    <>
                        <OpportunityField
                            label="Opportunity Name"
                            value={watch("opportunity")}
                            type="text"
                            onSave={(newValue) => handleSaveField("opportunity", newValue)}
                            required={true}
                        />

                        <OpportunityField
                            label="Stage"
                            value={watch("salesStage")}
                            type="select"
                            options={opportunityStages}
                            onSave={(newValue) => handleSaveField("salesStage", newValue)}
                            required={true}
                        />
                        <OpportunityField
                            label="Deal Amount"
                            value={watch("dealAmount") ? `$${Number(watch("dealAmount")).toLocaleString()}` : '—'}
                            type="text"
                            onSave={(newValue) => handleSaveField("dealAmount", parseFloat(newValue) || 0)}
                            required={true}
                        />

                        <OpportunityField
                            label="Close Date"
                            value={formatDate(watch("closeDate"))}
                            type="date"
                            onSave={(newValue) => handleSaveField("closeDate", newValue)}
                            required={true}
                        />
                    </>
                    <>
                        <OpportunityField
                            label="Account"
                            value={getDisplayName(watch("accountId"), accounts)}
                            type="select"
                            options={accounts}
                            onSave={(newValue) => handleSaveField("accountId", newValue)}
                        />

                        <OpportunityField
                            label="Next Steps"
                            value={watch("nextSteps")}
                            type="text"
                            onSave={(newValue) => handleSaveField("nextSteps", newValue)}
                            required={true}
                        />
                        <OpportunityField
                            label="Status"
                            value={watch("status")}
                            type="select"
                            options={opportunityStatus}
                            onSave={(newValue) => handleSaveField("status", newValue)}
                            required={true}
                        />
                    </>
                </div>
            </div>

            <ContactsSection list={opportunitiesContacts} />
            <PartnersSection list={opportunitiesPartner} />
            <ProductsSection list={opportunitiesProducts} />

        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(ViewOpportunity)
