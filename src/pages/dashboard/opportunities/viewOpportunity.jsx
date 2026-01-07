import React, { useEffect, useState } from 'react'

import { Editor } from "react-draft-wysiwyg";
import {
    EditorState,
    ContentState,
    convertToRaw
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { useForm } from 'react-hook-form';
import dayjs from "dayjs";
import { useNavigate, useParams } from 'react-router-dom'
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Tooltip } from '@mui/material';
import { Tabs } from '../../../components/common/tabs/tabs';

import Checkbox from '../../../components/common/checkBox/checkbox';
import Select from '../../../components/common/select/select';
import Input from '../../../components/common/input/input';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import FileInputBox from '../../../components/fileInputBox/fileInputBox';
import MultipleFileUpload from '../../../components/fileInputBox/multipleFileUpload';
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';

import Components from '../../../components/muiComponents/components';
import OpportunityContactModel from '../../../components/models/opportunities/opportunityContactModel';
import OpportunitiesPartnersModel from '../../../components/models/opportunities/opportunityPartnerModel';
import OpportunitiesProductsModel from '../../../components/models/opportunities/opportunitiesProductsModel';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';

import { getUserDetails } from '../../../utils/getUserDetails';
import { deleteOpportunityLogo, getOpportunityDetails, updateOpportunity, updateOpportunityLogo } from '../../../service/opportunities/opportunitiesService';
import { getAllAccounts } from '../../../service/account/accountService';
import { getAllOpportunitiesPartner, deleteOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';
import { getAllOpportunitiesProducts, deleteOpportunitiesProducts } from '../../../service/opportunities/OpportunityProductsService';
import { getAllOpportunitiesContact, updateOpportunitiesContact, deleteOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import { opportunityStages, opportunityStatus, partnerRoles, uploadFiles } from '../../../service/common/commonService'
import AddSalesProcessModel from '../../../components/models/opportunities/salesProcess/addSalesProcessModel';
import { deleteSalesProcess, getAllBySalesOpportunity } from '../../../service/salesProcess/salesProcessService';
import Calendar from '../calendar/Calendar';
import { deleteOppNotes, getNotesByOppId } from '../../../service/opportunitiesComment/opportunitiesCommentService';
import DataTable from '../../../components/common/table/table';
import Button from '../../../components/common/buttons/button';
import OpportunitiesNotesModel from '../../../components/models/opportunities/opportunitiesNotesModel';
// import { getAllSalesStages } from '../../../service/salesStage/salesStageService';

const toolbarProperties = {
    options: ['inline', 'list', 'link', 'history'],
    inline: {
        options: ['bold', 'italic', 'underline', 'strikethrough']
    },
    list: {
        options: ['unordered', 'ordered'],
    }
}

const tableData = [
    { label: 'Opportunity Details' },
    { label: 'Opp360' },
    { label: 'Calendar' },
    { label: 'Notes' },
]

const ViewOpportunity = ({ setAlert }) => {
    const { opportunityId } = useParams()
    const navigate = useNavigate();
    const userdata = getUserDetails();
    const [selectedTab, setSelectedTab] = useState(0);
    // const [opportunityStages, setOpportunityStages] = useState([])
    const [activeEditorHint, setActiveEditorHint] = useState(null);

    const [whyDoAnythingStateHTML, setWhyDoAnythingStateHTML] = useState(null);
    const [businessValueStateHTML, setBusinessValueStateHTML] = useState(null);
    const [currentEnvironmentHTML, setCurrentEnvironmentHTML] = useState(null);

    const [isWhyDoAnythingDirty, setIsWhyDoAnythingDirty] = useState(false);
    const [isBusinessValueDirty, setIsBusinessValueDirty] = useState(false);
    const [isCurrentEnvironmentDirty, setIsCurrentEnvironmentDirty] = useState(false);
    const [openDecisionMapModel, setOpenDecisionMapModel] = useState(null);
    const [salesProcess, setSalesProcess] = useState([])
    const [salesProcessId, setSalesProcessId] = useState(null)

    const [whyDoAnythingState, setWhyDoAnythingState] = useState(
        EditorState.createEmpty()
    );
    const [businessValueState, setBusinessValueState] = useState(
        EditorState.createEmpty()
    );

    const [currentEnvironmentState, setCurrentEnvironmentState] = useState(
        EditorState.createEmpty()
    );

    const [accounts, setAccounts] = useState([]);

    const [opportunitiesPartner, setOpportunitiesPartner] = useState([]);
    const [opportunitiesProducts, setOpportunitiesProducts] = useState([]);
    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);
    const [opportunitiesNotes, setOpportunitiesNotes] = useState([]);

    // Contact CRUD states
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState(null);

    const [dialogContact, setDialogContact] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    // Partner CRUD states
    const [partnerModalOpen, setPartnerModalOpen] = useState(false);
    const [selectedPartnerId, setSelectedPartnerId] = useState(null);

    const [dialogPartner, setDialogPartner] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    // Product CRUD states
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [dialogProduct, setDialogProduct] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    // Notes CRUD states
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState(null);

    const [dialogNote, setDialogNote] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const [initialIsKey, setInitialIsKey] = useState({});
    const [editedContacts, setEditedContacts] = useState([]);

    const [dialogLogo, setDialogLogo] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogDeleteDecisionMap, setDialogDeleteDecisionMap] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const [files, setFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const {
        watch,
        setValue,
        getValues,
    } = useForm({
        defaultValues: {
            id: null,
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            discountPercentage: null,
            listPrice: null,
            closeDate: null,
            nextSteps: null,
            accountId: null,
            salesforceOpportunityId: null,
            status: null,
            logo: null,
            newLogo: null,
            opportunityDocs: []
        },
    });

    const handleOpenNoteModel = (id = null) => {
        setSelectedNoteId(id)
        setNotesModalOpen(true)
    }

    const handleCloseNoteModel = () => {
        setSelectedNoteId(null)
        setNotesModalOpen(false)
    }

    const handleOpenDeleteNoteDialog = (id) => {
        setSelectedNoteId(id);
        setDialogNote({ open: true, title: 'Delete Note', message: 'Are you sure! Do you want to delete this note?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteNoteDialog = () => {
        setSelectedNoteId(null);
        setDialogNote({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteNote = async () => {
        try {
            const res = await deleteOppNotes(selectedNoteId);
            if (res?.status === 200) {
                handleCloseDeleteNoteDialog()
                handleGetAllNotes();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete product",
                    type: "error"
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                message: error.message || "Failed to delete product",
                type: "error"
            });
        }
    };

    const handleOpenDecisionMapModel = async (id = null) => {
        setSalesProcessId(id)
        setOpenDecisionMapModel(true)
    }

    const handleCloseDecisionMapModel = async () => {
        setSalesProcessId(null)
        setOpenDecisionMapModel(false)
    }

    const handleOpenDecisionMapDelete = async (id) => {
        setSalesProcessId(id)
        setDialogDeleteDecisionMap({ open: true, title: 'Delete Decision Map', message: 'Are you sure! Do you want to delete decision map ?', actionButtonText: 'yes' })
    }

    const handleCloseDecisionMapDelete = async () => {
        setSalesProcessId(null)
        setDialogDeleteDecisionMap({ open: false, title: '', message: '', actionButtonText: '' })
    }

    const handleDeteleDecisionMap = async () => {
        if (salesProcessId) {
            const res = await deleteSalesProcess(salesProcessId);
            if (res.status === 200) {
                handleGetAllSalesProcess()
                handleCloseDecisionMapDelete()
                setAlert({
                    open: true,
                    message: "Decision-Map deleted successfully",
                    type: "success"
                })
            } else {
                setAlert({
                    open: true,
                    message: res.message,
                    type: "error"
                })
            }
        }
    }

    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    const uploadSelectedFiles = async () => {
        const newFiles = [];
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("files", file);
                formData.append("folderName", "opportunitiesDocuments");

                const response = await uploadFiles(formData);
                if (response?.data?.status === 200) {
                    const uploadedFile = response.data.result[0];
                    // attach isInternal to API returned object
                    const fileWithInternal = {
                        ...uploadedFile,
                        isInternal: file.isInternal
                    };
                    // push to final return array
                    newFiles.push(fileWithInternal);
                } else {
                    setAlert({ open: true, message: response?.data?.message, type: "error" });
                    return { ok: false, files: [] };
                }
            }
            // clear local selected files on success
            const currentValues = getValues();
            const whyDoAnythingHtmlData = whyDoAnythingState
                ? draftToHtml(convertToRaw(whyDoAnythingState.getCurrentContent()))
                : null;

            const businessValueHtmlData = businessValueState
                ? draftToHtml(convertToRaw(businessValueState.getCurrentContent()))
                : null;

            const currentEnvironmentHtmlData = currentEnvironmentState
                ? draftToHtml(convertToRaw(currentEnvironmentState.getCurrentContent()))
                : null;


            let payload = {
                ...currentValues,
                opportunityDocs: newFiles,
                whyDoAnything: whyDoAnythingHtmlData,
                businessValue: businessValueHtmlData,
                currentEnvironment: currentEnvironmentHtmlData,
            };
            const res = await updateOpportunity(opportunityId, payload);
            if (res?.status !== 200) {
                setAlert({
                    open: true,
                    message: "Failed to save documents",
                    type: "error"
                })
            } else {
                setFiles([]);
                handleGetOpportunityDetails()
                setAlert({ open: true, message: "Deal documents uploaded successfully", type: "success" });
            }
            return { ok: true, files: newFiles };
        } catch (error) {
            setAlert({ open: true, message: 'Error uploading files', type: "error" });
            return { ok: false, files: [] };
        }
    };

    const handleOpenDeleteLogoDialog = () => {
        setDialogLogo({ open: true, title: 'Delete Logo', message: 'Are you sure! Do you want to delete this logo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteLogoDialog = () => {
        setDialogLogo({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteOppLogo = async () => {
        if (opportunityId && watch("logo")) {
            const res = await deleteOpportunityLogo(opportunityId);
            if (res?.status === 200) {
                setValue("newLogo", null)
                setValue("logo", null)
                handleCloseDeleteLogoDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity logo",
                    type: "error"
                });
            }
        }
        if (watch("newLogo")) {
            setValue("newLogo", null)
            handleCloseDeleteLogoDialog()
        }
    }

    const handleImageChange = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);                    // <-- send the File object
        formData.append("folderName", "oppLogo");
        formData.append("userId", String(userdata?.userId || ""));

        // IMPORTANT: don't set Content-Type; the browser sets multipart boundary
        uploadFiles(formData).then(async (res) => {
            if (res.data.status === 200) {
                const { imageURL } = res?.data?.result?.[0] || {};

                let obj = {
                    oppId: opportunityId,
                    image: imageURL
                }
                const response = await updateOpportunityLogo(obj);
                if (response.status === 200) {
                    setValue("logo", response.result || imageURL)
                    setAlert({ open: true, message: "Opportunity logo updated successfully", type: "success" });
                } else {
                    setAlert({ open: true, message: res?.data?.message || "Fail to upload opportunity logo", type: "error" });
                }
            } else {
                setAlert({ open: true, message: res?.data?.message, type: "error" });
            }
        });
    };

    const handleGetOpportunityDetails = async () => {
        if (opportunityId) {
            const res = await getOpportunityDetails(opportunityId);
            if (res?.status === 200) {
                // --- WHY DO ANYTHING ---
                const whyHtml = (res?.result?.whyDoAnything || "").trim();  // safe default
                if (whyHtml) {
                    const blocksFromHtml = htmlToDraft(whyHtml);
                    const contentState = ContentState.createFromBlockArray(
                        blocksFromHtml.contentBlocks,
                        blocksFromHtml.entityMap
                    );
                    setWhyDoAnythingState(EditorState.createWithContent(contentState));
                    setWhyDoAnythingStateHTML(whyHtml);
                } else {
                    // optional: clear state if empty
                    setWhyDoAnythingState(EditorState.createEmpty());
                    setWhyDoAnythingStateHTML("");
                }

                // --- BUSINESS VALUE ---
                const valueHtml = (res?.result?.businessValue || "").trim();
                if (valueHtml) {
                    const blocksFromHtml = htmlToDraft(valueHtml);
                    const contentState = ContentState.createFromBlockArray(
                        blocksFromHtml.contentBlocks,
                        blocksFromHtml.entityMap
                    );
                    setBusinessValueState(EditorState.createWithContent(contentState));
                    setBusinessValueStateHTML(valueHtml);
                } else {
                    setBusinessValueState(EditorState.createEmpty());
                    setBusinessValueStateHTML("");
                }

                const currentEnvironmentHtml = (res?.result?.currentEnvironment || "").trim();
                if (currentEnvironmentHtml) {
                    const blocksFromHtml = htmlToDraft(currentEnvironmentHtml);
                    const contentState = ContentState.createFromBlockArray(
                        blocksFromHtml.contentBlocks,
                        blocksFromHtml.entityMap
                    );
                    setCurrentEnvironmentState(EditorState.createWithContent(contentState));
                    setCurrentEnvironmentHTML(currentEnvironmentHtml);
                } else {
                    setCurrentEnvironmentState(EditorState.createEmpty());
                    setCurrentEnvironmentHTML("");
                }

                setValue("accountId", res?.result?.accountId || null);
                setValue("opportunity", res?.result?.opportunity || null);
                setValue("closeDate", res?.result?.closeDate ? res?.result?.closeDate : null);
                setValue("nextSteps", res?.result?.nextSteps || null);
                setValue("salesforceOpportunityId", res?.result?.salesforceOpportunityId || null);
                // Important: Map stage/status titles from API back to the local ID for `watch()`
                setValue("salesStage", opportunityStages?.find(stage => stage.title === res?.result?.salesStage)?.title || null);
                setValue("status", opportunityStatus?.find(stage => stage.title === res?.result?.status)?.title || null);
                setValue("logo", res?.result?.logo)
                setValue("id", res?.result?.id)
                setValue("dealAmount", res?.result?.dealAmount || null);
                setValue("discountPercentage", res?.result?.discountPercentage || null);
                setValue("listPrice", res?.result?.listPrice || null);
                setFiles([]);

                if (Array.isArray(res?.result?.opportunityDocs) && res.result.opportunityDocs.length) {
                    setExistingImages(res.result.opportunityDocs);
                }

                if (res?.result?.opportunityPartnerDetails?.length > 0) {
                    const formattedDetails = res?.result?.opportunityPartnerDetails?.map((item) => ({
                        ...item,
                        roleid: partnerRoles?.find(role => role.title === item.role)?.id || null,
                        partnerId: item.id
                    }));
                    setValue('opportunityPartnerDetails', formattedDetails);
                } else {
                    setValue('opportunityPartnerDetails', [{
                        id: null,
                        salesforceOpportunityPartnerId: null,
                        opportunityId: null,
                        accountToId: null,
                        accountId: null,
                        role: null,
                        roleid: null,
                        isPrimary: false,
                        isDeleted: false,
                    }]);
                }
            }
        }
    }

    const handleGetAllAccounts = async () => {
        if (opportunityId) {
            const res = await getAllAccounts("fetchType=Options");
            if (res?.status === 200) {
                const data = res?.result?.map((acc) => ({
                    title: acc.accountName,
                    id: acc.id,
                    salesforceAccountId: acc.salesforceAccountId
                }));
                setAccounts(data);
            }
        }
    };

    const handleGetAllOpportunitiesPartner = async () => {
        if (watch("id") || opportunityId) {
            const res = await getAllOpportunitiesPartner(watch("id") || opportunityId)
            setOpportunitiesPartner(res?.result)
        }
    }

    const handleGetOppProduct = async () => {
        if (watch("id") || opportunityId) {
            const res = await getAllOpportunitiesProducts(watch("id") || opportunityId)
            setOpportunitiesProducts(res.result)
        }
    }

    const handleGetOppContacts = async () => {
        if (watch("id") || opportunityId) {
            const res = await getAllOpportunitiesContact(watch("id") || opportunityId);
            const list = Array.isArray(res?.result) ? res.result : [];

            // ✅ Sort: isKey === true first
            const sortedList = [...list].sort((a, b) => {
                if (a.isKey === b.isKey) return 0;
                return a.isKey ? -1 : 1;
            });

            setOpportunitiesContacts(sortedList);

            const map = {};
            sortedList.forEach(c => {
                if (c?.id != null) map[c.id] = !!c.isKey;
            });
            setInitialIsKey(map);
            setEditedContacts([]); // Reset edits on fresh load
        }
    };

    const handleGetAllSalesProcess = async () => {
        if (opportunityId) {
            const res = await getAllBySalesOpportunity(opportunityId)
            if (res.status === 200) {
                setSalesProcess(res.result || [])
            }
        }
    }

    const handleGetAllNotes = async () => {
        if (opportunityId) {
            const res = await getNotesByOppId(opportunityId)
            if (res.status === 200) {
                const data = res.result?.map((row, index) => {
                    return {
                        ...row,
                        rowId: index + 1
                    }
                })
                setOpportunitiesNotes(data || [])
            }
        }
    }

    // const handleGetAllStages = async () => {
    //     const res = await getAllSalesStages()
    //     if (res.result) {
    //         const data = res.result?.map((row) => {
    //             return {
    //                 id: row.id,
    //                 title: row.shortName,
    //             }
    //         })
    //         setOpportunityStages(data)
    //     }
    // }


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
            field: 'title',
            headerName: 'Title',
            flex: 1,
            headerClassName: 'uppercase',
            sortable: false,
        },
        {
            field: 'comment',
            headerName: 'Note',
            headerClassName: 'uppercase',
            flex: 1,
            sortable: false,
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            maxWidth: 140,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <Tooltip title="Edit" arrow>
                                    <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpenNoteModel(params.row.id)}>
                                            <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={3}
                            component={
                                <Tooltip title="Delete" arrow>
                                    <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpenDeleteNoteDialog(params.row.id)}>
                                            <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
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
            <PermissionWrapper
                functionalityName="Opportunities"
                moduleName="Opportunities"
                actionId={1}
                component={
                    <div>
                        <Button onClick={() => handleOpenNoteModel()} type={`button`} text={'Add Notes'} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    useEffect(() => {
        // handleGetAllStages()
        handleGetOppProduct()
        handleGetAllOpportunitiesPartner()
        handleGetAllAccounts()
        handleGetOppContacts()
        handleGetOpportunityDetails()
        handleGetAllSalesProcess()
        handleGetAllNotes()
    }, [])

    const getDisplayName = (id, options) => {
        const option = options.find(opt => opt.id === id);
        return option ? option.title : '—';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSaveField = async (fieldName, newValue) => {
        const toNumber2 = (val) => {
            if (val === null || val === undefined || val === "") return null;
            const num = typeof val === "number" ? val : parseFloat(val);
            if (Number.isNaN(num)) return null;
            return Number(num.toFixed(2));
        };

        const cleanNumber = (val) => {
            if (val === null || val === undefined || val === "") return "";
            // IMPORTANT: remove commas so parseFloat("1,000") won't become 1
            return val.toString().replace(/,/g, "").replace(/[^\d.]/g, "");
        };

        try {
            const opportunityId = watch("id");
            if (!opportunityId) return;

            const currentValues = getValues();
            const whyDoAnythingHtmlData = whyDoAnythingState
                ? draftToHtml(convertToRaw(whyDoAnythingState.getCurrentContent()))
                : null;

            const businessValueHtmlData = businessValueState
                ? draftToHtml(convertToRaw(businessValueState.getCurrentContent()))
                : null;

            const currentEnvironmentHtmlData = currentEnvironmentState
                ? draftToHtml(convertToRaw(currentEnvironmentState.getCurrentContent()))
                : null;

            let payload = {
                ...currentValues,
                whyDoAnything: whyDoAnythingHtmlData,
                businessValue: businessValueHtmlData,
                currentEnvironment: currentEnvironmentHtmlData,
            };

            // 🔢 Normalize numeric values with comma cleaning
            let listPrice = toNumber2(
                fieldName === "listPrice"
                    ? cleanNumber(newValue)
                    : cleanNumber(currentValues.listPrice)
            );
            let discountPercentage = toNumber2(
                fieldName === "discountPercentage"
                    ? cleanNumber(newValue)
                    : cleanNumber(currentValues.discountPercentage)
            );
            let dealAmount = toNumber2(
                fieldName === "dealAmount"
                    ? cleanNumber(newValue)
                    : cleanNumber(currentValues.dealAmount)
            );

            // 🧮 Keep relationship between ListPrice, Discount%, DealAmount
            if (["listPrice", "discountPercentage", "dealAmount"].includes(fieldName)) {
                // 1) User edited LIST PRICE (base)
                if (fieldName === "listPrice") {
                    if (listPrice === null) {
                        // no base: clear both
                        discountPercentage = null;
                        dealAmount = null;
                    } else {
                        if (discountPercentage !== null) {
                            // Forward: listPrice + discount% → dealAmount
                            const discountValue = (listPrice * discountPercentage) / 100;
                            dealAmount = toNumber2(listPrice - discountValue);
                        } else if (dealAmount !== null) {
                            // Have listPrice and dealAmount, recompute discount%
                            let pct = ((listPrice - dealAmount) / listPrice) * 100;
                            if (pct < 0) pct = 0;
                            if (pct > 100) pct = 100;
                            discountPercentage = toNumber2(pct);
                        } else {
                            // default: no discount
                            dealAmount = listPrice;
                        }
                    }
                }

                // 2) User edited DISCOUNT %
                else if (fieldName === "discountPercentage") {
                    if (listPrice === null) {
                        // cannot compute without base
                        discountPercentage = null;
                        dealAmount = null;
                    } else if (discountPercentage === null) {
                        // discount cleared → final price = list price
                        dealAmount = listPrice;
                    } else {
                        const discountValue = (listPrice * discountPercentage) / 100;
                        dealAmount = toNumber2(listPrice - discountValue);
                    }
                }

                // 3) User edited DEAL AMOUNT (final amount after discount)
                else if (fieldName === "dealAmount") {
                    if (dealAmount === null || listPrice === null) {
                        discountPercentage = null;
                    } else {
                        let pct = ((listPrice - dealAmount) / listPrice) * 100;
                        if (pct < 0) pct = 0;
                        if (pct > 100) pct = 100;
                        discountPercentage = toNumber2(pct);
                    }
                }

                payload.listPrice = listPrice;
                payload.discountPercentage = discountPercentage;
                payload.dealAmount = dealAmount;
            } else {
                // non-numeric fields: keep old logic
                payload[fieldName] = newValue;
            }

            const res = await updateOpportunity(opportunityId, payload);
            if (res?.status === 200) {
                // keep form in sync
                setValue("listPrice", listPrice);
                setValue("discountPercentage", discountPercentage);
                setValue("dealAmount", dealAmount);

                // refresh others if needed
                handleGetOpportunityDetails();
            } else {
                setAlert({
                    open: true,
                    message: "Failed to update opportunity",
                    type: "error",
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                message: error || "Failed to update opportunity",
                type: "error",
            });
        }
    };

    const OpportunityField = ({ label, value, type = 'text', options = [], onSave, className = '', required = false, multiline = false, disabled = false }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(value);

        const formatNumberWithCommas = (val) => {
            if (!val && val !== 0) return "";
            const [intPartRaw, decimalRaw] = val.toString().split(".");
            const intPart = intPartRaw.replace(/\D/g, ""); // only digits
            const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (decimalRaw !== undefined) {
                return `${intWithCommas}.${decimalRaw.slice(0, 2)}`;
            }
            return intWithCommas;
        };

        const parseDealAmountToFloat = (val) => {
            if (!val) return null;
            const cleaned = val.toString().replace(/,/g, "");
            if (cleaned === "") return null;
            const num = parseFloat(cleaned);
            if (Number.isNaN(num)) return null;
            return parseFloat(num.toFixed(2));
        };


        const handleDoubleClick = () => {
            if (!disabled) {
                setIsEditing(true);

                if (label === "Deal Amount" || label === "List Amount") {
                    // value might be like "$20,000" or "20000" or 20000
                    const raw =
                        value !== undefined && value !== null
                            ? value.toString().replace(/[$,]/g, "")
                            : "";
                    if (raw === "") {
                        setEditValue("");
                    } else {
                        setEditValue(formatNumberWithCommas(raw));
                    }
                } else {
                    setEditValue(value);
                }
            }
        };

        const handleSave = async () => {
            if (!onSave) {
                setIsEditing(false);
                return;
            }

            let finalValue;

            if (type === 'select') {
                finalValue =
                    label === "Account"
                        ? options?.find((row) => (row.title === editValue || row.id === editValue))?.id
                        : options?.find((row) => (row.title === editValue || row.id === editValue))?.title;
            } else if (label === "Deal Amount" || label === "List Amount") {
                // convert "2,003.43" -> 2003.43
                finalValue = parseDealAmountToFloat(editValue);
            } else {
                finalValue = editValue;
            }

            // Avoid unnecessary save if value didn't actually change
            const original =
                (label === "Deal Amount" || label === "List Amount")
                    ? parseDealAmountToFloat(value?.toString().replace(/[$,]/g, ''))
                    : value;

            if (finalValue !== original) {
                await onSave(finalValue);
            }

            setIsEditing(false);
        };

        const handleCancel = () => {
            setEditValue(value);
            setIsEditing(false);
        };

        const handleChange = (e) => {
            const val = e.target.value;

            if (label === "Deal Amount" || label === "List Amount") {
                // Allow only digits and dot
                let cleaned = val.replace(/,/g, "").replace(/[^\d.]/g, "");

                // Keep only first dot
                const parts = cleaned.split(".");
                if (parts.length > 2) {
                    cleaned = parts[0] + "." + parts.slice(1).join("");
                }

                const [intPart, decimalPartRaw] = cleaned.split(".");
                const safeInt = intPart || "0";

                let formatted = safeInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                if (decimalPartRaw !== undefined) {
                    const decimals = decimalPartRaw.slice(0, 2); // max 2 digits
                    formatted = `${formatted}.${decimals}`;
                }

                if (val.trim() === "") {
                    setEditValue("");
                } else {
                    setEditValue(formatted);
                }
            } else {
                setEditValue(val);
            }

        };

        const handleSelectChange = (selectedOption) => {
            setEditValue(selectedOption ? selectedOption.id : null);
        };

        const handleDateChange = (date) => {
            setEditValue(date ? dayjs(date).format("MM/DD/YYYY") : null);
        };

        const displayValue = value || '—';

        return (
            <div className={`flex justify-start items-center text-sm py-1 ${className}`}>
                <span className="font-medium text-gray-500 tracking-wider text-sm w-52">{label}</span>
                <div className="text-gray-900 font-semibold text-base max-w-[60%] break-words">
                    {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                            {type === 'select' ? (
                                <div className='w-80'>
                                    <Select
                                        value={options?.find((row) => (row.title === editValue || row.id === editValue))?.id || null}
                                        options={options}
                                        onChange={(_, newValue) => handleSelectChange(newValue ? newValue : null)}
                                        className="flex-1"
                                        autoFocus
                                        error={(!editValue || editValue === "") && required}
                                        disabled={disabled}
                                    />
                                </div>
                            ) : type === 'date' ? (
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        value={editValue ? dayjs(editValue) : null}
                                        onChange={handleDateChange}
                                        format="MM/DD/YYYY"
                                        disabled={disabled}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: "outlined",
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        '& fieldset': {
                                                            borderColor: '#d1d5db',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: '#9ca3af',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#3b82f6',
                                                        },
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        height: 7,
                                                        fontSize: '14px',
                                                    },
                                                },
                                            },
                                        }}
                                        className="flex-1"
                                        error={(!editValue || editValue === "") && required}
                                    />
                                </LocalizationProvider>
                            ) : (
                                <Input
                                    value={editValue || ''}
                                    onChange={handleChange}
                                    autoFocus
                                    error={(!editValue || editValue === "") && required}
                                    multiline={multiline}
                                    rows={3}
                                    disabled={disabled}
                                />
                            )}
                            <div className='flex items-center gap-3'>
                                <Tooltip title="Save" arrow>
                                    <div className={`${(editValue === null || editValue === "") ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 cursor-pointer"} h-6 w-6 flex justify-center items-center rounded-full text-white`}>
                                        <Components.IconButton onClick={handleSave} disabled={editValue === null || editValue === ""}>
                                            <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>

                                <Tooltip title="Cancel" arrow>
                                    <div className='bg-gray-800 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={handleCancel}>
                                            <CustomIcons iconName={'fa-solid fa-close'} css='cursor-pointer text-white h-3 w-3' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    ) : (
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <span
                                    onClick={handleDoubleClick}
                                    className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                                >
                                    {displayValue}
                                </span>
                            }
                            fallbackComponent={
                                <span
                                    className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                                >
                                    {displayValue}
                                </span>
                            }
                        />
                    )}
                </div>
            </div>
        );
    };

    const StageTimeline = ({ stages, currentStageId }) => {
        const [confirmDialog, setConfirmDialog] = useState({
            open: false,
            stage: null
        });

        const handleStageClick = (stage) => {
            if (stage.id === currentStageId) return; // Don't show dialog if same stage

            setConfirmDialog({
                open: true,
                stage: stage
            });
        };

        const handleConfirmStageChange = async () => {
            try {
                const { stage } = confirmDialog;
                const opportunityId = watch("id");
                if (!opportunityId) return;

                // Update the stage
                setValue("salesStage", stage.title);

                const currentValues = getValues();
                const updateData = {
                    ...currentValues,
                    salesStage: stage.title
                };

                const res = await updateOpportunity(opportunityId, updateData);
                if (res?.status === 200) {
                    setAlert({
                        open: true,
                        message: `Stage updated successfully`,
                        type: "success"
                    });
                } else {
                    // Revert if failed
                    const currentStage = stages.find(s => s.id === currentStageId);
                    setValue("salesStage", currentStage?.title);
                    setAlert({
                        open: true,
                        message: "Failed to update stage",
                        type: "error"
                    });
                }
            } catch (error) {
                setAlert({
                    open: true,
                    message: "Failed to update stage",
                    type: "error"
                });
            } finally {
                setConfirmDialog({ open: false, stage: null });
            }
        };

        const handleCancelStageChange = () => {
            setConfirmDialog({ open: false, stage: null });
        };

        return (
            <>
                <div className="px-3 py-4 mb-0">
                    <div className="flex flex-wrap xl:justify-evenly gap-3 md:gap-2 overflow-x-auto pb-1">
                        {stages?.map((stage) => {
                            const isActive = stage.id === currentStageId;
                            const isCompleted = currentStageId !== null && stage.id < currentStageId;

                            let pillClasses = "";

                            if (isActive) {
                                pillClasses = "bg-[#1072E0] text-white border-[#1072E0] cursor-default";
                            } else if (isCompleted) {
                                pillClasses = "bg-[#E3F2FD] text-[#1072E0] border-[#B3D7FF] cursor-pointer";
                            } else {
                                pillClasses = "bg-white text-gray-700 border-gray-300 cursor-pointer";
                            }

                            return (
                                <div key={stage.id}>
                                    <PermissionWrapper
                                        functionalityName="Opportunities"
                                        moduleName="Opportunities"
                                        actionId={2}
                                        component={
                                            <div
                                                onClick={() => handleStageClick(stage)}
                                                className={`inline-flex items-center justify-center px-3 py-2 text-xs font-semibold border rounded-full whitespace-nowrap transition-all duration-150 ${pillClasses}`}
                                            >
                                                <span className="truncate">
                                                    {stage.title}
                                                </span>

                                                {isCompleted && (
                                                    <CustomIcons
                                                        iconName="fa-solid fa-check"
                                                        css="h-3 w-3 inline-block ml-2"
                                                    />
                                                )}
                                            </div>
                                        }
                                        fallbackComponent={
                                            <div
                                                className={`inline-flex items-center justify-center px-3 py-2 text-xs font-semibold border rounded-full whitespace-nowrap transition-all duration-150 ${pillClasses}`}
                                            >
                                                <span className="truncate">
                                                    {stage.title}
                                                </span>

                                                {isCompleted && (
                                                    <CustomIcons
                                                        iconName="fa-solid fa-check"
                                                        css="h-3 w-3 inline-block ml-2"
                                                    />
                                                )}
                                            </div>
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Confirmation Dialog */}
                <AlertDialog
                    open={confirmDialog.open}
                    title="Change Stage"
                    message={`Are you sure you want to change the stage to "${confirmDialog.stage?.title}"?`}
                    actionButtonText="Yes"
                    handleAction={handleConfirmStageChange}
                    handleClose={handleCancelStageChange}
                />
            </>
        );
    };

    // Contact CRUD handlers
    const handleAddContact = () => {
        setSelectedContactId(null);
        setContactModalOpen(true);
    };

    const handleCloseContactModel = () => {
        setSelectedContactId(null);
        setContactModalOpen(false);
    };

    const handleOpenDeleteContactDialog = (id) => {
        setSelectedContactId(id);
        setDialogContact({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this contact?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteContactDialog = () => {
        setSelectedContactId(null);
        setDialogContact({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteContact = async () => {
        try {
            const res = await deleteOpportunitiesContact(selectedContactId);
            if (res?.status === 200) {
                handleCloseDeleteContactDialog()
                handleGetOppContacts();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete contact",
                    type: "error"
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                message: error.message || "Failed to delete contact",
                type: "error"
            });
        }
    };

    // ✅ Contact toggle handlers (FIXED)
    const handleToggleKeyContact = (id, isKey) => {
        setEditedContacts(prev => {
            const next = [...prev];
            const idx = next.findIndex(e => e.id === id);

            if (idx >= 0) {
                next[idx] = { id, isKey };
            } else {
                next.push({ id, isKey });
            }

            const original = initialIsKey[id] ?? false;

            // If value is same as original, remove from edited list
            const idxAfter = next.findIndex(e => e.id === id);
            if (idxAfter >= 0 && next[idxAfter].isKey === original) {
                next.splice(idxAfter, 1);
            }

            return next;
        });
    };

    const handleSaveKeyContacts = async () => {
        try {
            const requestData = editedContacts.map(item => ({
                id: item.id,
                isKey: item.isKey
            }));

            const res = await updateOpportunitiesContact(requestData);

            if (res?.status === 200) {
                setEditedContacts([]);
                handleGetOppContacts();
            } else {
                setAlert({
                    open: true,
                    message: "Failed to update key contacts",
                    type: "error"
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                message: "Something went wrong while saving",
                type: "error"
            });
        }
    };

    // Partner CRUD handlers
    const handleAddPartner = () => {
        setSelectedPartnerId(null);
        setPartnerModalOpen(true);
    };

    const handleClosePartnerModel = () => {
        setSelectedPartnerId(null);
        setPartnerModalOpen(false);
    };

    const handleEditPartner = (partnerId) => {
        setSelectedPartnerId(partnerId);
        setPartnerModalOpen(true);
    };

    const handleOpenDeletePartnerDialog = (id) => {
        setSelectedPartnerId(id);
        setDialogPartner({ open: true, title: 'Delete competitor', message: 'Are you sure! Do you want to delete this competitor?', actionButtonText: 'yes' });
    }

    const handleCloseDeletePartnerDialog = () => {
        setSelectedPartnerId(null);
        setDialogPartner({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeletePartner = async () => {
        try {
            const res = await deleteOpportunitiesPartner(selectedPartnerId);
            if (res?.status === 200) {
                handleCloseDeletePartnerDialog()
                handleGetAllOpportunitiesPartner();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete partner",
                    type: "error"
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                message: error.message || "Failed to delete partner",
                type: "error"
            });
        }
    };

    // Product CRUD handlers
    const handleAddProduct = () => {
        setSelectedProductId(null);
        setProductModalOpen(true);
    };

    const handleCloseProductModel = () => {
        setSelectedProductId(null);
        setProductModalOpen(false);
    };

    const handleEditProduct = (productId) => {
        setSelectedProductId(productId);
        setProductModalOpen(true);
    };

    const handleOpenDeleteProductDialog = (id) => {
        setSelectedProductId(id);
        setDialogProduct({ open: true, title: 'Delete Product', message: 'Are you sure! Do you want to delete this product?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteProductDialog = () => {
        setSelectedProductId(null);
        setDialogProduct({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteProduct = async () => {
        try {
            const res = await deleteOpportunitiesProducts(selectedProductId);
            if (res?.status === 200) {
                handleCloseDeleteProductDialog()
                handleGetOppProduct();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete product",
                    type: "error"
                });
            }
        } catch (error) {
            setAlert({
                open: true,
                message: error.message || "Failed to delete product",
                type: "error"
            });
        }
    };

    const PartnersSection = ({ list = [] }) => {
        return (
            <section className="mt-8">
                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 font-semibold text-gray-700">Partners</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className='flex justify-end mb-4 gap-2'>
                    <PermissionWrapper
                        functionalityName="Opportunities"
                        moduleName="Opportunities"
                        actionId={2}
                        component={
                            <Tooltip title="Add" arrow>
                                <div className='bg-green-600 h-7 w-7 flex justify-center items-center rounded-full text-white p-1'>
                                    <Components.IconButton onClick={() => handleAddPartner()}>
                                        <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            </Tooltip>
                        }
                    />
                </div>
                {
                    list?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 4k:grid-cols-6 gap-4">
                            {list.map((row, i) => (
                                <div
                                    key={row.id ?? i}
                                    className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="absolute right-2 flex items-center justify-end gap-2">
                                        <PermissionWrapper
                                            functionalityName="Opportunities"
                                            moduleName="Opportunities"
                                            actionId={2}
                                            component={
                                                <Tooltip title="Edit" arrow>
                                                    <div className='bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                        <Components.IconButton onClick={() => handleEditPartner(row.id)}>
                                                            <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-3 w-3' />
                                                        </Components.IconButton>
                                                    </div>
                                                </Tooltip>
                                            }
                                        />
                                        <PermissionWrapper
                                            functionalityName="Opportunities"
                                            moduleName="Opportunities"
                                            actionId={2}
                                            component={
                                                <Tooltip title="Delete" arrow>
                                                    <div className='bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                        <Components.IconButton onClick={() => handleOpenDeletePartnerDialog(row.id)}>
                                                            <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                        </Components.IconButton>
                                                    </div>
                                                </Tooltip>
                                            }
                                        />
                                    </div>
                                    <p className="font-semibold text-gray-800 text-lg">
                                        {row.accountName || "—"}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {row.role || "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) :
                        <div className="border rounded-lg text-center py-10 font-bold">
                            No Competitors Found.
                        </div>
                }
            </section>
        );
    };

    const ContactsSection = ({ list = [] }) => {
        // Apply edits to the list
        const contactsWithEdits = list.map(c => {
            const edit = editedContacts.find(e => e.id === c.id);
            return { ...c, isKey: edit ? edit.isKey : c.isKey };
        });

        // Sort: isKey true first
        const sortedContacts = contactsWithEdits || [];
        const currentKeyContactsCount = sortedContacts?.filter(c => c.isKey).length;

        return (
            <>

                <section className="mt-8">
                    <div className="mt-4">
                        <div className="flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="mx-4 font-semibold text-gray-700">Contacts</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                    </div>

                    <div className='flex justify-end mb-4 gap-2'>
                        {editedContacts.length > 0 && (
                            <PermissionWrapper
                                functionalityName="Opportunities"
                                moduleName="Opportunities"
                                actionId={2}
                                component={
                                    <Tooltip title="Save" arrow>
                                        <div className='bg-blue-600 h-7 w-7 px-3 flex justify-center items-center rounded-full text-white'>
                                            <Tooltip title="Save" arrow>
                                                <Components.IconButton onClick={handleSaveKeyContacts} title="Update key contacts">
                                                    <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                                                </Components.IconButton>
                                            </Tooltip>
                                        </div>
                                    </Tooltip>
                                }
                            />

                        )}
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <Tooltip title="Add" arrow>
                                    <div className='bg-green-600 h-7 w-7 flex justify-center items-center rounded-full text-white p-1'>
                                        <Components.IconButton onClick={() => handleAddContact()}>
                                            <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
                    </div>
                    {
                        list?.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 4k:grid-cols-6 gap-4">
                                {sortedContacts.map((row, i) => (
                                    <div
                                        key={row.id ?? i}
                                        className={`
            relative bg-white border rounded-xl p-4 shadow-sm 
            hover:shadow-md transition-shadow cursor-pointer
            ${row.isKey ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
        `}
                                    >

                                        {/* ====== Checkbox on Top-Right ====== */}
                                        <div className="absolute top-2 right-2 flex items-center gap-1">
                                            <PermissionWrapper
                                                functionalityName="Opportunities"
                                                moduleName="Opportunities"
                                                actionId={2}
                                                component={
                                                    <>
                                                        <Checkbox
                                                            checked={!!row.isKey}
                                                            disabled={currentKeyContactsCount >= 4 && !row.isKey}
                                                            onChange={() => handleToggleKeyContact(row.id, !row.isKey)}
                                                        />
                                                        <Tooltip title="Delete" arrow>
                                                            <div className='bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                                <Components.IconButton onClick={() => handleOpenDeleteContactDialog(row.id)}>
                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    </>
                                                }
                                            />

                                        </div>

                                        {/* Avatar & Details */}
                                        <div className="flex gap-3 pr-8">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
                ${row.isKey ? 'bg-blue-600' : 'bg-gray-400'}`}
                                            >
                                                {(row.contactName || "—").charAt(0)}
                                            </div>

                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {row.contactName || "—"}
                                                </p>

                                                {row.role && (
                                                    <p className="text-xs text-gray-500 truncate mt-1">{row.role}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        ) :
                            <div className="border rounded-lg text-center py-10 font-bold">
                                No Contact Found.
                            </div>
                    }
                </section>
            </>
        );
    };

    const ProductsSection = ({ list = [] }) => {
        const items = Array.isArray(list) ? list : [];
        const grandTotal = items.reduce((sum, row) => {
            const qty = parseFloat(row?.qty) || 0;
            const price = parseFloat(row?.price) || 0;
            return sum + qty * price;
        }, 0);

        return (
            <>
                <section className="mt-8">
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 font-semibold text-gray-700">
                            Products &amp; Services
                        </span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <div className='flex justify-end mb-4 gap-2'>
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <Tooltip title="Add" arrow>
                                    <div className='bg-green-600 h-7 w-7 flex justify-center items-center rounded-full text-white p-1'>
                                        <Components.IconButton onClick={() => handleAddProduct()}>
                                            <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="hidden sm:table-header-group">
                                <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                    <th className="px-4 py-3 text-left">Product Name</th>
                                    <th className="px-4 py-3 text-right">Qty</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            {
                                items.length > 0 ? (
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map((row, i) => {
                                            const qty = parseFloat(row?.qty) || 0;
                                            const price = parseFloat(row?.price) || 0;
                                            const total = parseFloat(qty * price);

                                            return (
                                                <tr
                                                    key={row.id ?? i}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="sm:hidden text-xs text-gray-500 mb-1">Product Name:</div>
                                                        <p className="font-semibold text-gray-800 text-base break-words">
                                                            {row.name || "—"}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="sm:hidden text-xs text-gray-500 mb-1">Qty:</div>
                                                        <span className="font-semibold">{qty || "—"}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="sm:hidden text-xs text-gray-500 mb-1">Price:</div>
                                                        <span className="font-semibold">
                                                            {price
                                                                ? `$${price.toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}`
                                                                : "—"}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        <div className="sm:hidden text-xs text-blue-600 mb-1">Total:</div>
                                                        <span className="font-bold text-blue-600 text-base">
                                                            {total
                                                                ? `$${total.toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}`
                                                                : "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <PermissionWrapper
                                                                functionalityName="Opportunities"
                                                                moduleName="Opportunities"
                                                                actionId={2}
                                                                component={
                                                                    <>
                                                                        <Tooltip title="Edit" arrow>
                                                                            <div className='bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                                                <Components.IconButton onClick={() => handleEditProduct(row.id)}>
                                                                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-3 w-3' />
                                                                                </Components.IconButton>
                                                                            </div>
                                                                        </Tooltip>
                                                                        <Tooltip title="Delete" arrow>
                                                                            <div className='bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                                                <Components.IconButton onClick={() => handleOpenDeleteProductDialog(row.id)}>
                                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                                                </Components.IconButton>
                                                                            </div>
                                                                        </Tooltip>
                                                                    </>
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                ) :
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="py-10 text-center font-bold" colSpan={5}>
                                                Product & Service Not Found.
                                            </td>
                                        </tr>
                                    </tbody>
                            }
                        </table>
                        {
                            items.length > 0 ? (
                                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-[#F9FAFB] rounded-b-xl">
                                    <p className="text-base font-bold text-gray-700">
                                        Total Expected Revenue
                                    </p>
                                    <p className="text-lg font-extrabold text-[#1072E0]">
                                        {grandTotal
                                            ? `$${grandTotal.toLocaleString()}`
                                            : "—"}
                                    </p>
                                </div>
                            ) : null
                        }
                    </div>
                </section>
            </>
        );
    };

    const handleCancelEditor = (type) => {
        if (type === "WhyDoAnything") {
            if (whyDoAnythingStateHTML) {
                const blocks = htmlToDraft(whyDoAnythingStateHTML);
                const contentState = ContentState.createFromBlockArray(
                    blocks.contentBlocks,
                    blocks.entityMap
                );
                setWhyDoAnythingState(EditorState.createWithContent(contentState));
            } else {
                setWhyDoAnythingState(EditorState.createEmpty());
            }
            setIsWhyDoAnythingDirty(false);
        }

        if (type === "CurrentEnvironment") {
            if (currentEnvironmentHTML) {
                const blocks = htmlToDraft(currentEnvironmentHTML);
                const contentState = ContentState.createFromBlockArray(
                    blocks.contentBlocks,
                    blocks.entityMap
                );
                setCurrentEnvironmentState(EditorState.createWithContent(contentState));
            } else {
                setCurrentEnvironmentState(EditorState.createEmpty());
            }
            setIsCurrentEnvironmentDirty(false);
        }

        if (type === "BusinessValue") {
            if (businessValueStateHTML) {
                const blocks = htmlToDraft(businessValueStateHTML);
                const contentState = ContentState.createFromBlockArray(
                    blocks.contentBlocks,
                    blocks.entityMap
                );
                setBusinessValueState(EditorState.createWithContent(contentState));
            } else {
                setBusinessValueState(EditorState.createEmpty());
            }
            setIsBusinessValueDirty(false);
        }
    };

    const handleSubmitEditorData = async (type) => {
        const currentValues = getValues();
        const whyDoAnythingHtmlData = whyDoAnythingState
            ? draftToHtml(convertToRaw(whyDoAnythingState.getCurrentContent()))
            : null;

        const businessValueHtmlData = businessValueState
            ? draftToHtml(convertToRaw(businessValueState.getCurrentContent()))
            : null;

        const currentEnvironmentHtmlData = currentEnvironmentState
            ? draftToHtml(convertToRaw(currentEnvironmentState.getCurrentContent()))
            : null;


        let payload = {
            ...currentValues,
            whyDoAnything: whyDoAnythingHtmlData,
            businessValue: businessValueHtmlData,
            currentEnvironment: currentEnvironmentHtmlData,
        };
        const res = await updateOpportunity(opportunityId, payload);
        if (res?.status === 200) {
            // keep HTML snapshots in sync
            setWhyDoAnythingStateHTML(whyDoAnythingHtmlData || "");
            setBusinessValueStateHTML(businessValueHtmlData || "");
            setCurrentEnvironmentHTML(currentEnvironmentHtmlData || "");

            // clear only the relevant dirty flag
            if (type === "BusinessValue") {
                setIsBusinessValueDirty(false);
            }
            if (type === "WhyDoAnything") {
                setIsWhyDoAnythingDirty(false);
            }
            if (type === "CurrentEnvironment") {
                setIsCurrentEnvironmentDirty(false);
            }

            handleGetOpportunityDetails();
        } else {
            setAlert({
                open: true,
                message: "Failed to update opportunity",
                type: "error",
            });
        }

    }

    const DecisionMapTimeline = ({ items = [] }) => {
        if (!items || items.length === 0) {
            return (
                <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-gray-400 italic">
                        No decision map added yet.
                    </p>
                </div>
            );
        }

        const formatStepDate = (dateString) => {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric'
            });
        };

        // Filter only items that have a goLive date
        const goLiveItems = items.filter(step => step.goLive);

        // Find the item with the latest goLive date
        const lastGoLiveItem = goLiveItems.length
            ? goLiveItems.reduce((latest, current) => {
                const latestDate = new Date(latest.goLive);
                const currentDate = new Date(current.goLive);
                return currentDate > latestDate ? current : latest;
            })
            : null;

        // Format goLive date
        const goLiveText = lastGoLiveItem
            ? new Date(lastGoLiveItem.goLive).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric'
            })
            : null;
        // Extract reason
        const reasonText = lastGoLiveItem?.reason || null;



        return (
            <div className="w-full h-full flex flex-col justify-between">
                {/* Timeline Container with Scroll */}
                <div className="mt-4 mb-4 overflow-x-auto w-full pb-2 no-scrollbar">
                    <div className="flex items-center min-w-max px-2">
                        {items.map((step, index) => (
                            <React.Fragment key={step.id ?? index}>
                                {/* STEP COLUMN */}
                                <div className="flex flex-col items-center min-w-[70px] flex-shrink-0">
                                    <Tooltip title={step.notes} arrow>
                                        <span className="font-semibold text-sm text-gray-800 text-center leading-tight break-words px-1 cursor-pointer">
                                            {step.process}
                                        </span>
                                    </Tooltip>
                                    <span className="w-px h-3 bg-black my-1" />
                                    <span className="text-sm text-gray-600">
                                        {formatStepDate(step.processDate)}
                                    </span>
                                    <div className='flex items-center gap-2 mt-2'>
                                        <Tooltip title="Edit" arrow>
                                            <div className='bg-blue-600 h-5 w-5 flex justify-center items-center rounded-full text-white'>
                                                <Components.IconButton onClick={() => handleOpenDecisionMapModel(step.id)}>
                                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-2.5 w-2.5' />
                                                </Components.IconButton>
                                            </div>
                                        </Tooltip>
                                        <Tooltip title="Delete" arrow>
                                            <div className='bg-red-600 h-5 w-5 flex justify-center items-center rounded-full text-white'>
                                                <Components.IconButton onClick={() => handleOpenDecisionMapDelete(step.id)}>
                                                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white h-2.5 w-2.5' />
                                                </Components.IconButton>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* HORIZONTAL LINE COLUMN (between steps) */}
                                {index < items.length - 1 && (
                                    <div className="flex items-center flex-1 min-w-[60px] flex-shrink-0">
                                        <div className="h-px bg-gray-400 w-full mx-1" />
                                        {index === items.length - 2 && (
                                            <span className="text-gray-400">
                                                <CustomIcons iconName="fa-solid fa-angle-right" />
                                            </span>
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Footer Info (Fixed at bottom, does not scroll) */}
                {(goLiveText || reasonText) && (
                    <div className="flex justify-between items-center text-xs text-gray-700 gap-1 border-t border-gray-100 pt-2">

                        {goLiveText && (
                            <span>
                                <span className="font-semibold">Go Live: </span>
                                {goLiveText}
                            </span>
                        )}

                        {reasonText && (
                            <span className="truncate max-w-[50%] text-right" title={reasonText}>
                                <span className="font-semibold">Reason: </span>
                                {reasonText}
                            </span>
                        )}
                    </div>
                )}

            </div>
        );
    };

    return (
        <div className='mx-auto relative p-4 sm:p-6 my-3'>
            <div>
                <div className='absolute top-1 left-5'>
                    <div className='w-10 h-10 p-2 cursor-pointer flex items-center justify-center' onClick={() => navigate("/dashboard/opportunities")}>
                        <CustomIcons iconName="fa-solid fa-arrow-left" css="h-5 w-5 text-gray-600" />
                    </div>
                </div>
                {
                    selectedTab === 0 ? (
                        <div className='absolute top-2 right-5'>
                            <p className='text-red-600'><strong>Note:&nbsp;</strong>Fields can be edited by clicking.</p>
                        </div>
                    ) : null
                }
            </div>

            <div className='my-3'>
                <Tabs tabsData={tableData} selectedTab={selectedTab} handleChange={handleChangeTab} />
            </div>
            {
                selectedTab === 0 && (
                    <>
                        <StageTimeline
                            stages={opportunityStages}
                            currentStageId={opportunityStages.find(stage => stage.title === watch("salesStage"))?.id}
                        />

                        <div className='grid grid-cols-1 md:grid-cols-5 gap-6 pt-4'>
                            <div className='flex justify-center md:justify-start items-start md:col-span-1'>
                                <div className="w-40 h-40">
                                    {/* <FileInputBox
                                        onFileSelect={handleImageChange}
                                        onRemove={handleOpenDeleteLogoDialog}
                                        value={watch("logo") || watch("newLogo")}
                                        text="Upload jpg/png of Size 100X100 Px"
                                        size="100x100"
                                    /> */}
                                    <FileInputBox
                                        type="OppLogo"
                                        onFileSelect={handleImageChange}
                                        onRemove={handleOpenDeleteLogoDialog}
                                        value={watch("logo") || watch("newLogo")}
                                        text="Upload Opportunity Logo"
                                    />
                                </div>
                            </div>

                            <div className='grid md:grid-cols-2 gap-y-5 w-full md:col-span-4'>
                                <>
                                    <OpportunityField
                                        label="Opportunity Name"
                                        value={watch("opportunity")}
                                        type="text"
                                        onSave={(newValue) => handleSaveField("opportunity", newValue)}
                                        required={true}
                                    />

                                    <OpportunityField
                                        label="Stage"
                                        value={watch("salesStage")}
                                        type="select"
                                        options={opportunityStages}
                                        onSave={(newValue) => handleSaveField("salesStage", newValue)}
                                        required={true}
                                    />
                                    <OpportunityField
                                        label="List Amount"
                                        value={
                                            watch("listPrice") !== null && watch("listPrice") !== undefined && watch("listPrice") !== ""
                                                ? `$${Number(watch("listPrice")).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`
                                                : "—"
                                        }
                                        type="text"
                                        onSave={(newValue) => handleSaveField("listPrice", newValue)}
                                        required={true}
                                    />

                                    <OpportunityField
                                        label="Discount(%)"
                                        value={
                                            watch("discountPercentage") !== null && watch("discountPercentage") !== undefined && watch("discountPercentage") !== ""
                                                ? `${Number(watch("discountPercentage")).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`
                                                : "—"
                                        }
                                        type="text"
                                        onSave={(newValue) => handleSaveField("discountPercentage", newValue)}
                                        required={true}
                                    />

                                    <OpportunityField
                                        label="Deal Amount"
                                        value={
                                            watch("dealAmount") !== null &&
                                                watch("dealAmount") !== undefined &&
                                                watch("dealAmount") !== ""
                                                ? `$${Number(watch("dealAmount")).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}`
                                                : "—"
                                        }
                                        type="text"
                                        onSave={(newValue) => handleSaveField("dealAmount", newValue)}
                                        required={false}
                                    />


                                    <OpportunityField
                                        label="Close Date"
                                        value={formatDate(watch("closeDate"))}
                                        type="date"
                                        onSave={(newValue) => handleSaveField("closeDate", newValue)}
                                        required={true}
                                    />
                                </>

                                <>
                                    <OpportunityField
                                        label="Account"
                                        value={getDisplayName(watch("accountId"), accounts)}
                                        type="select"
                                        options={accounts}
                                        onSave={(newValue) => handleSaveField("accountId", newValue)}
                                    />

                                    <OpportunityField
                                        label="Status"
                                        value={watch("status")}
                                        type="select"
                                        options={opportunityStatus}
                                        onSave={(newValue) => handleSaveField("status", newValue)}
                                        required={true}
                                    />
                                </>

                                <div className='md:col-span-2'>
                                    <OpportunityField
                                        label="Next Step"
                                        value={watch("nextSteps")}
                                        type="text"
                                        onSave={(newValue) => handleSaveField("nextSteps", newValue)}
                                        required={true}
                                        multiline={true}
                                    />
                                </div>

                                <div className="flex items-center md:col-span-2">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="mx-4 font-semibold text-gray-700">Deal Documents</span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>
                                {
                                    files?.length > 0 && (
                                        <div className='flex justify-end items-center col-span-2'>
                                            <Tooltip title="Upload" arrow>
                                                <div className='bg-green-600 h-7 w-7 px-3 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={uploadSelectedFiles} title="Upload docs">
                                                        <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    )
                                }
                                <div className='md:col-span-2'>
                                    <MultipleFileUpload
                                        files={files}
                                        setFiles={setFiles}
                                        setAlert={setAlert}
                                        setValue={setValue}
                                        existingImages={existingImages}
                                        setExistingImages={setExistingImages}
                                        type="oppDocs"
                                        multiple={true}
                                        placeHolder="Drag & drop files or click to browse(PNG, JPG, JPEG, PDF, DOC, XLS, HTML)"
                                    // uploadedFiles={uploadedFiles}
                                    />
                                </div>
                            </div>
                        </div>

                        <ContactsSection list={opportunitiesContacts} />
                        <PartnersSection list={opportunitiesPartner} />
                        <ProductsSection list={opportunitiesProducts} />
                    </>
                )
            }
            {
                selectedTab === 1 && (
                    <>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-3">
                            <div className='w-full rounded-2xl shadow-sm border border-gray-200 px-5 py-4'>
                                <div className='flex justify-between items-center mb-4'>
                                    <p className='font-medium text-gray-500 tracking-wider text-sm'>
                                        Why Do Anything
                                    </p>

                                    {isWhyDoAnythingDirty && (
                                        <div className='flex justify-end items-center gap-3'>
                                            <Tooltip title="Save" arrow>
                                                <div className='bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleSubmitEditorData("WhyDoAnything")}>
                                                        <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                            <Tooltip title="Cancel" arrow>
                                                <div className='bg-black h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleCancelEditor("WhyDoAnything")}>
                                                        <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white h-3 w-3' />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                                <div className='relative h-60 '>
                                    <div className='h-full overflow-y-auto relative'>
                                        <Editor
                                            editorState={whyDoAnythingState}
                                            wrapperClassName="wrapper-class border border-gray-300 rounded-md"
                                            editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                            toolbarClassName="toolbar-class border-b border-gray-300"
                                            onEditorStateChange={(state) => {
                                                setWhyDoAnythingState(state);
                                                const html = draftToHtml(convertToRaw(state.getCurrentContent()));
                                                setIsWhyDoAnythingDirty(html !== (whyDoAnythingStateHTML || ""));
                                            }}
                                            toolbar={toolbarProperties}
                                            onFocus={() => setActiveEditorHint("WhyDoAnything")}
                                            onBlur={() => { setIsWhyDoAnythingDirty(false); setActiveEditorHint(null) }} />
                                    </div>

                                    {activeEditorHint === "WhyDoAnything" && (
                                        <div className="absolute top-1/2 -translate-y-1/2 right-[-216px] bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2
                        before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-8px] 
                        before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
                                            <img
                                                src="/images/WhyDoAnything2.png"
                                                alt="WhyDoAnything"
                                                className="max-w-xs max-h-48 object-contain relative z-10"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className='w-full rounded-2xl shadow-sm border border-gray-200 px-5 py-4'>
                                <div className='flex justify-between items-center mb-4'>
                                    <p className='font-medium text-gray-500 tracking-wider text-sm'>
                                        Current Environment
                                    </p>

                                    {isCurrentEnvironmentDirty && (
                                        <div className='flex justify-end items-center gap-3'>
                                            <Tooltip title="Save" arrow>
                                                <div className='bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleSubmitEditorData("CurrentEnvironment")}>
                                                        <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                            <Tooltip title="Cancel" arrow>
                                                <div className='bg-black h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleCancelEditor("CurrentEnvironment")}>
                                                        <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white h-3 w-3' />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>

                                <div className='h-60 overflow-y-auto'>
                                    <Editor
                                        editorState={currentEnvironmentState}
                                        wrapperClassName="wrapper-class border border-gray-300 rounded-md"
                                        editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                        toolbarClassName="toolbar-class border-b border-gray-300"
                                        onEditorStateChange={(state) => {
                                            setCurrentEnvironmentState(state);
                                            const html = draftToHtml(convertToRaw(state.getCurrentContent()));
                                            setIsCurrentEnvironmentDirty(html !== (currentEnvironmentHTML || ""));
                                        }}
                                        toolbar={toolbarProperties}
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className='w-full rounded-2xl shadow-sm border border-gray-200 px-5 py-4'>
                                <div className='flex justify-between items-center mb-4'>
                                    <p className='font-medium text-gray-500 tracking-wider text-sm'>
                                        Value
                                    </p>

                                    {isBusinessValueDirty && (
                                        <div className='flex justify-end items-center gap-3'>
                                            <Tooltip title="Save" arrow>
                                                <div className='bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleSubmitEditorData("BusinessValue")}>
                                                        <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                            <Tooltip title="Cancel" arrow>
                                                <div className='bg-black h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleCancelEditor("BusinessValue")}>
                                                        <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white h-3 w-3' />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>

                                <div className="relative h-60">
                                    {/* scroll only the editor, not the whole relative container */}
                                    <div className="h-full overflow-y-auto relative">
                                        <Editor
                                            editorState={businessValueState}
                                            wrapperClassName="wrapper-class border border-gray-300 rounded-md"
                                            editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                            toolbarClassName="toolbar-class border-b border-gray-300"
                                            onEditorStateChange={(state) => {
                                                setBusinessValueState(state);
                                                const html = draftToHtml(convertToRaw(state.getCurrentContent()));
                                                setIsBusinessValueDirty(html !== (businessValueStateHTML || ""));
                                            }}
                                            toolbar={toolbarProperties}
                                            onFocus={() => setActiveEditorHint("BusinessValue")}
                                            onBlur={() => { setIsBusinessValueDirty(false); setActiveEditorHint(null) }}
                                        />
                                    </div>

                                    {activeEditorHint === "BusinessValue" && (
                                        <div className="absolute top-1/2 -translate-y-1/2 right-[-216px] bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2
                        before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-8px] 
                        before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
                                            <img
                                                src="/images/BusinessValue2.png"
                                                alt="Business value guidance"
                                                className="max-w-xs max-h-48 object-contain relative z-10"
                                            />
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className='w-full rounded-2xl shadow-sm border border-gray-200 px-5 py-4'>
                                <div className='flex justify-between items-center mb-4'>
                                    <p className='font-medium text-gray-500 tracking-wider text-sm'>
                                        Decision Map
                                    </p>
                                    <div className='flex justify-end gap-3'>
                                        <p className='text-red-600'><strong>Note:&nbsp;</strong>Hover on <strong>Step Name</strong> to read the step notes.</p>
                                        <Tooltip title="Add" arrow>
                                            <div className='bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                <Components.IconButton onClick={() => handleOpenDecisionMapModel()}>
                                                    <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-3 w-3' />
                                                </Components.IconButton>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="h-60 w-full">
                                    <DecisionMapTimeline items={salesProcess} />
                                </div>

                            </div>
                        </div>
                    </>
                )
            }
            {
                selectedTab === 2 && (
                    <>
                        <Calendar />
                    </>
                )
            }
            {
                selectedTab === 3 && (
                    <div className='border rounded-lg bg-white w-full lg:w-full '>
                        <DataTable columns={columns} rows={opportunitiesNotes} getRowId={getRowId} hideFooter={true} height={400} showButtons={true} buttons={actionButtons} />
                    </div>
                )
            }
            {/* Contact Modal */}
            <OpportunityContactModel
                open={contactModalOpen}
                handleClose={handleCloseContactModel}
                opportunityId={opportunityId}
                handleGetAllOppContact={handleGetOppContacts}
                oppName={watch("opportunity")}
            />
            <AlertDialog
                open={dialogContact.open}
                title={dialogContact.title}
                message={dialogContact.message}
                actionButtonText={dialogContact.actionButtonText}
                handleAction={() => handleDeleteContact()}
                handleClose={() => handleCloseDeleteContactDialog()}
            />

            {/* Partner Modal */}
            <OpportunitiesPartnersModel
                open={partnerModalOpen}
                handleClose={handleClosePartnerModel}
                opportunityId={opportunityId}
                id={selectedPartnerId}
                handleGetAllOpportunitiesPartners={handleGetAllOpportunitiesPartner}
                oppName={watch("opportunity")}
            />
            <AlertDialog
                open={dialogPartner.open}
                title={dialogPartner.title}
                message={dialogPartner.message}
                actionButtonText={dialogPartner.actionButtonText}
                handleAction={() => handleDeletePartner()}
                handleClose={() => handleCloseDeletePartnerDialog()}
            />

            {/* Product Modal */}
            <OpportunitiesProductsModel
                open={productModalOpen}
                handleClose={handleCloseProductModel}
                opportunityId={opportunityId}
                id={selectedProductId}
                handleGetAllOpportunitiesProducts={handleGetOppProduct}
                oppName={watch("opportunity")}
            />
            <AlertDialog
                open={dialogProduct.open}
                title={dialogProduct.title}
                message={dialogProduct.message}
                actionButtonText={dialogProduct.actionButtonText}
                handleAction={() => handleDeleteProduct()}
                handleClose={() => handleCloseDeleteProductDialog()}
            />

            <AlertDialog
                open={dialogLogo.open}
                title={dialogLogo.title}
                message={dialogLogo.message}
                actionButtonText={dialogLogo.actionButtonText}
                handleAction={() => handleDeleteOppLogo()}
                handleClose={() => handleCloseDeleteLogoDialog()}
            />

            <AlertDialog
                open={dialogDeleteDecisionMap.open}
                title={dialogDeleteDecisionMap.title}
                message={dialogDeleteDecisionMap.message}
                actionButtonText={dialogDeleteDecisionMap.actionButtonText}
                handleAction={() => handleDeteleDecisionMap()}
                handleClose={() => handleCloseDecisionMapDelete()}
            />

            <OpportunitiesNotesModel open={notesModalOpen} handleClose={handleCloseNoteModel} opportunityId={opportunityId} id={selectedNoteId} handleGetAllOpportunitiesNotes={handleGetAllNotes} />
            <AlertDialog
                open={dialogNote.open}
                title={dialogNote.title}
                message={dialogNote.message}
                actionButtonText={dialogNote.actionButtonText}
                handleAction={() => handleDeleteNote()}
                handleClose={() => handleCloseNoteModel()}
            />
            <AddSalesProcessModel open={openDecisionMapModel} handleClose={handleCloseDecisionMapModel} id={salesProcessId} oppId={opportunityId} handleGetAllSalesProcess={handleGetAllSalesProcess} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(ViewOpportunity)
