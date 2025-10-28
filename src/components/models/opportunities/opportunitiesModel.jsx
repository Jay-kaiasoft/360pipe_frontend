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

import { createOpportunity, getOpportunityDetails, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import { getAllAccounts } from '../../../service/account/accountService';
import { opportunityStages, partnerRoles } from '../../../service/common/commonService';
import { deleteOpportunitiesPartner, getAllOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';
import AlertDialog from '../../common/alertDialog/alertDialog';
import OpportunitiesPartnersModel from "./opportunityPartnerModel";
import { deleteOpportunitiesProducts, getAllOpportunitiesProducts } from '../../../service/opportunities/OpportunityProductsService';
import OpportunitiesProductsModel from './opportunitiesProductsModel';

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

    const [opportunitiesPartner, setOpportunitiesPartner] = useState([]);
    const [opportunitiesProducts, setOpportunitiesProducts] = useState([]);

    const [openPartnerModel, setOpenPartnerModel] = useState(false);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedOppPartnerId, setSelectedOppPartnerId] = useState(null);

    const [openProductModel, setOpenProductModel] = useState(false);
    const [dialogProduct, setDialogProduct] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedProductId, setSelectedProductId] = useState(null);


    const handleOpenPartnerModel = (id) => {
        setSelectedOppPartnerId(id);
        setOpenPartnerModel(true);
    };

    const handleClosePartnerModel = () => {
        setSelectedOppPartnerId(null);
        setOpenPartnerModel(false);
    };

    const handleOpenDeleteDialog = (id) => {
        setSelectedOppPartnerId(id);
        setDialog({ open: true, title: 'Delete Partner', message: 'Are you sure! Do you want to delete this partner?', actionButtonText: 'yes' });
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
        },
    });

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
        });
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
        if (open && opportunityId) {
            const res = await getAllOpportunitiesPartner(opportunityId)
            setOpportunitiesPartner(res?.result)
        }
    }

    const handleGetOppProduct = async () => {
        if (open && opportunityId) {
            const res = await getAllOpportunitiesProducts(opportunityId)
            setOpportunitiesProducts(res.result)
        }
    }

    useEffect(() => {
        handleGetOppProduct()
        handleGetAllOpportunitiesPartner()
        handleGetAllAccounts()
        handleGetOpportunityDetails()
    }, [open])

    const submit = async (data) => {
        setLoading(true);
        const newData = {
            ...data,
            salesStage: opportunityStages?.find(stage => stage.id === parseInt(data.salesStage))?.title || null,
        }
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
                fullScreen
                maxWidth='lg'
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

                <form noValidate onSubmit={handleSubmit(submit)} className='h-full'>
                    <Components.DialogContent dividers>
                        <div className='grid md:grid-cols-4 gap-4 mb-4'>
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
                        <div className='grid md:grid-cols-2 gap-4'>
                            <div>
                                {/* <div className="flex items-center my-2 col-span-2 md:col-span-3">
                                    <div className="flex-grow border-t border-black"></div>
                                    <span className="mx-4 text-black font-medium">Partner Details</span>
                                    <div className="flex-grow border-t border-black"></div>
                                </div> */}

                                <div className="max-h-96 overflow-y-auto">
                                    <table className="min-w-full border-collapse border">
                                        <thead className="bg-gray-50 sticky top-0 z-10 ">
                                            <tr>
                                                <th colSpan={3} className="text-center px-4 py-3 text-lg font-semibold tracking-wide bg-gray-50 sticky top-0 border-b">
                                                    Partners
                                                </th>
                                                <th className="text-center px-4 py-3 text-lg font-semibold tracking-wide bg-gray-50 sticky top-0 border-b">
                                                    <div className='flex items-center gap-2 justify-end h-full'>
                                                        <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                            <Components.IconButton onClick={() => handleOpenPartnerModel()}>
                                                                <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-4 w-4' />
                                                            </Components.IconButton>
                                                        </div>
                                                    </div>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    #
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    Role
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        {
                                            opportunitiesPartner?.length > 0 ? (
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {opportunitiesPartner?.map((row, i) => (
                                                        <tr key={i} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm text-gray-800 font-bold">{i + 1}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{row.accountName || "—"}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{row.role || "—"}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                                <div className='flex items-center gap-2 justify-end h-full'>
                                                                    <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                        <Components.IconButton onClick={() => handleOpenPartnerModel(row.id)}>
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

                            <div>
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="min-w-full border-collapse border">
                                        <thead className="bg-gray-50 sticky top-0 z-10 ">
                                            <tr>
                                                <th colSpan={4} className="text-center px-4 py-3 text-lg font-semibold tracking-wide bg-gray-50 sticky top-0 border-b">
                                                    Products
                                                </th>
                                                <th className="text-center px-4 py-3 text-lg font-semibold tracking-wide bg-gray-50 sticky top-0 border-b">
                                                    <div className='flex items-center gap-2 justify-end h-full'>
                                                        <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                            <Components.IconButton onClick={() => handleOpenProductModel()}>
                                                                <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-4 w-4' />
                                                            </Components.IconButton>
                                                        </div>
                                                    </div>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    #
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    Price
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        {
                                            opportunitiesProducts?.length > 0 ? (
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {opportunitiesProducts?.map((row, i) => (
                                                        <tr key={i} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm text-gray-800 font-bold">{i + 1}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{row.name || "—"}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{row.qty || "—"}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{row.price || "—"}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                                <div className='flex items-center gap-2 justify-end h-full'>
                                                                    <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                        <Components.IconButton onClick={() => handleOpenProductModel(row.id)}>
                                                                            <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                                                        </Components.IconButton>
                                                                    </div>
                                                                    <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                        <Components.IconButton onClick={() => handleOpenDeleteProductDialog(row.id)}>
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
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions className='absolute bottom-2 right-2'>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={opportunityId ? "Update" : "Submit"} isLoading={loading} />
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
            <OpportunitiesPartnersModel open={openPartnerModel} handleClose={handleClosePartnerModel} id={selectedOppPartnerId} opportunityId={opportunityId} handleGetAllOpportunitiesPartners={handleGetAllOpportunitiesPartner} />
            <OpportunitiesProductsModel open={openProductModel} handleClose={handleCloseProductModel} id={selectedProductId} opportunityId={opportunityId} handleGetAllOpportunitiesProducts={handleGetOppProduct} />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(OpportunitiesModel)
