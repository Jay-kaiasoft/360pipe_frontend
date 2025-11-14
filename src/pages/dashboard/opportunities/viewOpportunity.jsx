// import React, { useEffect, useState } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'

// import Checkbox from '../../../components/common/checkBox/checkbox';
// import Select from '../../../components/common/select/select';
// import Input from '../../../components/common/input/input';
// import { Controller, useForm } from 'react-hook-form';
// import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
// import CustomIcons from '../../../components/common/icons/CustomIcons';
// import FileInputBox from '../../../components/fileInputBox/fileInputBox';

// import { getOpportunityDetails } from '../../../service/opportunities/opportunitiesService';
// import { getAllAccounts } from '../../../service/account/accountService';
// import { getAllOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';
// import { getAllOpportunitiesProducts } from '../../../service/opportunities/OpportunityProductsService';
// import { getAllOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
// import { opportunityStages, opportunityStatus, partnerRoles } from '../../../service/common/commonService';
// import Button from '../../../components/common/buttons/button';
// import { Chip } from '@mui/material';

// const ViewOpportunity = () => {
//     const { opportunityId } = useParams()
//     const navigate = useNavigate();

//     const [accounts, setAccounts] = useState([]);
//     const [productTotalAmount, setProductTotalAmount] = useState(0)

//     const [opportunitiesPartner, setOpportunitiesPartner] = useState([]);
//     const [opportunitiesProducts, setOpportunitiesProducts] = useState([]);
//     const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);

//     const {
//         control,
//         reset,
//         watch,
//         setValue,
//         formState: { errors },
//     } = useForm({
//         defaultValues: {
//             id: null,
//             opportunity: null,
//             salesStage: null,
//             dealAmount: null,
//             closeDate: null,
//             nextSteps: null,
//             accountId: null,
//             salesforceOpportunityId: null,
//             status: 1,
//             logo: null,
//             newLogo: null
//         },
//     });

//     const handleGetOpportunityDetails = async () => {
//         if (opportunityId) {
//             const res = await getOpportunityDetails(opportunityId);
//             if (res?.status === 200) {
//                 // reset(res?.result);
//                 setValue("accountId", res?.result?.accountId || null);
//                 setValue("opportunity", res?.result?.opportunity || null);
//                 setValue("closeDate", res?.result?.closeDate ? res?.result?.closeDate : null);
//                 setValue("nextSteps", res?.result?.nextSteps || null);
//                 setValue("salesforceOpportunityId", res?.result?.salesforceOpportunityId || null);
//                 setValue("salesStage", opportunityStages?.find(stage => stage.title === res?.result?.salesStage)?.id || null);
//                 setValue("status", opportunityStatus?.find(stage => stage.title === res?.result?.status)?.id || null);
//                 setValue("logo", res?.result?.logo)
//                 setValue("id", res?.result?.id)
//                 if (productTotalAmount > Number(res?.result?.dealAmount?.toFixed(2))) {
//                     setValue("dealAmount", productTotalAmount)
//                 } else {
//                     setValue("dealAmount", res?.result?.dealAmount || null);
//                 }
//                 if (res?.result?.opportunityPartnerDetails?.length > 0) {
//                     const formattedDetails = res?.result?.opportunityPartnerDetails?.map((item) => ({
//                         ...item,
//                         roleid: partnerRoles?.find(role => role.title === item.role)?.id || null,
//                         partnerId: item.id
//                     }));
//                     setValue('opportunityPartnerDetails', formattedDetails);
//                 } else {
//                     setValue('opportunityPartnerDetails', [{
//                         id: null,
//                         salesforceOpportunityPartnerId: null,
//                         opportunityId: null,
//                         accountToId: null,
//                         accountId: null,
//                         role: null,
//                         roleid: null,
//                         isPrimary: false,
//                         isDeleted: false,
//                     }]);
//                 }
//             }
//         }
//     }

//     const handleGetAllAccounts = async () => {
//         if (opportunityId) {
//             const res = await getAllAccounts("fetchType=Options");
//             if (res?.status === 200) {
//                 const data = res?.result?.map((acc) => ({
//                     title: acc.accountName,
//                     id: acc.id,
//                     salesforceAccountId: acc.salesforceAccountId
//                 }));
//                 setAccounts(data);
//             }
//         }
//     };

//     const handleGetAllOpportunitiesPartner = async () => {
//         if (watch("id") || opportunityId) {
//             const res = await getAllOpportunitiesPartner(watch("id") || opportunityId)
//             setOpportunitiesPartner(res?.result)
//         }
//     }

//     const handleGetOppProduct = async () => {
//         if (watch("id") || opportunityId) {
//             const res = await getAllOpportunitiesProducts(watch("id") || opportunityId)
//             setOpportunitiesProducts(res.result)
//             const total = res.result?.reduce((sum, item) => {
//                 const price = parseFloat(parseFloat(item?.qty) * parseFloat(item?.price)) || 0;
//                 return sum + price;
//             }, 0);
//             setProductTotalAmount(Number(total.toFixed(2)));
//         }
//     }

//     const handleGetOppContacts = async () => {
//         if (watch("id") || opportunityId) {
//             const res = await getAllOpportunitiesContact(watch("id") || opportunityId);
//             const list = Array.isArray(res?.result) ? res.result : [];

//             // ✅ Sort: isKey === true first
//             const sortedList = [...list].sort((a, b) => {
//                 // true values should come first
//                 if (a.isKey === b.isKey) return 0;
//                 return a.isKey ? -1 : 1;
//             });

//             setOpportunitiesContacts(sortedList);

//             const map = {};
//             sortedList.forEach(c => {
//                 if (c?.id != null) map[c.id] = !!c.isKey;
//             });

//         }
//     };

//     useEffect(() => {
//         handleGetOppProduct()
//         handleGetAllOpportunitiesPartner()
//         handleGetAllAccounts()
//         handleGetOppContacts()
//         handleGetOpportunityDetails()
//     }, [])

//     return (
//         <div className='mx-[200px] relative'>           
//             <div className='grid md:grid-cols-3 gap-[30px] mt-8'>
//                 <div className='flex justify-center items-start my-5'>
//                     <div className="w-32 h-32 border border-dashed border-gray-400 rounded-full overflow-hidden">
//                         <a href={watch("logo")} target='_blank'>
//                             <img
//                                 src={watch("logo")}
//                                 alt="Uploaded preview"
//                                 className="w-full h-full object-contain"
//                             />
//                         </a>
//                     </div>
//                 </div>

//                 <div className='grid grid-cols-2 md:grid-cols-3  gap-[30px] md:col-span-2'>
//                     <div>
//                         <Controller
//                             name="accountId"
//                             control={control}
//                             render={({ field }) => (
//                                 <Select
//                                     options={accounts}
//                                     label={"Account"}
//                                     placeholder="Select Account"
//                                     value={parseInt(watch("accountId")) || null}
//                                     disabled={true}
//                                 />
//                             )}
//                         />
//                     </div>

//                     <Controller
//                         name="opportunity"
//                         control={control}
//                         render={({ field }) => (
//                             <Input
//                                 {...field}
//                                 label="Opportunity Name"
//                                 type={`text`}
//                                 error={errors.opportunity}
//                                 disabled={true}
//                             />
//                         )}
//                     />
//                     <Controller
//                         name="dealAmount"
//                         control={control}
//                         render={({ field }) => (
//                             <Input
//                                 {...field}
//                                 label="Deal Amount"
//                                 type="text"
//                                 error={errors.dealAmount}
//                                 disabled={true}
//                                 startIcon={
//                                     <CustomIcons
//                                         iconName={"fa-solid fa-dollar-sign"}
//                                         css={"text-lg text-black mr-2"}
//                                     />
//                                 }
//                             />
//                         )}
//                     />
//                     <Controller
//                         name="salesStage"
//                         control={control}
//                         render={({ field }) => (
//                             <Select
//                                 options={opportunityStages}
//                                 label={"Stage"}
//                                 placeholder="Select Stage"
//                                 value={parseInt(watch("salesStage")) || null}
//                                 error={errors.salesStage}
//                                 disabled={true}
//                             />
//                         )}
//                     />
//                     <DatePickerComponent setValue={setValue} control={control} name='closeDate' label={`Close Date`} minDate={new Date()} maxDate={null} required={true} disabled={true} />
//                     <Controller
//                         name="nextSteps"
//                         control={control}
//                         render={({ field }) => (
//                             <Input
//                                 {...field}
//                                 label="Next Steps"
//                                 type={`text`}
//                                 error={errors.nextSteps}
//                                 disabled={true}
//                             />
//                         )}
//                     />
//                     <Controller
//                         name="status"
//                         control={control}
//                         render={({ field }) => (
//                             <Select
//                                 options={opportunityStatus}
//                                 label={"Status"}
//                                 placeholder="Select status"
//                                 value={parseInt(watch("status")) || null}
//                                 disabled={true}
//                             />
//                         )}
//                     />
//                 </div>
//             </div>

//             <div>
//                 <div class="flex items-center my-6">
//                     <div class="flex-grow border-t border-gray-300"></div>
//                     <span class="mx-4 font-semibold text-gray-700">Partners</span>
//                     <div class="flex-grow border-t border-gray-300"></div>
//                 </div>

//                 <div>
//                     <div className="border rounded-md overflow-hidden">
//                         <div className="max-h-56 overflow-y-auto">
//                             <table className="min-w-full border-collapse">
//                                 <thead className="sticky top-0 z-10">
//                                     <tr className="bg-[#0478DC] text-white">
//                                         <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
//                                         <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
//                                         <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {(opportunitiesPartner?.length ? opportunitiesPartner : []).map((row, i) => (
//                                         <tr
//                                             key={row.id ?? i}
//                                             className="odd:bg-white even:bg-[#0000003B]"
//                                         >
//                                             <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
//                                             <td className="px-4 py-3 text-sm">{row.accountName || "—"}</td>
//                                             <td className="px-4 py-3 text-sm">{row.role || "—"}</td>
//                                         </tr>
//                                     ))}
//                                     {(!opportunitiesPartner || opportunitiesPartner.length === 0) && (
//                                         <tr className="odd:bg-white">
//                                             <td colSpan={4} className="px-4 py-4 text-center text-sm font-semibold">
//                                                 No records
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="flex items-center my-6">
//                     <div class="flex-grow border-t border-gray-300"></div>
//                     <span class="mx-4 font-semibold text-gray-700">Contacts</span>
//                     <div class="flex-grow border-t border-gray-300"></div>
//                 </div>

//                 <div>
//                     <div className="border rounded-md overflow-hidden">
//                         <div className="max-h-56 overflow-y-auto">
//                             <table className="min-w-full border-collapse">
//                                 <thead className="sticky top-0 z-10">
//                                     <tr className="bg-[#0478DC] text-white">
//                                         <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
//                                         <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
//                                         <th className="px-4 py-3 text-left text-sm font-semibold">Key Contact</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {opportunitiesContacts?.length > 0 ? (
//                                         opportunitiesContacts.map((row, i) => (
//                                             <tr
//                                                 key={row.id ?? i}
//                                                 className="odd:bg-white even:bg-gray-200"
//                                             >
//                                                 <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
//                                                 <td className="px-4 py-3 text-sm">{row.contactName || "—"}</td>

//                                                 <td className="px-4 py-3 text-sm">
//                                                     <div className="flex justify-start">
//                                                         <Checkbox
//                                                             checked={!!row.isKey}
//                                                             disabled={true}
//                                                         />
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td
//                                                 colSpan={4}
//                                                 className="px-4 py-4 text-center text-sm font-semibold"
//                                             >
//                                                 No records
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="flex items-center my-6">
//                     <div class="flex-grow border-t border-gray-300"></div>
//                     <span class="mx-4 font-semibold text-gray-700">Products & Service</span>
//                     <div class="flex-grow border-t border-gray-300"></div>
//                 </div>

//                 <div>
//                     <div className="border rounded-md overflow-hidden">
//                         <div className="max-h-56 overflow-y-auto">
//                             <table className="min-w-full border-collapse">
//                                 <thead className="sticky top-0 z-10">
//                                     <tr className="bg-[#0478DC] text-white">
//                                         <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
//                                         <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
//                                         <th className="px-4 py-3 text-right text-sm font-semibold w-28">Qty</th>
//                                         <th className="px-4 py-3 text-right text-sm font-semibold w-32">Price</th>
//                                         <th className="px-4 py-3 text-right text-sm font-semibold w-40">Total Price</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {(opportunitiesProducts?.length ? opportunitiesProducts : []).map((row, i) => {
//                                         const qty = parseFloat(row?.qty) || 0;
//                                         const price = parseFloat(row?.price) || 0;
//                                         const total = qty * price;

//                                         return (
//                                             <tr key={row.id ?? i} className="odd:bg-white even:bg-gray-200">
//                                                 <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
//                                                 <td className="px-4 py-3 text-sm">{row.name || "—"}</td>
//                                                 <td className="px-4 py-3 text-sm text-right">{qty || "—"}</td>
//                                                 <td className="px-4 py-3 text-sm text-right">
//                                                     {price ? `$${price.toLocaleString()}` : "—"}
//                                                 </td>
//                                                 <td className="px-4 py-3 text-sm text-right">
//                                                     {total ? `$${total.toLocaleString()}` : "—"}
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}

//                                     {(!opportunitiesProducts || opportunitiesProducts.length === 0) && (
//                                         <tr>
//                                             <td colSpan={6} className="px-4 py-4 text-center text-sm font-semibold">
//                                                 No records
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className='absolute top-0 left-0'>
//                 <div className='w-10 h-10 rounded-full p-2 border cursor-pointer' onClick={() => navigate("/dashboard/opportunities")}>
//                     <CustomIcons iconName="fa-solid fa-arrow-left" css="h-5 w-5" />
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default ViewOpportunity



import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Checkbox from '../../../components/common/checkBox/checkbox';
import Select from '../../../components/common/select/select';
import Input from '../../../components/common/input/input';
import { Controller, useForm } from 'react-hook-form';
import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import FileInputBox from '../../../components/fileInputBox/fileInputBox';

import { getOpportunityDetails } from '../../../service/opportunities/opportunitiesService';
import { getAllAccounts } from '../../../service/account/accountService';
import { getAllOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';
import { getAllOpportunitiesProducts } from '../../../service/opportunities/OpportunityProductsService';
import { getAllOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import { opportunityStages, opportunityStatus, partnerRoles } from '../../../service/common/commonService';
import Button from '../../../components/common/buttons/button';
import { Chip } from '@mui/material';

const ViewOpportunity = () => {
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
            newLogo: null,
            // Mock field for data in image, you can populate this if available
            dealOwner: 'Drew Brockbank',
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
                setValue("salesStage", opportunityStages?.find(stage => stage.title === res?.result?.salesStage)?.id || null);
                setValue("status", opportunityStatus?.find(stage => stage.title === res?.result?.status)?.id || null);
                setValue("logo", res?.result?.logo)
                setValue("id", res?.result?.id)
                // Assuming 'dealOwner' comes from the API or needs to be set
                setValue("dealOwner", res?.result?.dealOwner || "N/A");

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

    const OpportunityField = ({ label, value, className = '' }) => (
        <div className={`flex justify-start items-center text-sm py-1 ${className}`}>
            <span className="font-medium text-gray-500 tracking-wider text-sm w-52">{label}</span>
            <span className="text-gray-900 font-semibold text-base text-right max-w-[60%] break-words">{value || '—'}</span>
        </div>
    );

    const StageTimeline = ({ stages, currentStageId }) => {
        return (
            <div className="bg-white px-2 py-4 mb-0">
                {/* <div className="flex justify-start items-center mb-3 ml-2">
                    <p className="text-xs font-semibold text-gray-500 tracking-wide mr-2">
                        START:
                    </p>
                    {startDate ? (
                        <p className="text-xs font-semibold text-gray-700">
                            {new Date(startDate).toLocaleDateString()}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500">—</p>
                    )}
                </div> */}

                <div className="flex overflow-x-auto gap-2 py-2">
                    {stages?.map((stage, index) => {
                        // Logic uses the ID derived from the title string
                        const isActive = stage.id === currentStageId;
                        const isCompleted = currentStageId !== null && stage.id < currentStageId;

                        return (
                            <div
                                key={stage.id}
                                className={`
                                relative px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-default
                                border rounded-full transition-colors duration-150
                                ${stage.id === currentStageId ? "bg-[#1072E0] text-gray-600 border-[#1072E0]" : "text-gray-600"}
                                ${isCompleted ? "bg-[#E3F2FD] text-[#1072E0] border-[#E3F2FD]" : "bg-white text-gray-600 border-gray-300"}
                            `}
                            >
                                {stage.title}
                                {/* Checkmark icon (resembling the design image) */}
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
                    list > 0 && (
                        <section className="mt-8">
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="mx-4 font-semibold text-gray-700">Partners</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>


                            <div className="grid md:grid-cols-4 gap-4">
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


                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                            <div className="border border-dashed border-gray-300 rounded-xl py-6 text-center text-sm font-semibold text-gray-500">
                                No products added yet
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
                salesStage={watch("salesStage")}
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
                <div className='grid grid-cols-2 gap-y-5 w-full col-span-4'>
                    <>
                        <OpportunityField
                            label="Opportunity Name"
                            value={watch("opportunity")}
                        />

                        <OpportunityField
                            label="Stage"
                            value={getDisplayName(watch("salesStage"), opportunityStages)}
                        />
                        <OpportunityField
                            label="Deal Amount"
                            value={watch("dealAmount") ? `$${Number(watch("dealAmount")).toLocaleString()}` : '—'}
                        />

                        <OpportunityField
                            label="Close Date"
                            value={formatDate(watch("closeDate"))}
                        />
                    </>
                    <>
                        <OpportunityField
                            label="Account"
                            value={getDisplayName(watch("accountId"), accounts)}
                        />

                        <OpportunityField
                            label="Next Steps"
                            value={watch("nextSteps")}
                        />
                        <OpportunityField
                            label="Status"
                            value={getDisplayName(watch("status"), opportunityStatus)}
                        />
                    </>
                    {/* Add placeholder for empty slot if needed, or let grid handle it */}
                </div>
            </div>

            {/* Related Records Sections (Using the improved components) */}
            <ContactsSection list={opportunitiesContacts} />
            <PartnersSection list={opportunitiesPartner} />
            <ProductsSection list={opportunitiesProducts} />

        </div>
    )
}

export default ViewOpportunity