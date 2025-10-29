import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { getAllContacts } from '../../../service/contact/contactService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function OpportunitiesContactModel({ setAlert, open, handleClose, opportunityId, handleGetAllContact }) {
    const theme = useTheme()
    const [contacts, setContacts] = useState([])

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: null,
            oppId: null,
            contactId: null,
            isKey: null,
        },
    });

    const onClose = () => {
        reset({
            id: null,
            oppId: null,
            contactId: null,
            isKey: null,
        });
        handleClose();
    };

    const handleGetAllContact = async () => {
        const res = await getAllContacts()
        const data = res?.result?.map((item, row) => {
            return {
                id: item.id,
                title: item?.firstName + item?.lastName
            }
        })
        setContacts(data)
    }

    useEffect(() => {

    }, [open])

    const submit = async (data) => {
        console.log(data)
    }

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

                <form noValidate onSubmit={handleSubmit(submit)} className='h-full'>
                    <Components.DialogContent dividers>
                        <div className='grid md:grid-cols-1 gap-4'>
                            <div className='mb-3'>
                                <Controller
                                    name={`contactId`}
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={contacts || []}
                                            label={"Account"}
                                            placeholder="Select Account"
                                            value={parseInt(watch(`contactId`)) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue(`contactId`, null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={"Submit"} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(OpportunitiesContactModel)