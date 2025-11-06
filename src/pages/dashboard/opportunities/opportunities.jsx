import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import DataTable from '../../../components/common/table/table';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import Components from '../../../components/muiComponents/components';
import { deleteOpportunity, getAllOpportunities, getOpportunityOptions } from '../../../service/opportunities/opportunitiesService';
import OpportunitiesModel from '../../../components/models/opportunities/opportunitiesModel';
import { useLocation } from 'react-router-dom';
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';
import SelectMultiple from '../../../components/common/select/selectMultiple';

const Opportunities = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();

    const [opportunities, setOpportunities] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [opportunitiesOptions, setOpportunitiesOptions] = useState(null)
    const [selectedOppName, setSelectedOppName] = useState([])
    const [selectedOppStage, setSelectedOppStage] = useState([])

    const handleGetOpportunityOptions = async () => {
        const res = await getOpportunityOptions()
        setOpportunitiesOptions(res?.result[0])
    }

    const handleSetName = (event) => {
        setSelectedOppName(event)
    }

    const handleSetStages = (event) => {
        setSelectedOppStage(event)
    }

    const handleGetOpportunities = async () => {
        try {
            let opportunityName = []
            let opportunityStages = []

            if (selectedOppName?.length > 0) {
                opportunityName = opportunitiesOptions?.opportunitiesNameOptions
                    ?.map((row) => selectedOppName?.includes(row.id) ? row.title : undefined)
                    .filter(Boolean);
            }
            if (selectedOppStage?.length > 0) {
                opportunityStages = opportunitiesOptions?.opportunitiesStagesOptions
                    ?.map((row) => selectedOppStage?.includes(row.id) ? row.title : undefined)
                    .filter(Boolean);
            }
            let params = {
                opportunity: opportunityName,   // can be ['Opp 1', 'Opp 2']
                salesStage: opportunityStages,  // can be ['Closed', 'Negotiation']
            };

            const searchParams = new URLSearchParams();

            // Append each array properly
            if (params.opportunity?.length) {
                params.opportunity.forEach((item) => searchParams.append("opportunity", item));
            }
            if (params.salesStage?.length) {
                params.salesStage.forEach((item) => searchParams.append("salesStage", item));
            }

            const queryString = searchParams.toString();

            const opportunities = await getAllOpportunities(queryString);
            const formattedOpportunities = opportunities?.result?.map((opportunity, index) => ({
                ...opportunity,
                rowId: index + 1
            }));
            setOpportunities(formattedOpportunities);
        } catch (error) {
            console.error("Error fetching opportunities:", error);
        }
    }

    const handleOpen = (opportunityId = null) => {
        setSelectedOpportunityId(opportunityId);
        setOpen(true);
    }

    const handleClose = () => {
        setSelectedOpportunityId(null);
        setOpen(false);
    }

    const handleOpenDeleteDialog = (opportunityId) => {
        setSelectedOpportunityId(opportunityId);
        setDialog({ open: true, title: 'Delete Opportunity', message: 'Are you sure! Do you want to delete this opportunity?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedOpportunityId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteOpportunity = async () => {
        const res = await deleteOpportunity(selectedOpportunityId);
        if (res.status === 200) {
            setSyncingPushStatus(true);
            setAlert({
                open: true,
                message: "Opportunity deleted successfully",
                type: "success"
            });
            handleGetOpportunities();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete opportunity",
                type: "error"
            });
        }
    }

    useEffect(() => {
        handleGetOpportunityOptions()
        // handleGetOpportunities();
    }, []);

    useEffect(() => {
        handleGetOpportunities()
    }, [selectedOppName, selectedOppStage])

    useEffect(() => {
        if (syncingPullStatus && location.pathname === '/dashboard/opportunities') {
            handleGetOpportunities();
        }
    }, [syncingPullStatus]);

    const columns = [
        {
            field: 'rowId',
            headerName: '#',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 50,
            sortable: false,
        },
        {
            field: 'opportunity',
            headerName: 'opportunity Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 400,
            sortable: false,
        },
        {
            field: 'salesStage',
            headerName: 'sales Stage',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'dealAmount',
            headerName: 'deal Amount',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => {
                return (
                    <span>{params.value ? `$${params.value.toLocaleString()}` : ''}</span>
                )
            }
        },
        {
            field: 'closeDate',
            headerName: 'close Date',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            renderCell: (params) => {
                return (
                    <span>{params.value ? new Date(params.value).toLocaleDateString() : ''}</span>
                )
            }
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <div className='bg-[#1072E0] h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpen(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                    </div>
                );
            },
        },
    ];

    const getRowId = (row) => {
        return row.rowId;
    }

    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Opportunities"
                moduleName="Opportunities"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add Opportunity'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    const filterComponent = () => {
        return (
            <div className='w-[550px] flex justify-start items-center gap-4'>
                <div className='w-full'>
                    <SelectMultiple
                        label="Opportunity name"
                        placeholder="Select opportunity name"
                        options={opportunitiesOptions?.opportunitiesNameOptions || []}
                        value={selectedOppName}
                        onChange={handleSetName}
                    />
                </div>
                <div className='w-full'>
                    <SelectMultiple
                        label="Opportunity stages"
                        placeholder="Select opportunity stages"
                        options={opportunitiesOptions?.opportunitiesStagesOptions || []}
                        value={selectedOppStage}
                        onChange={handleSetStages}
                    />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={opportunities} getRowId={getRowId} height={550} showButtons={true} buttons={actionButtons} showFilters={true} filtersComponent={filterComponent} />
            </div>
            <OpportunitiesModel open={open} handleClose={handleClose} opportunityId={selectedOpportunityId} handleGetAllOpportunities={handleGetOpportunities} />
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteOpportunity()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </>
    )
}

const mapStateToProps = (state) => ({
    syncingPullStatus: state.common.syncingPullStatus,
});

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(Opportunities)