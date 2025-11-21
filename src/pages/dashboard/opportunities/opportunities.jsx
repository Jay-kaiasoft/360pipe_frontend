import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import Components from '../../../components/muiComponents/components';
import { deleteOpportunity, getAllOpportunitiesGroupedByStage, getOpportunityOptions, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import OpportunitiesModel from '../../../components/models/opportunities/opportunitiesModel';
import { useLocation, useNavigate } from 'react-router-dom';
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';
import SelectMultiple from '../../../components/common/select/selectMultiple';
import { opportunityStatus, stageColors } from '../../../service/common/commonService';
import { Chip, Tooltip } from '@mui/material';
import ViewOpportunitiesModel from '../../../components/models/opportunities/viewOpportunitiesModel';
import GroupedDataTable from '../../../components/common/table/groupedTable';
import Input from '../../../components/common/input/input';

const Opportunities = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [opportunities, setOpportunities] = useState([]);
    const [open, setOpen] = useState(false);
    const [openView, setOpenView] = useState(false)

    const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [opportunitiesOptions, setOpportunitiesOptions] = useState(null)
    const [selectedOppName, setSelectedOppName] = useState([])
    const [selectedOppStage, setSelectedOppStage] = useState([])
    const [selectedOppStatus, setSelectedOppStatus] = useState([])

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

    const handleSetStatus = (event) => {
        setSelectedOppStatus(event)
    }

    const handleGetOpportunities = async () => {
        try {
            let opportunityName = []
            let opportunityStages = []
            let oppStatus = []

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
            if (selectedOppStatus?.length > 0) {
                oppStatus = opportunityStatus
                    ?.map((row) => selectedOppStatus?.includes(row.id) ? row.title : undefined)
                    .filter(Boolean);
            }
            let params = {
                opportunity: opportunityName,
                salesStage: opportunityStages,
                status: oppStatus,
            };

            const searchParams = new URLSearchParams();
            // Append each array properly
            if (params.opportunity?.length) {
                params.opportunity.forEach((item) => searchParams.append("opportunity", item));
            }
            if (params.salesStage?.length) {
                params.salesStage.forEach((item) => searchParams.append("salesStage", item));
            }
            if (params.status?.length) {
                params.status.forEach((item) => searchParams.append("status", item));
            }

            const queryString = searchParams.toString();

            const opportunities = await getAllOpportunitiesGroupedByStage(queryString);
            setOpportunities(opportunities?.result || []);
            // const formattedOpportunities = opportunities?.result?.map((opportunity, index) => ({
            //     ...opportunity,
            //     rowId: index + 1
            // }));
            // setOpportunities(formattedOpportunities);
        } catch (error) {
            console.error("Error fetching opportunities:", error);
        }
    }

    const handleOpenView = (opportunityId = null) => {
        setSelectedOpportunityId(opportunityId);
        setOpenView(true);
    }

    const handleCloseView = () => {
        setSelectedOpportunityId(null);
        setOpenView(false);
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
    }, []);

    useEffect(() => {
        handleGetOpportunities()
    }, [selectedOppName, selectedOppStage, selectedOppStatus])

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
            field: 'accountName',
            headerName: 'Account',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => {
                return (
                    <span>{params.value ? params.value : '-'}</span>
                )
            }
        },
        {
            field: 'opportunity',
            headerName: 'opportunity Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 300,
        },
        {
            field: 'dealAmount',
            headerName: 'Deal Amount',
            flex: 1,
            minWidth: 120,
            align: 'right',
            headerAlign: 'left',
            editable: true,
            headerClassName: 'uppercase',
            renderCell: (params) => {
                const val = params.value;
                if (val === null || val === undefined || val === '') return '';
                const num = parseFloat(val);
                if (Number.isNaN(num)) return '';
                return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            },
            renderEditCell: (params) => <DealAmountEditCell {...params} />,
        },
        {
            field: "salesStage",
            headerName: "Sales Stage",
            flex: 1,
            minWidth: 200,
            headerClassName: 'uppercase',
            renderCell: (params) => {
                const stage = params.value;
                const bg = stageColors[stage] || "#e0e0e0";                
                return (
                    <Chip                        
                        label={stage}
                        size="small"
                        sx={{
                            backgroundColor: bg,
                            color: "#fff",
                            fontWeight: 600,
                            borderRadius: "20px",
                            px: 1.5,
                        }}
                    />
                );
            },
        },
        {
            field: 'closeDate',
            headerName: 'close Date',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 180,
            renderCell: (params) => {
                return (
                    <span>{params.value ? new Date(params.value).toLocaleDateString() : ''}</span>
                )
            }
        },
        {
            field: 'nextSteps',
            headerName: 'Next Step',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 280,
            editable: true,
            headerClassName: 'uppercase',
            renderCell: (params) => {
                return (
                    <span>
                        {(params.value !== "" && params.value !== null && params.value !== undefined)
                            ? params.value
                            : '-'}
                    </span>
                );
            },
            renderEditCell: (params) => <NextStepsEditCell {...params} />,
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            maxWidth: 170,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <Tooltip title="View" arrow>
                            <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => navigate(`/dashboard/opportunity-view/${params.row.id}`)}>
                                    <CustomIcons iconName={'fa-solid fa-eye'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        {/* <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <Tooltip title="Edit" arrow>
                                    <div className='bg-[#1072E0] h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpen(params.row.id)}>
                                            <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        /> */}
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={3}
                            component={
                                <Tooltip title="Delete" arrow>
                                    <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
                                            <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
                    </div>
                );
            },
        },
    ];

    const DealAmountEditCell = (params) => {
        const { id, field, api, value } = params;

        const inputRef = React.useRef(null);

        const formatWithCommas = (raw) => {
            if (!raw) return "";
            const [intRaw, decRaw] = raw.toString().split(".");
            const intOnly = intRaw.replace(/\D/g, "");
            const intWithCommas = intOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (decRaw !== undefined) return `${intWithCommas}.${decRaw}`;
            return intWithCommas;
        };

        const sanitizeValue = (val) => {
            if (!val) return "";

            // keep only digits and dots
            val = val.replace(/[^0-9.]/g, "");

            // allow only one dot
            const firstDotIndex = val.indexOf(".");
            if (firstDotIndex !== -1) {
                const before = val.slice(0, firstDotIndex + 1);
                const after = val.slice(firstDotIndex + 1).replace(/\./g, "");
                val = before + after;
            }

            let [intPart, decPart] = val.split(".");
            intPart = intPart || "";

            if (decPart !== undefined) {
                decPart = decPart.slice(0, 2); // max 2 decimals
            }

            return decPart !== undefined ? `${intPart}.${decPart}` : intPart;
        };

        const [inputValue, setInputValue] = React.useState(() => {
            if (!value && value !== 0) return "";
            return formatWithCommas(value);
        });

        const originalValue = React.useRef(value);

        const handleChange = (event) => {
            const rawInput = event.target.value;
            const caretPos = event.target.selectionStart ?? rawInput.length;

            // sanitize full string
            const cleanedFull = sanitizeValue(rawInput);
            const formattedFull = formatWithCommas(cleanedFull);

            // now compute where caret should land after formatting
            const rawBeforeCaret = rawInput.slice(0, caretPos);
            const cleanedBeforeCaret = sanitizeValue(rawBeforeCaret);
            const formattedBeforeCaret = formatWithCommas(cleanedBeforeCaret);
            const newCaretPos = formattedBeforeCaret.length;

            setInputValue(formattedFull);
            api.setEditCellValue({ id, field, value: cleanedFull }, event);

            // restore caret position after React re-renders
            requestAnimationFrame(() => {
                if (inputRef.current) {
                    inputRef.current.setSelectionRange(newCaretPos, newCaretPos);
                }
            });
        };

        const handleSave = () => {
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            api.setEditCellValue({ id, field, value: originalValue.current });
            api.stopCellEditMode({ id, field, ignoreModifications: true });
        };

        return (
            <div className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                />

                <Tooltip title="Save" arrow>
                    <div className={`${(inputValue === null || inputValue === "") ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 cursor-pointer"} h-5 w-5 flex justify-center items-center rounded-full text-white`}>
                        <Components.IconButton onClick={handleSave} disabled={inputValue === null || inputValue === ""}>
                            <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                        </Components.IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Cancel" arrow>
                    <div className='bg-gray-800 h-5 w-5 flex justify-center items-center rounded-full text-white'>
                        <Components.IconButton onClick={handleCancel}>
                            <CustomIcons iconName={'fa-solid fa-close'} css='cursor-pointer text-white h-3 w-3' />
                        </Components.IconButton>
                    </div>
                </Tooltip>
            </div>
        );
    };

    const NextStepsEditCell = (params) => {
        const { id, field, api, value } = params;

        const [inputValue, setInputValue] = React.useState(value ?? "");
        const originalValue = React.useRef(value ?? "");

        const handleChange = (event) => {
            const newVal = event.target.value;
            setInputValue(newVal);
            api.setEditCellValue({ id, field, value: newVal }, event);
        };

        const handleSave = () => {
            // commit current value and exit edit mode
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            // revert to original and exit without saving
            api.setEditCellValue({ id, field, value: originalValue.current });
            api.stopCellEditMode({ id, field, ignoreModifications: true });
        };

        return (
            <div className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <Input
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                    className="flex-1"
                    multiline={true}
                    rows={4}
                />

                <Tooltip title="Save" arrow>
                    <div className={`${(inputValue === null || inputValue === "") ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 cursor-pointer"} h-5 w-5 flex justify-center items-center rounded-full text-white`}>
                        <Components.IconButton onClick={handleSave} disabled={inputValue === null || inputValue === ""}>
                            <CustomIcons
                                iconName={"fa-solid fa-floppy-disk"}
                                css="cursor-pointer text-white h-3 w-3"
                            />
                        </Components.IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Cancel" arrow>
                    <div className="bg-gray-800 h-5 w-5 flex justify-center items-center rounded-full text-white">
                        <Components.IconButton onClick={handleCancel}>
                            <CustomIcons
                                iconName={"fa-solid fa-close"}
                                css="cursor-pointer text-white h-3 w-3"
                            />
                        </Components.IconButton>
                    </div>
                </Tooltip>
            </div>
        );
    };

    const processRowUpdate = async (newRow, oldRow) => {
        try {
            const cleanedAmount =
                newRow.dealAmount === '' || newRow.dealAmount == null
                    ? null
                    : parseFloat(newRow.dealAmount).toFixed(2);
            const updatedData = {
                ...newRow,
                nextSteps: newRow.nextSteps,
                dealAmount: cleanedAmount, // float with max 2 decimals
            };
            if (cleanedAmount === null || cleanedAmount === "") {
                setAlert({
                    open: true,
                    message: "Deal amount can not be empty",
                    type: "error"
                })
                return
            }
            if (newRow.nextSteps === null || newRow.nextSteps === "") {
                setAlert({
                    open: true,
                    message: "Next step can not be empty",
                    type: "error"
                })
                return
            }
            const res = await updateOpportunity(newRow.id, updatedData);
            if (res.status === 200) {
                setSyncingPushStatus(true);
                handleGetOpportunities();
                return newRow;
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to update opportunity",
                    type: "error",
                });
                return oldRow;
            }
        } catch (error) {
            console.error("Error updating opportunity:", error);
            setAlert({
                open: true,
                message: "Failed to update opportunity",
                type: "error",
            });
            return oldRow;
        }
    };

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
            <div className='w-[750px] flex justify-start items-center gap-4'>
                <div className='w-full'>
                    <SelectMultiple
                        label="Opportunity name"
                        placeholder="Select opportunity name"
                        options={opportunitiesOptions?.opportunitiesNameOptions || []}
                        value={selectedOppName}
                        onChange={handleSetName}
                        limitTags={1}
                    />
                </div>
                <div className='w-full'>
                    <SelectMultiple
                        label="Opportunity stages"
                        placeholder="Select opportunity stages"
                        options={opportunitiesOptions?.opportunitiesStagesOptions || []}
                        value={selectedOppStage}
                        onChange={handleSetStages}
                        limitTags={1}
                    />
                </div>
                <div className='w-full'>
                    <SelectMultiple
                        label="Opportunity status"
                        placeholder="Select opportunity status"
                        options={opportunityStatus || []}
                        value={selectedOppStatus}
                        onChange={handleSetStatus}
                        limitTags={1}
                    />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                {/* <DataTable columns={columns} rows={opportunities} getRowId={getRowId} height={550} showButtons={true} buttons={actionButtons} showFilters={true} filtersComponent={filterComponent} processRowUpdate={processRowUpdate} /> */}
                <GroupedDataTable
                    groups={opportunities}
                    columns={columns}
                    height={350}
                    showButtons={true}
                    buttons={actionButtons}
                    showFilters={true}
                    filtersComponent={filterComponent}
                    processRowUpdate={processRowUpdate}
                    onCellEditStop={(params, event) => {
                        if (params.reason === "enterKeyDown") {
                            event.defaultMuiPrevented = true;   // ❌ prevent save on Enter
                        }
                        if (params.reason === "cellFocusOut") {
                            event.defaultMuiPrevented = true;   // ❌ prevent save on outside click
                        }
                    }}
                />
                
            </div>
            <OpportunitiesModel open={open} handleClose={handleClose} opportunityId={selectedOpportunityId} handleGetAllOpportunities={handleGetOpportunities} />
            <ViewOpportunitiesModel open={openView} opportunityId={selectedOpportunityId} handleClose={handleCloseView} />
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