import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import { getAllContacts } from '../../../service/contact/contactService';
import Checkbox from '../../common/checkBox/checkbox';
import { addOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function OpportunityContactModel({ setAlert, open, handleClose, opportunityId, handleGetAllOppContact }) {
    const theme = useTheme()
    const [contacts, setContacts] = useState([])
    const [selectedRows, setSetectedRows] = useState([])

    const onClose = () => {
        setSetectedRows([])
        setContacts([])
        handleClose();
    };

    const handleGetAllContact = async () => {
        if (open) {
            const res = await getAllContacts()
            const data = res?.result?.map((item, row) => {
                return {
                    id: item.id,
                    title: item?.firstName + " " + item?.lastName,
                    oppId: opportunityId,
                    contactId: item.id,
                    isKey: false,
                    isAdd: false,
                }
            })
            setContacts(data)
        }
    }

    const getKeyCount = (arr) => arr.filter(r => r.isKey === true).length;

    const handleAddRow = (row, checked) => {
        setContacts(prev => {
            const next = prev.map(item =>
                item.contactId === row.contactId
                    ? { ...item, isAdd: checked, isKey: checked ? item.isKey : false } // unselect clears key
                    : item
            );
            setSetectedRows(next.filter(c => c.isAdd));
            return next;
        });
    };

    const handleToggleKey = (row, checked) => {
        setContacts(prev => {
            const target = prev.find(i => i.contactId === row.contactId);
            if (!target?.isAdd) {
                setAlert({ open: true, type: "warning", message: "Select the contact first." });
                return prev;
            }
            const prospectiveSelected = prev.filter(c => c.isAdd);
            const currentKeyCount = getKeyCount(prospectiveSelected);
            const alreadyKey = !!target.isKey;

            if (checked && !alreadyKey && currentKeyCount >= 4) {
                setAlert({ open: true, type: "warning", message: "You can not mark up to 4 key contacts." });
                return prev;
            }

            const next = prev.map(item =>
                item.contactId === row.contactId
                    ? { ...item, isKey: checked, isAdd: true } // keep selected if keying
                    : item
            );

            // sync selectedRows (includes isKey updates)
            setSetectedRows(next.filter(c => c.isAdd));
            return next;
        });
    };



    useEffect(() => {
        handleGetAllContact()
    }, [open])

    const submit = async () => {
        const res = await addOpportunitiesContact(selectedRows)
        if (res?.status === 201) {
            handleGetAllOppContact()
            onClose()
        } else {
            setAlert({
                open: true,
                message: res.message || "Fail to add contact",
                type: "error"
            })
        }
    };



    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Add Opportunity Contact
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <Components.DialogContent
                    dividers
                    sx={{
                        height: "70vh",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div className="max-h-[70vh] overflow-y-auto">
                        <table className="min-w-full border-collapse border">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        #
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Name
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Key Contact
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">
                                {contacts?.length > 0 ? (
                                    contacts.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-1 text-sm text-gray-800">
                                                <Checkbox
                                                    onChange={(e) => handleAddRow(row, e.target.checked)}
                                                    checked={!!row.isAdd}
                                                />
                                            </td>
                                            <td className="px-4 py-1 text-sm text-gray-800">
                                                {row.title || "—"}
                                            </td>
                                            <td className="px-4 py-1 text-sm text-gray-800">
                                                <Checkbox
                                                    onChange={(e) => handleToggleKey(row, e.target.checked)}
                                                    checked={!!row.isKey}
                                                    disabled={
                                                        !row.isAdd ||
                                                        (!row.isKey && selectedRows.filter((r) => r.isKey).length >= 4)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-3 text-sm text-gray-800 font-bold text-center"
                                        >
                                            No records
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {/* ✅ Table Footer Summary */}
                            <tfoot className="bg-gray-100 sticky bottom-0">
                                <tr>
                                    <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-700">
                                        <div className="flex justify-between items-center">
                                            <span>Added: {selectedRows?.length}</span>
                                            <span>
                                                Key Contacts: {selectedRows?.filter((r) => r.isKey).length} / 4
                                            </span>
                                            <span>Total Contacts: {contacts.length}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                </Components.DialogContent>

                <Components.DialogActions>
                    <div className='flex justify-end'>
                        <Button type={`button`} text={"Submit"} onClick={() => submit()} />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(OpportunityContactModel)