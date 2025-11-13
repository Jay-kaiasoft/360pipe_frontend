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
            newLogo: null
        },
    });

    const handleGetOpportunityDetails = async () => {
        if (opportunityId) {
            const res = await getOpportunityDetails(opportunityId);
            if (res?.status === 200) {
                // reset(res?.result);
                setValue("accountId", res?.result?.accountId || null);
                setValue("opportunity", res?.result?.opportunity || null);
                setValue("closeDate", res?.result?.closeDate ? res?.result?.closeDate : null);
                setValue("nextSteps", res?.result?.nextSteps || null);
                setValue("salesforceOpportunityId", res?.result?.salesforceOpportunityId || null);
                setValue("salesStage", opportunityStages?.find(stage => stage.title === res?.result?.salesStage)?.id || null);
                setValue("status", opportunityStatus?.find(stage => stage.title === res?.result?.status)?.id || null);
                setValue("logo", res?.result?.logo)
                setValue("id", res?.result?.id)
                if (productTotalAmount > Number(res?.result?.dealAmount?.toFixed(2))) {
                    setValue("dealAmount", productTotalAmount)
                } else {
                    setValue("dealAmount", res?.result?.dealAmount || null);
                }
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

    return (
        <div className='mx-[200px] relative'>
            <div className='grid md:grid-cols-3 gap-[30px] mt-8'>
                <div className='flex justify-center items-center my-5'>
                    <FileInputBox
                        value={watch("logo") || watch("newLogo")}
                        text="Upload opportunity Logo"
                        size="100x100"
                        disabled={true}
                    />
                </div>

                <div className='grid grid-cols-2 md:grid-cols-3  gap-[30px] md:col-span-2'>
                    <div>
                        <Controller
                            name="accountId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={accounts}
                                    label={"Account"}
                                    placeholder="Select Account"
                                    value={parseInt(watch("accountId")) || null}
                                    disabled={true}
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="opportunity"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label="Opportunity Name"
                                type={`text`}
                                error={errors.opportunity}
                                disabled={true}
                            />
                        )}
                    />
                    <Controller
                        name="dealAmount"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label="Deal Amount"
                                type="text"
                                error={errors.dealAmount}
                                disabled={true}
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
                        render={({ field }) => (
                            <Select
                                options={opportunityStages}
                                label={"Stage"}
                                placeholder="Select Stage"
                                value={parseInt(watch("salesStage")) || null}
                                error={errors.salesStage}
                                disabled={true}
                            />
                        )}
                    />
                    <DatePickerComponent setValue={setValue} control={control} name='closeDate' label={`Close Date`} minDate={new Date()} maxDate={null} required={true} disabled={true} />
                    <Controller
                        name="nextSteps"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label="Next Steps"
                                type={`text`}
                                error={errors.nextSteps}
                                disabled={true}
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
                                disabled={true}
                            />
                        )}
                    />
                </div>
            </div>

            <div>
                <div class="flex items-center my-6">
                    <div class="flex-grow border-t border-gray-300"></div>
                    <span class="mx-4 font-semibold text-gray-700">Partners</span>
                    <div class="flex-grow border-t border-gray-300"></div>
                </div>

                <div>
                    <div className="border rounded-md overflow-hidden">
                        <div className="max-h-56 overflow-y-auto">
                            <table className="min-w-full border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#0478DC] text-white">
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(opportunitiesPartner?.length ? opportunitiesPartner : []).map((row, i) => (
                                        <tr
                                            key={row.id ?? i}
                                            className="odd:bg-white even:bg-[#0000003B]"
                                        >
                                            <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
                                            <td className="px-4 py-3 text-sm">{row.accountName || "—"}</td>
                                            <td className="px-4 py-3 text-sm">{row.role || "—"}</td>
                                        </tr>
                                    ))}
                                    {(!opportunitiesPartner || opportunitiesPartner.length === 0) && (
                                        <tr className="odd:bg-white">
                                            <td colSpan={4} className="px-4 py-4 text-center text-sm font-semibold">
                                                No records
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="flex items-center my-6">
                    <div class="flex-grow border-t border-gray-300"></div>
                    <span class="mx-4 font-semibold text-gray-700">Contacts</span>
                    <div class="flex-grow border-t border-gray-300"></div>
                </div>

                <div>
                    <div className="border rounded-md overflow-hidden">
                        <div className="max-h-56 overflow-y-auto">
                            <table className="min-w-full border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#0478DC] text-white">
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Key Contact</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {opportunitiesContacts?.length > 0 ? (
                                        opportunitiesContacts.map((row, i) => (
                                            <tr
                                                key={row.id ?? i}
                                                className="odd:bg-white even:bg-gray-200"
                                            >
                                                <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
                                                <td className="px-4 py-3 text-sm">{row.contactName || "—"}</td>

                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex justify-start">
                                                        <Checkbox
                                                            checked={!!row.isKey}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-4 text-center text-sm font-semibold"
                                            >
                                                No records
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="flex items-center my-6">
                    <div class="flex-grow border-t border-gray-300"></div>
                    <span class="mx-4 font-semibold text-gray-700">Products & Service</span>
                    <div class="flex-grow border-t border-gray-300"></div>
                </div>

                <div>
                    <div className="border rounded-md overflow-hidden">
                        <div className="max-h-56 overflow-y-auto">
                            <table className="min-w-full border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#0478DC] text-white">
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold w-28">Qty</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold w-32">Price</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold w-40">Total Price</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(opportunitiesProducts?.length ? opportunitiesProducts : []).map((row, i) => {
                                        const qty = parseFloat(row?.qty) || 0;
                                        const price = parseFloat(row?.price) || 0;
                                        const total = qty * price;

                                        return (
                                            <tr key={row.id ?? i} className="odd:bg-white even:bg-gray-200">
                                                <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
                                                <td className="px-4 py-3 text-sm">{row.name || "—"}</td>
                                                <td className="px-4 py-3 text-sm text-right">{qty || "—"}</td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    {price ? `$${price.toLocaleString()}` : "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    {total ? `$${total.toLocaleString()}` : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {(!opportunitiesProducts || opportunitiesProducts.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-4 text-center text-sm font-semibold">
                                                No records
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className='absolute top-0 left-0'>
                <div className='w-10 h-10 rounded-full p-2 border cursor-pointer' onClick={() => navigate("/dashboard/opportunities")}>
                    <CustomIcons iconName="fa-solid fa-arrow-left" css="h-5 w-5" />
                </div>
                {/* <Button type={`button`} text={'Back'} onClick={() => navigate("/dashboard/opportunities")} startIcon={ } /> */}
            </div>
        </div>
    )
}

export default ViewOpportunity


// <div className='px-[30px]'>
//         <div className='grid md:grid-cols-3 gap-[30px] mt-8'>
//             <div className='flex justify-center items-center my-5'>
//                 <FileInputBox
//                     value={watch("logo") || watch("newLogo")}
//                     text="Upload opportunity Logo"
//                     size="100x100"
//                     disabled={true}
//                 />
//             </div>

//             <div className='flex flex-col gap-[30px] md:col-span-2'>
//                 <div>
//                     <Controller
//                         name="accountId"
//                         control={control}
//                         render={({ field }) => (
//                             <Select
//                                 options={accounts}
//                                 label={"Account"}
//                                 placeholder="Select Account"
//                                 value={parseInt(watch("accountId")) || null}
//                                 disabled={true}
//                             />
//                         )}
//                     />
//                 </div>

//                 <Controller
//                     name="opportunity"
//                     control={control}
//                     render={({ field }) => (
//                         <Input
//                             {...field}
//                             label="Opportunity Name"
//                             type={`text`}
//                             error={errors.opportunity}
//                             disabled={true}
//                         />
//                     )}
//                 />
//             </div>
//         </div>

//         <div className='pt-[30px] md:px-[30px]'>
//             <div className={`grid grid-cols-2 md:grid-cols-3  gap-[30px] md:col-span-4`}>
//                 <Controller
//                     name="dealAmount"
//                     control={control}
//                     render={({ field }) => (
//                         <Input
//                             {...field}
//                             label="Deal Amount"
//                             type="text"
//                             error={errors.dealAmount}
//                             disabled={true}
//                             startIcon={
//                                 <CustomIcons
//                                     iconName={"fa-solid fa-dollar-sign"}
//                                     css={"text-lg text-black mr-2"}
//                                 />
//                             }
//                         />
//                     )}
//                 />
//                 <Controller
//                     name="salesStage"
//                     control={control}
//                     render={({ field }) => (
//                         <Select
//                             options={opportunityStages}
//                             label={"Stage"}
//                             placeholder="Select Stage"
//                             value={parseInt(watch("salesStage")) || null}
//                             error={errors.salesStage}
//                             disabled={true}
//                         />
//                     )}
//                 />
//                 <DatePickerComponent setValue={setValue} control={control} name='closeDate' label={`Close Date`} minDate={new Date()} maxDate={null} required={true} disabled={true} />
//                 <Controller
//                     name="nextSteps"
//                     control={control}
//                     render={({ field }) => (
//                         <Input
//                             {...field}
//                             label="Next Steps"
//                             type={`text`}
//                             error={errors.nextSteps}
//                             disabled={true}
//                         />
//                     )}
//                 />
//                 <Controller
//                     name="status"
//                     control={control}
//                     render={({ field }) => (
//                         <Select
//                             options={opportunityStatus}
//                             label={"Status"}
//                             placeholder="Select status"
//                             value={parseInt(watch("status")) || null}
//                             disabled={true}
//                         />
//                     )}
//                 />
//             </div>
//         </div>

//         <div class="flex items-center my-6 px-[30px]">
//             <div class="flex-grow border-t border-gray-300"></div>
//             <span class="mx-4 font-semibold text-gray-700">Partners</span>
//             <div class="flex-grow border-t border-gray-300"></div>
//         </div>


//         <div className="px-[30px]">
//             <div className="border rounded-md overflow-hidden">
//                 <div className="max-h-56 overflow-y-auto">
//                     <table className="min-w-full border-collapse">
//                         <thead className="sticky top-0 z-10">
//                             <tr className="bg-[#0478DC] text-white">
//                                 <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {(opportunitiesPartner?.length ? opportunitiesPartner : []).map((row, i) => (
//                                 <tr
//                                     key={row.id ?? i}
//                                     className="odd:bg-white even:bg-[#0000003B]"
//                                 >
//                                     <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
//                                     <td className="px-4 py-3 text-sm">{row.accountName || "—"}</td>
//                                     <td className="px-4 py-3 text-sm">{row.role || "—"}</td>
//                                 </tr>
//                             ))}
//                             {(!opportunitiesPartner || opportunitiesPartner.length === 0) && (
//                                 <tr className="odd:bg-white">
//                                     <td colSpan={4} className="px-4 py-4 text-center text-sm font-semibold">
//                                         No records
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>

//         <div class="flex items-center my-6 px-[30px]">
//             <div class="flex-grow border-t border-gray-300"></div>
//             <span class="mx-4 font-semibold text-gray-700">Contacts</span>
//             <div class="flex-grow border-t border-gray-300"></div>
//         </div>

//         <div className="px-[30px]">
//             <div className="border rounded-md overflow-hidden">
//                 <div className="max-h-56 overflow-y-auto">
//                     <table className="min-w-full border-collapse">
//                         <thead className="sticky top-0 z-10">
//                             <tr className="bg-[#0478DC] text-white">
//                                 <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Key Contact</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {opportunitiesContacts?.length > 0 ? (
//                                 opportunitiesContacts.map((row, i) => (
//                                     <tr
//                                         key={row.id ?? i}
//                                         className="odd:bg-white even:bg-gray-200"
//                                     >
//                                         <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
//                                         <td className="px-4 py-3 text-sm">{row.contactName || "—"}</td>

//                                         <td className="px-4 py-3 text-sm">
//                                             <div className="flex justify-start">
//                                                 <Checkbox
//                                                     checked={!!row.isKey}
//                                                     disabled={true}
//                                                 />
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td
//                                         colSpan={4}
//                                         className="px-4 py-4 text-center text-sm font-semibold"
//                                     >
//                                         No records
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>

//         <div class="flex items-center my-6 px-[30px]">
//             <div class="flex-grow border-t border-gray-300"></div>
//             <span class="mx-4 font-semibold text-gray-700">Products & Service</span>
//             <div class="flex-grow border-t border-gray-300"></div>
//         </div>

//         <div className="px-[30px]">
//             <div className="border rounded-md overflow-hidden">
//                 <div className="max-h-56 overflow-y-auto">
//                     <table className="min-w-full border-collapse">
//                         <thead className="sticky top-0 z-10">
//                             <tr className="bg-[#0478DC] text-white">
//                                 <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
//                                 <th className="px-4 py-3 text-right text-sm font-semibold w-28">Qty</th>
//                                 <th className="px-4 py-3 text-right text-sm font-semibold w-32">Price</th>
//                                 <th className="px-4 py-3 text-right text-sm font-semibold w-40">Total Price</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {(opportunitiesProducts?.length ? opportunitiesProducts : []).map((row, i) => {
//                                 const qty = parseFloat(row?.qty) || 0;
//                                 const price = parseFloat(row?.price) || 0;
//                                 const total = qty * price;

//                                 return (
//                                     <tr key={row.id ?? i} className="odd:bg-white even:bg-gray-200">
//                                         <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
//                                         <td className="px-4 py-3 text-sm">{row.name || "—"}</td>
//                                         <td className="px-4 py-3 text-sm text-right">{qty || "—"}</td>
//                                         <td className="px-4 py-3 text-sm text-right">
//                                             {price ? `$${price.toLocaleString()}` : "—"}
//                                         </td>
//                                         <td className="px-4 py-3 text-sm text-right">
//                                             {total ? `$${total.toLocaleString()}` : "—"}
//                                         </td>
//                                     </tr>
//                                 );
//                             })}

//                             {(!opportunitiesProducts || opportunitiesProducts.length === 0) && (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-4 text-center text-sm font-semibold">
//                                         No records
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     </div>