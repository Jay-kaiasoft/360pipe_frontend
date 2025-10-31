import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

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

// NEW: uploader + picker
import MultipleFileUpload from '../../fileInputBox/multipleFileUpload';
import { uploadFiles } from "../../../service/common/commonService"

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

const status = [
    { id: 1, title: "Not Started" },
    { id: 2, title: "In Progress" },
    { id: 3, title: "Completed" },
];

const assignedType = [
    { id: 1, title: "Me" },
    { id: 2, title: "Team" },
    { id: 3, title: "Individual" },
];

const todoType = [
    { id: 1, title: "Assigned" },
    { id: 2, title: "Work" },
    { id: 3, title: "Personal" },
];

function AddTodo({ setAlert, open, handleClose, todoId, handleGetAllTodos }) {
    const theme = useTheme();
    const userData = getUserDetails();

    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [teamAndMembers, setTeamAndMembers] = useState({ teams: [], individuals: [] });

    // NEW: local file state for the picker
    const [files, setFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);       // server-returned files (for preview after upload)
    const [existingImages, setExistingImages] = useState([]);     // if editing & todo already has images

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
            createdBy: null,

            assignedId: null,
            teamId: null,
            customerId: null,
            assignedType: 1,
            customerIds: [],
            removeCustomerIds: [],
            removeTeam: null,

            // NEW: where we store uploaded file metadata (array from API)
            images: [],
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
            createdBy: null,
            assignedId: null,
            teamId: null,
            customerId: null,
            assignedType: 1,
            customerIds: [],
            removeCustomerIds: [],
            removeTeam: null,
            images: [],
        });
        setFiles([]);
        setUploadedFiles([]);
        setExistingImages([]);
        handleClose();
    };

    const handleGetAllTeamAndMembers = async () => {
        if (open) {
            const res = await getAllTeamAndMembers();
            if (res?.status === 200) setTeamAndMembers(res?.result || { teams: [], individuals: [] });
        }
    };

    const handleGetTodoDetails = async () => {
        if (todoId && open) {
            const res = await getTodo(todoId);
            if (res?.status === 200) {
                reset(res?.result);
                setValue("createdBy", res?.result?.createdBy || null);
                setValue("source", todoType?.find(t => t.title === res?.result?.source)?.id);
                setValue("status", status?.find(s => s.title === res?.result?.status)?.id);

                // If backend returns any existing images for this todo
                if (Array.isArray(res?.result?.images) && res.result.images.length) {
                    setExistingImages(res.result.images);
                    setValue('images', res.result.images);
                }

                const response = await getTodoAssignByTodoId(todoId);
                if (response?.status === 200) {
                    const assignData = response?.result;
                    setValue("assignedId", assignData?.id);
                    setValue("teamId", assignData?.teamId);
                    if (assignData?.teamId) {
                        setValue("status", status?.find(s => s.title === assignData?.status)?.id);
                        setValue("customerIds", assignData?.customerIds != null ? assignData?.customerIds : []);
                        const members = await getAllTeamMembers(assignData?.teamId);
                        const data = members?.result?.map((item) => ({
                            id: item.memberId,
                            title: item.memberName || ''
                        }));
                        setCustomers(data || []);
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
    };

    const handleGetAllCustomers = async () => {
        if (open) {
            const res = await getAllSubUsers();
            const data = res?.data?.result?.map((item) => ({
                id: item.id,
                title: item.username || item.name,
                role: item.subUserTypeDto?.name || ''
            }));
            setCustomers(data || []);
        }
    };

    const handleGetAllTeams = async () => {
        if (open) {
            const res = await getAllTeams();
            const data = res?.result?.map((item) => ({
                id: item.id,
                title: item.name || '',
                teamMembers: item.teamMembers || []
            }));
            setCustomers([]);
            setTeams(data || []);
        }
    };

    useEffect(() => {
        handleGetAllTeamAndMembers();
        handleGetAllTeams();
        handleGetTodoDetails();
    }, [open]);

    useEffect(() => {
        if (watch("assignedType") === 3) handleGetAllCustomers();
    }, [watch("assignedType")]);

    const assignTodo = async (data) => {
        console.log("data", data)
        if (watch("assignedId")) {
            const res = await updateTodoAssign(watch("assignedId"), data);
            if (res?.status === 200) { handleGetAllTodos(); onClose(); }
            else {
                setAlert({ open: true, message: res?.message || "Failed to assign todo", type: "error" });
            }
        } else {
            const res = await createTodoAssign(data);
            if (res?.status === 201) { handleGetAllTodos(); onClose(); }
            else {
                setAlert({ open: true, message: res?.message || "Failed to assign todo", type: "error" });
            }
        }
    };

    // NEW: upload files first, then create/update todo with images[]
    const uploadSelectedFiles = async () => {
        const newFiles = [];
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("files", file);
                formData.append("folderName", "todo");
                // formData.append("userId", brandId); 

                const response = await uploadFiles(formData);
                if (response?.data?.status === 200) {
                    const uploadedFile = response.data.result[0];
                    // keep form value and local previews in sync
                    setValue('images', uploadedFile);
                    setUploadedFiles((prev) => [...prev, uploadedFile]);
                    newFiles.push(uploadedFile);
                } else {
                    setAlert({ open: true, message: response?.data?.message, type: "error" });
                    return { ok: false, files: [] };
                }
            }
            // clear local selected files on success
            setFiles([]);
            return { ok: true, files: newFiles };
        } catch (error) {
            setAlert({ open: true, message: 'Error uploading files', type: "error" });
            console.error("Error uploading files:", error);
            return { ok: false, files: [] };
        }
    };

    const submit = async (data) => {
        setLoading(true);

        // 1) Upload any newly picked files first
        const { ok, files: uploaded } = await uploadSelectedFiles();
        if (!ok) { setLoading(false); return; }

        const dueDateVal = dayjs(watch("dueDate")).isValid() ? dayjs(watch("dueDate")) : dayjs();
        const completedDateVal = dayjs(watch("completedDate")).isValid() ? dayjs(watch("completedDate")) : null;

        // 2) Combine existing (if editing) + newly uploaded
        const mergedImages = [
            ...(Array.isArray(existingImages) ? existingImages : []),
            ...uploaded
        ];
        const newData = {
            ...data,
            images: mergedImages, // <-- your API expects the array of uploadedFile objects
            dueDate: dueDateVal.format("MM/DD/YYYY"),
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
                if (parseInt(watch("createdBy")) === parseInt(userData?.userId)) {
                    const assignData = {
                        id: watch("assignedId"),
                        teamId: watch("assignedType") === 2 ? watch("teamId") : null,
                        customerId:
                            watch("assignedType") === 1
                                ? userData?.userId?.toString()
                                : watch("assignedType") === 2
                                    ? null
                                    : watch("customerId"),
                        customerIds: watch("assignedType") === 2 ? watch("customerIds") : [],
                        todoId: todoId,
                        removeCustomerIds: watch("removeCustomerIds") || [],
                        removeTeam: watch("removeTeam") || null,
                        status: status?.find(s => s.id === parseInt(watch("status")))?.title,
                        dueDate: dueDateVal.format("MM/DD/YYYY"),
                        complectedWork: parseInt(watch("complectedWork")) || 0
                    };
                    await assignTodo(assignData);
                } else {
                    const res = await updateTodo(todoId, newData);
                    if (res?.status === 200) { handleGetAllTodos(); onClose(); }
                    else setAlert({ open: true, message: res?.message || "Failed to update todo", type: "error" });
                }
            } else {
                const res = await createTodo(newData);
                if (res?.status === 201) {
                    const assignData = {
                        id: null,
                        teamId: watch("assignedType") === 2 ? watch("teamId") : null,
                        customerId:
                            watch("assignedType") === 1
                                ? userData?.userId?.toString()
                                : watch("assignedType") === 2
                                    ? null
                                    : watch("customerId"),
                        customerIds: watch("assignedType") === 2 ? watch("customerIds") : [],
                        todoId: res?.result?.id,
                        removeCustomerIds: watch("removeCustomerIds") || [],
                        removeTeam: watch("removeTeam") || null,
                        status: status?.find(s => s.id === parseInt(watch("status")))?.title,
                        dueDate: dueDateVal.format("MM/DD/YYYY"),
                        complectedWork: parseInt(watch("complectedWork")) || 0
                    };
                    await assignTodo(assignData);
                } else {
                    setAlert({ open: true, message: res?.message || "Failed to create todo", type: "error" });
                }
            }
        } catch (err) {
            setAlert({ open: true, message: err.message || "Something went wrong", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            <BootstrapDialog open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth='md'>
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
                        <div className='grid grid-cols-3 gap-6'>
                            <div className='col-span-2'>
                                <Controller
                                    name="task"
                                    control={control}
                                    rules={{
                                        required: "Task is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            disabled={todoId ? watch("createdBy") !== userData?.userId : false}
                                            {...field}
                                            label="Task"
                                            type={`text`}
                                            error={errors.task}
                                        />
                                    )}
                                />
                            </div>

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
                                            disabled={todoId ? watch("createdBy") !== userData?.userId : false}
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
                                                    disabled={todoId ? watch("createdBy") !== userData?.userId : false}
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
                                                        // disabled={todoId ? watch("createdBy") !== userData?.userId : false}
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
                                                            disabled={todoId ? watch("createdBy") !== userData?.userId : customers?.length === 0}
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
                                                    disabled={todoId ? watch("createdBy") !== userData?.userId : false}
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

                            <div className='col-span-3'>
                                <Controller
                                    name="comments"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            disabled={todoId ? watch("createdBy") !== userData?.userId : false}
                                            {...field}
                                            label="Comments"
                                            type={`text`}
                                            multiline={true}
                                            minRows={3}
                                        />
                                    )}
                                />
                            </div>

                            <div className="col-span-3">
                                <MultipleFileUpload
                                    files={files}
                                    setFiles={setFiles}
                                    setAlert={setAlert}
                                    setValue={setValue}
                                    existingImages={existingImages}
                                    setExistingImages={setExistingImages}
                                    type="todo"
                                    multiple={true}
                                    placeHolder="Attach files here"
                                    uploadedFiles={uploadedFiles}
                                />
                            </div>
                        </div>

                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type="submit" text={todoId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(AddTodo);