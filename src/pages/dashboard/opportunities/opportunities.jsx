import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import { Chip, Tooltip } from '@mui/material';
import Input from '../../../components/common/input/input';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import Components from '../../../components/muiComponents/components';
import OpportunitiesModel from '../../../components/models/opportunities/opportunitiesModel';
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';
import CheckBoxSelect from '../../../components/common/select/checkBoxSelect';

import { deleteOpportunity, getAllOpportunitiesGroupedByStage, getOpportunityOptions, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import { opportunityStatus, stageColors } from '../../../service/common/commonService';
import GroupedDataTable from '../../../components/common/table/groupedTable';

const Opportunities = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const canEditOpps = PermissionWrapper.hasPermission({
        functionalityName: "Opportunities",
        moduleName: "Opportunities",
        actionId: 2,
    });

    // ⬇️ was isEditing (boolean), now we track which row is editing
    const [editingRowId, setEditingRowId] = useState(null);

    const [opportunities, setOpportunities] = useState([]);
    const [open, setOpen] = useState(false);

    const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [opportunitiesOptions, setOpportunitiesOptions] = useState(null)

    // NOTE: these now hold ARRAYS OF OPTION OBJECTS from CheckBoxSelect
    const [selectedOppName, setSelectedOppName] = useState([])
    const [selectedOppStage, setSelectedOppStage] = useState([])
    const [selectedOppStatus, setSelectedOppStatus] = useState([])

    const handleGetOpportunityOptions = async () => {
        const res = await getOpportunityOptions()
        setOpportunitiesOptions(res?.result[0])
    }

    // Updated handlers to match CheckBoxSelect onChange(event, newValue)
    const handleSetName = (event, newValue) => {
        setSelectedOppName(newValue || []);
    }

    const handleSetStages = (event, newValue) => {
        setSelectedOppStage(newValue || []);
    }

    const handleSetStatus = (event, newValue) => {
        setSelectedOppStatus(newValue || []);
    }

    const handleGetOpportunities = async () => {
        try {
            let opportunityName = []
            let opportunityStages = []
            let oppStatus = []

            // Now selectedOppName/Stage/Status are arrays of {id, title}
            if (selectedOppName?.length > 0) {
                opportunityName = selectedOppName
                    .map((opt) => opt?.title)
                    .filter(Boolean);
            }
            if (selectedOppStage?.length > 0) {
                opportunityStages = selectedOppStage
                    .map((opt) => opt?.title)
                    .filter(Boolean);
            }
            if (selectedOppStatus?.length > 0) {
                oppStatus = selectedOppStatus
                    .map((opt) => opt?.title)
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

    const withEditTooltip = (text, params, children) => {
        if (!params.colDef?.editable) return children;

        return (
            <Tooltip title={text} arrow>
                <span className="cursor-pointer w-full block">
                    {children}
                </span>
            </Tooltip>
        );
    };

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
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <span>{params.value ? params.value : '-'}</span>
                )
            }
        },
        {
            field: 'opportunity',
            headerName: 'Opportunity Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 250,
            editable: canEditOpps,
            renderCell: (params) =>
                withEditTooltip(
                    "Click To Edit",
                    params,
                    <span>{params.value || '-'}</span>
                ),
            renderEditCell: (params) => <OpportunityNameEditCell {...params} />,
        },
        {
            field: 'dealAmount',
            headerName: 'Deal Amount',
            flex: 1,
            minWidth: 120,
            align: 'right',
            headerAlign: 'left',
            editable: canEditOpps,
            headerClassName: 'uppercase',
            renderCell: (params) => {
                const val = params.value;
                if (val === null || val === undefined || val === '') {
                    return withEditTooltip(`$${params.row.listPrice?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}-${params.row.discountPercentage}(%) = $${params.row.dealAmount?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`, params, <span>-</span>);
                }
                const num = parseFloat(val);
                if (Number.isNaN(num)) {
                    return withEditTooltip(`$${params.row.listPrice?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}-${params.row.discountPercentage}(%) = $${params.row.dealAmount?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`, params, <span>-</span>);
                }
                const formatted = `$${num.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`;
                return withEditTooltip(`$${params.row.listPrice?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}-${params.row.discountPercentage}(%) = $${params.row.dealAmount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`, params, <span>{formatted}</span>);
            },
            renderEditCell: (params) => <DealAmountEditCell {...params} />,
        },

        {
            field: "salesStage",
            headerName: "Sales Stage",
            flex: 1,
            minWidth: 100,
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
            maxWidth: 150,
            align: 'center',
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
            minWidth: 300,
            editable: canEditOpps,
            renderCell: (params) => {
                const display =
                    params.value !== "" && params.value !== null && params.value !== undefined
                        ? params.value
                        : "-";

                return withEditTooltip(
                    "Click To Edit",
                    params,
                    <span>{display}</span>
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
            maxWidth: 120,
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

    const OpportunityNameEditCell = (params) => {
        const { id, field, api, value } = params;

        const [inputValue, setInputValue] = React.useState(value ?? '');
        const originalValue = React.useRef(value ?? '');

        const handleChange = (event) => {
            const newVal = event.target.value;
            setInputValue(newVal);
            api.setEditCellValue({ id, field, value: newVal }, event);
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
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                    className="flex-1"
                />

                <Tooltip title="Save" arrow>
                    <div
                        className={`${(inputValue === null || inputValue === "") ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 cursor-pointer"} h-5 w-5 flex justify-center items-center rounded-full text-white`}
                    >
                        <Components.IconButton
                            onClick={(event) => {
                                event.stopPropagation();   // 🔒 don't bubble to DataGrid onCellClick
                                handleSave();
                            }}
                            disabled={inputValue === null || inputValue === ""}
                        >
                            <CustomIcons
                                iconName={'fa-solid fa-floppy-disk'}
                                css='cursor-pointer text-white h-3 w-3'
                            />
                        </Components.IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Cancel" arrow>
                    <div className='bg-gray-800 h-5 w-5 flex justify-center items-center rounded-full text-white'>
                        <Components.IconButton
                            onClick={(event) => {
                                event.stopPropagation();   // 🔒 same here
                                handleCancel();
                            }}
                        >
                            <CustomIcons
                                iconName={'fa-solid fa-close'}
                                css='cursor-pointer text-white h-3 w-3'
                            />
                        </Components.IconButton>
                    </div>
                </Tooltip>
            </div>
        );
    };

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
                    <div
                        className={`${(inputValue === null || inputValue === "") ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 cursor-pointer"} h-5 w-5 flex justify-center items-center rounded-full text-white`}
                    >
                        <Components.IconButton
                            onClick={(event) => {
                                event.stopPropagation();   // 🔒 don't bubble to DataGrid onCellClick
                                handleSave();
                            }}
                            disabled={inputValue === null || inputValue === ""}
                        >
                            <CustomIcons
                                iconName={'fa-solid fa-floppy-disk'}
                                css='cursor-pointer text-white h-3 w-3'
                            />
                        </Components.IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Cancel" arrow>
                    <div className='bg-gray-800 h-5 w-5 flex justify-center items-center rounded-full text-white'>
                        <Components.IconButton
                            onClick={(event) => {
                                event.stopPropagation();   // 🔒 same here
                                handleCancel();
                            }}
                        >
                            <CustomIcons
                                iconName={'fa-solid fa-close'}
                                css='cursor-pointer text-white h-3 w-3'
                            />
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

        // ✅ when this edit cell mounts, mark this row as editing for height change
        setEditingRowId(id ? id : null);

        const handleChange = (event) => {
            const newVal = event.target.value;
            setInputValue(newVal);
            api.setEditCellValue({ id, field, value: newVal }, event);
        };

        const handleSave = () => {
            // commit current value and exit edit mode
            setEditingRowId(null);
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            // revert to original and exit without saving
            setEditingRowId(null);
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
                    <div
                        className={`${(inputValue === null || inputValue === "") ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 cursor-pointer"} h-5 w-5 flex justify-center items-center rounded-full text-white`}
                    >
                        <Components.IconButton
                            onClick={(event) => {
                                event.stopPropagation();   // 🔒 don't bubble to DataGrid onCellClick
                                handleSave();
                            }}
                            disabled={inputValue === null || inputValue === ""}
                        >
                            <CustomIcons
                                iconName={'fa-solid fa-floppy-disk'}
                                css='cursor-pointer text-white h-3 w-3'
                            />
                        </Components.IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Cancel" arrow>
                    <div className='bg-gray-800 h-5 w-5 flex justify-center items-center rounded-full text-white'>
                        <Components.IconButton
                            onClick={(event) => {
                                event.stopPropagation();   // 🔒 same here
                                handleCancel();
                            }}
                        >
                            <CustomIcons
                                iconName={'fa-solid fa-close'}
                                css='cursor-pointer text-white h-3 w-3'
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
                    <CheckBoxSelect
                        label="Opportunity Name"
                        placeholder="Select opportunity name"
                        options={opportunitiesOptions?.opportunitiesNameOptions || []}
                        value={selectedOppName}
                        onChange={handleSetName}
                    />
                </div>
                <div className='w-full'>
                    <CheckBoxSelect
                        label="Sales Stages"
                        placeholder="Select sales stages"
                        options={opportunitiesOptions?.opportunitiesStagesOptions || []}
                        value={selectedOppStage}
                        onChange={handleSetStages}
                    />
                </div>
                <div className='w-full'>
                    <CheckBoxSelect
                        label="Deal Status"
                        placeholder="Select deal status"
                        options={opportunityStatus || []}
                        value={selectedOppStatus}
                        onChange={handleSetStatus}
                    />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <GroupedDataTable
                    groups={opportunities}
                    columns={columns}
                    // height={350}
                    showButtons={true}
                    buttons={actionButtons}
                    showFilters={true}
                    filtersComponent={filterComponent}
                    processRowUpdate={processRowUpdate}
                    onCellEditStop={(params, event) => {
                        if (params.reason === "enterKeyDown") {
                            event.defaultMuiPrevented = true;
                        }
                        if (params.reason === "cellFocusOut") {
                            event.defaultMuiPrevented = true;
                        }
                    }}
                    // ⬇️ NEW: only the grid that contains this row id will grow in height
                    editingRowId={editingRowId}
                />

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
