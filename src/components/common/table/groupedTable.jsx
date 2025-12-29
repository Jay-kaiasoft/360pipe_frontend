import React from 'react';
import PropTypes from 'prop-types';
import { Chip, useTheme } from '@mui/material';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import Input from '../input/input';
import CustomIcons from '../icons/CustomIcons';
import { stageColors, statusColors } from '../../../service/common/commonService';

// const paginationModel = { page: 0, pageSize: 10 };

const AscIcon = () => (
    <CustomIcons
        iconName="fa-solid fa-sort-up"
        css="text-black text-sm ml-2"
    />
);

const DescIcon = () => (
    <CustomIcons
        iconName="fa-solid fa-sort-down"
        css="text-black text-sm ml-2"
    />
);

const UnsortedIcon = () => (
    <CustomIcons
        iconName="fa-solid fa-sort"
        css="text-black text-sm ml-2"
    />
);

export default function GroupedDataTable({
    groups,
    columns,
    height,
    showSearch = false,
    showButtons = false,
    showFilters = false,
    filtersComponent = null,
    buttons,
    getRowClassName,
    checkboxSelection = false,
    setRowSelectionModel,
    rowSelectionModel,
    processRowUpdate,
    onCellEditStop,
    hideFooter = true,
    editingRowId = null,     // NEW: row id that is currently being edited
}) {
    const theme = useTheme();
    return (
        <>
            {(showSearch || showButtons || showFilters) && (
                <div className="border border-1 py-4 px-5 rounded-lg rounded-b-none flex justify-between items-center gap-4">
                    <div className="grow">
                        {showSearch && (
                            <div className="w-full md:w-60 mb-3 md:mb-0 md:max-w-xs">
                                <Input
                                    name="search"
                                    label="Search"
                                    endIcon={
                                        <CustomIcons
                                            iconName={'fa-solid fa-magnifying-glass'}
                                            css="mr-3"
                                        />
                                    }
                                />
                            </div>
                        )}

                        <div>
                            {showFilters && filtersComponent && filtersComponent()}
                        </div>
                    </div>

                    <div>
                        {showButtons && buttons && buttons()}
                    </div>
                </div>
            )}

            <div className="border border-t-0 rounded-b-lg bg-white">
                {(!groups || groups.length === 0) && (
                    <div className="w-full h-full text-center py-10 text-gray-500 text-sm italic">
                        No data available.
                    </div>
                )}
                {groups?.map((group, groupIndex) => {
                    const statusname = group?.statusname || 'No Stage';
                    const rowsWithIndex = (group?.data || []).map((row, idx) => ({
                        ...row,
                        rowId: idx + 1,
                    }));
                    const color = statusColors[group?.statusname] || "#e0e0e0";

                    // ✅ Only expand the grid for the group that contains the editingRowId                  
                    return (
                        <Accordion
                            key={statusname + groupIndex}
                            defaultExpanded
                            disableGutters
                        >
                            <AccordionSummary
                                expandIcon={
                                    <CustomIcons
                                        iconName="fa-solid fa-chevron-down"
                                        css="h-4 w-4"
                                    />
                                }
                                sx={{
                                    backgroundColor: "#ECECEC"
                                }}
                            >
                                <div className="flex w-full items-center justify-center">
                                    <div className='flex items-center justify-start gap-5'>
                                        <Chip
                                            label={statusname}
                                            size="small"
                                            sx={{
                                                backgroundColor: color,
                                                color: "#fff",
                                                fontWeight: 600,
                                                borderRadius: "20px",
                                                px: 1.5,
                                            }}
                                        />
                                        <h1 className="font-bold mr-5">
                                            ${parseFloat(group?.total)?.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                                            )}
                                        </h1>
                                    </div>
                                </div>
                            </AccordionSummary>

                            <AccordionDetails>
                                <div
                                    style={{
                                        width: '100%',
                                    }}
                                >
                                    <DataGrid
                                        rows={rowsWithIndex}
                                        columns={columns}
                                        // initialState={{ pagination: { paginationModel } }}
                                        // pageSizeOptions={[10, 25, 50]}
                                        disableRowSelectionOnClick
                                        hideFooterSelectedRowCount
                                        hideFooter={hideFooter}
                                        getRowClassName={getRowClassName}
                                        getRowId={(row) => row.rowId}
                                        checkboxSelection={checkboxSelection}
                                        onRowSelectionModelChange={(newRowSelectionModel) => {
                                            if (setRowSelectionModel) {
                                                setRowSelectionModel(newRowSelectionModel);
                                            }
                                        }}
                                        rowSelectionModel={rowSelectionModel}
                                        processRowUpdate={processRowUpdate}
                                        slots={{
                                            columnSortedAscendingIcon: AscIcon,
                                            columnSortedDescendingIcon: DescIcon,
                                            columnUnsortedIcon: UnsortedIcon,
                                        }}
                                        disableColumnMenu
                                        onCellClick={(params, event) => {
                                            // only for editable columns
                                            if (!params.colDef?.editable) return;

                                            const api = params.api;
                                            const cellMode = api.getCellMode(params.id, params.field);

                                            // ✅ only switch to edit if currently in view mode
                                            if (cellMode === 'view') {
                                                if (api.startCellEditMode) {
                                                    api.startCellEditMode({ id: params.id, field: params.field });
                                                } else if (api.setCellMode) {
                                                    api.setCellMode(params.id, params.field, 'edit');
                                                }
                                            }
                                        }}

                                        // 🔒 Stop default double-click behaviour
                                        onCellDoubleClick={(params, event) => {
                                            if (event) {
                                                event.defaultMuiPrevented = true;
                                            }
                                        }}
                                        onCellEditStop={onCellEditStop}
                                        slotProps={{
                                            toolbar: {
                                                showQuickFilter: true,
                                                quickFilterProps: { debounceMs: 500 },
                                            },
                                        }}
                                        sx={{
                                            // 🔑 Only this group's grid height grows when its row is in edit
                                            // height: editingRowId ? 200 : height,
                                            color: theme.palette.text.primary,
                                            overflow: 'auto',
                                            '& .MuiDataGrid-editInputCell': {
                                                boxShadow: 5,
                                            },
                                            '& .MuiDataGrid-columnHeaders': {
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 2,
                                                backgroundColor: theme.palette.background.paper,
                                            },
                                            '& .MuiDataGrid-footerContainer': {
                                                position: 'sticky',
                                                bottom: 0,
                                                zIndex: 2,
                                                backgroundColor: theme.palette.background.paper,
                                            },
                                            '& .MuiDataGrid-container--top [role="row"], .MuiDataGrid-container--bottom [role="row"]':
                                            {
                                                backgroundColor: theme.palette.background.paper,
                                            },
                                            '& .MuiDataGrid-row:hover': {
                                                backgroundColor: theme.palette.background.paper,
                                            },
                                            '& .MuiDataGrid-overlay': {
                                                backgroundColor: theme.palette.background.paper,
                                            },

                                            '& .MuiCheckbox-root': {
                                                color: theme.palette.secondary.main,
                                            },
                                            '& .MuiCheckbox-root.Mui-checked': {
                                                color: `${theme.palette.secondary.main} !important`,
                                            },

                                            '& .MuiDataGrid-row.Mui-selected': {
                                                backgroundColor:
                                                    'rgba(4,120,220,0.08) !important',
                                            },
                                            '& .MuiDataGrid-row.Mui-selected:hover': {
                                                backgroundColor:
                                                    'rgba(4,120,220,0.12) !important',
                                            },
                                            '& .MuiDataGrid-toolbarContainer': {
                                                p: 1.5,
                                                backgroundColor: '#f7f9fb',
                                                borderBottom: '1px solid #e0e0e0',
                                            },
                                            // ⬇️ add this block
                                            '& .info-selected-row': {
                                                backgroundColor: 'rgba(4,120,220,0.12) !important',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(4,120,220,0.18) !important',
                                                },
                                                borderLeft: '3px solid #0478DC',
                                            },
                                        }}
                                    />
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </div>
        </>
    );
}

GroupedDataTable.propTypes = {
    groups: PropTypes.arrayOf(
        PropTypes.shape({
            stagename: PropTypes.string,
            data: PropTypes.array,
        })
    ).isRequired,
    columns: PropTypes.array.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showSearch: PropTypes.bool,
    showButtons: PropTypes.bool,
    showFilters: PropTypes.bool,
    filtersComponent: PropTypes.func,
    buttons: PropTypes.func,
    getRowClassName: PropTypes.func,
    checkboxSelection: PropTypes.bool,
    setRowSelectionModel: PropTypes.func,
    rowSelectionModel: PropTypes.array,
    processRowUpdate: PropTypes.func,
    isEditing: PropTypes.bool,
    editingRowId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
