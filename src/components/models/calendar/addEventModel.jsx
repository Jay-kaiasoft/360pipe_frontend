import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import { Editor } from 'react-draft-wysiwyg';
import {
    EditorState,
    ContentState,
    convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import ModalRepeat from './modalRepeat';
import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import { getTimeZones } from '../../../service/timeZones/timeZoneService';
import Checkbox from '../../common/checkBox/checkbox';
import Select from '../../common/select/select';
import { dateTimeFormatDB, userTimeZone } from '../../../service/common/commonService';
import { getEventById, saveEvents } from '../../../service/calendar/calendarService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const toolbarProperties = {
    options: ['inline', 'list', 'link', 'history'],
    inline: {
        options: ['bold', 'italic', 'underline', 'strikethrough'],
    },
    list: {
        options: ['unordered', 'ordered'],
    },
};

const repeatList = [
    {
        id: 1,
        title: "Don't repeat",
        value: "donotrepeat",
    },
    {
        id: 2,
        title: 'Daily',
        value: "day",
    },
    {
        id: 3,
        title: 'Weekly',
        value: "week",
    },
    {
        id: 4,
        title: 'Monthly',
        value: "month",
    },
    {
        id: 5,
        title: 'Yearly',
        value: "year",
    },
    {
        id: 6,
        title: 'Custom',
        value: "custom",
    },
];

function AddEventModel({
    setAlert,
    open,
    handleClose,
    slotInfo,
    handleGetAllEvents,
}) {
    const theme = useTheme();

    const [openRepeat, setOpenRepeat] = useState(false);
    const [editAll, setEditAll] = useState(false);

    const [loading, setLoading] = useState(false);
    const [timeZones, setTimeZones] = useState([]);
    const [editorState, setEditorState] = useState(
        EditorState.createEmpty(),
    );

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: null,
            customerId: null,
            title: null,
            description: null,
            start: null,
            end: null,
            allDay: false,
            calTimeZone: null,
            calAttendees: null,
            slotMember: null,
            calAetId: null,

            slotTimeMinus: null,
            contactList: null,

            displayStart: null,
            displayEnd: null,

            calType: null,
            currentDateYN: null,
            memTimeZone: null,

            calEventReminder: null,
            calReminderSubject: null,
            calReminderType: null,
            calMyPageId: null,
            calSmsSstId: null,
            calScheduleDateTime: null,

            calParentId: null,
            calRepeatEvery: null,
            calRepeatType: 1,
            calRepeatEveryType: null,
            calRepeatDayName: null,
            calRepeatEndDate: null,
            calRepeatDate: null,
            calRepeatSelectedOption: null,
            editAll: null,
        },
    });

    const handleCloseRepeatModel = () => {
        setOpenRepeat(false);
    };

    const onClose = () => {
        setTimeZones([])
        setEditAll(false)
        setLoading(false);
        reset({
            id: null,
            customerId: null,
            title: null,
            description: null,
            start: null,
            end: null,
            allDay: false,
            calTimeZone: null,
            calAttendees: null,
            slotMember: null,
            calAetId: null,

            slotTimeMinus: null,
            contactList: null,

            displayStart: null,
            displayEnd: null,

            calType: null,
            currentDateYN: null,
            memTimeZone: null,

            calEventReminder: null,
            calReminderSubject: null,
            calReminderType: null,
            calMyPageId: null,
            calSmsSstId: null,
            calScheduleDateTime: null,

            calParentId: null,
            calRepeatEvery: null,
            calRepeatType: 1,
            calRepeatEveryType: null,
            calRepeatDayName: null,
            calRepeatEndDate: null,
            calRepeatDate: null,
            calRepeatSelectedOption: null,
            editAll: null,
        });
        handleClose();
    };

    const handleGetAllTimeZones = async () => {
        const res = await getTimeZones();
        if (res.result) {
            const data = res?.result?.map((item) => ({
                id: item.tmzId,
                title: item.tmzTitle,
                value: item.tmzValue,
            }));
            setTimeZones(data);
        }
    };

    const handleGetEvent = async () => {
        if (open && slotInfo?.id) {
            const res = await getEventById(userTimeZone, slotInfo.id);

            if (res?.status === 200 && res?.result?.event) {
                const event = res.result.event;
                setEditAll(true)
                // ---- dates (string → dayjs) ----
                const start = event.start
                    ? dayjs(event.start, "MM/DD/YYYY HH:mm:ss")
                    : null;

                const end = event.end
                    ? dayjs(event.end, "MM/DD/YYYY HH:mm:ss")
                    : null;

                // ---- set form values safely ----
                setValue("id", event.id);
                setValue("title", event.title);
                setValue("allDay", !!event.allDay);

                setValue("start", start);
                setValue("end", end);
                setValue("calTimeZone", timeZones?.find(row => row.value === event.calTimeZone)?.id || null);
                setValue("calAttendees", event.calAttendees ?? null);
                setValue("calAetId", event.calAetId ?? null);

                setValue("calParentId", event.calParentId ?? null);
                setValue("calRepeatEvery", event.calRepeatEvery ?? null);
                setValue("calRepeatType", repeatList?.find(row => row.value === event.calRepeatType)?.id || 1);
                setValue("calRepeatEveryType", event.calRepeatEveryType ?? null);
                setValue("calRepeatDayName", event.calRepeatDayName ?? null);

                setValue(
                    "calRepeatEndDate",
                    event.calRepeatEndDate
                        ? dayjs(event.calRepeatEndDate, "MM/DD/YYYY HH:mm:ss")
                        : null
                );

                setValue("calRepeatDate", event.calRepeatDate ?? null);
                setValue("calRepeatSelectedOption", event.calRepeatSelectedOption ?? null);

                // ---- description (HTML → EditorState) ----
                if (event.description) {
                    const contentBlock = htmlToDraft(event.description);
                    const contentState = ContentState.createFromBlockArray(
                        contentBlock.contentBlocks
                    );
                    setEditorState(EditorState.createWithContent(contentState));
                } else {
                    setEditorState(EditorState.createEmpty());
                }
            } else {
                const startDate =
                    slotInfo?.start instanceof Date
                        ? dayjs(slotInfo.start)
                        : slotInfo?.start
                            ? dayjs(slotInfo.start)
                            : null;

                const endDate =
                    slotInfo?.end instanceof Date
                        ? dayjs(slotInfo.end)
                        : slotInfo?.end
                            ? dayjs(slotInfo.end)
                            : null;

                setValue('start', startDate);
                setValue('end', endDate);
            }
        } else {
            const startDate =
                slotInfo?.start instanceof Date
                    ? dayjs(slotInfo.start)
                    : slotInfo?.start
                        ? dayjs(slotInfo.start)
                        : null;

            const endDate =
                slotInfo?.end instanceof Date
                    ? dayjs(slotInfo.end)
                    : slotInfo?.end
                        ? dayjs(slotInfo.end)
                        : null;

            setValue('start', startDate);
            setValue('end', endDate);
        }
    };

    useEffect(() => {
        if (open) {
            handleGetAllTimeZones();
            handleGetEvent()
        }
    }, [open, slotInfo, setValue]);

    const submit = async () => {
        const allValues = getValues()
        const payload = {
            ...allValues,
            description: draftToHtml(convertToRaw(editorState.getCurrentContent())),
            start: dateTimeFormatDB(watch("start")),
            end: dateTimeFormatDB(watch("end")),
            calTimeZone: timeZones?.find(row => row.id === parseInt(watch("calTimeZone")))?.value || null,
            calRepeatEndDate: dateTimeFormatDB(watch("calRepeatEndDate")),
            calRepeatType: repeatList?.find(row => row.id === parseInt(watch("calRepeatType")))?.value || null,
            editAll: (editAll && watch("calRepeatType") !== null && watch("calRepeatType") !== "donotrepeat") ? "Y" : "N"
        }
        const res = await saveEvents(payload);
        if (res.status === 200) {
            setAlert({
                open: true,
                message: res?.message,
                type: "success"
            })
            handleGetAllEvents()
            onClose()
        } else {
            setAlert({
                open: true,
                message: res?.message,
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
                maxWidth="sm"
            >
                <Components.DialogTitle
                    sx={{ m: 0, p: 2, color: theme.palette.text.primary }}
                    id="customized-dialog-title"
                >
                    {watch("id") ? "Update Event" : "Add Event"}
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
                    <CustomIcons
                        iconName={'fa-solid fa-xmark'}
                        css="cursor-pointer text-black w-5 h-5"
                    />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Controller
                                    name="title"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Title"
                                            type="text"
                                            error={errors.title}
                                        />
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start Date"
                                        value={watch('start')}
                                        format="MM/DD/YYYY"
                                        onChange={(date) => {
                                            setValue('start', date);
                                        }}
                                        slotProps={{
                                            textField: {
                                                variant: 'outlined',
                                                size: 'small',
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        transition:
                                                            'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                        '& fieldset': {
                                                            borderColor:
                                                                theme.palette.secondary
                                                                    ?.main,
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor:
                                                                theme.palette.secondary
                                                                    ?.main,
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor:
                                                                theme.palette.secondary
                                                                    ?.main,
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: theme.palette.text.primary,
                                                        textTransform: 'capitalize',
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: theme.palette.text.primary,
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        color: theme.palette.text.primary,
                                                    },
                                                    '& .Mui-disabled': {
                                                        color: theme.palette.text.primary,
                                                    },
                                                    '& .MuiFormHelperText-root': {
                                                        color: theme.palette.error.main,
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        marginX: 0.5,
                                                    },
                                                    fontFamily: '"Inter", sans-serif',
                                                },
                                            },
                                        }}
                                        minDate={dayjs()}
                                    />
                                </LocalizationProvider>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="End Date"
                                        value={watch('end')}
                                        format="MM/DD/YYYY"
                                        onChange={(date) => {
                                            setValue('end', date);
                                        }}
                                        slotProps={{
                                            textField: {
                                                variant: 'outlined',
                                                size: 'small',
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        transition:
                                                            'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                        '& fieldset': {
                                                            borderColor:
                                                                theme.palette.secondary
                                                                    ?.main,
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor:
                                                                theme.palette.secondary
                                                                    ?.main,
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor:
                                                                theme.palette.secondary
                                                                    ?.main,
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: theme.palette.text.primary,
                                                        textTransform: 'capitalize',
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: theme.palette.text.primary,
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        color: theme.palette.text.primary,
                                                    },
                                                    '& .Mui-disabled': {
                                                        color: theme.palette.text.primary,
                                                    },
                                                    '& .MuiFormHelperText-root': {
                                                        color: theme.palette.error.main,
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        marginX: 0.5,
                                                    },
                                                    fontFamily: '"Inter", sans-serif',
                                                },
                                            },
                                        }}
                                        minDate={watch('start') || dayjs()}
                                    />
                                </LocalizationProvider>
                            </div>

                            <div className="w-24">
                                <Controller
                                    name="allDay"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            text={'All Day'}
                                            checked={!!field.value}
                                            onChange={(e) =>
                                                setValue(
                                                    'allDay',
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                    )}
                                />
                            </div>

                            {!watch('allDay') && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Controller
                                                name="start"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <TimePicker
                                                            label="Start Time"
                                                            value={watch('start')}
                                                            onChange={(time) => {
                                                                setValue('start', time);
                                                            }}
                                                            slotProps={{
                                                                textField: {
                                                                    variant: 'outlined',
                                                                    size: 'small',
                                                                    fullWidth: true,
                                                                    sx: {
                                                                        '& .MuiOutlinedInput-root':
                                                                        {
                                                                            borderRadius:
                                                                                '4px',
                                                                            transition:
                                                                                'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                                            '& fieldset':
                                                                            {
                                                                                borderColor:
                                                                                    theme
                                                                                        .palette
                                                                                        .secondary
                                                                                        ?.main,
                                                                            },
                                                                            '&:hover fieldset':
                                                                            {
                                                                                borderColor:
                                                                                    theme
                                                                                        .palette
                                                                                        .secondary
                                                                                        ?.main,
                                                                            },
                                                                            '&.Mui-focused fieldset':
                                                                            {
                                                                                borderColor:
                                                                                    theme
                                                                                        .palette
                                                                                        .secondary
                                                                                        ?.main,
                                                                            },
                                                                        },
                                                                        '& .MuiInputLabel-root':
                                                                        {
                                                                            color: theme
                                                                                .palette
                                                                                .text
                                                                                .primary,
                                                                            textTransform:
                                                                                'capitalize',
                                                                        },
                                                                        '& .MuiInputLabel-root.Mui-focused':
                                                                        {
                                                                            color: theme
                                                                                .palette
                                                                                .text
                                                                                .primary,
                                                                        },
                                                                        '& .MuiInputBase-input':
                                                                        {
                                                                            color: theme
                                                                                .palette
                                                                                .text
                                                                                .primary,
                                                                        },
                                                                        '& .Mui-disabled': {
                                                                            color: theme
                                                                                .palette
                                                                                .text
                                                                                .primary,
                                                                        },
                                                                        '& .MuiFormHelperText-root':
                                                                        {
                                                                            color: theme
                                                                                .palette
                                                                                .error
                                                                                .main,
                                                                            fontSize:
                                                                                '14px',
                                                                            fontWeight:
                                                                                '500',
                                                                            marginX: 0.5,
                                                                        },
                                                                        fontFamily:
                                                                            '"Inter", sans-serif',
                                                                    },
                                                                },
                                                            }}
                                                            minTime={dayjs()}
                                                        />
                                                    </LocalizationProvider>
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <Controller
                                                name="end"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <TimePicker
                                                            label="End Time"
                                                            value={watch('end')}
                                                            onChange={(time) => {
                                                                setValue('end', time);
                                                            }}
                                                            slotProps={{
                                                                textField: {
                                                                    variant: 'outlined',
                                                                    size: 'small',
                                                                    fullWidth: true,
                                                                    sx: {
                                                                        '& .MuiOutlinedInput-root':
                                                                        {
                                                                            borderRadius:
                                                                                '4px',
                                                                            transition:
                                                                                'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                                            '& fieldset':
                                                                            {
                                                                                borderColor:
                                                                                    theme
                                                                                        .palette
                                                                                        .secondary
                                                                                        ?.main,
                                                                            },
                                                                            '&:hover fieldset':
                                                                            {
                                                                                borderColor:
                                                                                    theme
                                                                                        .palette
                                                                                        .secondary
                                                                                        ?.main,
                                                                            },
                                                                            '&.Mui-focused fieldset':
                                                                            {
                                                                                borderColor:
                                                                                    theme
                                                                                        .palette
                                                                                        .secondary
                                                                                        ?.main,
                                                                            },
                                                                        },
                                                                        '& .MuiInputLabel-root':
                                                                        {
                                                                            color: theme
                                                                                .palette
                                                                                .text
                                                                                .primary,
                                                                            textTransform:
                                                                                'capitalize',
                                                                        },
                                                                        '& .MuiInputLabel-root.Mui-focused':
                                                                        {
                                                                            color: theme
                                                                                .palette
                                                                                .text
                                                                                .primary,
                                                                        },
                                                                        '& .MuiInputBase-input':
                                                                        {
                                                                            color: theme
                                                                                .palette
                                                                                .text
                                                                                .primary,
                                                                        },
                                                                        '& .Mui-disabled': {
                                                                            color: theme
                                                                                .palette
                                                                                .text
                                                                                .primary,
                                                                        },
                                                                        '& .MuiFormHelperText-root':
                                                                        {
                                                                            color: theme
                                                                                .palette
                                                                                .error
                                                                                .main,
                                                                            fontSize:
                                                                                '14px',
                                                                            fontWeight:
                                                                                '500',
                                                                            marginX: 0.5,
                                                                        },
                                                                        fontFamily:
                                                                            '"Inter", sans-serif',
                                                                    },
                                                                },
                                                            }}
                                                            minTime={
                                                                watch('start') || dayjs()
                                                            }
                                                        />
                                                    </LocalizationProvider>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Controller
                                            name="calTimeZone"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Select
                                                    options={timeZones}
                                                    label={'Time Zone'}
                                                    placeholder="Select timezone"
                                                    value={
                                                        watch('calTimeZone')
                                                            ? parseInt(
                                                                watch('calTimeZone'),
                                                            )
                                                            : null
                                                    }
                                                    onChange={(_, newValue) => {
                                                        if (newValue?.id) {
                                                            field.onChange(newValue.id);
                                                        } else {
                                                            setValue(
                                                                'calTimeZone',
                                                                null,
                                                            );
                                                        }
                                                    }}
                                                    error={errors?.calTimeZone}
                                                />
                                            )}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Repeat type selector -> opens modal */}
                            <div>
                                <Controller
                                    name="calRepeatType"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            options={repeatList}
                                            label={'Repeat Type'}
                                            placeholder="Select repeat type"
                                            value={
                                                watch('calRepeatType')
                                                    ? parseInt(
                                                        watch('calRepeatType'),
                                                    )
                                                    : null
                                            }
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);

                                                    if (newValue.id === 1) {
                                                        // Don't repeat → clear recurrence fields
                                                        setValue(
                                                            'calRepeatEvery',
                                                            null,
                                                        );
                                                        setValue(
                                                            'calRepeatEveryType',
                                                            null,
                                                        );
                                                        setValue(
                                                            'calRepeatDayName',
                                                            null,
                                                        );
                                                        setValue(
                                                            'calRepeatEndDate',
                                                            null,
                                                        );
                                                        setValue(
                                                            'calRepeatDate',
                                                            null,
                                                        );
                                                        setValue(
                                                            'calRepeatSelectedOption',
                                                            null,
                                                        );
                                                    } else {
                                                        // open detailed repeat modal
                                                        setOpenRepeat(true);
                                                    }
                                                } else {
                                                    setValue(
                                                        'calRepeatType',
                                                        null,
                                                    );
                                                }
                                            }}
                                            error={errors?.calRepeatType}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Editor
                                    editorState={editorState}
                                    wrapperClassName="wrapper-class d-inline-block"
                                    editorClassName="editor-class"
                                    toolbarClassName="toolbar-class"
                                    onEditorStateChange={(state) => {
                                        setEditorState(state);
                                    }}
                                    toolbar={toolbarProperties}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className="flex justify-end items-center gap-4">
                            <Button
                                type="submit"
                                text={'Save'}
                                isLoading={loading}
                                endIcon={
                                    <CustomIcons
                                        iconName={'fa-solid fa-floppy-disk'}
                                        css="cursor-pointer"
                                    />
                                }
                            />
                            {
                                (editAll && watch("calRepeatType") !== null && watch("calRepeatType") !== "donotrepeat") && (
                                    <Button
                                        type="submit"
                                        text={'Save All'}
                                        isLoading={loading}
                                        endIcon={
                                            <CustomIcons
                                                iconName={'fa-solid fa-floppy-disk'}
                                                css="cursor-pointer"
                                            />
                                        }
                                    />
                                )
                            }
                            <Button
                                type="button"
                                text={'Cancel'}
                                disabled={loading}
                                useFor="disabled"
                                onClick={onClose}
                                startIcon={
                                    <CustomIcons
                                        iconName={'fa-solid fa-xmark'}
                                        css="cursor-pointer mr-2"
                                    />
                                }
                            />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>

            {/* Repeat configuration modal – reads/writes form values */}
            <ModalRepeat
                open={openRepeat}
                handleClose={handleCloseRepeatModel}
                values={getValues()}
                setValues={setValue}
            />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AddEventModel);