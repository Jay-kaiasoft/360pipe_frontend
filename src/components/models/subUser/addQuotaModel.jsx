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

    const formatMoney = (val) => {
        if (val === null || val === undefined || val === '') return '';

        const [intPartRaw, decimalRaw] = val.toString().replace(/,/g, '').split('.');

        const intWithCommas = intPartRaw
            .replace(/\D/g, '')
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // If user has typed a dot, we always keep it,
        // even if nothing is after it yet.
        if (decimalRaw !== undefined) {
            const trimmed = decimalRaw.slice(0, 2); // max 2 decimals
            // "1." → keep as "1."
            if (trimmed === '') {
                return `${intWithCommas}.`;
            }
            // "1.5" or "1.56" → "1.5" / "1.56"
            return `${intWithCommas}.${trimmed}`;
        }

        // No dot typed yet
        return intWithCommas;
    };


    const sanitizeMoney = (val) => {
        if (!val) return '';

        // keep only digits and dot
        val = val.replace(/[^0-9.]/g, '');

        // allow only one dot
        const firstDotIndex = val.indexOf('.');
        if (firstDotIndex !== -1) {
            const before = val.slice(0, firstDotIndex + 1);
            const after = val.slice(firstDotIndex + 1).replace(/\./g, '');
            val = before + after;
        }

        let [intPart, decPart] = val.split('.');
        intPart = intPart || '';

        if (decPart !== undefined) {
            decPart = decPart.slice(0, 2); // max 2 decimals
        }

        return decPart !== undefined ? `${intPart}.${decPart}` : intPart;
    };

    const parseMoneyFloat = (val) => {
        if (!val) return 0;
        const num = parseFloat(val.toString().replace(/,/g, ''));
        if (Number.isNaN(num)) return 0;
        return Number(num.toFixed(2));
    };

    const handleGetQuotaLocal = async () => {
        if (open && id) {
            const response = await getQuota(id);
            if (response?.result) {
                const r = response.result;

                setValue('quotaId', r?.id || '');

                // term mapping
                const termData = terms.find(item => item.title === r?.term);
                setValue('term', termData?.id || '');

                // 🟢 show formatted quota like 3,435.54
                setValue('quota', r?.quota != null ? formatMoney(r.quota) : '');

                // 🟢 show formatted amounts for amount1..amount12
                for (let i = 1; i <= 12; i++) {
                    const key = `amount${i}`;
                    const rawAmount = r?.[key];
                    setValue(key, rawAmount != null ? formatMoney(rawAmount) : '');
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

        const getMoney = (name) => parseMoneyFloat(watch(name));

        const quotaData = {
            id: id,
            quota: getMoney("quota"),
            term: selectedTerm.title,
            amount1: getMoney("amount1"),
            amount2: getMoney("amount2"),
            amount3: getMoney("amount3"),
            amount4: getMoney("amount4"),
            amount5: getMoney("amount5"),
            amount6: getMoney("amount6"),
            amount7: getMoney("amount7"),
            amount8: getMoney("amount8"),
            amount9: getMoney("amount9"),
            amount10: getMoney("amount10"),
            amount11: getMoney("amount11"),
            amount12: getMoney("amount12"),
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
                    message: response?.data?.message || "An error occurred",
                });
            }
        } else {
            const response = await createQuota(quotaData);
            if (response?.status === 200) {
                handleGetAllQuota();
                onClose();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred",
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
                                                    const target = e.target;
                                                    const rawInput = target.value;
                                                    const caretPos = target.selectionStart ?? rawInput.length;

                                                    // 1) Clean + format full input
                                                    const cleanedFull = sanitizeMoney(rawInput);
                                                    const formattedFull = formatMoney(cleanedFull);

                                                    // 2) Clean + format part BEFORE caret to compute new caret pos
                                                    const rawBeforeCaret = rawInput.slice(0, caretPos);
                                                    const cleanedBeforeCaret = sanitizeMoney(rawBeforeCaret);
                                                    const formattedBeforeCaret = formatMoney(cleanedBeforeCaret);
                                                    const newCaretPos = formattedBeforeCaret.length;

                                                    // 3) Update form value
                                                    field.onChange(formattedFull);

                                                    // 4) Restore caret after rerender
                                                    requestAnimationFrame(() => {
                                                        try {
                                                            target.setSelectionRange(newCaretPos, newCaretPos);
                                                        } catch (err) { }
                                                    });
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
                                                                            const target = e.target;
                                                                            const rawInput = target.value;
                                                                            const caretPos = target.selectionStart ?? rawInput.length;

                                                                            const cleanedFull = sanitizeMoney(rawInput);
                                                                            const formattedFull = formatMoney(cleanedFull);

                                                                            const rawBeforeCaret = rawInput.slice(0, caretPos);
                                                                            const cleanedBeforeCaret = sanitizeMoney(rawBeforeCaret);
                                                                            const formattedBeforeCaret = formatMoney(cleanedBeforeCaret);
                                                                            const newCaretPos = formattedBeforeCaret.length;

                                                                            field.onChange(formattedFull);

                                                                            requestAnimationFrame(() => {
                                                                                try {
                                                                                    target.setSelectionRange(newCaretPos, newCaretPos);
                                                                                } catch (err) { }
                                                                            });
                                                                        }}

                                                                        error={errors?.[fieldName]}
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
