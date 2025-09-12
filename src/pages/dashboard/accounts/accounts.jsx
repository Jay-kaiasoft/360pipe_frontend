import React, { useEffect, useState } from 'react'
import { deleteAccount, getAllAccounts } from '../../../service/account/accountService';
import DataTable from '../../../components/common/table/table';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import AccountModel from '../../../components/models/accounts/accountModel';
import { setAlert, setLoading } from '../../../redux/commonReducers/commonReducers';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import Components from '../../../components/muiComponents/components';
import { connect } from 'react-redux';

const Accounts = ({ setAlert, setLoading }) => {
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

  const handleGetAccounts = async () => {
    try {
      const accounts = await getAllAccounts();
      const formattedAccounts = accounts?.result?.map((account, index) => ({
        ...account,
        rowId: index + 1
      }));
      setAccounts(formattedAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  }

  const handleOpen = (accountId = null) => {
    setSelectedAccountId(accountId);
    setOpen(true);
  }

  const handleClose = () => {
    setSelectedAccountId(null);
    setOpen(false);
  }

  const handleOpenDeleteDialog = (accountId) => {
    setSelectedAccountId(accountId);
    setDialog({ open: true, title: 'Delete Account', message: 'Are you sure! Do you want to delete this account?', actionButtonText: 'yes' });
  }

  const handleCloseDeleteDialog = () => {
    setSelectedAccountId(null);
    setDialog({ open: false, title: '', message: '', actionButtonText: '' });
  }

  const handleDeleteAccount = async () => {
    const res = await deleteAccount(selectedAccountId);
    if (res.status === 200) {
      setAlert({
        open: true,
        message: "Account deleted successfully",
        type: "success"
      });
      handleGetAccounts();
      handleCloseDeleteDialog();
    } else {
      setAlert({
        open: true,
        message: res?.message || "Failed to delete account",
        type: "error"
      });
    }
  }

  useEffect(() => {
    handleGetAccounts();
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
      field: 'accountName',
      headerName: 'Account Name',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 300,
      sortable: false,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      headerClassName: 'uppercase',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'action',
      headerName: 'action',
      headerClassName: 'uppercase',
      sortable: false,
      renderCell: (params) => {
        return (
          <div className='flex items-center gap-2 justify-center h-full'>
            {/* <PermissionWrapper
              functionalityName="Company"
              moduleName="Manage Shifts"
              actionId={2}
              component={ */}
            <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
              <Components.IconButton onClick={() => handleOpen(params.row.id)}>
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
        <Button type={`button`} text={'Add Account'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
      </div>
      //   }
      // />
    )
  }

  return (
    <>
      <div className='border rounded-lg bg-white w-full lg:w-full '>
        <DataTable columns={columns} rows={accounts} getRowId={getRowId} height={550} showButtons={true} buttons={actionButtons} />
      </div>
      <AccountModel open={open} handleClose={handleClose} accountId={selectedAccountId} handleGetAllAccounts={handleGetAccounts} />
      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        actionButtonText={dialog.actionButtonText}
        handleAction={() => handleDeleteAccount()}
        handleClose={() => handleCloseDeleteDialog()}
      />
    </>
  )
}

const mapDispatchToProps = {
  setAlert,
  setLoading,
};

export default connect(null, mapDispatchToProps)(Accounts)