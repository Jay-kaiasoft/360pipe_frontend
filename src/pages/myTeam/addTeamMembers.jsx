import React, { useState } from 'react'
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';

import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import Input from '../../components/common/input/input';
import { deleteTeamMembers } from '../../service/teamMembers/teamMembersService';
import DataTable from '../../components/common/table/table';
import Button from '../../components/common/buttons/button';
import Components from '../../components/muiComponents/components';
import CustomIcons from '../../components/common/icons/CustomIcons';
import AddTeamMemberModel from '../../components/models/teamMember/addTeamMemberModel';

const AddTeamMembers = ({ setAlert }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedMember, setSelectedMember] = useState(null)

    const handleOpen = (id = null) => {
        setSelectedMember(id);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleOpenDeleteDialog = (data) => {
        setSelectedMember(data);
        setDialog({ open: true, title: 'Delete Team', message: 'Are you sure! Do you want to delete this team?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedMember(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

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
            name: null,
            teamMembers: []
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'teamMembers',
    });

    const handleDeleteTeam = async () => {
        const res = await deleteTeamMembers(selectedMember?.id);
        if (res.status === 200) {
            setAlert({
                open: true,
                message: "Team deleted successfully",
                type: "success"
            });
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete team",
                type: "error"
            });
        }
    }

    const handleSave = async (data) => {
        console.log("data", data);
    }

    const columns = [      
        {
            field: 'memberName',
            headerName: 'Member Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 300,
            sortable: false,
        },
        {
            field: 'role',
            headerName: 'Role',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 200,
        },
        {
            field: 'oppName',
            headerName: 'Assigned Opportunity',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 300,
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
                            functionalityName="Contacts"
                            moduleName="Contacts"
                            actionId={2}
                            component={ */}
                        <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                            <Components.IconButton onClick={() => handleOpen(params.row)}>
                                <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                            </Components.IconButton>
                        </div>
                        {/* }
                        /> */}
                        {/* <PermissionWrapper
                            functionalityName="Contacts"
                            moduleName="Contacts"
                            actionId={3}
                            component={ */}
                        <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                            <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row)}>
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
        return row.rowId || row.id;
    }

    const actionButtons = () => {
        return (
            // <PermissionWrapper
            //     functionalityName="Contacts"
            //     moduleName="Contacts"
            //     actionId={1}
            //     component={
            <div>
                <Button type={`button`} text={'Add Member'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
            </div>
            //     }
            // />
        )
    }

    return (
        <div>
            <form onSubmit={handleSubmit(handleSave)}>
                <div className='my-5 md:w-96'>
                    <Controller
                        name="name"
                        control={control}
                        rules={{
                            required: "Team name is required",
                        }}
                        render={({ field }) => (
                            <Input
                                {...field}
                                fullWidth
                                id="name"
                                label="Team Name"
                                variant="outlined"
                                error={!!errors.name}
                            />
                        )}
                    />
                </div>
                <div className='border rounded-lg bg-white w-full lg:w-full '>
                    <DataTable columns={columns} rows={fields} getRowId={getRowId} height={400} showButtons={true} buttons={actionButtons} />
                </div>
                <div className='flex justify-end mt-5 gap-3'>
                    <div>
                        <Button type="button" text={"Cancel"} variant="contained" useFor='disabled' onClick={() => navigate("/dashboard/myteam")} />
                    </div>
                    <div>
                        <Button type="submit" text={id ? "Update" : "Submit"} />
                    </div>
                </div>
            </form>
            <AddTeamMemberModel open={open} handleClose={handleClose} selectedMember={selectedMember} members={fields} append={append} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AddTeamMembers)