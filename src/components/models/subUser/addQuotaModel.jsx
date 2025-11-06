import React, { useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { createQuota, getQuota, updateQuota } from '../../../service/customerQuota/customerQuotaService';
import Input from '../../common/input/input';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

const terms = [
    { id: 1, title: 'Monthly', value: 1, kind: 'monthly' },
    { id: 2, title: 'Quarter 1', value: 3, kind: 'q1' },
    { id: 3, title: 'Quarter 2', value: 3, kind: 'q2' },
    { id: 4, title: 'Quarter 3', value: 3, kind: 'q3' },
    { id: 5, title: 'Quarter 4', value: 3, kind: 'q4' },
    { id: 6, title: 'Semi-Annual', value: 6, kind: 'semi' },
    { id: 7, title: 'Yearly', value: 12, kind: 'yearly' },
];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function parseStartMonthIndex(startEvalPeriod) {
    try {
        if (!startEvalPeriod) return 0;
        // Expect "MM/DD/YYYY, ..." — take the first part before comma
        const datePart = String(startEvalPeriod).split(',')[0]?.trim(); // "MM/DD/YYYY"
        const mm = parseInt((datePart || '').split('/')[0], 10);
        if (Number.isFinite(mm) && mm >= 1 && mm <= 12) return mm - 1; // 0-based
        return 0;
    } catch {
        return 0;
    }
}

function getIndicesForKind(kind) {
    switch (kind) {
        case 'q1': return [1, 2, 3];
        case 'q2': return [4, 5, 6];
        case 'q3': return [7, 8, 9];
        case 'q4': return [10, 11, 12];
        case 'semi': return [1, 2, 3, 4, 5, 6];
        case 'yearly': return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        case 'monthly':
        default: return [1];
    }
}

function buildMonthLabels({ kind, count, startMonthIndex }) {

    // Offsets per term kind
    const ranges = {
        monthly: [0],
        q1: [0, 1, 2],
        q2: [3, 4, 5],
        q3: [6, 7, 8],
        q4: [9, 10, 11],
        semi: [0, 1, 2, 3, 4, 5],
        yearly: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    };

    const offsets = ranges[kind] || Array.from({ length: count }, (_, i) => i);
    return offsets.slice(0, count).map(off => {
        const idx = (startMonthIndex + off) % 12;
        return MONTHS[idx];
    });
}

function AddQuotaModel({ open, handleClose, customerId, id, handleGetAllQuota, startEvalPeriod, endEvalPeriod }) {
    const theme = useTheme();

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
            quota: '',
            term: '',
            amount1: '',
            amount2: '',
            amount3: '',
            amount4: '',
            amount5: '',
            amount6: '',
            amount7: '',
            amount8: '',
            amount9: '',
            amount10: '',
            amount11: '',
            amount12: '',
        },
    });

    const onClose = () => {
        reset({
            id: null,
            quota: '',
            term: '',
            amount1: '',
            amount2: '',
            amount3: '',
            amount4: '',
            amount5: '',
            amount6: '',
            amount7: '',
            amount8: '',
            amount9: '',
            amount10: '',
            amount11: '',
            amount12: '',
        });
        handleClose();
    };

    const handleGetQuotaLocal = async () => {
        if (open && id) {
            const response = await getQuota(id);
            if (response?.result) {
                const r = response.result;
                setValue('id', r?.id || '');
                setValue('quota', r?.quota || '');
                // Map incoming term title back to our id
                const termData = terms.find(item => item.title === r?.term);
                setValue('term', termData?.id || '');
                for (let i = 1; i <= 12; i++) {
                    setValue(`amount${i}`, r?.[`amount${i}`] ?? '');
                }
            }
        }
    };

    useEffect(() => {
        handleGetQuotaLocal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const submit = async (data) => {
        const selectedTerm = terms.find(t => t.id === parseInt(watch('term')));
        if (!selectedTerm || !data?.quota) return;

        const quotaData = {
            ...data,
            customerId,
            term: selectedTerm.title, // fix: use our terms array
        };
        if (id) {
          const response = await updateQuota(id, quotaData);
          if (response?.status === 200) {
            handleGetAllQuota();
            onClose();
          } else {
            // You can integrate your setAlert here if available in scope
            console.error(response?.message || 'Error updating quota');
          }
        } else {
          const response = await createQuota(quotaData);
          if (response?.status === 201) {
            handleGetAllQuota();
            onClose();
          } else {
            console.error(response?.message || 'Error creating quota');
          }
        }
    };

    // ---- Dynamic month labels based on selected term & startEvalPeriod ----
    const selectedTerm = terms.find(t => t.id === parseInt(watch('term')));
    const count = selectedTerm?.value || 0;

    const startMonthIndex = parseStartMonthIndex(startEvalPeriod);
    const monthLabels = selectedTerm
        ? buildMonthLabels({
            kind: selectedTerm.kind,
            count,
            startMonthIndex,
        })
        : [];

    return (
        <React.Fragment>
            <BootstrapDialog open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="sm">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    {id ? 'Update' : 'Add'} Quota
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

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Controller
                                    name="quota"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Quota"
                                            type="text"
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="term"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={terms}
                                            label="Period"
                                            placeholder="Select period"
                                            value={parseInt(watch('term')) || null}
                                            onChange={(_, newValue) => {
                                                // Clear all amount fields when term changes
                                                for (let i = 1; i <= 12; i++) setValue(`amount${i}`, null, { shouldDirty: true });
                                                // Set new term
                                                field.onChange(newValue?.id || null);
                                            }}
                                        />

                                    )}
                                />
                            </div>

                            {/* Dynamic amount inputs with month-based labels */}
                            {/* Dynamic amount inputs using fixed storage slots based on term */}
                            {(() => {
                                if (!selectedTerm) return null;

                                // Which amount slots to use for this term (e.g., q2 -> [4,5,6])
                                const slotIndices = getIndicesForKind(selectedTerm.kind);

                                // Build labels that *align* with the offsets of the chosen term
                                // (q1 uses offsets [0,1,2], q2 [3,4,5], etc., already handled by buildMonthLabels)
                                const startMonthIndex = parseStartMonthIndex(startEvalPeriod);
                                const monthLabels = buildMonthLabels({
                                    kind: selectedTerm.kind,
                                    count: slotIndices.length,
                                    startMonthIndex,
                                });

                                return (
                                    <>
                                        {slotIndices.map((slotNumber, i) => {
                                            const fieldName = `amount${slotNumber}`;
                                            const labelMonth = monthLabels[i] || `Month ${i + 1}`;
                                            return (
                                                <div key={fieldName}>
                                                    <Controller
                                                        name={fieldName}
                                                        control={control}
                                                        rules={{
                                                            required: watch('term') ? `${labelMonth} amount is required` : false,
                                                        }}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                label={`${labelMonth} Amount`}
                                                                type="text"
                                                                onChange={(e) => {
                                                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                    field.onChange(numericValue);
                                                                }}
                                                                error={errors?.[fieldName]}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </>
                                );
                            })()}

                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className="flex justify-end items-center gap-4">
                            <Button type="submit" text={id ? 'Update' : 'Submit'} />
                            <Button type="button" text={'Cancel'} useFor="disabled" onClick={onClose} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

export default AddQuotaModel;
