import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import { getAllContacts } from '../../../service/contact/contactService';
import Checkbox from '../../common/checkBox/checkbox';
import { addOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import Select from '../../common/select/select';
import { opportunityContactRoles } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function OpportunityContactModel({
    setAlert,
    open,
    handleClose,
    opportunityId,
    handleGetAllOppContact,
    setSyncingPushStatus,
    oppName
}) {
    const theme = useTheme();
    const [contacts, setContacts] = useState([]);
    const selectedRows = contacts?.filter((c) => c.isAdd);

    const onClose = () => {
        setContacts([]);
        handleClose();
    };

    const handleGetAllContact = async () => {
        if (open) {
            const res = await getAllContacts();
            const data = res?.result?.map((item) => ({
                id: item.id,
                name: `${item?.firstName || ''} ${item?.lastName || ''}`.trim(),
                oppId: opportunityId,
                contactId: item.id,
                title: item?.title,
                role: null,
                isKey: false,
                isAdd: false,
                salesforceContactId: item?.salesforceContactId,
                isDeleted: false,
            })) || [];
            setContacts(data);
        }
    };

    const getKeyCount = (arr) => arr.filter((r) => r.isKey === true).length;

    const handleAddRow = (row, checked) => {
        setContacts((prev) => {
            const next = prev.map((item) =>
                item.contactId === row.contactId
                    ? {
                        ...item,
                        isAdd: checked,
                        // when unselecting a row, clear its key flag
                        isKey: checked ? item.isKey : false,
                        salesforceContactId: item?.salesforceContactId,
                        isDeleted: false,
                    }
                    : item
            );
            return next;
        });
    };

    const handleToggleKey = (row, checked) => {
        setContacts((prev) => {
            const target = prev.find((i) => i.contactId === row.contactId);
            if (!target?.isAdd) {
                setAlert({ open: true, type: 'warning', message: 'Select the contact first.' });
                return prev;
            }

            const prospectiveSelected = prev.filter((c) => c.isAdd);
            const currentKeyCount = getKeyCount(prospectiveSelected);
            const alreadyKey = !!target.isKey;

            if (checked && !alreadyKey && currentKeyCount >= 4) {
                setAlert({ open: true, type: 'warning', message: 'You can mark up to 4 key contacts.' });
                return prev;
            }

            const next = prev.map((item) =>
                item.contactId === row.contactId
                    ? {
                        ...item,
                        isKey: checked,
                        isAdd: true,
                        salesforceContactId: item?.salesforceContactId,
                        isDeleted: false,
                    }
                    : item
            );

            return next;
        });
    };

    // ✅ CHECK ALL logic
    const selectedCount = contacts.filter((c) => c.isAdd).length;
    const allChecked = contacts.length > 0 && selectedCount === contacts.length;
    const isIndeterminate = selectedCount > 0 && selectedCount < contacts.length;

    const handleToggleAll = (checked) => {
        setContacts((prev) => {
            const next = prev.map((item) => ({
                ...item,
                isAdd: checked,
                // when unchecking all, clear all key flags
                isKey: checked ? item.isKey : false,
            }));
            return next;
        });
    };

    useEffect(() => {
        handleGetAllContact();
    }, [open]);

    const submit = async () => {
        if (selectedRows.length > 0) {
            const res = await addOpportunitiesContact(selectedRows);
            if (res?.status === 201) {
                setSyncingPushStatus(true);
                handleGetAllOppContact();
                onClose();
            } else {
                setAlert({
                    open: true,
                    message: res.message || 'Fail to add contact',
                    type: 'error',
                });
            }
        }
    };

    return (
        <React.Fragment>
            <BootstrapDialog open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Add Contact For <strong>{oppName}</strong>
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
                    <CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer text-black w-5 h-5" />
                </Components.IconButton>

                <Components.DialogContent
                    dividers
                    sx={{
                        height: '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div className="py-3 px-[30px] h-full">
                        <div className="max-h-[63vh] overflow-y-auto border rounded-md overflow-hidden">
                            <table className="min-w-full border-collapse">
                                {/* 🔵 Blue sticky header */}
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#0478DC] text-white">
                                        {/* Check-all header (replaces '#') */}
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-14">
                                            <Checkbox
                                                checked={allChecked}
                                                indeterminate={isIndeterminate}
                                                onChange={(e) => handleToggleAll(e.target.checked)}
                                                color={"#ffffff"}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-60">Role</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-32">Key Contact</th>
                                    </tr>
                                </thead>

                                {/* Body with zebra rows */}
                                <tbody>
                                    {contacts?.length > 0 ? (
                                        contacts.map((row, i) => (
                                            <tr key={row.contactId ?? i} className="odd:bg-white even:bg-gray-200">
                                                <td className="px-4 py-3 text-sm">
                                                    <Checkbox
                                                        onChange={(e) => handleAddRow(row, e.target.checked)}
                                                        checked={!!row.isAdd}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {row.name || '—'}
                                                    {row.title && (
                                                        <>
                                                            <span className="mx-1 text-indigo-600">
                                                                –
                                                            </span>
                                                            <span className='text-indigo-600'>
                                                                {row.title}
                                                            </span>
                                                        </>
                                                    )}
                                                </td>
                                                <td>
                                                    <Select
                                                        placeholder="Select Role"
                                                        value={opportunityContactRoles?.find((item) => item.title === row.role)?.id || null}
                                                        options={opportunityContactRoles}
                                                        onChange={(_, newValue) => {
                                                            const selectedRole = opportunityContactRoles?.find((item) => item.id === newValue?.id);
                                                            setContacts((prev) =>
                                                                prev.map((c) =>
                                                                    c.contactId === row.contactId
                                                                        ? { ...c, role: selectedRole?.title || null }
                                                                        : c
                                                                )
                                                            );
                                                        }}
                                                        className="flex-1"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm flex justify-center items-center">
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
                                            <td colSpan={3} className="px-4 py-4 text-center text-sm font-semibold">
                                                No records
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {/* Sticky footer summary */}
                                <tfoot className="bg-gray-100 sticky bottom-0">
                                    <tr>
                                        <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-gray-700">
                                            <div className="flex justify-between items-center">
                                                <span>Added: {selectedRows?.length}</span>
                                                <span>Key Contacts: {selectedRows?.filter((r) => r.isKey).length} / 4</span>
                                                <span>Total Contacts: {contacts.length}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </Components.DialogContent>

                <Components.DialogActions>
                    <div className="flex justify-end items-center gap-4">
                        <Button disabled={selectedRows.length === 0} type="button" text={'Submit'} onClick={() => submit()} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                        <Button type="button" text={'Cancel'} useFor="disabled" onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert, setSyncingPushStatus };
export default connect(null, mapDispatchToProps)(OpportunityContactModel);