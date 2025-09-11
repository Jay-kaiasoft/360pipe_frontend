import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Input from '../input/input';
import { useTheme } from '@mui/material';
import CustomIcons from '../icons/CustomIcons';

const paginationModel = { page: 0, pageSize: 10 };

export default function DataTable({ checkboxSelection = false, showSearch = false, showButtons = false, rows, columns, getRowId, height, buttons }) {
    const theme = useTheme();
    return (
        <>
            {
                (showSearch || showButtons) && (
                    <div className="border border-1 py-4 px-5 rounded-lg rounded-b-none grid md:grid-cols-2">
                        <div className="w-full md:w-60 mb-3 md:mb-0 md:max-w-xs">
                            {
                                showSearch && (
                                    <Input name="search" label="Search" endIcon={<CustomIcons iconName={'fa-solid fa-magnifying-glass'} css='mr-3' />} />
                                )
                            }
                        </div>

                        <div className="w-full flex justify-end md:justify-end items-center gap-3">
                            {
                                showButtons && (
                                    <>
                                        {buttons()}
                                    </>
                                )
                            }
                        </div>
                    </div>
                )
            }

            <div style={{ height: height || "full", width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    // disableColumnSorting
                    getRowId={getRowId}
                    // hideFooter
                    // loading={rows?.length > 0 ? false : true}
                    checkboxSelection={checkboxSelection}
                    sx={{
                        // ,
                        color: theme.palette.text.primary,
                        overflow: 'auto',
                        '& .MuiDataGrid-columnHeaders': {
                            position: 'sticky',
                            top: 0,
                            zIndex: 2,
                            backgroundColor: theme.palette.background.paper,
                            // marginY:2,   
                        },
                        '& .MuiDataGrid-footerContainer': {
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 2,
                            backgroundColor: theme.palette.background.paper,
                        },
                        '& .MuiDataGrid-container--top [role="row"], .MuiDataGrid-container--bottom [role="row"]': {
                            backgroundColor: theme.palette.background.paper,
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: theme.palette.background.paper,
                        },
                        '& .MuiDataGrid-overlay': {
                            backgroundColor: theme.palette.background.paper,
                        }
                    }}
                />
            </div>

        </>
    );
}