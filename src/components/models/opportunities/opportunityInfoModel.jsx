import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';

import { getOpportunityDetails } from '../../../service/opportunities/opportunitiesService';
import { getAllOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';


const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));


function OpportunityInfoModel({ open, handleClose, opportunityId }) {
    const theme = useTheme()

    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);

    const {
        reset,
        watch,
    } = useForm({
        defaultValues: {
            id: null,
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            discountPercentage: 0.00,
            listPrice: null,
            closeDate: null,
            nextSteps: null,
            accountId: null,
            salesforceOpportunityId: null,
            status: 1,
            logo: null,
            newLogo: null,
            whyDoAnything: null,
            businessValue: null,
            currentEnvironment: null,
            decisionMap: null,
            opportunityDocs: []
        },
    });
    
    const onClose = () => {
        setOpportunitiesContacts([])
        reset({
            id: null,
            accountId: null,
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            discountPercentage: 0,
            listPrice: null,
            closeDate: null,
            nextSteps: null,
            salesforceOpportunityId: null,
            status: 1,
            logo: null,
            newLogo: null,
            opportunityDocs: [],
            whyDoAnything: null,
            businessValue: null,
            currentEnvironment: null,
            decisionMap: null,
        });
        handleClose();
    };

    const handleGetOpportunityDetails = async () => {
        if (opportunityId && open) {
            const res = await getOpportunityDetails(opportunityId);
            if (res?.status === 200) {
                reset(res?.result);
            }
        }
    }

    const handleGetOppContacts = async () => {
        if (open && opportunityId) {
            const res = await getAllOpportunitiesContact(opportunityId);
            const list = Array.isArray(res?.result) ? res.result : [];
            setOpportunitiesContacts(list?.filter((row) => row.isKey === true));
        }
    };

    useEffect(() => {
        handleGetOpportunityDetails()
        handleGetOppContacts()
    }, [open])

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                maxWidth={"md"}
                fullWidth
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    {watch("accountName")} Opp 360
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

                <Components.DialogContent dividers>
                    <div className="w-full px-1 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                <h3 className="text-base font-semibold text-gray-800 mb-2">
                                    Why Do Anything
                                </h3>
                                <div
                                    className="text-sm text-gray-700 leading-relaxed space-y-1"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            watch("whyDoAnything") ||
                                            "<span class='text-gray-400 italic'>No information added yet.</span>",
                                    }}
                                />
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                <h3 className="text-base font-semibold text-gray-800 mb-2">
                                    Current Environment
                                </h3>
                                <div
                                    className="text-sm text-gray-700 leading-relaxed space-y-1"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            watch("currentEnvironment") ||
                                            "<span class='text-gray-400 italic'>No information added yet.</span>",
                                    }}
                                />
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                <h3 className="text-base font-semibold text-gray-800 mb-2">
                                    Value
                                </h3>
                                <div
                                    className="text-sm text-gray-700 leading-relaxed space-y-1"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            watch("businessValue") ||
                                            "<span class='text-gray-400 italic'>No value summary added yet.</span>",
                                    }}
                                />
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                <h3 className="text-base font-semibold text-gray-800 mb-2">
                                    Key Contacts
                                </h3>

                                {opportunitiesContacts && opportunitiesContacts.length > 0 ? (
                                    <ul className="space-y-1 text-sm">
                                        {opportunitiesContacts.map((c) => (
                                            <li key={c.id}>
                                                <span className="font-medium text-indigo-600">
                                                    {c.contactName}
                                                </span>
                                                {c.title && (
                                                    <>
                                                        <span className="mx-1 text-gray-500">–</span>
                                                        <span>
                                                            {c.title}
                                                        </span>
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">
                                        No contacts linked to this opportunity.
                                    </p>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                <h3 className="text-base font-semibold text-gray-800 mb-2">
                                    Decision Map
                                </h3>
                                <div
                                    className="text-sm text-gray-700 leading-relaxed space-y-1"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            watch("decisionMap") ||
                                            "<span class='text-gray-400 italic'>No information added yet.</span>",
                                    }}
                                />
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                <h3 className="text-base font-semibold text-gray-800 mb-2">
                                    Next Steps
                                </h3>
                                {watch("nextSteps") ? (
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                        {watch("nextSteps")}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">
                                        No next steps defined.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Components.DialogContent>


                <Components.DialogActions>
                    <div className='flex justify-end items-center gap-4'>
                        <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(OpportunityInfoModel)
