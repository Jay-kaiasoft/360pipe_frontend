import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, set, useForm } from 'react-hook-form';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';

import { createTodo, getTodo, updateTodo } from '../../../service/todo/todoService';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';
import dayjs from 'dayjs';
import { getAllSubUsers } from '../../../service/customers/customersService';
import { getAllTeamAndMembers, getAllTeams } from '../../../service/teamDetails/teamDetailsService';
import { createTodoAssign, getTodoAssignByTodoId, updateTodoAssign } from '../../../service/todoAssign/todoAssignService';
import { getUserDetails } from '../../../utils/getUserDetails';
import TeamMemberSelect from './teamMemberSelect';
import { getAllTeamMembers } from '../../../service/teamMembers/teamMembersService';
import CheckBoxSelect from '../../common/select/checkBoxSelect';
import PermissionWrapper from '../../common/permissionWrapper/PermissionWrapper';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const status = [
    {
        id: 1,
        title: "Not Started"
    },
    {
        id: 2,
        title: "In Progress"
    },
    {
        id: 3,
        title: "Completed"
    }
]

const assignedType = [
    {
        id: 1,
        title: "Me"
    },
    {
        id: 2,
        title: "Team"
    },
    {
        id: 3,
        title: "Individual"
    }
]

const todoType = [
    {
        id: 1,
        title: "Assigned"
    },
    {
        id: 2,
        title: "Work"
    },
    {
        id: 3,
        title: "Personal"
    }
]

function AddTodo({ setAlert, open, handleClose, todoId, handleGetAllTodos }) {
    const theme = useTheme()
    const userData = getUserDetails()

    const [loading, setLoading] = useState(false);
    // const [opportunities, setOpportunities] = useState([]);
    const [teams, setTeams] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [teamAndMembers, setTeamAndMembers] = useState({ teams: [], individuals: [] })

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
            opportunityId: null,
            salesforceOpportunityId: null,
            source: null,
            topic: null,
            task: null,
            attachment: null,
            dueDate: null,
            completedDate: null,
            status: null,
            comments: null,
            complectedWork: 0,

            assignedId: null,
            teamId: null,
            customerId: null,
            assignedType: 1,
            customerIds: [],
            removeCustomerIds: [],
            removeTeam: null
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            id: null,
            opportunityId: null,
            salesforceOpportunityId: null,
            source: null,
            topic: null,
            task: null,
            attachment: null,
            dueDate: null,
            completedDate: null,
            status: null,
            comments: null,
            complectedWork: 0,

            assignedId: null,
            teamId: null,
            customerId: null,
            assignedType: 1,
            customerIds: [],
            removeCustomerIds: [],
            removeTeam: null
        });
        handleClose();
    };

    const handleGetAllTeamAndMembers = async () => {
        if (open) {
            const res = await getAllTeamAndMembers()
            if (res?.status === 200) {
                setTeamAndMembers(res?.result || { teams: [], individuals: [] })
            }
        }
    }

    const handleGetTodoDetails = async () => {
        if (todoId && open) {
            const res = await getTodo(todoId);
            if (res?.status === 200) {
                reset(res?.result);

                setValue("source", todoType?.find(t => t.title === res?.result?.source)?.id);
                setValue("status", status?.find(s => s.title === res?.result?.status)?.id);
                const response = await getTodoAssignByTodoId(todoId);
                if (response?.status === 200) {
                    const assignData = response?.result;
                    setValue("assignedId", assignData?.id);
                    setValue("teamId", assignData?.teamId);
                    if (assignData?.teamId) {
                        setValue("customerIds", assignData?.customerIds != null ? assignData?.customerIds : []);
                        const members = await getAllTeamMembers(assignData?.teamId);
                        const data = members?.result?.map((item) => {
                            return {
                                id: item.memberId,
                                title: item.memberName || ''
                            }
                        })
                        setCustomers(data || [])
                        setValue("assignedType", 2);
                    } else if (parseInt(assignData?.customerId) === userData?.userId) {
                        setValue("customerId", parseInt(assignData?.customerId));
                        setValue("assignedType", 1);
                    } else if (parseInt(assignData?.customerId)) {
                        setValue("customerId", parseInt(assignData?.customerId));
                        setValue("assignedType", 3);
                    }

                }
            }
        }
    }

    const handleGetAllCustomers = async () => {
        if (open) {
            const res = await getAllSubUsers()
            const data = res?.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.username || item.name,
                    role: item.subUserTypeDto?.name || ''
                }
            })
            setCustomers(data || [])
        }
    }

    const handleGetAllTeams = async () => {
        if (open) {
            const res = await getAllTeams()
            const data = res?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.name || '',
                    teamMembers: item.teamMembers || []
                }
            })
            setCustomers([])
            setTeams(data || [])
        }
    }

    useEffect(() => {
        handleGetAllTeamAndMembers()
        handleGetAllTeams()
        handleGetTodoDetails()
    }, [open])

    useEffect(() => {
        if (watch("assignedType") === 3) {
            handleGetAllCustomers()
        }
    }, [watch("assignedType")])

    const assignTodo = async (data) => {
        if (watch("assignedId")) {
            const res = await updateTodoAssign(watch("assignedId"), data);
            if (res?.status === 200) {
                handleGetAllTodos();
                onClose();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to assign todo",
                    type: "error",
                });
            }
        } else {
            const res = await createTodoAssign(data);
            if (res?.status === 201) {
                handleGetAllTodos();
                onClose();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to assign todo",
                    type: "error",
                });
            }
        }
    }

    const submit = async (data) => {
        setLoading(true);
        const dueDateVal = dayjs(watch("dueDate")).isValid() ? dayjs(watch("dueDate")) : dayjs();
        const completedDateVal = dayjs(watch("completedDate")).isValid() ? dayjs(watch("completedDate")) : null;
        const newData = {
            ...data,
            dueDate: dueDateVal.format("MM/DD/YYYY"), // always valid now
            completedDate: completedDateVal
                ? (completedDateVal.isValid()
                    ? completedDateVal.format("MM/DD/YYYY")
                    : dayjs().format("MM/DD/YYYY"))
                : null,
            status: status?.find(s => s.id === parseInt(watch("status")))?.title,
            source: todoType?.find(t => t.id === parseInt(watch("source")))?.title,
        };
        try {
            if (todoId) {
                const res = await updateTodo(todoId, newData);
                if (res?.status === 200) {
                    const assignData = {
                        id: watch("assignedId"),
                        teamId: watch("assignedType") === 2 ? watch("teamId") : null,
                        customerId: watch("assignedType") === 1 ? userData?.userId?.toString() : watch("assignedType") === 2 ? null : watch("customerId"),
                        customerIds: watch("assignedType") === 2 ? watch("customerIds") : [],
                        todoId: todoId,
                        removeCustomerIds: watch("removeCustomerIds") || [],
                        removeTeam: watch("removeTeam") || null,
                    }
                    assignTodo(assignData)
                } else {
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to update todo",
                        type: "error",
                    });
                }
            } else {
                const res = await createTodo(newData);
                if (res?.status === 201) {
                    const assignData = {
                        id: null,
                        teamId: watch("assignedType") === 2 ? watch("teamId") : null,
                        customerId: watch("assignedType") === 1 ? userData?.userId?.toString() : watch("assignedType") === 2 ? null : watch("customerId"),
                        customerIds: watch("assignedType") === 2 ? watch("customerIds") : [],
                        todoId: res?.result?.id,
                        removeCustomerIds: watch("removeCustomerIds") || [],
                        removeTeam: watch("removeTeam") || null,
                    }
                    assignTodo(assignData)
                } else {
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to create todo",
                        type: "error",
                    });
                }
            }
        } catch (err) {
            setAlert({
                open: true,
                message: err.message || "Something went wrong",
                type: "error",
            });
        } finally {
            setLoading(false);
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
                    {todoId ? "Update " : "Add New "}Todo
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

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className='grid grid-cols-2 gap-4'>
                            <Controller
                                name="topic"
                                control={control}
                                rules={{
                                    required: "Topic is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Topic"
                                        type={`text`}
                                        error={errors.topic}
                                    />
                                )}
                            />
                            <Controller
                                name="task"
                                control={control}
                                rules={{
                                    required: "Task is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Task"
                                        type={`text`}
                                        error={errors.task}
                                    />
                                )}
                            />
                            <div>
                                <DatePickerComponent setValue={setValue} control={control} name='dueDate' label={`Due Date`} />
                            </div>

                            {/* <div>
                                <DatePickerComponent setValue={setValue} control={control} name='completedDate' label={`Completed Date`} />
                            </div> */}
                            <div>
                                <Controller
                                    name="status"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            options={status}
                                            label={"Status"}
                                            placeholder="Select status"
                                            value={parseInt(watch("status")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                    if (newValue?.title === "Completed") {
                                                        setValue("complectedWork", 100);
                                                    }
                                                    if (newValue?.title === "Not Started") {
                                                        setValue("complectedWork", 0);
                                                    }
                                                } else {
                                                    setValue("status", null);
                                                    setValue("complectedWork", 0);
                                                }
                                            }}
                                            error={errors.status}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="source"
                                    control={control}
                                    rules={{ required: true }}

                                    render={({ field }) => (
                                        <Select
                                            options={todoType}
                                            label={"Task Type"}
                                            placeholder="Select Task Type"
                                            value={parseInt(watch("source")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("source", null);
                                                }
                                            }}
                                            error={errors.source}
                                        />
                                    )}
                                />
                            </div>

                            <PermissionWrapper
                                functionalityName="Todo"
                                moduleName="Assign Todo"
                                actionIds={[2, 1]}
                                checkAll={false}
                                component={
                                    <div>
                                        <Controller
                                            name="assignedType"
                                            control={control}
                                            rules={{ required: true }}

                                            render={({ field }) => (
                                                <Select
                                                    options={assignedType}
                                                    label={"Assigned To"}
                                                    placeholder="Select Assigned To"
                                                    value={parseInt(watch("assignedType")) || null}
                                                    onChange={(_, newValue) => {
                                                        const currentRemoved = watch("customerIds") || [];
                                                        setValue("removeCustomerIds", currentRemoved);
                                                        setValue("removeTeam", watch("teamId") || null);
                                                        if (newValue?.id) {
                                                            setValue("customerId", null);
                                                            setValue("teamId", null);
                                                            field.onChange(newValue.id);
                                                            if (newValue?.id === 1 || newValue?.id === 2) {
                                                                setCustomers([])
                                                            }
                                                        } else {
                                                            setValue("assignedType", null);
                                                            setValue("customerId", null);
                                                            setValue("teamId", null);
                                                        }
                                                    }}
                                                    error={errors.assignedType}
                                                />
                                            )}
                                        />
                                    </div>
                                }
                                fallbackComponent={
                                    <div>
                                        <Controller
                                            name="assignedType"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    disabled={true}
                                                    options={assignedType}
                                                    label={"Assigned To"}
                                                    placeholder="Select Assigned To"
                                                    value={parseInt(watch("assignedType")) || null}
                                                />
                                            )}
                                        />
                                    </div>
                                }
                            />


                            {
                                watch("assignedType") === 2 && (
                                    <>
                                        <div>
                                            <Controller
                                                name="teamId"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Select
                                                        options={teams}
                                                        label={"Team"}
                                                        placeholder="Select Team"
                                                        value={parseInt(watch("teamId")) || null}
                                                        onChange={(_, newValue) => {
                                                            if (newValue?.id) {
                                                                field.onChange(newValue.id);
                                                                const customers = newValue?.teamMembers?.map((item) => {
                                                                    return {
                                                                        id: item.memberId,
                                                                        title: item.memberName || ''
                                                                    }
                                                                })
                                                                setCustomers(customers || [])
                                                                const customerIds = customers?.map(cust => cust.id);                                                                
                                                                setValue("customerIds", customerIds || []);
                                                            } else {
                                                                setValue("teamId", null);
                                                                setCustomers([])
                                                                setValue("customerIds", []);
                                                            }
                                                        }}
                                                        error={errors.teamId}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <Controller
                                                name="customerIds"
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedOptions = customers.filter((cust) =>
                                                        (field.value || []).includes(cust.id)
                                                    );

                                                    return (
                                                        <CheckBoxSelect
                                                            disabled={customers?.length === 0}
                                                            options={customers}
                                                            label="Members"
                                                            placeholder="Select members"
                                                            value={selectedOptions}
                                                            onChange={(event, newValue) => {
                                                                const newIds = newValue.map(opt => opt.id);
                                                                const removedIds = (field.value || []).filter(id => !newIds.includes(id));

                                                                // ✅ Update main selected IDs
                                                                field.onChange(newIds);

                                                                // ✅ Also update removeCustomerIds in the form
                                                                if (todoId) {
                                                                    const currentRemoved = watch("removeCustomerIds") || [];
                                                                    setValue("removeCustomerIds", [...new Set([...currentRemoved, ...removedIds])]);
                                                                    setValue("removeTeam", watch("teamId") || null);
                                                                }
                                                            }}
                                                            checkAll={true}
                                                            maxVisibleChips={1}
                                                        />
                                                    );
                                                }}
                                            />
                                        </div>
                                    </>
                                )
                            }

                            {
                                watch("assignedType") === 3 && (
                                    <div>
                                        <Controller
                                            name="customerId"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field, fieldState: { error } }) => (
                                                <TeamMemberSelect
                                                    label={"Member"}
                                                    placeholder="Select Member"
                                                    options={teamAndMembers}
                                                    value={field.value || ""}
                                                    onChange={(e) => {
                                                        field.onChange(e?.id)
                                                    }}
                                                    error={!!error}
                                                />
                                            )}
                                        />
                                    </div>
                                )
                            }
                            <div>
                                <Controller
                                    name="complectedWork"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            disabled={parseInt(watch("status")) === 1}
                                            label="Completed Work"
                                            type="text"
                                            onChange={(e) => {
                                                let numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                if (numericValue === '') {
                                                    field.onChange('');
                                                    return;
                                                }
                                                let value = parseInt(numericValue, 10);

                                                if (Math.abs(value) <= 100) {
                                                    field.onChange(value);
                                                }
                                            }}
                                            value={field.value ?? ""}
                                            endIcon="%"
                                        />
                                    )}
                                />
                            </div>

                            <div className='col-span-2'>
                                <Controller
                                    name="comments"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Comments"
                                            type={`text`}
                                            multiline={true}
                                            minRows={3}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={todoId ? "Update" : "Submit"} isLoading={loading} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(AddTodo)
