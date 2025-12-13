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
import GroupedDataTable from '../../../components/common/table/groupedTable';
import OpportunitiesInfo from './opportunitiesInfo';

import { deleteOpportunity, getAllOpportunitiesGroupedByStage, getOpportunityOptions, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import { opportunityStatus, stageColors, opportunityStages } from '../../../service/common/commonService';
import { getAllAccounts } from '../../../service/account/accountService';
import Select from '../../../components/common/select/select';
import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
import { useForm } from 'react-hook-form';
import { Tabs } from '../../../components/common/tabs/tabs';

const filterTab = [
    { id: 1, label: "Summary", },
]
const Opportunities = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const canEditOpps = PermissionWrapper.hasPermission({
        functionalityName: "Opportunities",
        moduleName: "Opportunities",
        actionId: 2,
    });

    const [activeFilterTab, setActiveFilterTab] = useState(0);
    const [editingRowId, setEditingRowId] = useState(null);
    const [accounts, setAccounts] = useState([]);

    const [opportunities, setOpportunities] = useState([]);
    const [open, setOpen] = useState(false);
    const [openInfoModel, setOpenInfoModel] = useState(false);
    const [infoRowId, setInfoRowId] = useState(null);

    const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [opportunitiesOptions, setOpportunitiesOptions] = useState(null)

    // NOTE: these now hold ARRAYS OF OPTION OBJECTS from CheckBoxSelect
    const [selectedOppName, setSelectedOppName] = useState([])
    const [selectedOppStage, setSelectedOppStage] = useState([])
    const [selectedOppStatus, setSelectedOppStatus] = useState([])

    const handleSetActiveFilterTab = (id) => {
        setActiveFilterTab(id);
    }

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

    const handleOpenInfoModel = (opportunityId = null) => {
        setSelectedOpportunityId(opportunityId);
        setOpenInfoModel(true);
        setInfoRowId(opportunityId);      // ⬅️ highlight this row
    };

    const handleCloseInfoModel = () => {
        setSelectedOpportunityId(null);
        setOpenInfoModel(false);
        setInfoRowId(null);               // ⬅️ remove highlight when closing
    };


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

    const handleGetAllAccounts = async () => {
        const res = await getAllAccounts("fetchType=Options");
        if (res?.status === 200) {
            const data = res?.result?.map((acc) => ({
                title: acc.accountName,
                id: acc.id,
                salesforceAccountId: acc.salesforceAccountId
            }));
            setAccounts(data);
        }
    };

    useEffect(() => {
        handleGetAllAccounts()
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
            field: 'valid8',
            headerName: 'Valid8',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 80,
            sortable: false,
            renderCell: (params) => {
                return (
                    <span>-</span>
                )
            }
        },
        {
            field: 'accountName',
            headerName: 'Account',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            editable: canEditOpps,
            renderCell: (params) =>
                withEditTooltip(
                    "Click To Edit",
                    params,
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {params.value ? params.value : '-'}
                    </span>
                ),
            renderEditCell: (params) => <AccountEditCell {...params} />,
        },
        {
            field: 'opportunity',
            headerName: 'Opportunity Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 250,
            editable: canEditOpps,
            renderCell: (params) =>
                withEditTooltip(
                    "Click To Edit",
                    params,
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{params.value || '-'}</span>
                ),
            renderEditCell: (params) => <OpportunityNameEditCell {...params} />,
        },
        {
            field: 'dealAmount',
            headerName: 'Deal Amount',
            flex: 1,
            maxWidth: 150,
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
            maxWidth: 200,
            headerClassName: 'uppercase',
            editable: canEditOpps,
            renderCell: (params) => {
                const stage = params.value;
                const bg = stageColors[stage] || "#e0e0e0";
                return withEditTooltip(
                    "Click To Edit",
                    params,
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
            renderEditCell: (params) => <SalesStageEditCell {...params} />,
        },
        {
            field: 'closeDate',
            headerName: 'Close Date',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            align: 'center',
            editable: canEditOpps,
            renderCell: (params) =>
                withEditTooltip(
                    "Click To Edit",
                    params,
                    <span>
                        {params.value ? new Date(params.value).toLocaleDateString() : ''}
                    </span>
                ),
            renderEditCell: (params) => <CloseDateEditCell {...params} />,
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
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {display}
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
            maxWidth: 140,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <Tooltip title="Info" arrow>
                            <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpenInfoModel(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-info'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                            <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => navigate(`/dashboard/opportunity-view/${params.row.id}`)}>
                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
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

    const CloseDateEditCell = (params) => {
        const { id, field, api, value } = params;

        const originalValue = React.useRef(value ?? null);

        // Local RHF form just for this cell
        const { control, setValue: rhfSetValue, watch } = useForm({
            defaultValues: {
                closeDate: value ?? null,
            },
        });

        const currentDate = watch("closeDate");

        // This will be passed into DatePickerComponent
        const handleSetValue = (name, newValue) => {
            // update RHF internal value so the picker shows correctly
            rhfSetValue(name, newValue);

            // update the DataGrid cell value
            api.setEditCellValue(
                { id, field, value: newValue },
                null
            );
        };

        const handleSave = () => {
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            rhfSetValue("closeDate", originalValue.current);
            api.setEditCellValue({
                id,
                field,
                value: originalValue.current,
            });
            api.stopCellEditMode({
                id,
                field,
                ignoreModifications: true,
            });
        };

        return (
            <div className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <div className="flex-1 w-60">
                    <DatePickerComponent
                        name="closeDate"
                        // label="Close Date"
                        control={control}
                        setValue={handleSetValue}
                        minDate={new Date()}
                        maxDate={null}
                        required={true}
                    />
                </div>

                <Tooltip title="Save" arrow>
                    <div
                        className={`${!currentDate ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 cursor-pointer"} h-5 w-5 flex justify-center items-center rounded-full text-white`}
                    >
                        <Components.IconButton
                            disabled={!currentDate}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (!currentDate) return;
                                handleSave();
                            }}
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
                                event.stopPropagation();
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

    const SalesStageEditCell = (params) => {
        const { id, field, api, value } = params;

        const stageOptions = opportunityStages || [];

        const originalValue = React.useRef(value ?? "");

        const [selectedId, setSelectedId] = React.useState(() => {
            const found = stageOptions.find((opt) => opt.title === value);
            return found ? found.id : null;
        });

        const handleChange = (event, newValue) => {
            const newStage = newValue?.title ?? "";
            const newId = newValue?.id ?? null;

            setSelectedId(newId);

            api.setEditCellValue(
                { id, field, value: newStage },
                event
            );
        };

        const handleSave = () => {
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            api.setEditCellValue({
                id,
                field,
                value: originalValue.current,
            });
            api.stopCellEditMode({
                id,
                field,
                ignoreModifications: true,
            });
        };

        return (
            <div className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <div className="flex-1 w-60">
                    <Select
                        placeholder="Select stage"
                        options={stageOptions}
                        value={selectedId}
                        onChange={handleChange}
                    />
                </div>

                <Tooltip title="Save" arrow>
                    <div className="bg-green-600 cursor-pointer h-5 w-5 flex justify-center items-center rounded-full text-white">
                        <Components.IconButton
                            onClick={(event) => {
                                event.stopPropagation();
                                handleSave();
                            }}
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
                                event.stopPropagation();
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

    const AccountEditCell = (params) => {
        const { id, api, row } = params;

        const originalValue = React.useRef({
            accountId: row.accountId ?? null,
            accountName: row.accountName ?? "",
        });

        const [selectedId, setSelectedId] = React.useState(() => {
            const found = accounts.find(
                (opt) => opt.id === row.accountId || opt.title === row.accountName
            );
            return found ? found.id : null;
        });

        const handleChange = (event, newValue) => {
            const newId = newValue?.id ?? null;
            const newName = newValue?.title ?? "";

            setSelectedId(newId);

            // ✅ This is the only thing the grid *must* know:
            api.setEditCellValue(
                { id, field: "accountName", value: newName },
                event
            );

            // optional – visually keep row in sync, but we won't depend on it
            api.setEditCellValue(
                { id, field: "accountId", value: newId },
                event
            );
        };

        const handleSave = () => {
            api.stopCellEditMode({ id, field: "accountName" });
        };

        const handleCancel = () => {
            api.setEditCellValue({
                id,
                field: "accountName",
                value: originalValue.current.accountName,
            });
            api.setEditCellValue({
                id,
                field: "accountId",
                value: originalValue.current.accountId,
            });
            api.stopCellEditMode({
                id,
                field: "accountName",
                ignoreModifications: true,
            });
        };

        return (
            <div className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <div className="flex-1 w-60">
                    <Select
                        placeholder="Select account"
                        options={accounts}
                        value={selectedId}
                        onChange={handleChange}
                    />
                </div>

                <Tooltip title="Save" arrow>
                    <div className="bg-green-600 cursor-pointer h-5 w-5 flex justify-center items-center rounded-full text-white">
                        <Components.IconButton
                            onClick={(event) => {
                                event.stopPropagation();
                                handleSave();
                            }}
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
                                event.stopPropagation();
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

    // const AccountEditCell = (params) => {
    //     const { id, api, row } = params;

    //     const originalValue = React.useRef({
    //         accountId: row.accountId ?? null,
    //         accountName: row.accountName ?? "",
    //     });

    //     const [selectedId, setSelectedId] = React.useState(() => {
    //         const found = accounts.find(
    //             (opt) => opt.id === row.accountId || opt.title === row.accountName
    //         );
    //         return found ? found.id : null;
    //     });

    //     const handleChange = (event, newValue) => {
    //         const newId = newValue?.id ?? null;
    //         const newName = newValue?.title ?? "";

    //         setSelectedId(newId);

    //         // Update both accountId and accountName in the grid row
    //         api.setEditCellValue(
    //             { id, field: "accountId", value: newId },
    //             event
    //         );
    //         api.setEditCellValue(
    //             { id, field: "accountName", value: newName },
    //             event
    //         );
    //     };

    //     const handleSave = () => {
    //         api.stopCellEditMode({ id, field: "accountName" });
    //     };

    //     const handleCancel = () => {
    //         api.setEditCellValue({
    //             id,
    //             field: "accountId",
    //             value: originalValue.current.accountId,
    //         });
    //         api.setEditCellValue({
    //             id,
    //             field: "accountName",
    //             value: originalValue.current.accountName,
    //         });
    //         api.stopCellEditMode({
    //             id,
    //             field: "accountName",
    //             ignoreModifications: true,
    //         });
    //     };

    //     return (
    //         <div className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
    //             <div className="flex-1 w-60">
    //                 <Select
    //                     // label="Account"
    //                     placeholder="Select account"
    //                     options={accounts}
    //                     value={selectedId}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             <Tooltip title="Save" arrow>
    //                 <div
    //                     className="bg-green-600 cursor-pointer h-5 w-5 flex justify-center items-center rounded-full text-white"
    //                 >
    //                     <Components.IconButton
    //                         onClick={(event) => {
    //                             event.stopPropagation();
    //                             handleSave();
    //                         }}
    //                     >
    //                         <CustomIcons
    //                             iconName={'fa-solid fa-floppy-disk'}
    //                             css='cursor-pointer text-white h-3 w-3'
    //                         />
    //                     </Components.IconButton>
    //                 </div>
    //             </Tooltip>

    //             <Tooltip title="Cancel" arrow>
    //                 <div className='bg-gray-800 h-5 w-5 flex justify-center items-center rounded-full text-white'>
    //                     <Components.IconButton
    //                         onClick={(event) => {
    //                             event.stopPropagation();
    //                             handleCancel();
    //                         }}
    //                     >
    //                         <CustomIcons
    //                             iconName={'fa-solid fa-close'}
    //                             css='cursor-pointer text-white h-3 w-3'
    //                         />
    //                     </Components.IconButton>
    //                 </div>
    //             </Tooltip>
    //         </div>
    //     );
    // };

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
            <div className="deal-amount-edit-container flex justify-start items-center gap-3 px-3">
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

            // 🔹 Build base payload
            const updatedData = {
                ...newRow,
                nextSteps: newRow.nextSteps,
                dealAmount: cleanedAmount,
            };

            // 🔹 If account name changed, map it to accountId
            if (newRow.accountName && newRow.accountName !== oldRow.accountName) {
                const selectedAccount = accounts.find(
                    (acc) => acc.title === newRow.accountName
                );

                if (selectedAccount) {
                    updatedData.accountId = selectedAccount.id;
                }
            }

            // ✅ (optional) also ensure the row the grid keeps uses the new id
            const rowToReturn = {
                ...newRow,
                dealAmount: cleanedAmount,
                accountId: updatedData.accountId ?? newRow.accountId,
            };

            if (cleanedAmount === null || cleanedAmount === "") {
                setAlert({
                    open: true,
                    message: "Deal amount can not be empty",
                    type: "error"
                });
                return oldRow;
            }

            if (newRow.nextSteps === null || newRow.nextSteps === "") {
                setAlert({
                    open: true,
                    message: "Next step can not be empty",
                    type: "error"
                });
                return oldRow;
            }

            // 👇 accountId is now included in updatedData
            const res = await updateOpportunity(newRow.id, updatedData);
            if (res.status === 200) {
                setSyncingPushStatus(true);
                handleGetOpportunities();
                return rowToReturn;
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
                message: "Something went wrong while updating opportunity",
                type: "error",
            });
            return oldRow;
        }
    };

    // const processRowUpdate = async (newRow, oldRow) => {
    //     try {
    //         const cleanedAmount =
    //             newRow.dealAmount === '' || newRow.dealAmount == null
    //                 ? null
    //                 : parseFloat(newRow.dealAmount).toFixed(2);
    //         const updatedData = {
    //             ...newRow,
    //             nextSteps: newRow.nextSteps,
    //             dealAmount: cleanedAmount, // float with max 2 decimals
    //         };
    //         if (cleanedAmount === null || cleanedAmount === "") {
    //             setAlert({
    //                 open: true,
    //                 message: "Deal amount can not be empty",
    //                 type: "error"
    //             })
    //             return
    //         }
    //         if (newRow.nextSteps === null || newRow.nextSteps === "") {
    //             setAlert({
    //                 open: true,
    //                 message: "Next step can not be empty",
    //                 type: "error"
    //             })
    //             return
    //         }
    //         const res = await updateOpportunity(newRow.id, updatedData);
    //         if (res.status === 200) {
    //             setSyncingPushStatus(true);
    //             handleGetOpportunities();
    //             return newRow;
    //         } else {
    //             setAlert({
    //                 open: true,
    //                 message: res?.message || "Failed to update opportunity",
    //                 type: "error",
    //             });
    //             return oldRow;
    //         }
    //     } catch (error) {
    //         setAlert({
    //             open: true,
    //             message: "Failed to update opportunity",
    //             type: "error",
    //         });
    //         return oldRow;
    //     }
    // };

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

    const getRowClassNameForGrid = (params) => {
        // params.row.id is your opportunityId (from API)
        if (params?.row?.id === infoRowId) {
            return 'info-selected-row';
        }
        return '';
    };

    return (
        <>
            <div className="mb-2">
                <Tabs tabsData={filterTab} selectedTab={activeFilterTab} handleChange={handleSetActiveFilterTab} />
            </div>

            <div className='border rounded-lg bg-white w-full lg:w-full'>
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
                    getRowClassName={getRowClassNameForGrid}
                />
            </div>
            
            <OpportunitiesModel open={open} handleClose={handleClose} opportunityId={selectedOpportunityId} handleGetAllOpportunities={handleGetOpportunities} />
            {openInfoModel && (
                <OpportunitiesInfo
                    isOpen={openInfoModel}
                    handleClose={handleCloseInfoModel}
                    opportunityId={selectedOpportunityId}
                />
            )}

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
