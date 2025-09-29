import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setAlert } from '../../redux/commonReducers/commonReducers'
import PermissionWrapper from '../../components/common/permissionWrapper/PermissionWrapper'
import Components from '../../components/muiComponents/components'
import CustomIcons from '../../components/common/icons/CustomIcons'
import { deleteTeam, getAllTeams } from '../../service/teamDetails/teamDetailsService'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/common/table/table'
import Button from '../../components/common/buttons/button'
import AlertDialog from '../../components/common/alertDialog/alertDialog'

const ManageTeam = ({ setAlert }) => {
    const navigate = useNavigate()

    const [teams, setTeams] = useState([])
    const [selectedTeamId, setSelectedTeamId] = useState(null)
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleOpenDeleteDialog = (teamId) => {
        setSelectedTeamId(teamId);
        setDialog({ open: true, title: 'Delete Team', message: 'Are you sure! Do you want to delete this team?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedTeamId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteTeam = async () => {
        const res = await deleteTeam(selectedTeamId);
        if (res.status === 200) {
            setAlert({
                open: true,
                message: "Team deleted successfully",
                type: "success"
            });
            handleGetAllTeams();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete team",
                type: "error"
            });
        }
    }

    const handleGetAllTeams = async () => {
        const res = await getAllTeams();
        if (res.status === 200) {
            const formattedTeams = res.result?.map((team, index) => ({
                ...team,
                rowId: index + 1,
                teamMembers: team.teamMembers?.length || 0
            }));
            setTeams(formattedTeams);
        }
    }

    useEffect(() => {
        handleGetAllTeams();
    }, [])

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
            headerName: 'Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 300,
            sortable: false,
        },
        {
            field: 'createdByName',
            headerName: 'Created By',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'teamMembers',
            headerName: 'Team Members',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200,
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
                            <Components.IconButton onClick={() => navigate(`/dashboard/myTeam/edit/${params.row.id}`)}>
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
            //     functionalityName="Contacts"
            //     moduleName="Contacts"
            //     actionId={1}
            //     component={
            <div>
                <Button type={`button`} text={'Create Team'} onClick={() => navigate("/dashboard/myTeam/create")} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
            </div>
            //     }
            // />
        )
    }

    return (
        <div>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={teams} getRowId={getRowId} height={550} showButtons={true} buttons={actionButtons} />
            </div>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteTeam()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(ManageTeam)