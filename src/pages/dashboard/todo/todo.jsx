import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import DataTable from '../../../components/common/table/table';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import Components from '../../../components/muiComponents/components';
import { useLocation } from 'react-router-dom';
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';
import { deleteTodo, getTodoByFilter, setTodoToday, updateTodo } from '../../../service/todo/todoService';

import AddTodo from '../../../components/models/todo/addTodo';
import Checkbox from '../../../components/common/checkBox/checkbox';
import { Tabs } from '../../../components/common/tabs/tabs';
import BorderLinearProgress from '../../../components/common/borderLinearProgress/BorderLinearProgress';
import { setStatusToCompleted } from '../../../service/todoAssign/todoAssignService';

const filterTab = [
    { id: 1, label: "Master", },
    { id: 2, label: "Today", },
    { id: 3, label: "Assigned", },
    { id: 4, label: "Work" },
    { id: 5, label: "Personal", },
    { id: 6, label: "Completed", },
]

const Todo = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();
    const [activeFilterTab, setActiveFilterTab] = useState(0);

    const [todos, setTodos] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedTodoId, setSelectedTodoId] = useState(null);
    const [checkTodoIds, setCheckTodoIds] = useState([]);
    const [removeTodoIds, setRemoveTodoIds] = useState([]);

    const [showSaveButton, setShowSaveButton] = useState(false);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogCompleteTodo, setDialogCompleteTodo] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedTodo, setSelectedTodo] = useState(null);

    const handleSetActiveFilterTab = (id) => {
        setTodos([]);
        setCheckTodoIds([]);
        setShowSaveButton(false);
        setActiveFilterTab(id);
    }

    const handleOpen = (todoId = null) => {
        setSelectedTodoId(todoId);
        setOpen(true);
    }

    const handleClose = () => {
        setSelectedTodoId(null);
        setOpen(false);
    }

    const handleOpenDeleteDialog = (todoId) => {
        setSelectedTodoId(todoId);
        setDialog({ open: true, title: 'Delete Todo', message: 'Are you sure! Do you want to delete this todo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedTodoId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenCompleteTodoDialog = (todo) => {
        setSelectedTodo(todo);
        setDialogCompleteTodo({ open: true, title: 'Complete Todo', message: 'Are you sure! Do you want to complete this todo?', actionButtonText: 'yes' });
    }

    const handleCloseCompleteTodoDialog = () => {
        setSelectedTodo(null);
        setDialogCompleteTodo({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleCompleteTodo = async () => {
        const data = {
            ...selectedTodo,
            status: 'Completed',
            complectedWork: 100
        }
        if (selectedTodo?.customId?.startsWith('A')) {
            const id = selectedTodo?.customId?.split('A-')[1];
            const res = await setStatusToCompleted(id)
            if (res.status === 200) {
                handleGetTodoByFilter();
                handleCloseCompleteTodoDialog();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to update todo",
                    type: "error"
                });
            }
        } else {
            const res = await updateTodo(selectedTodo?.id, data)
            if (res.status === 200) {
                handleGetTodoByFilter();
                handleCloseCompleteTodoDialog();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to update todo",
                    type: "error"
                });
            }
        }
    }

    const handleDeleteTodo = async () => {
        const res = await deleteTodo(selectedTodoId);
        if (res.status === 200) {
            setSyncingPushStatus(true);
            // setAlert({
            //     open: true,
            //     message: "Todo deleted successfully",
            //     type: "success"
            // });
            handleGetTodoByFilter();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete todo",
                type: "error"
            });
        }
    }

    const handleGetTodoByFilter = async () => {
        const filterData = {
            source: null,
            isToday: false
        };

        if (activeFilterTab === 0) {
            filterData.source = "All";
        } else if (activeFilterTab === 1) {
            filterData.isToday = true;
        } else if (activeFilterTab === 2) {
            filterData.source = "Assigned";
        } else if (activeFilterTab === 3) {
            filterData.source = "Work";
        } else if (activeFilterTab === 4) {
            filterData.source = "Personal";
        } else if (activeFilterTab === 5) {
            filterData.source = "Completed";
        }

        const res = await getTodoByFilter(filterData);
        if (res.status === 200) {
            let formattedTodos = res?.result?.map((todo, index) => ({
                ...todo,
                rowId: index + 1,
                isToday: todo.isToday || false,
                complete: todo.status?.toLowerCase() === 'completed',
            })) || [];

            // ✅ Apply sorting ONLY when Today tab is active
            if (activeFilterTab === 1) {
                formattedTodos?.sort((a, b) => {
                    const aPriority = a.priority ?? Infinity;
                    const bPriority = b.priority ?? Infinity;
                    return aPriority - bPriority;
                });
            }

            setRemoveTodoIds([]);

            formattedTodos?.forEach(todo => {
                if (todo.isToday) {
                    setCheckTodoIds(prev => {
                        const exists = prev.some(item => item.id === todo.id);
                        if (exists) return prev;
                        return [...prev, { id: todo.id, customId: todo.customId }];
                    });
                }
            });

            setTodos(formattedTodos);
        }
    };

    const handleSave = async () => {
        const data = {
            source: "",
            isToday: false,
            todoIds: checkTodoIds,
            removeTodoIds: removeTodoIds
        };
        if (activeFilterTab === 0) {
            data.source = "All";
            data.isToday = false;
        }
        else if (activeFilterTab === 1) {
            data.source = "";
            data.isToday = true;
        }
        else if (activeFilterTab === 2) {
            data.source = "Assigned";
            data.isToday = false;
        }
        else if (activeFilterTab === 3) {
            data.source = "Work";
            data.isToday = false;
        }
        else if (activeFilterTab === 4) {
            data.source = "Personal";
            data.isToday = false;
        }
        const res = await setTodoToday(data);
        if (res.status === 200) {
            setCheckTodoIds([]);
            setRemoveTodoIds([]);
            setShowSaveButton(false);
            setAlert({
                open: true,
                message: "Todo updated successfully",
                type: "success"
            });
            handleGetTodoByFilter()
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to update todo",
                type: "error"
            });
        }
    }

    useEffect(() => {
        handleGetTodoByFilter()
    }, [activeFilterTab])

    useEffect(() => {
        if (syncingPullStatus && location.pathname === '/dashboard/todos') {
            handleGetTodoByFilter();
        }
    }, [syncingPullStatus]);

    useEffect(() => {
        let isChanged = [];
        todos?.map(todo => {
            if (todo.isToday) {
                isChanged.push({ id: todo.id, customId: todo.customId });
            }
        })

        setShowSaveButton(JSON.stringify(isChanged.sort()) !== JSON.stringify(checkTodoIds?.sort()));
    }, [checkTodoIds])

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
            field: 'isToday',
            headerName: 'Today',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 100,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                return (
                    <div className='h-full flex justify-center items-center'>
                        <Checkbox
                            checked={checkTodoIds?.some(item => item.id === params.row.id)}
                            onChange={(e) => {
                                const newValue = e.target.checked;
                                const currentId = params.row.id;
                                const currentCustomId = params.row.customId;

                                setCheckTodoIds(prev => {
                                    let updated = [...prev];

                                    if (newValue) {
                                        // ✅ Add if not already present
                                        const exists = updated.some(item => item.id === currentId);
                                        if (!exists) {
                                            updated.push({ id: currentId, customId: currentCustomId });
                                        }

                                        // 🔁 Also remove from removeTodoIds if it was previously unchecked
                                        setRemoveTodoIds(prevRemove =>
                                            prevRemove.filter(item => item.id !== currentId)
                                        );

                                    } else {
                                        // ❌ Remove if unchecked
                                        updated = updated.filter(item => item.id !== currentId);

                                        // ➕ Add to removeTodoIds list
                                        setRemoveTodoIds(prevRemove => [
                                            ...prevRemove,
                                            { id: currentId, customId: currentCustomId }
                                        ]);
                                    }

                                    console.log("updated", updated);
                                    return updated;
                                });
                            }}
                        />
                    </div>
                )
            }
        },
        {
            field: 'source',
            headerName: 'Source',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150
        },
        {
            field: 'task',
            headerName: 'Task',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 500,
            sortable: false,
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 200
        },
        {
            field: 'dueDate',
            headerName: 'Due Date',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            renderCell: (params) => {
                return (
                    <span>{params.value ? new Date(params.value).toLocaleDateString() : '-'}</span>
                )
            }
        },
        {
            field: 'complectedWork',
            headerName: 'Completed Work',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 200,

            renderCell: (params) => {
                return (
                    <div className='flex justify-center items-center h-full'>
                        <BorderLinearProgress value={params.value ? parseInt(params.value) : 0} />
                    </div>
                )
            }
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            minWidth: 150,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-end h-full'>
                        {
                            params.row.status?.toLowerCase() !== 'completed' ? (
                                <PermissionWrapper
                                    functionalityName="Todo"
                                    moduleName="Todo"
                                    actionId={2}
                                    component={
                                        <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                            <Components.IconButton onClick={() => handleOpenCompleteTodoDialog(params.row)}>
                                                <CustomIcons iconName={'fa-solid fa-check'} css='cursor-pointer text-white h-4 w-4' />
                                            </Components.IconButton>
                                        </div>
                                    }
                                />
                            ) : null

                        }
                        <PermissionWrapper
                            functionalityName="Todo"
                            moduleName="Todo"
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
                            functionalityName="Todo"
                            moduleName="Todo"
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
            <div className='flex gap-4'>
                {
                    showSaveButton && (
                        <PermissionWrapper
                            functionalityName="Todo"
                            moduleName="Todo"
                            actionId={2}
                            component={
                                <div>
                                    <Button useFor='success' type={`button`} text={'Save'} onClick={() => handleSave()} startIcon={<CustomIcons iconName="fa-solid fa-save" css="h-5 w-5 mr-2" />} />
                                </div>
                            }
                        />
                    )
                }
                <PermissionWrapper
                    functionalityName="Todo"
                    moduleName="Todo"
                    actionId={1}
                    component={
                        <div>
                            <Button type={`button`} text={'Add Todo'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                        </div>
                    }
                />
            </div>
        )
    }

    return (
        <>
            <div className="mb-2">
                <Tabs tabsData={filterTab} selectedTab={activeFilterTab} handleChange={handleSetActiveFilterTab} />
            </div>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable
                    getRowClassName={(params) => {
                        const status = params.row.status?.toLowerCase();
                        if (status === 'completed') return '';

                        const dueDate = params.row.dueDate ? new Date(params.row.dueDate) : null;
                        if (!dueDate) return '';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        dueDate.setHours(0, 0, 0, 0);

                        return dueDate < today ? 'warning-row' : '';
                    }}
                    columns={columns}
                    rows={todos}
                    getRowId={getRowId}
                    height={500}
                    showButtons={true}
                    buttons={actionButtons}
                    allowSorting={activeFilterTab === 1}
                />

            </div>
            <AddTodo open={open} handleClose={handleClose} todoId={selectedTodoId} handleGetAllTodos={handleGetTodoByFilter} />
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteTodo()}
                handleClose={() => handleCloseDeleteDialog()}
            />
            <AlertDialog
                open={dialogCompleteTodo.open}
                title={dialogCompleteTodo.title}
                message={dialogCompleteTodo.message}
                actionButtonText={dialogCompleteTodo.actionButtonText}
                handleAction={() => handleCompleteTodo()}
                handleClose={() => handleCloseCompleteTodoDialog()}
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

export default connect(mapStateToProps, mapDispatchToProps)(Todo)