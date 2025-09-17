import React, { useEffect, useState } from 'react'
import Components from '../../../components/muiComponents/components';
import { deleteSubUserType, getAllSubUserTypes } from '../../../service/subUserType/subUserTypeService';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import DataTable from '../../../components/common/table/table';
import Button from '../../../components/common/buttons/button';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import { deleteCustomer, getAllSubUsers } from '../../../service/customers/customersService';
import SubUserModel from '../../../components/models/subUser/subUserModel';

const SubUserList = ({ setAlert }) => {

    const [subUsers, setSubUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [open, setOpen] = useState(false);

    const handleClickOpen = (id = null) => {
        if (id) {
            setSelectedUserId(id);
        }
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
        setSelectedUserId(null);
    }

    const handleOpenDeleteDialog = (id) => {
        setSelectedUserId(id);
        setDialog({ open: true, title: 'Delete User', message: 'Are you sure! Do you want to delete this user?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedUserId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteSubUser = async () => {
        const res = await deleteCustomer(selectedUserId);
        if (res.status === 200) {
            handleGetAllSubUsers();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete user",
                type: "error"
            });
        }
    }

    const handleGetAllSubUsers = async () => {
        const res = await getAllSubUsers();
        if (res.status === 200) {
            const formattedSubUsers = res?.data?.result?.map((subUser, index) => ({
                ...subUser,
                rowId: index + 1,
                subUserType: subUser?.subUserTypeDto?.name,
                status: ((subUser?.userName !== "" || subUser?.userName !== null) && (subUser?.password !== '' || subUser?.password !== null)) ? 'Pending' : 'Active'
            }));
            setSubUsers(formattedSubUsers);
        }
    }


    useEffect(() => {
        handleGetAllSubUsers();
    }, []);

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
            field: 'subUserType',
            headerName: 'Sub-Users Type',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 800,
            sortable: false,
        },
        {
            field: 'emailAddress',
            headerName: 'Email Address',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 700,
            sortable: false,
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 100,
            sortable: false,
        },
        {
            field: 'action',
            headerName: 'action',
            headerAlign: 'right',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-end h-full'>
                        {/* <PermissionWrapper
              functionalityName="Company"
              moduleName="Manage Shifts"
              actionId={2}
              component={ */}
                        <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                            <Components.IconButton onClick={() => handleClickOpen(params.row.id)}>
                                <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                            </Components.IconButton>
                        </div>
                        {/* }
            /> */}
                        {/* <PermissionWrapper
              functionalityName="Company"
              moduleName="Manage Shifts"
              actionId={3}
              component={ */}
                        <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                            <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
                                <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                            </Components.IconButton>
                        </div>
                        {/* }
            /> */}
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
            // <PermissionWrapper
            //   functionalityName="Company"
            //   moduleName="Manage Shifts"
            //   actionId={1}
            //   component={
            <div>
                <Button type={`button`} text={'Add Sub-User'} onClick={() => handleClickOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
            </div>
            //   }
            // />
        )
    }

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={subUsers} getRowId={getRowId} height={470} showButtons={true} buttons={actionButtons} />
            </div>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteSubUser()}
                handleClose={() => handleCloseDeleteDialog()}
            />
            <SubUserModel open={open} handleClose={handleClose} id={selectedUserId} handleGetAllUsers={handleGetAllSubUsers} />
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(SubUserList)