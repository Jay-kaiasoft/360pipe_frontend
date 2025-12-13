import React, { useEffect, useMemo, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../common/select/select';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { dateTimeFormatDB } from '../../../service/common/commonService';

const calRepeatEveryList = Array.from({ length: 99 }, (_, idx) => {
    const v = idx + 1;
    return { id: v, title: `${v}`, value: v };
});

const calRepeatEveryTypeList = [
    { id: 1, title: 'Day', value: 'day' },
    { id: 2, title: 'Week', value: 'week' },
    { id: 3, title: 'Month', value: 'month' },
    { id: 4, title: 'Year', value: 'year' },
];

const daysList = [
    { id: 1, title: 'Sunday', label: 'S' },
    { id: 2, title: 'Monday', label: 'M' },
    { id: 3, title: 'Tuesday', label: 'T' },
    { id: 4, title: 'Wednesday', label: 'W' },
    { id: 5, title: 'Thursday', label: 'T' },
    { id: 6, title: 'Friday', label: 'F' },
    { id: 7, title: 'Saturday', label: 'S' },
];

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function ModalRepeat({ setAlert, open, handleClose, values, setValues }) {
    const theme = useTheme();

    const setIfExists = (name, value) => {
        if (value !== undefined && value !== null && value !== '') {
            setValues(name, value, { shouldDirty: false, shouldValidate: false });
        }
    };

    const [repeatEveryId, setRepeatEveryId] = useState(1);
    const [repeatTypeId, setRepeatTypeId] = useState(1);
    const [selectedDays, setSelectedDays] = useState([]);

    const [seriesStart, setSeriesStart] = useState(null);
    const [seriesEnd, setSeriesEnd] = useState(null);

    const repeatEveryOption = useMemo(
        () => calRepeatEveryList.find((o) => o.id === repeatEveryId) || calRepeatEveryList[0],
        [repeatEveryId],
    );

    const repeatTypeOption = useMemo(
        () => calRepeatEveryTypeList.find((o) => o.id === repeatTypeId) || calRepeatEveryTypeList[0],
        [repeatTypeId],
    );

    const normalizeDateOnly = (d) => dayjs(dayjs(d).format('YYYY-MM-DD'));

    useEffect(() => {
        if (!open) return;

        // --- init start/end from parent values (keep time part from start/end, but date picker shows date only)
        const startVal = values?.start ? dayjs(values.start) : dayjs();
        const endVal = values?.calRepeatEndDate
            ? dayjs(values.calRepeatEndDate)
            : values?.end
                ? dayjs(values.end)
                : startVal.add(1, 'year');

        setSeriesStart(startVal);
        setSeriesEnd(endVal);

        // --- repeat every
        const ev = values?.calRepeatEvery ? Number(values.calRepeatEvery) : 1;
        const evMatch = calRepeatEveryList.find((o) => o.value === ev);
        setRepeatEveryId(evMatch ? evMatch.id : 1);

        // --- unit
        const unit = values?.calRepeatEveryType || null; // day|week|month|year
        const unitMatch = calRepeatEveryTypeList.find((o) => o.value === unit);
        setRepeatTypeId(unitMatch ? unitMatch.id : 1);

        // --- selected days for weekly
        if (values?.calRepeatDayName) {
            const arr = String(values.calRepeatDayName)
                .split(',')
                .map((v) => parseInt(v, 10))
                .filter((v) => !Number.isNaN(v));
            setSelectedDays(arr);
        } else if (values?.start) {
            const dow = dayjs(values.start).day(); // 0..6
            setSelectedDays([dow + 1]); // store 1..7
        } else {
            setSelectedDays([]);
        }

        // Keep these if already exist
        if (values) {
            setIfExists('calRepeatEvery', values.calRepeatEvery);
            setIfExists('calRepeatEveryType', values.calRepeatEveryType);
            setIfExists('calRepeatDayName', values.calRepeatDayName);
            setIfExists('calRepeatSelectedOption', values.calRepeatSelectedOption);
            if (values.calRepeatDate) setIfExists('calRepeatDate', values.calRepeatDate);
            if (values.calParentId) setIfExists('calParentId', values.calParentId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const toggleDay = (dayId) => {
        setSelectedDays((prev) =>
            prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId].sort((a, b) => a - b),
        );
    };

    const onClose = () => handleClose();

    const handleSave = () => {
        const repeatEvery = repeatEveryOption.value;
        const repeatEveryType = repeatTypeOption.value; // day|week|month|year

        if (!repeatEvery || repeatEvery <= 0) {
            setAlert({ severity: 'error', message: 'Please select a repeat interval.' });
            return;
        }
        if (!seriesStart) {
            setAlert({ severity: 'error', message: 'Please select a start date.' });
            return;
        }
        if (!seriesEnd) {
            setAlert({ severity: 'error', message: 'Please select an end date.' });
            return;
        }
        if (dayjs(seriesEnd).isBefore(dayjs(seriesStart), 'day')) {
            setAlert({ severity: 'error', message: 'End date cannot be before start date.' });
            return;
        }

        // --- write back to parent RHF ---
        setValues('calRepeatEvery', repeatEvery);
        setValues('calRepeatEveryType', repeatEveryType);

        if (repeatEveryType === 'week' && selectedDays.length > 0) {
            setValues('calRepeatDayName', selectedDays.join(','));
        } else {
            setValues('calRepeatDayName', null);
        }

        // calRepeatEndDate (keep date from picker, but time from start if possible)
        // If you want end time same as event start time, keep it as chosen in parent anyway.
        setValues('calRepeatEndDate', seriesEnd);

        if (repeatEveryType === 'month' || repeatEveryType === 'year') {
            setValues('calRepeatDate', dateTimeFormatDB(seriesStart)); // full datetime string
        } else {
            setValues('calRepeatDate', null);
        }

        // keep the actual event start/end in parent (don’t destroy time)
        setValues('start', seriesStart);
        setValues('end', values?.end ? dayjs(values.end) : seriesStart.add(30, 'minute'));

        handleClose();
    };

    const renderSummary = () => {
        const count = repeatEveryOption.value;
        const unitLabel = repeatTypeOption.title + (count > 1 ? 's' : '');
        let text = `Repeats every ${count} ${unitLabel}`;

        if (repeatTypeOption.value === 'week' && selectedDays.length) {
            const dayLabels = daysList
                .filter((d) => selectedDays.includes(d.id))
                .map((d) => d.title)
                .join(', ');
            text += ` on ${dayLabels}`;
        }

        if (seriesStart) text += ` starting ${dayjs(seriesStart).format('MM/DD/YYYY')}`;
        if (seriesEnd) text += ` until ${dayjs(seriesEnd).format('MM/DD/YYYY')}`;

        return text;
    };

    return (
        <React.Fragment>
            <BootstrapDialog open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="sm">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Repeat
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={() => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer text-black w-5 h-5" />
                </Components.IconButton>

                <div>
                    <Components.DialogContent dividers>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Start date"
                                            value={seriesStart ? normalizeDateOnly(seriesStart) : null}
                                            format="MM/DD/YYYY"
                                            onChange={(date) => {
                                                if (!date) return;
                                                // preserve time from old seriesStart
                                                const old = seriesStart ? dayjs(seriesStart) : dayjs();
                                                const merged = dayjs(date).hour(old.hour()).minute(old.minute()).second(old.second());
                                                setSeriesStart(merged);
                                            }}
                                            slotProps={{
                                                textField: {
                                                    variant: 'outlined',
                                                    size: 'small',
                                                    fullWidth: true,
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '4px',
                                                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                            '& fieldset': { borderColor: theme.palette.secondary?.main },
                                                            '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
                                                            '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
                                                        },
                                                        '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
                                                        '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                        '& .Mui-disabled': { color: theme.palette.text.primary },
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
                                        />
                                    </LocalizationProvider>

                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="End date"
                                            value={seriesEnd ? normalizeDateOnly(seriesEnd) : null}
                                            format="MM/DD/YYYY"
                                            minDate={seriesStart ? normalizeDateOnly(seriesStart) : undefined}
                                            onChange={(date) => {
                                                if (!date) return;
                                                // preserve time from old seriesEnd
                                                const old = seriesEnd ? dayjs(seriesEnd) : dayjs();
                                                const merged = dayjs(date).hour(old.hour()).minute(old.minute()).second(old.second());
                                                setSeriesEnd(merged);
                                            }}
                                            slotProps={{
                                                textField: {
                                                    variant: 'outlined',
                                                    size: 'small',
                                                    fullWidth: true,
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '4px',
                                                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                            '& fieldset': { borderColor: theme.palette.secondary?.main },
                                                            '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
                                                            '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
                                                        },
                                                        '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
                                                        '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                        '& .Mui-disabled': { color: theme.palette.text.primary },
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
                                        />
                                    </LocalizationProvider>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Select
                                        options={calRepeatEveryList}
                                        label="Repeat every"
                                        placeholder="Select"
                                        value={repeatEveryId}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) setRepeatEveryId(newValue.id);
                                        }}
                                    />
                                    <Select
                                        options={calRepeatEveryTypeList}
                                        label="Time unit"
                                        placeholder="Select"
                                        value={repeatTypeId}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) setRepeatTypeId(newValue.id);
                                        }}
                                    />
                                </div>

                                {repeatTypeOption.value === 'week' && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium text-gray-600">Repeat on</p>
                                        <div className="flex flex-wrap gap-2">
                                            {daysList.map((day) => {
                                                const isSelected = selectedDays.includes(day.id);
                                                return (
                                                    <button
                                                        key={day.id}
                                                        type="button"
                                                        onClick={() => toggleDay(day.id)}
                                                        className={`w-9 h-9 flex items-center justify-center rounded-full border text-sm font-medium transition
                              ${isSelected
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">{renderSummary()}</div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className="flex justify-end items-center gap-4 px-2">
                            <Button
                                type="button"
                                text={'Submit'}
                                onClick={handleSave}
                                endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css="cursor-pointer" />}
                            />
                            <Button
                                type="button"
                                text={'Cancel'}
                                useFor="disabled"
                                onClick={onClose}
                                startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer mr-2" />}
                            />
                        </div>
                    </Components.DialogActions>
                </div>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert };

export default connect(null, mapDispatchToProps)(ModalRepeat);


// import React, { useEffect, useState } from 'react';
// import { styled, useTheme } from '@mui/material/styles';
// import { connect } from 'react-redux';
// import dayjs from 'dayjs';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// import Components from '../../../components/muiComponents/components';
// import Button from '../../../components/common/buttons/button';
// import CustomIcons from '../../../components/common/icons/CustomIcons';
// import Select from '../../common/select/select';
// import { setAlert } from '../../../redux/commonReducers/commonReducers';
// import { dateTimeFormatDB } from '../../../service/common/commonService';

// const calRepeatEveryList = Array.from({ length: 99 }, (_, idx) => {
//     const v = idx + 1;
//     return {
//         id: v,
//         title: `${v}`,
//         value: v,
//     };
// });


// const calRepeatEveryTypeList = [
//     { id: 1, title: 'Day', value: 'day' },
//     { id: 2, title: 'Week', value: 'week' },
//     { id: 3, title: 'Month', value: 'month' },
//     { id: 4, title: 'Year', value: 'year' },
// ];

// const daysList = [
//     { id: 1, title: 'Sunday', label: 'S' },
//     { id: 2, title: 'Monday', label: 'M' },
//     { id: 3, title: 'Tuesday', label: 'T' },
//     { id: 4, title: 'Wednesday', label: 'W' },
//     { id: 5, title: 'Thursday', label: 'T' },
//     { id: 6, title: 'Friday', label: 'F' },
//     { id: 7, title: 'Saturday', label: 'S' },
// ];

// const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
//     '& .MuiDialogContent-root': {
//         padding: theme.spacing(2),
//     },
//     '& .MuiDialogActions-root': {
//         padding: theme.spacing(1),
//     },
// }));


// function ModalRepeat({ setAlert, open, handleClose, values, setValues }) {
//     const theme = useTheme();

//     const setIfExists = (name, value) => {
//         if (value !== undefined && value !== null && value !== "") {
//             setValues(name, value, { shouldDirty: false, shouldValidate: false });
//         }
//     };
//     // local UI state
//     const [repeatEveryId, setRepeatEveryId] = useState(1); // maps to calRepeatEveryList.id
//     const [repeatTypeId, setRepeatTypeId] = useState(1); // maps to calRepeatEveryTypeList.id
//     const [selectedDays, setSelectedDays] = useState([]); // [1..7]

//     // NEW: start & end of series
//     const [seriesStart, setSeriesStart] = useState(null);
//     const [seriesEnd, setSeriesEnd] = useState(null);

//     const repeatEveryOption =
//         calRepeatEveryList.find((o) => o.id === repeatEveryId) || calRepeatEveryList[0];
//     const repeatTypeOption =
//         calRepeatEveryTypeList.find((o) => o.id === repeatTypeId) || calRepeatEveryTypeList[0];

//     useEffect(() => {
//         if (!open) return;

//         if (values) {
//             setIfExists("calRepeatType", values.calRepeatType);
//             setIfExists("calRepeatEvery", values.calRepeatEvery);
//             setIfExists("calRepeatEveryType", values.calRepeatEveryType);
//             setIfExists("calRepeatDayName", values.calRepeatDayName);
//             setIfExists("calRepeatSelectedOption", values.calRepeatSelectedOption);

//             if (values.calRepeatEndDate) {
//                 const repEnd = dayjs(values.calRepeatEndDate, "MM/DD/YYYY HH:mm:ss", true);
//                 if (repEnd.isValid()) setValues("calRepeatEndDate", repEnd, { shouldDirty: false });
//             }

//             if (values.calRepeatDate) {
//                 setIfExists("calRepeatDate", values.calRepeatDate);
//             }

//             if (values.calParentId) {
//                 setIfExists("calParentId", values.calParentId);
//             }

//         } else {
//             if (!values?.calRepeatType) {
//                 setValues("calRepeatType", 1, { shouldDirty: false });
//             }
//         }

//     }, [open, values]);

//     // useEffect(() => {
//     //     if (!open) return;

//     //     // repeat every
//     //     if (values?.calRepeatEvery) {
//     //         const match = calRepeatEveryList.find(
//     //             (o) => o.value === Number(values.calRepeatEvery),
//     //         );
//     //         setRepeatEveryId(match ? match.id : 1);
//     //     } else {
//     //         setRepeatEveryId(1);
//     //     }

//     //     // repeat type (days/weeks/months/years)
//     //     if (values?.calRepeatEveryType) {
//     //         const matchType = calRepeatEveryTypeList.find(
//     //             (o) => o.value === values.calRepeatEveryType,
//     //         );
//     //         setRepeatTypeId(matchType ? matchType.id : 1);
//     //     } else {
//     //         // default from calRepeatType (Daily / Weekly / Monthly / Yearly)
//     //         let defaultTypeVal = 'days';
//     //         switch (values?.calRepeatType) {
//     //             case 3: // Weekly
//     //                 defaultTypeVal = 'weeks';
//     //                 break;
//     //             case 4: // Monthly
//     //                 defaultTypeVal = 'months';
//     //                 break;
//     //             case 5: // Yearly
//     //                 defaultTypeVal = 'years';
//     //                 break;
//     //             default:
//     //                 defaultTypeVal = 'days';
//     //         }
//     //         const matchType = calRepeatEveryTypeList.find(
//     //             (o) => o.value === defaultTypeVal,
//     //         );
//     //         setRepeatTypeId(matchType ? matchType.id : 1);
//     //     }

//     //     // selected days (for weekly)
//     //     if (values?.calRepeatDayName) {
//     //         const arr = String(values.calRepeatDayName)
//     //             .split(',')
//     //             .map((v) => parseInt(v, 10))
//     //             .filter((v) => !Number.isNaN(v));
//     //         setSelectedDays(arr);
//     //     } else if (values?.start) {
//     //         const d = dayjs(values.start);
//     //         const dow = d.day(); // 0..6
//     //         setSelectedDays([dow + 1]); // store as 1..7
//     //     } else {
//     //         setSelectedDays([]);
//     //     }

//     //     // Normalize date to remove timezone shifts
//     //     const normalize = (d) => dayjs(dayjs(d).format("YYYY-MM-DD"));

//     //     // NEW: series start & end
//     //     let startVal = values?.start ? normalize(values.start) : normalize(dayjs());

//     //     // If no end date set → default = +1 year from START DATE
//     //     let endVal;

//     //     if (values?.calRepeatEndDate) {
//     //         endVal = normalize(values.calRepeatEndDate);
//     //     } else if (values?.end) {
//     //         endVal = normalize(values.end);
//     //     } else {
//     //         endVal = normalize(startVal.add(1, "year"));
//     //     }

//     //     setSeriesStart(startVal);
//     //     setSeriesEnd(endVal);


//     // }, [open, values]);

//     const onClose = () => {
//         handleClose();
//     };

//     const toggleDay = (dayId) => {
//         setSelectedDays((prev) =>
//             prev.includes(dayId)
//                 ? prev.filter((id) => id !== dayId)
//                 : [...prev, dayId].sort((a, b) => a - b),
//         );
//     };

//     const handleSave = () => {
//         const repeatEvery = repeatEveryOption.value;
//         const repeatEveryType = repeatTypeOption.value;

//         if (!repeatEvery || repeatEvery <= 0) {
//             setAlert({ severity: 'error', message: 'Please select a repeat interval.' });
//             return;
//         }

//         if (!seriesStart) {
//             setAlert({ severity: 'error', message: 'Please select a start date.' });
//             return;
//         }
//         if (!seriesEnd) {
//             setAlert({ severity: 'error', message: 'Please select an end date.' });
//             return;
//         }
//         if (seriesEnd.isBefore(seriesStart, 'day')) {
//             setAlert({
//                 severity: 'error',
//                 message: 'End date cannot be before start date.',
//             });
//             return;
//         }

//         // write recurrence info
//         setValues('calRepeatEvery', repeatEvery);
//         setValues('calRepeatEveryType', repeatEveryType);

//         if (repeatEveryType === 'weeks' && selectedDays.length > 0) {
//             console.log("selectedDays", selectedDays)
//             setValues('calRepeatDayName', selectedDays.join(','));
//         } else {
//             setValues('calRepeatDayName', null);
//         }

//         // store end date in repeat metadata if needed
//         setValues('calRepeatEndDate', seriesEnd);

//         // for monthly / yearly, store day-of-month
//         if (repeatEveryType === 'months' || repeatEveryType === 'years') {
//             const d = seriesStart;
//             setValues('calRepeatDate', dateTimeFormatDB(d)); // 1..31
//         } else {
//             setValues('calRepeatDate', null);
//         }

//         // also update main start/end on the parent form
//         setValues('start', seriesStart);
//         setValues('end', seriesEnd);

//         handleClose();
//     };

//     const renderSummary = () => {
//         const count = repeatEveryOption.value;
//         const unitLabel = repeatTypeOption.title + (count > 1 ? 's' : '');
//         let text = `Repeats every ${count} ${unitLabel}`;

//         if (repeatEveryOption.value && repeatTypeOption.value === 'weeks' && selectedDays.length) {
//             const dayLabels = daysList
//                 .filter((d) => selectedDays.includes(d.id))
//                 .map((d) => d.title)
//                 .join(', ');
//             text += ` on ${dayLabels}`;
//         }

//         if (seriesStart) {
//             text += ` starting ${seriesStart.format('MM/DD/YYYY')}`;
//         }
//         if (seriesEnd) {
//             text += ` until ${seriesEnd.format('MM/DD/YYYY')}`;
//         }

//         return text;
//     };

//     return (
//         <React.Fragment>
//             <BootstrapDialog
//                 open={open}
//                 aria-labelledby="customized-dialog-title"
//                 fullWidth
//                 maxWidth="sm"
//             >
//                 <Components.DialogTitle
//                     sx={{ m: 0, p: 2, color: theme.palette.text.primary }}
//                     id="customized-dialog-title"
//                 >
//                     Repeat
//                 </Components.DialogTitle>

//                 <Components.IconButton
//                     aria-label="close"
//                     onClick={onClose}
//                     sx={(theme) => ({
//                         position: 'absolute',
//                         right: 8,
//                         top: 8,
//                         color: theme.palette.primary.icon,
//                     })}
//                 >
//                     <CustomIcons
//                         iconName={'fa-solid fa-xmark'}
//                         css="cursor-pointer text-black w-5 h-5"
//                     />
//                 </Components.IconButton>

//                 <div>
//                     <Components.DialogContent dividers>
//                         <div className="flex flex-col gap-6">
//                             {/* NEW: Start & End dates */}
//                             <div className="flex flex-col gap-3">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                                         <DatePicker
//                                             label="Start date"
//                                             value={seriesStart}
//                                             format="MM/DD/YYYY"
//                                             onChange={(date) => setSeriesStart(date)}
//                                             slotProps={{
//                                                 textField: {
//                                                     variant: 'outlined',
//                                                     size: 'small',
//                                                     fullWidth: true,
//                                                     sx: {
//                                                         '& .MuiOutlinedInput-root':
//                                                         {
//                                                             borderRadius:
//                                                                 '4px',
//                                                             transition:
//                                                                 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
//                                                             '& fieldset':
//                                                             {
//                                                                 borderColor:
//                                                                     theme
//                                                                         .palette
//                                                                         .secondary
//                                                                         ?.main,
//                                                             },
//                                                             '&:hover fieldset':
//                                                             {
//                                                                 borderColor:
//                                                                     theme
//                                                                         .palette
//                                                                         .secondary
//                                                                         ?.main,
//                                                             },
//                                                             '&.Mui-focused fieldset':
//                                                             {
//                                                                 borderColor:
//                                                                     theme
//                                                                         .palette
//                                                                         .secondary
//                                                                         ?.main,
//                                                             },
//                                                         },
//                                                         '& .MuiInputLabel-root':
//                                                         {
//                                                             color: theme
//                                                                 .palette
//                                                                 .text
//                                                                 .primary,
//                                                             textTransform:
//                                                                 'capitalize',
//                                                         },
//                                                         '& .MuiInputLabel-root.Mui-focused':
//                                                         {
//                                                             color: theme
//                                                                 .palette
//                                                                 .text
//                                                                 .primary,
//                                                         },
//                                                         '& .MuiInputBase-input':
//                                                         {
//                                                             color: theme
//                                                                 .palette
//                                                                 .text
//                                                                 .primary,
//                                                         },
//                                                         '& .Mui-disabled': {
//                                                             color: theme
//                                                                 .palette
//                                                                 .text
//                                                                 .primary,
//                                                         },
//                                                         '& .MuiFormHelperText-root':
//                                                         {
//                                                             color: theme
//                                                                 .palette
//                                                                 .error
//                                                                 .main,
//                                                             fontSize:
//                                                                 '14px',
//                                                             fontWeight:
//                                                                 '500',
//                                                             marginX: 0.5,
//                                                         },
//                                                         fontFamily:
//                                                             '"Inter", sans-serif',
//                                                     },
//                                                 },
//                                             }}
//                                         />
//                                     </LocalizationProvider>

//                                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                                         <DatePicker
//                                             label="End date"
//                                             value={seriesEnd}
//                                             format="MM/DD/YYYY"
//                                             minDate={seriesStart || undefined}
//                                             onChange={(date) => setSeriesEnd(date)}
//                                             slotProps={{
//                                                 textField: {
//                                                     variant: 'outlined',
//                                                     size: 'small',
//                                                     fullWidth: true,
//                                                     sx: {
//                                                         '& .MuiOutlinedInput-root':
//                                                         {
//                                                             borderRadius:
//                                                                 '4px',
//                                                             transition:
//                                                                 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
//                                                             '& fieldset':
//                                                             {
//                                                                 borderColor:
//                                                                     theme
//                                                                         .palette
//                                                                         .secondary
//                                                                         ?.main,
//                                                             },
//                                                             '&:hover fieldset':
//                                                             {
//                                                                 borderColor:
//                                                                     theme
//                                                                         .palette
//                                                                         .secondary
//                                                                         ?.main,
//                                                             },
//                                                             '&.Mui-focused fieldset':
//                                                             {
//                                                                 borderColor:
//                                                                     theme
//                                                                         .palette
//                                                                         .secondary
//                                                                         ?.main,
//                                                             },
//                                                         },
//                                                         '& .MuiInputLabel-root':
//                                                         {
//                                                             color: theme
//                                                                 .palette
//                                                                 .text
//                                                                 .primary,
//                                                             textTransform:
//                                                                 'capitalize',
//                                                         },
//                                                         '& .MuiInputLabel-root.Mui-focused':
//                                                         {
//                                                             color: theme
//                                                                 .palette
//                                                                 .text
//                                                                 .primary,
//                                                         },
//                                                         '& .MuiInputBase-input':
//                                                         {
//                                                             color: theme
//                                                                 .palette
//                                                                 .text
//                                                                 .primary,
//                                                         },
//                                                         '& .Mui-disabled': {
//                                                             color: theme
//                                                                 .palette
//                                                                 .text
//                                                                 .primary,
//                                                         },
//                                                         '& .MuiFormHelperText-root':
//                                                         {
//                                                             color: theme
//                                                                 .palette
//                                                                 .error
//                                                                 .main,
//                                                             fontSize:
//                                                                 '14px',
//                                                             fontWeight:
//                                                                 '500',
//                                                             marginX: 0.5,
//                                                         },
//                                                         fontFamily:
//                                                             '"Inter", sans-serif',
//                                                     },
//                                                 },
//                                             }}
//                                         />
//                                     </LocalizationProvider>
//                                 </div>
//                             </div>

//                             {/* Repeat pattern */}
//                             <div className="flex flex-col gap-3">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                     <Select
//                                         options={calRepeatEveryList}
//                                         label="Repeat every"
//                                         placeholder="Select"
//                                         value={repeatEveryId}
//                                         onChange={(_, newValue) => {
//                                             if (newValue?.id) setRepeatEveryId(newValue.id);
//                                         }}
//                                     />
//                                     <Select
//                                         options={calRepeatEveryTypeList}
//                                         label="Time unit"
//                                         placeholder="Select"
//                                         value={repeatTypeId}
//                                         onChange={(_, newValue) => {
//                                             if (newValue?.id) setRepeatTypeId(newValue.id);
//                                         }}
//                                     />
//                                 </div>

//                                 {/* Weekly days selector */}
//                                 {repeatTypeOption.value === 'weeks' && (
//                                     <div className="flex flex-col gap-2">
//                                         <p className="text-xs font-medium text-gray-600">
//                                             Repeat on
//                                         </p>
//                                         <div className="flex flex-wrap gap-2">
//                                             {daysList.map((day) => {
//                                                 const isSelected = selectedDays.includes(day.id);
//                                                 return (
//                                                     <button
//                                                         key={day.id}
//                                                         type="button"
//                                                         onClick={() => toggleDay(day.id)}
//                                                         className={`w-9 h-9 flex items-center justify-center rounded-full border text-sm font-medium transition
//                                                         ${isSelected
//                                                                 ? 'bg-blue-600 text-white border-blue-600'
//                                                                 : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
//                                                             }`}
//                                                     >
//                                                         {day.label}
//                                                     </button>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Summary */}
//                             <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
//                                 {renderSummary()}
//                             </div>
//                         </div>
//                     </Components.DialogContent>

//                     <Components.DialogActions>
//                         <div className="flex justify-end items-center gap-4 px-2">
//                             <Button
//                                 type="button"
//                                 text={'Submit'}
//                                 onClick={handleSave}
//                                 endIcon={
//                                     <CustomIcons
//                                         iconName={'fa-solid fa-floppy-disk'}
//                                         css="cursor-pointer"
//                                     />
//                                 }
//                             />
//                             <Button
//                                 type="button"
//                                 text={'Cancel'}
//                                 useFor="disabled"
//                                 onClick={onClose}
//                                 startIcon={
//                                     <CustomIcons
//                                         iconName={'fa-solid fa-xmark'}
//                                         css="cursor-pointer mr-2"
//                                     />
//                                 }
//                             />
//                         </div>
//                     </Components.DialogActions>
//                 </div>
//             </BootstrapDialog>
//         </React.Fragment>
//     );
// }

// const mapDispatchToProps = {
//     setAlert,
// };

// export default connect(null, mapDispatchToProps)(ModalRepeat);
