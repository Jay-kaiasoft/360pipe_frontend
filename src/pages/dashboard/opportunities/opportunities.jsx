import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import DataTable from '../../../components/common/table/table';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import Components from '../../../components/muiComponents/components';
import { deleteOpportunity, getAllOpportunities } from '../../../service/opportunities/opportunitiesService';
import OpportunitiesModel from '../../../components/models/opportunities/opportunitiesModel';
import { useLocation } from 'react-router-dom';
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';

const Opportunities = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();

    const [opportunities, setOpportunities] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleGetOpportunities = async () => {
        try {
            const opportunities = await getAllOpportunities();
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
        handleGetOpportunities();
    }, []);

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

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={opportunities} getRowId={getRowId} height={550} showButtons={true} buttons={actionButtons} />
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