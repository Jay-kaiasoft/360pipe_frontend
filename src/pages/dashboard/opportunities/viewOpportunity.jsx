import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';

// Rich Text Editor
import { Editor } from "react-draft-wysiwyg";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Dates & UI Utils
import dayjs from "dayjs";
import { Tooltip, useTheme } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Components & Icons
import Components from "../../../components/muiComponents/components";
import CustomIcons from "../../../components/common/icons/CustomIcons";
import Input from "../../../components/common/input/input";
import Select from "../../../components/common/select/select";
import Checkbox from "../../../components/common/checkBox/checkbox";
import { Tabs } from "../../../components/common/tabs/tabs";
import DatePickerComponent from "../../../components/common/datePickerComponent/datePickerComponent";
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';
import Calendar from '../calendar/Calendar';

// Modals
import OpportunityContactModel from '../../../components/models/opportunities/opportunityContactModel';
import AddSalesProcessModel from '../../../components/models/opportunities/salesProcess/addSalesProcessModel';
import MeetingAttendeesModel from '../../../components/models/meeting/meetingAttendeesModel';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';

// Services & Actions
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import { getUserDetails } from '../../../utils/getUserDetails';
import {
    deleteOpportunityLogo,
    getOpportunityDetails,
    updateOpportunity,
    updateOpportunityLogo
} from '../../../service/opportunities/opportunitiesService';
import { getAllAccounts } from '../../../service/account/accountService';
import {
    getAllOpportunitiesContact,
    updateOpportunitiesContact,
    deleteOpportunitiesContact
} from '../../../service/opportunities/opportunitiesContactService';
import { deleteSalesProcess, getAllBySalesOpportunity } from '../../../service/salesProcess/salesProcessService';
import { getAllMeetingsByOppId } from '../../../service/meetings/meetingsService';
import { deleteMeetingAttendees, getAllMeetingsAttendeesByMeetingId } from '../../../service/meetingAttendees/meetingAttendeesService';
import { getByMeetingId, saveNote, updateNote } from '../../../service/notes/notesService';
import {
    opportunityContactRoles,
    opportunityStages,
    opportunityStatus,
    uploadFiles,
    userTimeZone
} from '../../../service/common/commonService';
import { getAllContacts } from "../../../service/contact/contactService";

// ----------------------------
// Constants / Helpers
// ----------------------------
const toolbarProperties = {
    options: ["inline", "list", "link", "history"],
    inline: { options: ["bold", "italic", "underline", "strikethrough"] },
    list: { options: ["unordered", "ordered"] },
};

const tableData = [{ label: "Opp360" }, { label: "Notes" }, { label: "Calendar" }];

const isEmptyHtml = (h) => {
    const x = (h || "").trim();
    return !x || x === "<p></p>" || x === "<p><br></p>";
};

const htmlToEditorState = (html) => {
    const clean = (html || "").trim();
    if (!clean) return EditorState.createEmpty();
    const blocks = htmlToDraft(clean);
    const contentState = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
    return EditorState.createWithContent(contentState);
};

const editorStateToHtml = (state) => (state ? draftToHtml(convertToRaw(state.getCurrentContent())) : "");

// function useClickOutside(ref, handler, when = true) {
//     useEffect(() => {
//         if (!when) return;
//         const listener = (event) => {
//             const el = ref?.current;
//             if (!el) return;
//             if (el.contains(event.target)) return;
//             handler(event);
//         };
//         document.addEventListener("mousedown", listener, true);
//         document.addEventListener("touchstart", listener, true);
//         return () => {
//             document.removeEventListener("mousedown", listener, true);
//             document.removeEventListener("touchstart", listener, true);
//         };
//     }, [ref, handler, when]);
// }

function useClickOutside(ref, handler, when = true) {
    useEffect(() => {
        if (!when) return;

        const listener = (event) => {
            const el = ref?.current;
            if (!el) return;

            // 1. Check if the click is inside the component itself
            if (el.contains(event.target)) return;

            // 2. Check if the click is inside a Portal (MUI Popover, Menu, or Calendar)
            // Most MUI overlays use these classes:
            const isPortal = event.target.closest(".MuiPopover-root") ||
                event.target.closest(".MuiAutocomplete-popper") ||
                event.target.closest(".MuiDialog-root") ||
                event.target.closest(".MuiMenu-root");

            if (isPortal) return;

            handler(event);
        };

        document.addEventListener("mousedown", listener, true);
        document.addEventListener("touchstart", listener, true);
        return () => {
            document.removeEventListener("mousedown", listener, true);
            document.removeEventListener("touchstart", listener, true);
        };
    }, [ref, handler, when]);
}

const normalizeDomain = (raw) => {
    const v = (raw || "").trim();
    if (!v) return "";
    let d = v.replace(/^https?:\/\//i, "");
    d = d.split("/")[0].split("?")[0].trim();
    d = d.replace(/\.+$/, "");
    return d;
};

const brandfetchSrc = (domain) => `https://cdn.brandfetch.io/${domain}/w/100/h/100/icon?c=1id2vhiypCcqm7fpTjx`;

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
// ----------------------------
// Main Component
// ----------------------------
const ViewOpportunity = ({ setAlert }) => {
    const { opportunityId } = useParams();
    const navigate = useNavigate();
    const userdata = getUserDetails();
    const theme = useTheme();

    // --- Layout State ---
    const [selectedTab, setSelectedTab] = useState(0);
    const [openDrawer, setOpenDrawer] = useState(true);

    // --- Form & Data State ---
    const { control, setValue, watch, getValues } = useForm({
        defaultValues: {
            id: null,
            opportunity: null,
            salesStage: null,
            status: null,
            closeDate: null,
            accountId: null,
            dealAmount: null,
            discountPercentage: null,
            listPrice: null,
            nextSteps: null,
            logo: null,
            meetingDate: dayjs().format("MM/DD/YYYY"),
            noteId: null,
        },
    });

    const [accounts, setAccounts] = useState([]);
    const [allContacts, setAllContacts] = useState([]);

    // --- Rich Text Editor States ---
    const [activeEditorHint, setActiveEditorHint] = useState(null);
    const [whyDoAnythingStateHTML, setWhyDoAnythingStateHTML] = useState("");
    const [businessValueStateHTML, setBusinessValueStateHTML] = useState("");
    const [currentEnvironmentHTML, setCurrentEnvironmentHTML] = useState("");

    const [whyDoAnythingState, setWhyDoAnythingState] = useState(EditorState.createEmpty());
    const [businessValueState, setBusinessValueState] = useState(EditorState.createEmpty());
    const [currentEnvironmentState, setCurrentEnvironmentState] = useState(EditorState.createEmpty());

    // Click-to-edit toggles
    const [isEditingWhy, setIsEditingWhy] = useState(false);
    const [isEditingValue, setIsEditingValue] = useState(false);
    const [isEditingEnv, setIsEditingEnv] = useState(false);
    const [isEditingNextSteps, setIsEditingNextSteps] = useState(false);

    const whyCardRef = useRef(null);
    const valueCardRef = useRef(null);
    const envCardRef = useRef(null);
    const nextStepsRef = useRef(null);

    // --- Contacts State ---
    const [contacts, setContacts] = useState([]);
    const [editedContacts, setEditedContacts] = useState([]);
    const [initialIsKey, setInitialIsKey] = useState({});
    const [isSelectContactsOpen, setIsSelectContactsOpen] = useState(false);
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const emptyContactRow = () => ({
        tempId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        nameId: "",
        roleId: "",
        title: "",
        isKeyContact: false,
        firstName: "",
        lastName: "",
        email: "",
    });
    const [contactRows, setContactRows] = useState([emptyContactRow()]);
    const selectContactsRef = useRef(null);

    // Modals
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [dialogContact, setDialogContact] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    // --- Decision Map State ---
    const [salesProcess, setSalesProcess] = useState([]);
    const [salesProcessId, setSalesProcessId] = useState(null);
    const [openDecisionMapModel, setOpenDecisionMapModel] = useState(false);
    const [dialogDeleteDecisionMap, setDialogDeleteDecisionMap] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    // --- Pricing Box State ---
    const [showPricingBox, setShowPricingBox] = useState(false);
    const pricingBoxRef = useRef(null);
    const [pricingDraft, setPricingDraft] = useState({
        listPrice: null,
        discountPercentage: null,
        dealAmount: null,
    });

    // --- Logo State ---
    const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
    const [isUploadLogoOpen, setIsUploadLogoOpen] = useState(false);
    const [isFetchLogoOpen, setIsFetchLogoOpen] = useState(false);

    const logoMenuRef = useRef(null);
    const uploadLogoRef = useRef(null);
    const fetchLogoRef = useRef(null);
    const fileInputRef = useRef(null);

    const [dialogLogo, setDialogLogo] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [logoUploadDraft, setLogoUploadDraft] = useState({ file: null, previewUrl: "", fileName: "" });
    const [domainDraft, setDomainDraft] = useState("");

    // --- Meetings & Notes State ---
    const [showDates, setShowDates] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [meetingAttendees, setMeetingAttendees] = useState([]);

    const [selectedMeetingAttendeesId, setSelectedMeetingAttendeesId] = useState(null);
    const [attendeesModelOpen, setAttendeesModelOpen] = useState(false);
    const [deleteAttendees, setDeleteAttendees] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    // Note Snapshots
    const [purposeHTML, setPurposeHTML] = useState("");
    const [backgroundHTML, setBackgroundHTML] = useState("");
    const [agendaHTML, setAgendaHTML] = useState("");
    const [alignmentHTML, setAlignmentHTML] = useState("");
    const [purposeState, setPurposeState] = useState(EditorState.createEmpty());
    const [backgroundState, setBackgroundState] = useState(EditorState.createEmpty());
    const [agendaState, setAgendaState] = useState(EditorState.createEmpty());
    const [alignmentState, setAlignmentState] = useState(EditorState.createEmpty());

    const [editingNoteField, setEditingNoteField] = useState(null);
    const activeNoteEditorRef = useRef(null);

    // ----------------------------
    // Data Fetching
    // ----------------------------
    const handleGetOpportunityDetails = async () => {
        if (!opportunityId) return;
        const res = await getOpportunityDetails(opportunityId);
        if (res?.status === 200) {
            const r = res.result;

            setValue("id", r.id);
            setValue("accountId", r.accountId);
            setValue("opportunity", r.opportunity);
            setValue("closeDate", r.closeDate);
            setValue("nextSteps", r.nextSteps);
            setValue("logo", r.logo);

            const stg = opportunityStages?.find(s => s.title === r.salesStage)?.title || null;
            setValue("salesStage", stg);
            const sts = opportunityStatus?.find(s => s.title === r.status)?.title || null;
            setValue("status", sts);

            setValue("listPrice", r.listPrice);
            setValue("discountPercentage", r.discountPercentage);
            setValue("dealAmount", r.dealAmount);

            const whyHtml = (r.whyDoAnything || "").trim();
            setWhyDoAnythingStateHTML(whyHtml);
            setWhyDoAnythingState(htmlToEditorState(whyHtml));

            const valHtml = (r.businessValue || "").trim();
            setBusinessValueStateHTML(valHtml);
            setBusinessValueState(htmlToEditorState(valHtml));

            const envHtml = (r.currentEnvironment || "").trim();
            setCurrentEnvironmentHTML(envHtml);
            setCurrentEnvironmentState(htmlToEditorState(envHtml));
        }
    };

    const handleGetAllAccounts = async () => {
        const res = await getAllAccounts("fetchType=Options");
        if (res?.status === 200) {
            setAccounts(res.result.map(a => ({ title: a.accountName, id: a.id })));
        }
    };

    const handleGetOppContacts = async () => {
        if (!opportunityId) return;
        const res = await getAllOpportunitiesContact(opportunityId);
        const list = Array.isArray(res?.result) ? res.result : [];

        const sorted = [...list].sort((a, b) => (a.isKey === b.isKey ? 0 : a.isKey ? -1 : 1));
        setContacts(sorted);

        const map = {};
        sorted.forEach(c => { map[c.id] = !!c.isKey; });
        setInitialIsKey(map);
        setEditedContacts([]);
    };

    const handleGetAllSalesProcess = async () => {
        if (!opportunityId) return;
        const res = await getAllBySalesOpportunity(opportunityId);
        if (res?.status === 200) setSalesProcess(res.result || []);
    };

    const handleGetMeeetingByOppId = async () => {
        if (!opportunityId || selectedTab !== 1) return;
        const res = await getAllMeetingsByOppId(opportunityId, userTimeZone);
        if (res?.status === 200) {
            const data = res.result.map(row => ({
                id: row.id,
                title: row.calendarDto?.title,
                description: row.calendarDto?.description,
                displayStart: row.calendarDto?.displayStart,
            }));
            setMeetings(data);
            const dates = new Set(data.map(m => m.displayStart?.split(" ")[0]));
            setShowDates(dates);
            const hasData = data?.filter(m => m.displayStart?.split(" ")[0] === dayjs().format("MM/DD/YYYY"))?.length > 0
            if (hasData) {
                setFilteredMeetings(data?.filter(m => m.displayStart?.split(" ")[0] === dayjs().format("MM/DD/YYYY")))
                setSelectedMeeting(null);
                setMeetingAttendees([]);
            } else {
                setFilteredMeetings([]);
            }
        }
    };

    const handleGetAllContact = async () => {
        const res = await getAllContacts();
        const data = res?.result?.map((item) => ({
            id: item.id,
            name: `${item?.firstName || ''} ${item?.lastName || ''}`.trim(),
            nameId: "",
            oppId: opportunityId,
            contactId: item.id,
            title: `${item?.firstName || ''} ${item?.lastName || ''}`.trim(),
            role: null,
            isKey: false,
            isAdd: false,
            salesforceContactId: item?.salesforceContactId,
            isDeleted: false,
        })) || [];
        setAllContacts(data);
    };

    useEffect(() => {
        handleGetAllAccounts();
        handleGetOpportunityDetails();
        handleGetOppContacts();
        handleGetAllSalesProcess();
        handleGetAllContact()
    }, [opportunityId]);

    useEffect(() => {
        handleGetMeeetingByOppId()
        if (selectedTab !== 1) {
            setOpenDrawer(true)
            setSelectedMeeting(null)
            setFilteredMeetings([])
            setMeetingAttendees([])
            setValue("meetingDate", null)
        }
    }, [selectedTab])

    useEffect(() => {
        const date = watch("meetingDate");
        if (date && meetings.length > 0) {
            const filtered = meetings.filter(m => m.displayStart?.split(" ")[0] === date);
            setFilteredMeetings(filtered);
            setSelectedMeeting(null);
            setMeetingAttendees([]);
        } else {
            setFilteredMeetings([]);
        }
    }, [watch("meetingDate")]);

    // ----------------------------
    // Logic: Field Saving
    // ----------------------------
    const handleSaveField = async (fieldName, newValue) => {
        const currentValues = getValues();

        const whyHtml = editorStateToHtml(whyDoAnythingState);
        const valHtml = editorStateToHtml(businessValueState);
        const envHtml = editorStateToHtml(currentEnvironmentState);

        let payload = {
            ...currentValues,
            [fieldName]: newValue,
            whyDoAnything: whyHtml,
            businessValue: valHtml,
            currentEnvironment: envHtml,
        };

        if (["listPrice", "discountPercentage", "dealAmount"].includes(fieldName)) {
            const toNumber = (v) => (v === null || v === "" || isNaN(Number(v))) ? null : Number(v);

            let lp = toNumber(fieldName === "listPrice" ? newValue : currentValues.listPrice);
            let dp = toNumber(fieldName === "discountPercentage" ? newValue : currentValues.discountPercentage);
            let da = toNumber(fieldName === "dealAmount" ? newValue : currentValues.dealAmount);

            if (fieldName === "listPrice") {
                if (lp !== null && dp !== null) da = lp - (lp * dp / 100);
                else if (lp !== null && da !== null) dp = ((lp - da) / lp) * 100;
                else if (lp !== null) da = lp;
            } else if (fieldName === "discountPercentage") {
                if (lp !== null && dp !== null) da = lp - (lp * dp / 100);
            } else if (fieldName === "dealAmount") {
                if (lp !== null && da !== null) dp = ((lp - da) / lp) * 100;
            }

            payload.listPrice = lp;
            payload.discountPercentage = dp ? parseFloat(dp.toFixed(2)) : null;
            payload.dealAmount = da ? parseFloat(da.toFixed(2)) : null;
        }
        // console.log("payload", payload)
        const res = await updateOpportunity(opportunityId, payload);
        if (res?.status === 200) {
            setValue(fieldName, newValue);
            if (["listPrice", "discountPercentage", "dealAmount"].includes(fieldName)) {
                setValue("listPrice", payload.listPrice);
                setValue("discountPercentage", payload.discountPercentage);
                setValue("dealAmount", payload.dealAmount);
            }
            //    setAlert({ open: true, message: "Saved successfully", type: "success" });
        } else {
            setAlert({ open: true, message: "Failed to save", type: "error" });
        }
    };

    const handleSaveEditor = async (key) => {
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
            nextSteps: watch("nextSteps"),
        };

        const res = await updateOpportunity(opportunityId, payload);

        if (res?.status === 200) {
            setWhyDoAnythingStateHTML(whyDoAnythingHtmlData);
            setBusinessValueStateHTML(businessValueHtmlData);
            setCurrentEnvironmentHTML(currentEnvironmentHtmlData);
        }
    };

    useClickOutside(whyCardRef, () => {
        if (!isEditingWhy) return;
        handleSaveEditor("whyDoAnything");
        setIsEditingWhy(false);
        setActiveEditorHint(null)
    }, isEditingWhy);

    useClickOutside(valueCardRef, () => {
        if (!isEditingValue) return;
        handleSaveEditor("businessValue");
        setIsEditingValue(false);
        setActiveEditorHint(null)
    }, isEditingValue);

    useClickOutside(envCardRef, () => {
        if (!isEditingEnv) return;
        handleSaveEditor("currentEnvironment");
        setIsEditingEnv(false);
    }, isEditingEnv);

    useClickOutside(nextStepsRef, () => {
        if (!isEditingNextSteps) return;
        handleSaveField("nextSteps", watch("nextSteps"));
        setIsEditingNextSteps(false);
    }, isEditingNextSteps);

    // ----------------------------
    // Logic: Contacts
    // ----------------------------
    const allContactsWithEdits = useMemo(() => {
        return (contacts || []).map((c) => {
            const edit = editedContacts.find((e) => String(e.id) === String(c.id));
            return { ...c, isKey: edit ? !!edit.isKey : !!c.isKey };
        });
    }, [contacts, editedContacts]);

    const currentKeyContactsCount = allContactsWithEdits.filter((c) => c.isKey).length;

    const handleToggleKeyContact = (id, isKey) => {
        setEditedContacts((prev) => {
            const next = [...prev];
            const idx = next.findIndex((e) => String(e.id) === String(id));
            if (idx >= 0) next[idx] = { id, isKey };
            else next.push({ id, isKey });
            return next;
        });
    };

    useClickOutside(selectContactsRef, async () => {
        if (!isSelectContactsOpen) return;
        if (editedContacts.length > 0) {
            const requestData = editedContacts.map(item => ({ id: item.id, isKey: item.isKey }));
            const res = await updateOpportunitiesContact(requestData);
            if (res?.status === 200) {
                handleGetOppContacts();
                // setAlert({ open: true, message: "Contacts updated", type: "success" });
            }
        }
        setIsSelectContactsOpen(false);
    }, isSelectContactsOpen);

    const openAddContactModal = () => {
        setContactRows([emptyContactRow()]);
        setIsAddContactOpen(true);
    };

    const closeAddContactModal = () => setIsAddContactOpen(false);

    const addContactRow = () => setContactRows((prev) => [...prev, emptyContactRow()]);

    const removeContactRow = (tempId) =>
        setContactRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.tempId !== tempId)));

    const updateContactRow = (tempId, key, value) =>
        setContactRows((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, [key]: value } : r)));

    const saveContactsFromModal = () => {

        closeAddContactModal();
    };

    const handleOpenDeleteDialog = async (id) => {
        setSelectedContactId(id)
        setDialogContact({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this contact?', actionButtonText: 'yes' })
    }

    const handleCloseDeleteDialog = async () => {
        setSelectedContactId(null)
        setDialogContact({ open: false, title: '', message: '', actionButtonText: '' })
    }

    const handleDeleteContact = async () => {
        const res = await deleteOpportunitiesContact(selectedContactId);
        if (res?.status === 200) {
            handleGetOppContacts();
            setDialogContact({ open: false, title: '', message: '', actionButtonText: '' });
        }
    };

    // ----------------------------
    // Logic: Logo (Fetch & Upload)
    // ----------------------------

    // 1. Upload Logic
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

    const handlePickLogoFile = (file) => {
        if (file) {
            const url = URL.createObjectURL(file);
            setLogoUploadDraft({ file, previewUrl: url, fileName: file.name });
        }
    };

    const saveUploadedLogo = async () => {
        if (!logoUploadDraft.file) return;

        const formData = new FormData();
        formData.append("file", logoUploadDraft.file);
        formData.append("folderName", "oppLogo");
        formData.append("userId", String(userdata?.userId || ""));

        // 1. Upload file to server/S3
        const res = await uploadFiles(formData);

        if (res?.data?.status === 200) {
            const { imageURL } = res.data.result[0];
            // 2. Update Opportunity with new URL
            const updateRes = await updateOpportunityLogo({ oppId: opportunityId, image: imageURL });
            if (updateRes.status === 200) {
                setValue("logo", updateRes?.result);
                setIsUploadLogoOpen(false);
                setLogoUploadDraft({ file: null, previewUrl: "", fileName: "" });
            } else {
                setAlert({ open: true, message: "Failed to update logo link", type: "error" });
            }
        } else {
            setAlert({ open: true, message: "File upload failed", type: "error" });
        }
    };

    const handleSaveFetchedLogo = () => {
        const d = normalizeDomain(domainDraft);
        if (!d) return;
        // console.log("d",)
        handleSaveField("logo", brandfetchSrc(d))
        // // setOpp((p) => ({ ...p, logoType: "brandfetch", logoDomain: d }));
        setIsFetchLogoOpen(false);
        setDomainDraft("");
    };

    // Close menus on click outside
    useClickOutside(logoMenuRef, () => setIsLogoMenuOpen(false), isLogoMenuOpen);

    // ----------------------------
    // Logic: Pricing Box
    // ----------------------------
    const openPricingBox = () => {
        setPricingDraft({
            listPrice: watch("listPrice"),
            discountPercentage: watch("discountPercentage"),
            dealAmount: watch("dealAmount"),
        });
        setShowPricingBox(true);
    };

    const handleSavePricing = async (draft) => {
        const currentValues = getValues();
        const toCleanNum = (val) => {
            if (!val) return null;
            const n = Number(String(val).replace(/,/g, ""));
            return isNaN(n) ? null : n;
        };

        const payload = {
            ...currentValues,
            listPrice: toCleanNum(draft.listPrice),
            discountPercentage: toCleanNum(draft.discountPercentage),
            dealAmount: toCleanNum(draft.dealAmount),
            // Include your editor states
            whyDoAnything: editorStateToHtml(whyDoAnythingState),
            businessValue: editorStateToHtml(businessValueState),
            currentEnvironment: editorStateToHtml(currentEnvironmentState),
        };

        // SINGLE API CALL
        const res = await updateOpportunity(opportunityId, payload);

        if (res?.status === 200) {
            // Update Hook Form state
            setValue("listPrice", payload.listPrice);
            setValue("discountPercentage", payload.discountPercentage);
            setValue("dealAmount", payload.dealAmount);
        }
    };

    useClickOutside(pricingBoxRef, async () => {
        if (!showPricingBox) return;

        // Call one function with the entire draft object
        await handleSavePricing(pricingDraft);

        setShowPricingBox(false);
    }, showPricingBox);

    // ----------------------------
    // Logic: Meetings & Notes
    // ----------------------------
    const handleSelectMeeting = async (mid) => {
        setSelectedMeeting(mid);
        const resAttendees = await getAllMeetingsAttendeesByMeetingId(mid);
        setMeetingAttendees(resAttendees?.result || []);

        const resNote = await getByMeetingId(mid);
        if (resNote?.status === 200) {
            const n = resNote.result || {};
            setValue("noteId", n.id);
            setPurposeHTML(n.purpose || ""); setPurposeState(htmlToEditorState(n.purpose));
            setBackgroundHTML(n.background || ""); setBackgroundState(htmlToEditorState(n.background));
            setAgendaHTML(n.agenda || ""); setAgendaState(htmlToEditorState(n.agenda));
            setAlignmentHTML(n.alignment || ""); setAlignmentState(htmlToEditorState(n.alignment));
        }
    };

    const saveMeetingNote = async (key) => {
        let html = "";
        if (key === "purpose") html = editorStateToHtml(purposeState);
        if (key === "background") html = editorStateToHtml(backgroundState);
        if (key === "agenda") html = editorStateToHtml(agendaState);
        if (key === "alignment") html = editorStateToHtml(alignmentState);

        const payload = {
            id: watch("noteId"),
            meetingId: selectedMeeting,
            purpose: key === "purpose" ? html : editorStateToHtml(purposeState),
            background: key === "background" ? html : editorStateToHtml(backgroundState),
            agenda: key === "agenda" ? html : editorStateToHtml(agendaState),
            alignment: key === "alignment" ? html : editorStateToHtml(alignmentState),
        };

        const res = payload.id ? await updateNote(payload.id, payload) : await saveNote(payload);
        if (res?.status === 200 || res?.status === 201) {
            if (!payload.id) setValue("noteId", res.result.id);
            if (key === "purpose") setPurposeHTML(html);
            if (key === "background") setBackgroundHTML(html);
            if (key === "agenda") setAgendaHTML(html);
            if (key === "alignment") setAlignmentHTML(html);
        }
    };

    useEffect(() => {
        if (!editingNoteField) return;
        const onMouseDown = (e) => {
            if (activeNoteEditorRef.current?.contains(e.target)) return;
            saveMeetingNote(editingNoteField);
            setEditingNoteField(null);
        };
        document.addEventListener("mousedown", onMouseDown, true);
        return () => document.removeEventListener("mousedown", onMouseDown, true);
    }, [editingNoteField, purposeState, backgroundState, agendaState, alignmentState]);

    // ----------------------------
    // Sub-Components
    // ----------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 1. Clean formatting
        let cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
        const parts = cleaned.split(".");
        if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");

        const [intPart, decimalPartRaw] = cleaned.split(".");
        let formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (decimalPartRaw !== undefined) {
            formatted = `${formatted}.${decimalPartRaw.slice(0, 2)}`;
        }

        // 2. Prepare values for calculation
        const toNum = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;

        // Use the new value for the field being changed, and existing draft values for the others
        let lp = name === "listPrice" ? toNum(formatted) : toNum(pricingDraft.listPrice);
        let dp = name === "discountPercentage" ? toNum(formatted) : toNum(pricingDraft.discountPercentage);
        let da = name === "dealAmount" ? toNum(formatted) : toNum(pricingDraft.dealAmount);

        let updatedDraft = { ...pricingDraft, [name]: formatted };

        // 3. Calculation Logic
        if (name === "listPrice" || name === "discountPercentage") {
            // Calculate Deal Amount: LP - (LP * DP / 100)
            const newDeal = lp - (lp * dp / 100);
            updatedDraft.dealAmount = newDeal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        } else if (name === "dealAmount") {
            // Calculate Discount %: ((LP - DA) / LP) * 100
            if (lp > 0) {
                const newDiscount = ((lp - da) / lp) * 100;
                updatedDraft.discountPercentage = newDiscount.toFixed(2);
            }
        }

        setPricingDraft(updatedDraft);
    };

    const OpportunityField = ({
        label,
        value,
        type = 'text',
        options = [],
        onSave,
        className = '',
        required = false,
        multiline = false,
        disabled = false
    }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(value);
        const containerRef = useRef(null);

        // Sync local state if external value changes
        useEffect(() => {
            if (!isEditing) setEditValue(value);
        }, [value, isEditing]);

        // Advanced Click Outside Logic
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (!isEditing) return;

                // 1. Check if target still exists in DOM (prevents 'ghost target' issues when MUI re-renders)
                if (!document.body.contains(event.target)) return;

                // 2. Check if click is inside the component container
                if (containerRef.current && containerRef.current.contains(event.target)) {
                    return;
                }

                // 3. Robust check for ALL MUI overlays
                const isInsideMuiOverlay =
                    event.target.closest(".MuiPopover-root") ||
                    event.target.closest(".MuiAutocomplete-popper") ||
                    event.target.closest(".MuiMenu-root") ||
                    event.target.closest(".MuiDialog-root") ||
                    event.target.closest(".MuiPickersPopper-root") || // Specific to DatePicker
                    event.target.closest(".MuiYearCalendar-root") ||
                    event.target.closest(".MuiMonthCalendar-root");

                if (isInsideMuiOverlay) return;

                handleSave();
            };

            // Use capture phase (true) to catch events before MUI's internal 'stopPropagations'
            document.addEventListener("mousedown", handleClickOutside, true);
            return () => document.removeEventListener("mousedown", handleClickOutside, true);
        }, [isEditing, editValue, value]);

        const formatNumberWithCommas = (val) => {
            if (!val && val !== 0) return "";
            const [intPartRaw, decimalRaw] = val.toString().split(".");
            const intPart = intPartRaw.replace(/\D/g, "");
            const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return decimalRaw !== undefined ? `${intWithCommas}.${decimalRaw.slice(0, 2)}` : intWithCommas;
        };

        const parseDealAmountToFloat = (val) => {
            if (!val) return null;
            const cleaned = val.toString().replace(/,/g, "");
            if (cleaned === "") return null;
            const num = parseFloat(cleaned);
            return Number.isNaN(num) ? null : parseFloat(num.toFixed(2));
        };

        const handleDoubleClick = () => {
            if (!disabled) {
                setIsEditing(true);
                if (label === "Deal Amount" || label === "List Amount") {
                    const raw = value?.toString().replace(/[$,]/g, "") || "";
                    setEditValue(raw === "" ? "" : formatNumberWithCommas(raw));
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
                finalValue = label === "Account"
                    ? options?.find((row) => (row.title === editValue || row.id === editValue))?.id
                    : options?.find((row) => (row.title === editValue || row.id === editValue))?.title;
            } else if (label === "Deal Amount" || label === "List Amount") {
                finalValue = parseDealAmountToFloat(editValue);
            } else {
                finalValue = editValue;
            }

            const original = (label === "Deal Amount" || label === "List Amount")
                ? parseDealAmountToFloat(value?.toString().replace(/[$,]/g, ''))
                : value;

            if (finalValue !== original) {
                await onSave(finalValue);
            }
            setIsEditing(false);
        };

        const handleChange = (e) => {
            const val = e.target.value;
            if (label === "Deal Amount" || label === "List Amount") {
                let cleaned = val.replace(/,/g, "").replace(/[^\d.]/g, "");
                const parts = cleaned.split(".");
                if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");
                const [intPart, decimalPartRaw] = cleaned.split(".");
                let formatted = (intPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                if (decimalPartRaw !== undefined) {
                    formatted = `${formatted}.${decimalPartRaw.slice(0, 2)}`;
                }
                setEditValue(val.trim() === "" ? "" : formatted);
            } else {
                setEditValue(val);
            }
        };

        const displayValue = value || '—';

        return (
            <div ref={containerRef} className={`flex justify-start items-center text-sm py-1 ${className} w-full`}>
                <div className="text-gray-900 font-semibold text-base w-full break-words">
                    {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                            {type === 'select' ? (
                                <div className="w-full max-w-52">
                                    <Select
                                        value={options?.find((row) => (row.title === editValue || row.id === editValue))?.id || null}
                                        options={options}
                                        onChange={(_, newValue) => setEditValue(newValue ? newValue.id : null)}
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
                                        onChange={(date) => setEditValue(date ? dayjs(date).format("MM/DD/YYYY") : null)}
                                        format="MM/DD/YYYY"
                                        disabled={disabled}
                                        minDate={dayjs(new Date())}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: "outlined",
                                                autoFocus: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                        '& fieldset': {
                                                            borderColor: theme.palette.secondary.main,
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: theme.palette.secondary.main,
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: theme.palette.secondary.main,
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: theme.palette.text.primary,
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: theme.palette.text.primary,
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        color: theme.palette.text.primary,
                                                        height: 7,
                                                    },
                                                    '& .MuiInputLabel-root.Mui-disabled': {
                                                        color: theme.palette.text.primary,
                                                    },

                                                    // ✅ disabled input text color (important one)
                                                    '& .MuiInputBase-input.Mui-disabled': {
                                                        color: theme.palette.text.primary,
                                                        WebkitTextFillColor: theme.palette.text.primary,
                                                    },
                                                    '& .MuiFormHelperText-root': {
                                                        color: theme.palette.error.main,
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        marginX: 0.5,
                                                    },
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;',
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            ) : (
                                <Input
                                    value={editValue || ''}
                                    onChange={handleChange}
                                    autoFocus
                                    error={(!editValue || editValue === "") && required}
                                    multiline={multiline}
                                    rows={multiline ? 3 : 1}
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    ) : (
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <span onClick={handleDoubleClick} className="cursor-pointer px-1 rounded block">
                                    {displayValue}
                                </span>
                            }
                            fallbackComponent={
                                <span className="px-1 rounded block">{displayValue}</span>
                            }
                        />
                    )}
                </div>
            </div>
        );
    };

    const StageTimeline = ({ stages, currentStageId }) => {
        return (
            <div className="py-4 mb-0">
                <div className="flex flex-wrap xl:justify-evenly gap-1 overflow-x-auto pb-1">
                    {stages?.map((stage) => {
                        const isActive = stage.id === currentStageId;
                        const isCompleted = currentStageId !== null && stage.id < currentStageId;
                        let pillClasses = isActive ? "bg-[#1072E0] text-white border-[#1072E0]" :
                            isCompleted ? "bg-[#E3F2FD] text-[#1072E0] border-[#B3D7FF] cursor-pointer" :
                                "bg-white text-gray-700 border-gray-300 cursor-pointer";
                        return (
                            <div key={stage.id} onClick={() => { if (!isActive) handleSaveField("salesStage", stage.title); }}>
                                <div className={`inline-flex items-center justify-center px-3 py-2 text-xs font-semibold border rounded-full whitespace-nowrap transition-all duration-150 ${pillClasses}`}>
                                    <span>{stage.title}</span>
                                    {isCompleted && <CustomIcons iconName="fa-solid fa-check" css="h-3 w-3 inline-block ml-2" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
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
            } else {
                setAlert({
                    open: true,
                    message: res.message,
                    type: "error"
                })
            }
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
                                <span className="font-bold text-black">Go Live: </span>
                                {goLiveText}
                            </span>
                        )}

                        {reasonText && (
                            <span className="truncate max-w-[50%] text-right" title={reasonText}>
                                <span className="font-bold text-black">Reason: </span>
                                {reasonText}
                            </span>
                        )}
                    </div>
                )}

            </div>
        );
    };

    const handleGetAllMeetingAttendees = async (mid = null) => {
        if (opportunityId && selectedTab === 1 && mid) {
            const res = await getAllMeetingsAttendeesByMeetingId(mid)
            setMeetingAttendees(res?.result)
        }
    }

    const MeetingNotesTable = () => {
        const rows = [
            { key: "purpose", label: "Purpose", html: purposeHTML, state: purposeState, setState: setPurposeState },
            { key: "background", label: "Background", html: backgroundHTML, state: backgroundState, setState: setBackgroundState },
            { key: "agenda", label: "Agenda", html: agendaHTML, state: agendaState, setState: setAgendaState },
            { key: "alignment", label: "Alignment", html: alignmentHTML, state: alignmentState, setState: setAlignmentState },
        ];
        return (
            <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                <table className="w-full border-collapse">
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.key} className="border-b last:border-b-0">
                                <td className="w-[25%] align-top bg-gray-50 border-r border-gray-300 px-4 py-2 font-bold text-gray-900">{r.label}</td>
                                <td className="align-top px-4 py-2">
                                    {editingNoteField === r.key ? (
                                        <div ref={activeNoteEditorRef} className="editor-container-integrated">
                                            <Editor
                                                editorState={r.state}
                                                onEditorStateChange={r.setState}
                                                toolbar={toolbarProperties}
                                                wrapperClassName="editor-wrapper-custom"
                                                editorClassName="editor-main-custom"
                                                toolbarClassName="editor-toolbar-custom"
                                            />
                                        </div>
                                    ) : (
                                        <div className="cursor-pointer p-2 min-h-[2rem]" onClick={() => setEditingNoteField(r.key)}>
                                            {isEmptyHtml(r.html) ? <span className="text-gray-400 italic">Enter {r.label}...</span> : <div dangerouslySetInnerHTML={{ __html: r.html }} />}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const handleOpenAttendeesModel = (id = null) => {
        setSelectedMeetingAttendeesId(id)
        setAttendeesModelOpen(true)
    }

    const handleCloseAttendeesModel = () => {
        setSelectedMeetingAttendeesId(null)
        setAttendeesModelOpen(false)
    }

    const handleOpenDeleteAttendees = (id) => {
        setSelectedMeetingAttendeesId(id)
        setDeleteAttendees({ open: true, title: 'Delete Attendees', message: 'Are you sure! Do you want to delete this attendees?', actionButtonText: 'Yes' })
    }

    const handleCloseDeleteAttendees = () => {
        setSelectedMeetingAttendeesId(null)
        setDeleteAttendees({ open: false, title: '', message: '', actionButtonText: '' })
    }

    const handleDeleteAttendees = async () => {
        const res = await deleteMeetingAttendees(selectedMeetingAttendeesId)
        if (res.status === 200) {
            handleGetAllMeetingAttendees(selectedMeeting)
            handleCloseDeleteAttendees()
        } else {
            setAlert({
                open: true,
                message: res.message || "Fail to delete attendees",
                type: "error"
            })
        }
    }

    // ----------------------------
    // Render
    // ----------------------------
    const currentStageId = opportunityStages.find(s => s.title === watch("salesStage"))?.id;
    const logoUrl = watch("logo");

    // 1. Define the grid layout in a variable to ensure alignment matches perfectly.
    // I used minmax(0, Xfr) to prevent inputs from forcing columns to expand.
    const GRID_LAYOUT =
        "grid [grid-template-columns:minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,0.4fr)] gap-3 items-center px-4 py-3";
    return (
        <div className="mx-auto relative p-4 sm:p-6 my-3">
            {/* Navigation & Hint */}
            <div>
                <div className='absolute top-1 left-5'>
                    <div className='w-10 h-10 p-2 cursor-pointer flex items-center justify-center' onClick={() => navigate("/dashboard/opportunities")}>
                        <CustomIcons iconName="fa-solid fa-arrow-left" css="h-5 w-5 text-gray-600" />
                    </div>
                </div>
                {selectedTab === 0 && <div className="absolute top-2 right-5"><p className="text-red-600 text-lg"><strong>Note:&nbsp;</strong>Fields can be edited by clicking.</p></div>}
            </div>

            <div className="my-3">
                <Tabs tabsData={tableData} selectedTab={selectedTab} handleChange={setSelectedTab} />
            </div>

            {selectedTab === 0 && (
                <>
                    {/* Header Grid */}
                    <div className="flex justify-center items-center gap-10">
                        {/* Logo Section */}
                        <div className="flex justify-center md:justify-start items-center relative">
                            <div className="w-24 h-24 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 overflow-hidden"
                                onClick={() => setIsLogoMenuOpen(!isLogoMenuOpen)}>
                                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center"><CustomIcons iconName="fa-solid fa-image" css="mb-3 w-6 h-6" /><p className="text-xs">Logo</p></div>}
                                {
                                    logoUrl && (
                                        <div className="z-50 absolute -top-1 right-0 h-6 w-6 flex justify-center items-center rounded-full border border-red-500 bg-red-500">
                                            <button type="button" onClick={handleOpenDeleteLogoDialog}>
                                                <CustomIcons
                                                    iconName="fa-solid fa-xmark"
                                                    css="cursor-pointer text-white"
                                                />
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                            {isLogoMenuOpen && (
                                <div ref={logoMenuRef} className="absolute z-50 left-0 top-28 w-48 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
                                    <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setIsUploadLogoOpen(true); setIsLogoMenuOpen(false); }}>
                                        <CustomIcons iconName="fa-solid fa-upload" css="h-4 w-4" /> Upload Logo
                                    </button>
                                    <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 border-t" onClick={() => { setIsFetchLogoOpen(true); setIsLogoMenuOpen(false); }}>
                                        <CustomIcons iconName="fa-solid fa-cloud-arrow-down" css="h-4 w-4" /> Fetch Logo
                                    </button>
                                </div>
                            )}

                            {/* 1. Upload Logo Modal */}
                            {isUploadLogoOpen && (
                                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
                                    <div
                                        ref={uploadLogoRef}
                                        className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                                            <p className="text-sm font-semibold text-gray-900">Upload Logo</p>
                                            <button
                                                type="button"
                                                className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                                                onClick={() => setIsUploadLogoOpen(false)}
                                                title="Close"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Body */}
                                        <div className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-20 w-20 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center bg-white">
                                                    {logoUploadDraft.previewUrl ? (
                                                        <img
                                                            src={logoUploadDraft.previewUrl}
                                                            alt="Preview"
                                                            className="h-20 w-20 object-cover"
                                                        />
                                                    ) : (
                                                        <CustomIcons iconName="fa-solid fa-image" css="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-600 mb-1">Choose an image (PNG, JPG, SVG, WEBP)</p>

                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handlePickLogoFile(e.target.files?.[0])}
                                                    />

                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        Select File
                                                    </button>

                                                    {logoUploadDraft.fileName ? (
                                                        <p className="mt-2 text-xs text-gray-500 truncate" title={logoUploadDraft.fileName}>
                                                            {logoUploadDraft.fileName}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Footer buttons */}
                                            <div className="flex justify-end gap-2 mt-5">
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                                                    onClick={() => setIsUploadLogoOpen(false)}
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    className={`px-4 py-2 text-sm rounded-md text-white ${logoUploadDraft.previewUrl ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                                                        }`}
                                                    disabled={!logoUploadDraft.previewUrl}
                                                    onClick={saveUploadedLogo}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                // <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
                                //     <div ref={uploadLogoRef} className="w-full max-w-md rounded-xl bg-white shadow-2xl border p-4">
                                //         <h3 className="font-semibold text-lg mb-4">Upload Logo</h3>
                                //         <div className="flex items-center gap-4 mb-4">
                                //             <div className="h-20 w-20 rounded-full border flex items-center justify-center overflow-hidden bg-gray-50">
                                //                 {logoUploadDraft.previewUrl ? <img src={logoUploadDraft.previewUrl} className="h-full w-full object-cover" /> : <CustomIcons iconName="fa-solid fa-image" css="h-6 w-6 text-gray-400" />}
                                //             </div>
                                //             <div>
                                //                 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePickLogoFile(e.target.files[0])} />
                                //                 <button className="px-4 py-2 text-sm border rounded hover:bg-gray-50 mb-1" onClick={() => fileInputRef.current?.click()}>Select File</button>
                                //                 {logoUploadDraft.fileName && <p className="text-xs text-gray-500 truncate max-w-[200px]">{logoUploadDraft.fileName}</p>}
                                //             </div>
                                //         </div>
                                //         <div className="flex justify-end gap-2">
                                //             <button className="px-4 py-2 text-sm border rounded" onClick={() => setIsUploadLogoOpen(false)}>Cancel</button>
                                //             <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded" onClick={saveUploadedLogo}>Save</button>
                                //         </div>
                                //     </div>
                                // </div>
                            )}

                            {/* 2. Fetch Logo Modal */}
                            {isFetchLogoOpen && (
                                <div
                                    ref={fetchLogoRef}
                                    className="absolute z-50 left-0 top-28 w-80 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                                        <p className="text-sm font-semibold text-gray-900">Fetch Logo</p>
                                        <button
                                            type="button"
                                            className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                                            onClick={() => {
                                                setIsFetchLogoOpen(false);
                                                setDomainDraft("");
                                            }}
                                            title="Close"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Domain</label>
                                        <input
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g. google.com"
                                            value={domainDraft}
                                            onChange={(e) => setDomainDraft(e.target.value)}
                                        />

                                        <div className="flex justify-end gap-2 mt-4">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                                                onClick={() => {
                                                    setIsFetchLogoOpen(false);
                                                    setDomainDraft("");
                                                }}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                className={`px-4 py-2 text-sm rounded-md text-white ${normalizeDomain(domainDraft) ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                                                    }`}
                                                disabled={!normalizeDomain(domainDraft)}
                                                onClick={handleSaveFetchedLogo}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="flex justify-center items-center w-full">
                            <OpportunityField
                                label="Account"
                                value={getDisplayName(watch("accountId"), accounts)}
                                type="select"
                                options={accounts}
                                onSave={(newValue) => handleSaveField("accountId", newValue)}
                            />

                            {/* Pricing Popover Trigger */}
                            <div className="relative cursor-pointer w-full">
                                <p className="font-semibold text-black" onClick={openPricingBox}>
                                    {watch("dealAmount") ? `$${Number(watch("dealAmount")).toLocaleString()}` : "—"}
                                </p>
                                {showPricingBox && (
                                    <div ref={pricingBoxRef} className="absolute z-50 right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-lg py-2 px-4 flex justify-start items-center gap-3">
                                        <div>
                                            <label className="text-xs font-semibold">List Amount</label>
                                            <Input
                                                name="listPrice"
                                                placeholder="0.00"
                                                value={pricingDraft.listPrice || ""}
                                                onChange={handleChange}
                                                error={pricingDraft.listPrice === ""}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold">Discount (%)</label>
                                            <Input
                                                name="discountPercentage"
                                                placeholder="0"
                                                value={pricingDraft.discountPercentage || ""}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold">Deal Amount</label>
                                            <Input
                                                name="dealAmount"
                                                placeholder="0.00"
                                                value={pricingDraft.dealAmount || ""}
                                                onChange={handleChange}
                                            />
                                        </div>

                                    </div>
                                )}
                            </div>

                            <OpportunityField
                                label="Opportunity Name"
                                value={watch("opportunity")}
                                type="text"
                                onSave={(newValue) => handleSaveField("opportunity", newValue)}
                                required={true}
                            />
                            <OpportunityField
                                label="Close Date"
                                value={formatDate(watch("closeDate"))}
                                type="date"
                                onSave={(newValue) => handleSaveField("closeDate", newValue)}
                                required={true}
                            />
                            <OpportunityField
                                label="Status"
                                value={watch("status")}
                                type="select"
                                options={opportunityStatus}
                                onSave={(newValue) => handleSaveField("status", newValue)}
                                required={true}
                            />
                        </div>
                    </div>

                    <StageTimeline stages={opportunityStages} currentStageId={currentStageId} />

                    {/* 3-Column Layout: Why, Value, Contacts */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 my-3">
                        {/* Why Do Anything */}
                        <div ref={whyCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 min-h-[15rem] relative flex flex-col">
                            <p className="font-medium text-black tracking-wider text-2xl text-center mb-4 shrink-0">
                                Why Do Anything
                            </p>

                            <div
                                className={`flex-1 ${!isEditingWhy ? 'cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors overflow-y-auto' : ''}`}
                                onClick={() => !isEditingWhy && setIsEditingWhy(true)}
                            >
                                {isEditingWhy ? (
                                    <div className="editor-container-integrated">
                                        <Editor
                                            editorState={whyDoAnythingState}
                                            wrapperClassName="editor-wrapper-custom"
                                            editorClassName="editor-main-custom"
                                            toolbarClassName="editor-toolbar-custom"
                                            onEditorStateChange={setWhyDoAnythingState}
                                            toolbar={toolbarProperties}
                                            onFocus={() => setActiveEditorHint("WhyDoAnything")}
                                            onBlur={() => setActiveEditorHint(null)}
                                            autoFocus
                                        />
                                        {activeEditorHint === "WhyDoAnything" && (
                                            <div className="absolute top-0 right-[-240px] hidden xl:block bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-3
                            before:content-[''] before:absolute before:top-10 before:left-[-8px] 
                            before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
                                                <img
                                                    src="/images/WhyDoAnything2.png"
                                                    alt="WhyDoAnything Hint"
                                                    className="max-w-[200px] rounded-lg object-contain relative z-10"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className="prose prose-sm max-w-none text-gray-800"
                                        dangerouslySetInnerHTML={{
                                            __html: whyDoAnythingStateHTML || ""
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Value */}
                        <div ref={valueCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 min-h-[15rem] relative flex flex-col">
                            <p className="font-medium text-black tracking-wider text-2xl text-center mb-4 shrink-0">Value</p>

                            <div
                                className={`flex-1 ${!isEditingValue ? 'cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors overflow-y-auto' : ''}`}
                                onClick={() => !isEditingValue && setIsEditingValue(true)}
                            >
                                {isEditingValue ? (
                                    <div className="editor-container-integrated">
                                        <Editor
                                            editorState={businessValueState}
                                            wrapperClassName="editor-wrapper-custom"
                                            editorClassName="editor-main-custom"
                                            toolbarClassName="editor-toolbar-custom"
                                            onEditorStateChange={setBusinessValueState}
                                            toolbar={toolbarProperties}
                                            onFocus={() => setActiveEditorHint("BusinessValue")}
                                            onBlur={() => setActiveEditorHint(null)}
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="prose prose-sm max-w-none text-gray-800"
                                        dangerouslySetInnerHTML={{
                                            __html: businessValueStateHTML || ""
                                        }}
                                    />
                                )}

                                {/* Floating Hint Image */}
                                {activeEditorHint === "BusinessValue" && (
                                    <div className="absolute top-0 right-[-240px] hidden xl:block bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-3
                            before:content-[''] before:absolute before:top-10 before:left-[-8px] 
                            before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
                                        <img
                                            src="/images/BusinessValue2.png"
                                            alt="Business value guidance"
                                            className="max-w-[200px] rounded-lg object-contain relative z-10"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Key Contacts */}
                        <div className="border-2 border-black p-3 rounded-3xl flex flex-col relative h-60">
                            <div className="flex justify-start items-center mb-4">
                                <p className="font-medium text-black tracking-wider text-2xl text-center grow">Key Contacts</p>
                                <div className="flex items-center gap-2">
                                    <Tooltip title="Select">
                                        <button className="h-6 px-3 rounded-full border text-xs text-white bg-black" onClick={() => setIsSelectContactsOpen(!isSelectContactsOpen)}>Select</button>
                                    </Tooltip>
                                    <Tooltip title="Add New">
                                        <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full">
                                            <Components.IconButton onClick={() => openAddContactModal()}>
                                                <CustomIcons iconName="fa-solid fa-plus" css="h-3 w-3 text-white" />
                                            </Components.IconButton>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>

                            {isSelectContactsOpen && (
                                <div ref={selectContactsRef} className="absolute top-10 right-2 z-20 w-[360px] rounded-xl bg-white shadow-xl border border-gray-200 p-3 max-h-80 overflow-y-auto">
                                    {allContactsWithEdits.map(c => (
                                        <div key={c.id} className="flex items-center gap-2 mb-2 p-2 border rounded">
                                            <Checkbox checked={!!c.isKey} onChange={() => handleToggleKeyContact(c.id, !c.isKey)} disabled={currentKeyContactsCount >= 4 && !c.isKey} />
                                            <div className="grow"><p className="text-sm font-bold">{c.contactName}</p><p className="text-xs">{c.role}</p></div>
                                            <Components.IconButton onClick={() => handleOpenDeleteDialog(c.id)}>
                                                <CustomIcons iconName="fa-solid fa-trash" css="text-red-500 cursor-pointer h-4 w-4" />
                                            </Components.IconButton>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Contact Modal */}
                            {isAddContactOpen && (
                                <div className="absolute top-0 -left-[600px] right-20 z-10 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-end px-5 py-1 border-b">
                                        <button
                                            onClick={closeAddContactModal}
                                            className="h-9 w-9 rounded-md hover:bg-gray-100 flex items-center justify-center"
                                            type="button"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Table */}
                                    <div className="px-4 py-4">
                                        {/* HEADER */}
                                        <div
                                            className={`
        rounded-xl bg-[#5B45A6] text-white text-sm font-semibold
        ${GRID_LAYOUT} 
      `}
                                        >
                                            {/* Name + Add */}
                                            <div className="flex items-center gap-3">
                                                <span>Name</span>
                                            </div>

                                            <div>First Name</div>
                                            <div>Last Name</div>
                                            <div>Email</div>
                                            <div>Title</div>
                                            <div>Role</div>
                                            <div className="text-center">Key</div>
                                            <div className="text-right">
                                                <button
                                                    type="button"
                                                    onClick={addContactRow}
                                                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                                                    title="Add row"
                                                >
                                                    <CustomIcons
                                                        iconName="fa-solid fa-plus"
                                                        css="text-white text-xs"
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* ROWS */}
                                        <div className="mt-3 space-y-3">
                                            {contactRows.map((row) => (
                                                <div
                                                    key={row.tempId}
                                                    className={`
            rounded-xl border border-gray-200 bg-white
            ${GRID_LAYOUT}
          `}
                                                >
                                                    {/* Name */}
                                                    <div className="w-full">
                                                        <Select
                                                            options={allContacts}
                                                            placeholder="Select name"
                                                            freeSolo={true}
                                                            value={row.nameId ? Number(row.nameId) : null}
                                                            onChange={(e, newValue) => {
                                                                if (typeof newValue === "object" && newValue?.id) {
                                                                    updateContactRow(
                                                                        row.tempId,
                                                                        "nameId",
                                                                        String(newValue.id)
                                                                    );
                                                                    updateContactRow(
                                                                        row.tempId,
                                                                        "name",
                                                                        newValue?.name ?? ""
                                                                    );
                                                                }
                                                            }}
                                                            onInputChange={(e, inputValue) => {
                                                                updateContactRow(row.tempId, "name", inputValue);
                                                                if (inputValue) updateContactRow(row.tempId, "nameId", "");
                                                            }}
                                                        />
                                                    </div>

                                                    {/* First Name */}
                                                    <div className="w-full">
                                                        <Input
                                                            value={row.firstName || ""}
                                                            placeholder="First"
                                                            type="text"
                                                            onChange={(e) =>
                                                                updateContactRow(row.tempId, "firstName", e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    {/* Last Name */}
                                                    <div className="w-full">
                                                        <Input
                                                            value={row.lastName || ""}
                                                            placeholder="Last"
                                                            type="text"
                                                            onChange={(e) =>
                                                                updateContactRow(row.tempId, "lastName", e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    {/* Email */}
                                                    <div className="w-full">
                                                        <Input
                                                            value={row.email || ""}
                                                            placeholder="Email"
                                                            type="email"
                                                            onChange={(e) =>
                                                                updateContactRow(row.tempId, "email", e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    {/* Title */}
                                                    <div className="w-full">
                                                        <Input
                                                            value={row.title || ""}
                                                            placeholder="Title"
                                                            type="text"
                                                            onChange={(e) =>
                                                                updateContactRow(row.tempId, "title", e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    {/* Role */}
                                                    <div className="w-full">
                                                        <Select
                                                            options={opportunityContactRoles}
                                                            label={null}
                                                            placeholder="Role"
                                                            value={row.roleId ? Number(row.roleId) : null}
                                                            onChange={(_, newValue) =>
                                                                updateContactRow(
                                                                    row.tempId,
                                                                    "roleId",
                                                                    newValue?.id ? String(newValue.id) : ""
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {/* Key */}
                                                    <div className="flex justify-center">
                                                        <Checkbox
                                                            checked={!!row.isKeyContact}
                                                            onChange={(e) =>
                                                                updateContactRow(
                                                                    row.tempId,
                                                                    "isKeyContact",
                                                                    e.target.checked
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {/* Actions (trash) */}
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeContactRow(row.tempId)}
                                                            className="h-9 w-9 rounded-lg hover:bg-red-50 flex items-center justify-center"
                                                            title="Remove"
                                                        >
                                                            <CustomIcons
                                                                iconName="fa-solid fa-trash"
                                                                css="text-red-600 text-sm"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 px-5 py-4 border-t">
                                        <button
                                            type="button"
                                            onClick={saveContactsFromModal}
                                            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="overflow-y-auto">
                                <ul className="pl-3 text-base">
                                    {allContactsWithEdits?.filter((row) => row.isKey === true)?.length > 0 ? allContactsWithEdits?.filter((row) => row.isKey === true)?.map((c) => (
                                        <li key={c.id}>
                                            <span className="font-medium text-indigo-600 text-base">
                                                {c.contactName}
                                                {c.title && (
                                                    <span className="text-base text-gray-500">
                                                        <span className="mx-1">–</span>
                                                        {c.title}
                                                    </span>
                                                )}
                                            </span>
                                            {c.role && (
                                                <>
                                                    <span className="mx-1">–</span>
                                                    <span className="text-indigo-600 text-base">{c.role}</span>
                                                </>
                                            )}
                                        </li>
                                    )) : <p className="text-sm text-gray-400 italic">No contacts linked to this opportunity.</p>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 3-Column Layout: Decision, Env, Next Steps */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {/* Decision Map */}
                        <div className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 h-60 flex flex-col">
                            <div className="flex justify-between mb-4 flex-none">
                                <p className="font-medium text-black tracking-wider text-2xl">Decision Map</p>
                                <div
                                    className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white cursor-pointer"
                                    onClick={() => setOpenDecisionMapModel(true)}
                                >
                                    <CustomIcons iconName="fa-solid fa-plus" css="h-3 w-3" />
                                </div>
                            </div>

                            {/* Component: Now 'h-full' will mean '100% of the REMAINING space' */}
                            <DecisionMapTimeline items={salesProcess} />
                        </div>

                        {/* Current Environment */}
                        <div ref={envCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 min-h-[15rem] relative flex flex-col">
                            <p className="font-medium text-black tracking-wider text-2xl text-center mb-4 shrink-0">
                                Current Environment
                            </p>

                            <div
                                className={`flex-1 ${!isEditingEnv ? 'cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors overflow-y-auto' : ''}`}
                                onClick={() => !isEditingEnv && setIsEditingEnv(true)}
                            >
                                {isEditingEnv ? (
                                    <div className="editor-container-integrated">
                                        <Editor
                                            editorState={currentEnvironmentState}
                                            wrapperClassName="editor-wrapper-custom"
                                            editorClassName="editor-main-custom"
                                            toolbarClassName="editor-toolbar-custom"
                                            onEditorStateChange={setCurrentEnvironmentState}
                                            toolbar={toolbarProperties}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="prose prose-sm max-w-none text-gray-800"
                                        dangerouslySetInnerHTML={{
                                            __html: currentEnvironmentHTML || "<span class='text-gray-400 italic'>Click to describe current environment...</span>"
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div ref={nextStepsRef} className="border-2 border-black p-3 rounded-3xl flex flex-col h-60 cursor-pointer" onClick={() => setIsEditingNextSteps(true)}>
                            <p className="font-medium text-black tracking-wider text-2xl text-center mb-2">Next Steps</p>
                            {isEditingNextSteps ?
                                <Input multiline rows={6} value={watch("nextSteps")} onChange={e => setValue("nextSteps", e.target.value)} /> :
                                <div className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{watch("nextSteps") || <span className="italic text-gray-400">No steps defined.</span>}</div>
                            }
                        </div>
                    </div>
                </>
            )}

            {/* Notes Tab */}
            {selectedTab === 1 && (
                <div className="flex justify-start items-start gap-4">
                    <div className={`${openDrawer ? "w-56 md:w-80 " : "w-0 md:w-0 "} transition-all duration-300 ease-in-out overflow-hidden`}>
                        <DatePickerComponent
                            name="meetingDate"
                            label="Meeting Date"
                            control={control}
                            setValue={setValue}
                            showDates={showDates}
                        />
                        {
                            filteredMeetings?.length > 0 && (
                                <div class="rounded-md border border-gray-200 bg-white py-4 px-2 mt-3">
                                    <div class="flex h-[400px] w-full flex-col overflow-y-scroll">
                                        {
                                            filteredMeetings?.map((row, index) => (
                                                <button key={index} onClick={() => handleSelectMeeting(row.id)} class={`mb-2 group flex items-center gap-x-5 rounded-md px-2.5 py-2 transition-all duration-75 ${selectedMeeting === row.id ? "bg-blue-500" : "hover:bg-gray-100 "} `}>
                                                    <div class={`flex flex-col items-start justify-between font-light ${selectedMeeting === row.id ? "text-white" : "text-gray-600"} `}>
                                                        <p class="text-[15px] font-semibold">{row.title}</p>
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </div>

                    <div className="w-full">
                        {selectedMeeting && (
                            <div>
                                <div className="min-h-40 overflow-y-auto border rounded-md overflow-hidden">
                                    <table className="min-w-full border-collapse">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                <th colSpan={1}>
                                                    <div className='flex justify-start items-center pl-5'>
                                                        {
                                                            !openDrawer ? (
                                                                <Components.IconButton onClick={() => setOpenDrawer(true)}>
                                                                    <CustomIcons iconName={`fa-solid fa-bars`} css={"text-black text-lg"} />
                                                                </Components.IconButton>
                                                            ) :
                                                                <Components.IconButton onClick={() => setOpenDrawer(false)}>
                                                                    <CustomIcons iconName={`fa-solid fa-angle-left`} css={"text-black text-lg"} />
                                                                </Components.IconButton>
                                                        }
                                                    </div>
                                                </th>
                                                <th colSpan={3} className="px-4 py-3 text-center text-lg font-bold text-black">Attendees</th>
                                                <th className="px-4 py-3 text-sm font-semibold flex justify-end">
                                                    <Tooltip title="Add Attendees" arrow>
                                                        <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                            <Components.IconButton onClick={() => handleOpenAttendeesModel()}>
                                                                <CustomIcons iconName="fa-solid fa-plus" css="h-4 w-4 text-white" />
                                                            </Components.IconButton>
                                                        </div>
                                                    </Tooltip>
                                                </th>
                                            </tr>
                                            <tr className="bg-gray-200 text-black">
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Notes</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {meetingAttendees?.length > 0 ? (
                                                meetingAttendees.map((row, i) => (
                                                    <tr key={row.contactId ?? i} className={`bg-white border-b-1 border-t-0 border-l-0 border-r-0 ${i !== meetingAttendees?.length - 1 ? "border" : ""}`}>
                                                        <td className="px-4 py-3 text-sm">
                                                            {row.contactName || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {row.title || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {row.role || '—'}
                                                        </td>
                                                        <td className="white-space-pre-line px-4 py-3 text-sm">
                                                            {row.note || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 flex justify-end items-center gap-3">
                                                            <Tooltip title="Edit" arrow>
                                                                <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                    <Components.IconButton onClick={() => handleOpenAttendeesModel(row.id)}>
                                                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                                                    </Components.IconButton>
                                                                </div>
                                                            </Tooltip>
                                                            <Tooltip title="Delete" arrow>
                                                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                    <Components.IconButton onClick={() => handleOpenDeleteAttendees(row.id)}>
                                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                                                    </Components.IconButton>
                                                                </div>
                                                            </Tooltip>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-4 text-center text-sm font-semibold">
                                                        No records
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="my-4">
                                    <MeetingNotesTable />
                                </div>

                                {/* 3-Column Layout: Why, Value, Contacts */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 my-3">
                                    {/* Why Do Anything */}
                                    <div ref={whyCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 min-h-[15rem] relative flex flex-col">
                                        <p className="font-medium text-black tracking-wider text-2xl text-center mb-4 shrink-0">
                                            Why Do Anything
                                        </p>

                                        <div
                                            className={`flex-1 ${!isEditingWhy ? 'cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors overflow-y-auto' : ''}`}
                                            onClick={() => !isEditingWhy && setIsEditingWhy(true)}
                                        >
                                            {isEditingWhy ? (
                                                <div className="editor-container-integrated">
                                                    <Editor
                                                        editorState={whyDoAnythingState}
                                                        wrapperClassName="editor-wrapper-custom"
                                                        editorClassName="editor-main-custom"
                                                        toolbarClassName="editor-toolbar-custom"
                                                        onEditorStateChange={setWhyDoAnythingState}
                                                        toolbar={toolbarProperties}
                                                        onFocus={() => setActiveEditorHint("WhyDoAnything")}
                                                        onBlur={() => setActiveEditorHint(null)}
                                                        autoFocus
                                                    />
                                                    {activeEditorHint === "WhyDoAnything" && (
                                                        <div className="absolute top-0 right-[-240px] hidden xl:block bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-3
                            before:content-[''] before:absolute before:top-10 before:left-[-8px] 
                            before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
                                                            <img
                                                                src="/images/WhyDoAnything2.png"
                                                                alt="WhyDoAnything Hint"
                                                                className="max-w-[200px] rounded-lg object-contain relative z-10"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className="prose prose-sm max-w-none text-gray-800"
                                                    dangerouslySetInnerHTML={{
                                                        __html: whyDoAnythingStateHTML || ""
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Value */}
                                    <div ref={valueCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 min-h-[15rem] relative flex flex-col">
                                        <p className="font-medium text-black tracking-wider text-2xl text-center mb-4 shrink-0">Value</p>

                                        <div
                                            className={`flex-1 ${!isEditingValue ? 'cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors overflow-y-auto' : ''}`}
                                            onClick={() => !isEditingValue && setIsEditingValue(true)}
                                        >
                                            {isEditingValue ? (
                                                <div className="editor-container-integrated">
                                                    <Editor
                                                        editorState={businessValueState}
                                                        wrapperClassName="editor-wrapper-custom"
                                                        editorClassName="editor-main-custom"
                                                        toolbarClassName="editor-toolbar-custom"
                                                        onEditorStateChange={setBusinessValueState}
                                                        toolbar={toolbarProperties}
                                                        onFocus={() => setActiveEditorHint("BusinessValue")}
                                                        onBlur={() => setActiveEditorHint(null)}
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="prose prose-sm max-w-none text-gray-800"
                                                    dangerouslySetInnerHTML={{
                                                        __html: businessValueStateHTML || ""
                                                    }}
                                                />
                                            )}

                                            {/* Floating Hint Image */}
                                            {activeEditorHint === "BusinessValue" && (
                                                <div className="absolute top-0 right-[-240px] hidden xl:block bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-3
                            before:content-[''] before:absolute before:top-10 before:left-[-8px] 
                            before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
                                                    <img
                                                        src="/images/BusinessValue2.png"
                                                        alt="Business value guidance"
                                                        className="max-w-[200px] rounded-lg object-contain relative z-10"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Key Contacts */}
                                    <div className="border-2 border-black p-3 rounded-3xl flex flex-col relative h-60">
                                        <div className="flex justify-start items-center mb-4">
                                            <p className="font-medium text-black tracking-wider text-2xl text-center grow">Key Contacts</p>
                                            <div className="flex items-center gap-2">
                                                <Tooltip title="Select">
                                                    <button className="h-6 px-3 rounded-full border text-xs text-white bg-black" onClick={() => setIsSelectContactsOpen(!isSelectContactsOpen)}>Select</button>
                                                </Tooltip>
                                                <Tooltip title="Add New">
                                                    <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full">
                                                        <Components.IconButton onClick={() => setContactModalOpen(true)}>
                                                            <CustomIcons iconName="fa-solid fa-plus" css="h-3 w-3 text-white" />
                                                        </Components.IconButton>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        {isSelectContactsOpen && (
                                            <div ref={selectContactsRef} className="absolute top-10 right-2 z-20 w-[360px] rounded-xl bg-white shadow-xl border border-gray-200 p-3 max-h-80 overflow-y-auto">
                                                {allContactsWithEdits.map(c => (
                                                    <div key={c.id} className="flex items-center gap-2 mb-2 p-2 border rounded">
                                                        <Checkbox checked={!!c.isKey} onChange={() => handleToggleKeyContact(c.id, !c.isKey)} disabled={currentKeyContactsCount >= 4 && !c.isKey} />
                                                        <div className="grow"><p className="text-sm font-bold">{c.contactName}</p><p className="text-xs">{c.role}</p></div>
                                                        <Components.IconButton onClick={() => handleOpenDeleteDialog(c.id)}>
                                                            <CustomIcons iconName="fa-solid fa-trash" css="text-red-500 cursor-pointer h-4 w-4" />
                                                        </Components.IconButton>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="overflow-y-auto">
                                            <ul className="pl-3 text-base">
                                                {allContactsWithEdits?.filter((row) => row.isKey === true)?.length > 0 ? allContactsWithEdits?.filter((row) => row.isKey === true)?.map((c) => (
                                                    <li key={c.id}>
                                                        <span className="font-medium text-indigo-600 text-base">
                                                            {c.contactName}
                                                            {c.title && (
                                                                <span className="text-base text-gray-500">
                                                                    <span className="mx-1">–</span>
                                                                    {c.title}
                                                                </span>
                                                            )}
                                                        </span>
                                                        {c.role && (
                                                            <>
                                                                <span className="mx-1">–</span>
                                                                <span className="text-indigo-600 text-base">{c.role}</span>
                                                            </>
                                                        )}
                                                    </li>
                                                )) : <p className="text-sm text-gray-400 italic">No contacts linked to this opportunity.</p>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* 3-Column Layout: Decision, Env, Next Steps */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                                    {/* Decision Map */}
                                    <div className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 h-60 flex flex-col">
                                        <div className="flex justify-between mb-4 flex-none">
                                            <p className="font-medium text-black tracking-wider text-2xl">Decision Map</p>
                                            <div
                                                className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white cursor-pointer"
                                                onClick={() => setOpenDecisionMapModel(true)}
                                            >
                                                <CustomIcons iconName="fa-solid fa-plus" css="h-3 w-3" />
                                            </div>
                                        </div>

                                        {/* Component: Now 'h-full' will mean '100% of the REMAINING space' */}
                                        <DecisionMapTimeline items={salesProcess} />
                                    </div>

                                    {/* Current Environment */}
                                    <div ref={envCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 min-h-[15rem] relative flex flex-col">
                                        <p className="font-medium text-black tracking-wider text-2xl text-center mb-4 shrink-0">
                                            Current Environment
                                        </p>

                                        <div
                                            className={`flex-1 ${!isEditingEnv ? 'cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors overflow-y-auto' : ''}`}
                                            onClick={() => !isEditingEnv && setIsEditingEnv(true)}
                                        >
                                            {isEditingEnv ? (
                                                <div className="editor-container-integrated">
                                                    <Editor
                                                        editorState={currentEnvironmentState}
                                                        wrapperClassName="editor-wrapper-custom"
                                                        editorClassName="editor-main-custom"
                                                        toolbarClassName="editor-toolbar-custom"
                                                        onEditorStateChange={setCurrentEnvironmentState}
                                                        toolbar={toolbarProperties}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="prose prose-sm max-w-none text-gray-800"
                                                    dangerouslySetInnerHTML={{
                                                        __html: currentEnvironmentHTML || "<span class='text-gray-400 italic'>Click to describe current environment...</span>"
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Next Steps */}
                                    <div ref={nextStepsRef} className="border-2 border-black p-3 rounded-3xl flex flex-col h-60 cursor-pointer" onClick={() => setIsEditingNextSteps(true)}>
                                        <p className="font-medium text-black tracking-wider text-2xl text-center mb-2">Next Steps</p>
                                        {isEditingNextSteps ?
                                            <Input multiline rows={6} value={watch("nextSteps")} onChange={e => setValue("nextSteps", e.target.value)} /> :
                                            <div className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{watch("nextSteps") || <span className="italic text-gray-400">No steps defined.</span>}</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedTab === 2 && <Calendar />}

            {/* Modals & Dialogs */}
            <OpportunityContactModel open={contactModalOpen} handleClose={() => setContactModalOpen(false)} opportunityId={opportunityId} handleGetAllOppContact={handleGetOppContacts} oppName={watch("opportunity")} />
            <AddSalesProcessModel open={openDecisionMapModel} handleClose={handleCloseDecisionMapModel} id={salesProcessId} oppId={opportunityId} handleGetAllSalesProcess={handleGetAllSalesProcess} />
            <MeetingAttendeesModel open={attendeesModelOpen} handleClose={handleCloseAttendeesModel} opportunityId={opportunityId} handleGetAllMeetingAttendees={handleGetAllMeetingAttendees} meetingid={selectedMeeting} id={selectedMeetingAttendeesId} />

            <AlertDialog open={dialogContact.open} title={dialogContact.title} message={dialogContact.message} actionButtonText={dialogContact.actionButtonText} handleAction={handleDeleteContact} handleClose={handleCloseDeleteDialog} />
            <AlertDialog open={deleteAttendees.open} title={deleteAttendees.title} message={deleteAttendees.message} actionButtonText={deleteAttendees.actionButtonText} handleAction={handleDeleteAttendees} />
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
        </div>
    );
};

const mapDispatchToProps = { setAlert, setSyncingPushStatus };
export default connect(null, mapDispatchToProps)(ViewOpportunity);