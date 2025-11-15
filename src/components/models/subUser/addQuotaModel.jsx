import React, { useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { createQuota, getQuota, updateQuota } from '../../../service/customerQuota/customerQuotaService';
import Input from '../../common/input/input';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

const terms = [
    { id: 1, title: 'Monthly', kind: 'monthly' },
    { id: 2, title: 'Quarterly', kind: 'quarterly' },
    { id: 3, title: 'Semi-Annual', kind: 'semi' },
    { id: 4, title: 'Annual', kind: 'annual' },
];

const TERM_COUNTS = {
    monthly: 12,
    quarterly: 4,
    semi: 2,
    annual: 1,
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function parseStartMonthIndex(startEvalPeriod) {
    try {
        if (!startEvalPeriod) return 0;
        const datePart = String(startEvalPeriod).split(',')[0]?.trim();
        const mm = parseInt((datePart || '').split('/')[0], 10);
        if (Number.isFinite(mm) && mm >= 1 && mm <= 12) return mm - 1; // 0-based
        return 0;
    } catch {
        return 0;
    }
}

function monthName(idx) { return MONTHS[(idx + 12) % 12]; }

function monthSpanLabel(startIdx, len) {
    const s = monthName(startIdx);
    const e = monthName(startIdx + len - 1);
    return `${s}–${e}`;
}

function buildLabelsForKind(kind, startMonthIndex) {
    switch (kind) {
        case 'monthly':
            // 12 single-month labels rotating from start
            return Array.from({ length: 12 }, (_, i) => monthName(startMonthIndex + i));
        case 'quarterly': {
            // 4 quarters of 3 months each
            const starts = [0, 3, 6, 9].map(o => (startMonthIndex + o) % 12);
            return starts.map((s, i) => `Q${i + 1} (${monthSpanLabel(s, 3)})`);
        }
        case 'semi': {
            // 2 halves: 6 months each
            const h1 = monthSpanLabel(startMonthIndex, 6);
            const h2 = monthSpanLabel(startMonthIndex + 6, 6);
            return [`(${h1})`, `(${h2})`];
        }
        case 'annual': {
            // 1 full-year label
            const full = monthSpanLabel(startMonthIndex, 12);
            return [`Annual (${full})`];
        }
        default:
            return [];
    }
}

function AddQuotaModel({ setAlert, open, handleClose, customerId, id, handleGetAllQuota, startEvalPeriod, endEvalPeriod }) {
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
                setValue('quotaId', r?.id || '');
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

    const submit = async () => {
        const selectedTerm = terms.find(t => t.id === parseInt(watch('term')));
        if (!selectedTerm || !watch("quota")) return;

        const quotaData = {
            id: id,
            quota: Number(parseFloat(watch("quota")).toFixed(2)),
            term: selectedTerm.title, // fix: use our terms array
            amount1: Number(parseFloat(watch("amount1")).toFixed(2)),
            amount2: Number(parseFloat(watch("amount2")).toFixed(2)),
            amount3: Number(parseFloat(watch("amount3")).toFixed(2)),
            amount4: Number(parseFloat(watch("amount4")).toFixed(2)),
            amount5: Number(parseFloat(watch("amount5")).toFixed(2)),
            amount6: Number(parseFloat(watch("amount6")).toFixed(2)),
            amount7: Number(parseFloat(watch("amount7")).toFixed(2)),
            amount8: Number(parseFloat(watch("amount8")).toFixed(2)),
            amount9: Number(parseFloat(watch("amount9")).toFixed(2)),
            amount10: Number(parseFloat(watch("amount10")).toFixed(2)),
            amount11: Number(parseFloat(watch("amount11")).toFixed(2)),
            amount12: Number(parseFloat(watch("amount12")).toFixed(2)),
            customerId: customerId,
        };

        if (id) {
            const response = await updateQuota(id, quotaData);
            if (response?.status === 200) {
                handleGetAllQuota();
                onClose();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
            }
        } else {
            const response = await createQuota(quotaData);
            if (response?.status === 201) {
                handleGetAllQuota();
                onClose();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
            }
        }
    };

    const selectedTerm = terms?.find(t => t.id === parseInt(watch('term')));

    return (
        <React.Fragment>
            <BootstrapDialog open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
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
                        <div className='px-[30px]'>
                            <div className="grid gap-[30px]">
                                <div>
                                    <Controller
                                        name="term"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                options={terms}
                                                label="Period"
                                                placeholder="Select period"
                                                value={parseInt(watch('term')) || null}
                                                onChange={(_, newValue) => {
                                                    for (let i = 1; i <= 12; i++) setValue(`amount${i}`, null, { shouldDirty: true });
                                                    field.onChange(newValue?.id || null);
                                                }}
                                                error={errors.term}
                                            />

                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="quota"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Quota"
                                                type="text"
                                                onChange={(e) => {
                                                    let value = e.target.value;
                                                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                                                        field.onChange(value);
                                                    }
                                                }}
                                                error={errors?.quota}
                                                startIcon={
                                                    <CustomIcons
                                                        iconName={"fa-solid fa-dollar-sign"}
                                                        css={"text-lg text-black mr-2"}
                                                    />
                                                }
                                            />
                                        )}
                                    />
                                </div>

                                <div className='grid md:grid-cols-2 gap-4'>
                                    {(() => {
                                        if (!selectedTerm) return null;
                                        const startMonthIndex = parseStartMonthIndex(startEvalPeriod);
                                        const kind = terms.find(t => t.id === parseInt(watch('term')))?.kind;
                                        const count = TERM_COUNTS[kind] || 0;
                                        const labels = buildLabelsForKind(kind, startMonthIndex).slice(0, count);
                                        return (
                                            <>
                                                {Array.from({ length: count }, (_, i) => {
                                                    const n = i + 1;                   // amount1..amountN
                                                    const fieldName = `amount${n}`;
                                                    const labelText = `${labels[i]} Amount` || `Amount ${n}`;
                                                    return (
                                                        <div key={fieldName}>
                                                            <Controller
                                                                name={fieldName}
                                                                control={control}
                                                                rules={{ required: watch('term') ? `${labelText} is required` : false }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label={`${labelText}`}
                                                                        type="text"
                                                                        onChange={(e) => {
                                                                            let value = e.target.value;
                                                                            if (/^\d*\.?\d{0,2}$/.test(value)) {
                                                                                field.onChange(value);
                                                                            }
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

                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className="flex justify-end items-center gap-4">
                            <Button type="submit" text={id ? 'Update' : 'Submit'} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                            <Button type="button" text={'Cancel'} useFor="disabled" onClick={onClose} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
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

export default connect(null, mapDispatchToProps)(AddQuotaModel)
