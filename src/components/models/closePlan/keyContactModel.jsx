import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Checkbox from '../../common/checkBox/checkbox';
import { getAllOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import { saveClosePlan } from '../../../service/closePlanService/closePlanService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function KeyContactModel({
    setAlert,
    open,
    handleClose,
    opportunityId,
    setClosePlanUrl,
    handleOpenPlanUrlModel
}) {
    const theme = useTheme();
    const [contacts, setContacts] = useState([]);

    const onClose = () => {
        setContacts([]);
        handleClose();
    };

    const handleToggleAll = (isChecked) => {
        if (isChecked) {
            setContacts((prev) => prev.map((r) => ({ ...r, isAdd: true })));
        } else {
            setContacts((prev) => prev.map((r) => ({ ...r, isAdd: false })));
        }
    }

    const handleSelectRow = (row, isChecked) => {
        if (isChecked) {
            setContacts((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, isAdd: true } : r))
            );
        } else {
            setContacts((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, isAdd: false } : r))
            );
        }
    }

    const handleGetAllContact = async () => {
        if (open && opportunityId) {
            const res = await getAllOpportunitiesContact(opportunityId);
            const data = res?.result?.filter((row) => row.isKey === true)?.map((item) => ({
                id: item.id,
                title: item.contactName,
                isAdd: false,
                role: item.role,
                contactId: item.contactId,
            })) || [];
            setContacts(data);
        }
    };

    useEffect(() => {
        handleGetAllContact();
    }, [open]);

    const submit = async () => {
        if (contacts?.filter((row) => row.isAdd).length > 0) {
            const payload = contacts?.filter((row) => row.isAdd).map((item) => ({
                oppId: opportunityId,
                contactId: item.contactId,
            }))
            const res = await saveClosePlan(payload);
            if (res.status === 201) {
                setClosePlanUrl(res?.result);
                onClose()
                handleOpenPlanUrlModel();
            } else {
                setAlert({
                    open: true,
                    message: 'Fail to create close plan',
                    type: 'error',
                });
            }
        }
    }

    return (
        <React.Fragment>
            <BootstrapDialog open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Send Close Plan
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
                                                checked={contacts?.length > 0 && contacts.every((row) => row.isAdd)}
                                                onChange={(e) => handleToggleAll(e.target.checked)}
                                                color={"#ffffff"}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {contacts?.length > 0 ? (
                                        contacts.map((row, i) => (
                                            <tr key={row.contactId ?? i} className="odd:bg-white even:bg-gray-200">
                                                <td className="px-4 py-3 text-sm">
                                                    <Checkbox
                                                        onChange={(e) => handleSelectRow(row, e.target.checked)}
                                                        checked={!!row.isAdd}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {row.title || '—'}
                                                    {row.role && (
                                                        <>
                                                            <span className="mx-1 text-gray-500">–</span>
                                                            <span className='text-indigo-600'>
                                                                {row.role}
                                                            </span>
                                                        </>
                                                    )}
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
                            </table>
                        </div>
                    </div>
                </Components.DialogContent>

                <Components.DialogActions>
                    <div className="flex justify-end items-center gap-4">
                        <Button disabled={contacts?.filter((row) => row.isAdd).length === 0} type="button" text={'Submit'} onClick={() => submit()} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                        <Button type="button" text={'Cancel'} useFor="disabled" onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    )
};

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(KeyContactModel);
