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
import { deleteTodo, getAllTodos } from '../../../service/todo/todoService';
import AddTodo from '../../../components/models/todo/addTodo';

const Todo = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();

    const [todos, setTodos] = useState([]);
    const [open, setOpen] = useState(false);
    // const [openAssignTodoModel, setOpenAssignTodoModel] = useState(false);
    const [selectedTodoId, setSelectedTodoId] = useState(null);
    // const [selectedTodo, setSelectedTodo] = useState(null);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleGetTodos = async () => {
        try {
            const todos = await getAllTodos();
            const formattedTodos = todos?.result?.map((todo, index) => ({
                ...todo,
                rowId: index + 1
            }));
            setTodos(formattedTodos);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    }

    const handleOpen = (todoId = null) => {
        setSelectedTodoId(todoId);
        setOpen(true);
    }

    const handleClose = () => {
        setSelectedTodoId(null);
        setOpen(false);
    }

    // const handleOpenTodoAssignModel = (todo) => {
    //     setSelectedTodo(todo);
    //     setOpenAssignTodoModel(true);
    // }

    // const handleCloseTodoAssignModel = () => {
    //     setSelectedTodo(null);
    //     setOpenAssignTodoModel(false);
    // }

    const handleOpenDeleteDialog = (todoId) => {
        setSelectedTodoId(todoId);
        setDialog({ open: true, title: 'Delete Todo', message: 'Are you sure! Do you want to delete this todo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedTodoId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteTodo = async () => {
        const res = await deleteTodo(selectedTodoId);
        if (res.status === 200) {
            setSyncingPushStatus(true);
            setAlert({
                open: true,
                message: "Todo deleted successfully",
                type: "success"
            });
            handleGetTodos();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete todo",
                type: "error"
            });
        }
    }

    useEffect(() => {
        handleGetTodos();
    }, []);

    useEffect(() => {
        if (syncingPullStatus && location.pathname === '/dashboard/todos') {
            handleGetTodos();
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
            field: 'topic',
            headerName: 'Topic Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 400,
            sortable: false,
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'dueDate',
            headerName: 'Due Date',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <span>{params.value ? new Date(params.value).toLocaleDateString() : '-'}</span>
                )
            }
        },        
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        {/* <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenTodoAssignModel(params.row)}>
                                        <CustomIcons iconName={'fa-solid fa-user-plus'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        /> */}
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
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
                        <Button type={`button`} text={'Add Todo'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={todos} getRowId={getRowId} height={550} showButtons={true} buttons={actionButtons} />
            </div>
            <AddTodo open={open} handleClose={handleClose} todoId={selectedTodoId} handleGetAllTodos={handleGetTodos} />
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteTodo()}
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

export default connect(mapStateToProps, mapDispatchToProps)(Todo)