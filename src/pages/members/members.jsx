import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setAlert, setSyncingPushStatus } from '../../redux/commonReducers/commonReducers';

import DataTable from '../../components/common/table/table';
import Button from '../../components/common/buttons/button';
import CustomIcons from '../../components/common/icons/CustomIcons';
import AlertDialog from '../../components/common/alertDialog/alertDialog';
import Components from '../../components/muiComponents/components';

import PermissionWrapper from '../../components/common/permissionWrapper/PermissionWrapper';
import { deleteCustomer, getAllSubUsers } from '../../service/customers/customersService';
import SubUserModel from '../../components/models/subUser/subUserModel';

const Members = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
  const location = useLocation();
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
    setDialog({ open: true, title: 'Delete Account', message: 'Are you sure! Do you want to delete this account?', actionButtonText: 'yes' });
  }

  const handleCloseDeleteDialog = () => {
    setSelectedUserId(null);
    setDialog({ open: false, title: '', message: '', actionButtonText: '' });
  }

  const handleDeleteAccount = async () => {
    const res = await deleteCustomer(selectedUserId);
    if (res.status === 200) {
      setSyncingPushStatus(true);
      handleGetAllAccounts();
      handleCloseDeleteDialog();
    } else {
      setAlert({
        open: true,
        message: res?.message || "Failed to delete user",
        type: "error"
      });
    }
  }

  const handleGetAllAccounts = async () => {
    const res = await getAllSubUsers();
    if (res?.data?.status === 200) {
      const formattedSubUsers = res?.data?.result?.map((subUser, index) => ({
        ...subUser,
        rowId: index + 1,
        subUserType: subUser?.subUserTypeDto?.name,
      }));
      setSubUsers(formattedSubUsers);
    }
  }

  useEffect(() => {
    handleGetAllAccounts();
  }, []);

  useEffect(() => {
    if (syncingPullStatus && location.pathname === '/dashboard/accounts') {
      handleGetAllAccounts();
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
      field: 'name',
      headerName: 'Member Name',
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
      renderCell: (params) => {
        return (
          <div>
            <span>
              {params.value ? params.value : '-'}
            </span>
          </div>
        )
      }
    },
    {
      field: 'subUserType',
      headerName: 'Role',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 800,
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
            <PermissionWrapper
              functionalityName="Account"
              moduleName="Account"
              actionId={2}
              component={
                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                  <Components.IconButton onClick={() => handleClickOpen(params.row.id)}>
                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                  </Components.IconButton>
                </div>
              }
            />
            <PermissionWrapper
              functionalityName="Account"
              moduleName="Account"
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
        functionalityName="Account"
        moduleName="Account"
        actionId={1}
        component={
          <div>
            <Button type={`button`} text={'Create Member'} onClick={() => handleClickOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
          </div>
        }
      />
    )
  }

  return (
    <div className='w-full'>
      <div className='border rounded-lg bg-white'>
        <DataTable columns={columns} rows={subUsers} getRowId={getRowId} height={480} showButtons={true} buttons={actionButtons} />
      </div>
      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        actionButtonText={dialog.actionButtonText}
        handleAction={() => handleDeleteAccount()}
        handleClose={() => handleCloseDeleteDialog()}
      />
      <SubUserModel open={open} handleClose={handleClose} id={selectedUserId} handleGetAllUsers={handleGetAllAccounts} />
    </div>
  )
}

const mapStateToProps = (state) => ({
  syncingPullStatus: state.common.syncingPullStatus,
});

const mapDispatchToProps = {
  setAlert,
  setSyncingPushStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(Members)