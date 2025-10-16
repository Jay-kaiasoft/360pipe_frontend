import React, { useState, useEffect } from 'react';
import Input from '../input/input';
import { useTheme } from '@mui/material';
import { ReactSortable } from 'react-sortablejs';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import CustomIcons from '../icons/CustomIcons';
import { getUserDetails } from '../../../utils/getUserDetails';
import { changeTodoPriority } from '../../../service/todoPriority/todoPriorityService';

const paginationModel = { page: 0, pageSize: 10 };

export default function DataTable({
    getRowClassName,
    checkboxSelection = false,
    showSearch = false,
    showButtons = false,
    rows,
    columns,
    getRowId,
    height,
    buttons,
    allowSorting = false,
}) {
    const userInfo = getUserDetails();
    const theme = useTheme();
    const [priority, setPriority] = useState(false);
    const [priorityData, setPriorityData] = useState([]);
    const [sortedRows, setSortedRows] = useState([]);

    useEffect(() => {
        setSortedRows(rows);
    }, [rows]);

    const handleChangeTodoPriority = async () => {
        if (priority) {
            const res = await changeTodoPriority(priorityData)
            if (res && res.status === 200) {
                setPriority(false)
                setPriorityData([])
            }
        }
    }

    useEffect(() => {
        handleChangeTodoPriority()
    }, [priority]);

    const renderSortableTable = (sortedRows, setSortedRows) => {
        const handleChangeValue = (newList) => {
            const filteredList = (newList || []).filter(Boolean);
            setSortedRows(filteredList);
            const logArr = filteredList.map((row, idx) => ({
                id: row.priorityId || null,
                todoId: row.id,
                priority: idx,
                userId: userInfo.userId
            }));
            setPriorityData(logArr);
        }

        return (
            <div className="overflow-x-auto" style={{ height: height || "full", width: '100%' }}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead style={{ background: theme.palette.background.paper }}>
                        <tr className='sticky top-0 bg-white z-50 '>
                            <th className="w-6"></th>
                            {columns.map(col => (
                                <th
                                    key={col.field}
                                    className="px-2 py-4 font-bold uppercase border-b text-left text-sm"
                                    style={{
                                        maxWidth: col.maxWidth,
                                        minWidth: col.minWidth,
                                        textAlign: col.headerAlign || 'left'
                                    }}
                                >
                                    {col.headerName}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <ReactSortable
                        tag="tbody"
                        list={sortedRows}
                        setList={handleChangeValue}
                        onEnd={(evt) => {
                            setTimeout(() => {
                                if (priorityData && priorityData?.length > 0 && !priority) {
                                    setPriority(true)
                                }
                            }, 1000);
                        }}
                        animation={150} fallbackOnBody={true} swapThreshold={0.65} ghostClass={"ghost"} group={"shared"} forceFallback={true}
                    >
                        {sortedRows?.map((row, idx) => (
                            <tr
                                key={String(getRowId(row))}
                                className={`${getRowClassName ? getRowClassName({ row }) : ''} border-b`}
                                data-id={String(getRowId(row))}
                            >
                                <td className="sortable-handle cursor-move px-2 py-4 align-middle">
                                    {/* Removed the grip-lines icon */}
                                </td>
                                {columns.map(col => (
                                    <td
                                        key={col.field}
                                        className="px-2 py-4 align-middle text-sm"
                                        style={{
                                            maxWidth: col.maxWidth,
                                            minWidth: col.minWidth,
                                            textAlign: col.align || 'left'
                                        }}
                                    >
                                        {col.renderCell ? col.renderCell({ row, value: row[col.field] }) : row[col.field]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </ReactSortable>
                </table>
            </div>
        )
    }

    if (allowSorting) {
        return (
            <div>
                {(showSearch || showButtons) && (
                    <div className="border border-1 py-4 px-5 rounded-lg rounded-b-none grid md:grid-cols-2">
                        <div className="w-full md:w-60 mb-3 md:mb-0 md:max-w-xs">
                            {showSearch && (
                                <Input name="search" label="Search" endIcon={<CustomIcons iconName={'fa-solid fa-magnifying-glass'} css='mr-3' />} />
                            )}
                        </div>
                        <div className="w-full flex justify-end md:justify-end items-center gap-3">
                            {showButtons && buttons && buttons()}
                        </div>
                    </div>
                )}
                {renderSortableTable(sortedRows, setSortedRows)}
            </div>
        );
    }

    // Only render DataGrid if allowSorting is false
    return (
        <>
            {(showSearch || showButtons) && (
                <div className="border border-1 py-4 px-5 rounded-lg rounded-b-none grid md:grid-cols-2">
                    <div className="w-full md:w-60 mb-3 md:mb-0 md:max-w-xs">
                        {showSearch && (
                            <Input name="search" label="Search" endIcon={<CustomIcons iconName={'fa-solid fa-magnifying-glass'} css='mr-3' />} />
                        )}
                    </div>
                    <div className="w-full flex justify-end md:justify-end items-center gap-3">
                        {showButtons && buttons && buttons()}
                    </div>
                </div>
            )}
            {/* Only render DataGrid if allowSorting is false */}
            {!allowSorting && (
                <div style={{ height: height || "full", width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                        hideFooterSelectedRowCount
                        getRowClassName={getRowClassName}
                        getRowId={getRowId}
                        checkboxSelection={checkboxSelection}
                        sx={{
                            color: theme.palette.text.primary,
                            overflow: 'auto',
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
            )}
        </>
    );
}

DataTable.propTypes = {
    getRowClassName: PropTypes.func,
    checkboxSelection: PropTypes.bool,
    showSearch: PropTypes.bool,
    showButtons: PropTypes.bool,
    rows: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    getRowId: PropTypes.func.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    buttons: PropTypes.func,
    allowSorting: PropTypes.bool,
    userId: PropTypes.string,
};