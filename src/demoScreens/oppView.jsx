import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Editor } from "react-draft-wysiwyg";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import dayjs from "dayjs";
import { Tooltip } from "@mui/material";

import Components from "../components/muiComponents/components";
import CustomIcons from "../components/common/icons/CustomIcons";
import Input from "../components/common/input/input";
import Select from "../components/common/select/select";
import Checkbox from "../components/common/checkBox/checkbox";
import { Tabs } from "../components/common/tabs/tabs";
import DatePickerComponent from "../components/common/datePickerComponent/datePickerComponent";
import { opportunityContactRoles } from "../service/common/commonService";

// ----------------------------
// Demo constants / helpers
// ----------------------------
const toolbarProperties = {
  options: ["inline", "list", "link", "history"],
  inline: { options: ["bold", "italic", "underline", "strikethrough"] },
  list: { options: ["unordered", "ordered"] },
};

const tableData = [{ label: "Opp360" }, { label: "Notes" }, { label: "Calendar" }];

const DEMO_STAGES = [
  { id: 1, title: "Prospecting" },
  { id: 2, title: "Qualification" },
  { id: 3, title: "Needs Analysis" },
  { id: 4, title: "Value Proposition" },
  { id: 5, title: "Id. Decision Makers" },
  { id: 6, title: "Perception Analysis" },
  { id: 7, title: "Proposal/Price Quote" },
  { id: 8, title: "Negotiation/Review" },
  { id: 9, title: "Closed Won" },
  { id: 10, title: "Closed Lost" },
];

const DEMO_STATUS = [
  { id: 1, title: "Commit" },
  { id: 2, title: "Upside" },
  { id: 3, title: "Pipeline" },
  { id: 4, title: "Won" },
  { id: 5, title: "Lost" },
];

const DEMO_ACCOUNTS = [
  { id: 101, title: "Acme Inc" },
  { id: 102, title: "Stark Industries" },
  { id: 103, title: "Wayne Enterprises" },
];

/**
 * IMPORTANT FIX:
 * - Each contact object must be an object (not nested array)
 * - Provide some default isKeyContact=true if you want them to show by default
 */
const demoContactsArray = [
  { id: 1, name: "John Smith", title: "VP Sales", role: "Decision Maker", isKeyContact: true },
  { id: 2, name: "Tony Stark", title: "CTO", role: "Champion", isKeyContact: true },
];

// For dropdown in Add Contact modal (simple list)
const demoContactsDropdown = [
  { id: 1, name: "John Smith", title: "John Smith" },
  { id: 2, name: "Tony Stark", title: "Tony Stark" },
  { id: 3, name: "Emma Watson", title: "Emma Watson" },
  { id: 4, name: "Michael Scott", title: "Michael Scott" },
];

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

function useClickOutside(ref, handler, when = true) {
  useEffect(() => {
    if (!when) return;

    const listener = (event) => {
      const el = ref?.current;
      if (!el) return;
      if (el.contains(event.target)) return; // inside
      handler(event); // outside
    };

    document.addEventListener("mousedown", listener, true);
    document.addEventListener("touchstart", listener, true);

    return () => {
      document.removeEventListener("mousedown", listener, true);
      document.removeEventListener("touchstart", listener, true);
    };
  }, [ref, handler, when]);
}

const brandfetchSrc = (domain) => `https://cdn.brandfetch.io/${domain}/w/100/h/100/icon?c=1id2vhiypCcqm7fpTjx`;

const normalizeDomain = (raw) => {
  const v = (raw || "").trim();
  if (!v) return "";
  // remove protocol
  let d = v.replace(/^https?:\/\//i, "");
  // remove path/query
  d = d.split("/")[0].split("?")[0].trim();
  // remove trailing dots/spaces
  d = d.replace(/\.+$/, "");
  return d;
};

// ----------------------------
// Demo Screen
// ----------------------------
export default function OppView() {
  const [selectedTab, setSelectedTab] = useState(0);

  // Demo Opportunity model (acts like your watch/getValues)
  const [opp, setOpp] = useState({
    id: 999,
    accountId: 101,
    opportunity: "Demo Opportunity",
    salesStage: "Proposal",
    status: "Commit",
    closeDate: dayjs().add(20, "day").toISOString(),
    listPrice: 25000,
    discountPercentage: 10,
    dealAmount: 22500,
    nextSteps: "1) Review proposal\n2) Schedule stakeholder call\n3) Confirm procurement timeline",
    // ✅ NEW: Logo state
    // logoType: "local" | "brandfetch" | null
    logoType: null,
    logoDomain: "", // used when logoType === "brandfetch"
    // ✅ NEW: uploaded logo preview URL (demo)
    logoUrl: "",
    logoFileName: "",
  });

  const [whyDoAnythingStateHTML, setWhyDoAnythingStateHTML] = useState(
    "<p>We want to reduce manual work and improve pipeline visibility.</p>"
  );
  const [businessValueStateHTML, setBusinessValueStateHTML] = useState(
    "<ul><li>Save 4 hours/week</li><li>Increase close rate</li></ul>"
  );
  const [currentEnvironmentHTML, setCurrentEnvironmentHTML] = useState(
    "<p>Using spreadsheets + emails. No single source of truth.</p>"
  );

  const [whyDoAnythingState, setWhyDoAnythingState] = useState(htmlToEditorState(whyDoAnythingStateHTML));
  const [businessValueState, setBusinessValueState] = useState(htmlToEditorState(businessValueStateHTML));
  const [currentEnvironmentState, setCurrentEnvironmentState] = useState(htmlToEditorState(currentEnvironmentHTML));

  // --- NEW: click-to-edit toggles ---
  const [isEditingNextSteps, setIsEditingNextSteps] = useState(false);
  const [isEditingWhy, setIsEditingWhy] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isEditingEnv, setIsEditingEnv] = useState(false);

  const whyCardRef = useRef(null);
  const valueCardRef = useRef(null);
  const envCardRef = useRef(null);
  const nextStepsRef = useRef(null);

  useClickOutside(
    whyCardRef,
    () => {
      if (!isEditingWhy) return;
      const html = editorStateToHtml(whyDoAnythingState);
      setWhyDoAnythingStateHTML(html);
      setIsEditingWhy(false);
    },
    isEditingWhy
  );

  useClickOutside(
    valueCardRef,
    () => {
      if (!isEditingValue) return;
      const html = editorStateToHtml(businessValueState);
      setBusinessValueStateHTML(html);
      setIsEditingValue(false);
    },
    isEditingValue
  );

  useClickOutside(
    envCardRef,
    () => {
      if (!isEditingEnv) return;
      const html = editorStateToHtml(currentEnvironmentState);
      setCurrentEnvironmentHTML(html);
      setIsEditingEnv(false);
    },
    isEditingEnv
  );

  useClickOutside(
    nextStepsRef,
    () => {
      if (!isEditingNextSteps) return;
      setIsEditingNextSteps(false);
    },
    isEditingNextSteps
  );

  // ----------------------------
  // ✅ KEY CONTACTS
  // ----------------------------
  const [contacts, setContacts] = useState(demoContactsArray);

  // edits you toggle in UI (unsaved)
  const [editedContacts, setEditedContacts] = useState([]);

  // initial map used to remove "no-op" edits
  const [initialIsKey, setInitialIsKey] = useState({});

  // ✅ derive allContactsWithEdits from contacts + editedContacts (always up-to-date)
  const allContactsWithEdits = useMemo(() => {
    return (contacts || []).map((c) => {
      const edit = editedContacts.find((e) => String(e.id) === String(c.id));
      return { ...c, isKeyContact: edit ? !!edit.isKeyContact : !!c.isKeyContact };
    });
  }, [contacts, editedContacts]);

  // ✅ build initialIsKey correctly whenever contacts changes
  useEffect(() => {
    const map = {};
    (contacts || []).forEach((c) => {
      map[c.id] = !!c.isKeyContact;
    });
    setInitialIsKey(map);
  }, [contacts]);

  const currentKeyContactsCount = allContactsWithEdits.filter((c) => c.isKeyContact).length;

  const handleToggleKeyContact = (id, isKeyContact) => {
    setEditedContacts((prev) => {
      const next = [...prev];
      const idx = next.findIndex((e) => String(e.id) === String(id));

      if (idx >= 0) next[idx] = { id, isKeyContact };
      else next.push({ id, isKeyContact });

      // remove edit if equals original
      const original = initialIsKey[id] ?? false;
      const idxAfter = next.findIndex((e) => String(e.id) === String(id));
      if (idxAfter >= 0 && next[idxAfter].isKeyContact === original) next.splice(idxAfter, 1);

      return next;
    });
  };

  // ----------------------------
  // ✅ NEW: Select Contacts popup
  // ----------------------------
  const [isSelectContactsOpen, setIsSelectContactsOpen] = useState(false);
  const selectContactsRef = useRef(null);

  useClickOutside(
    selectContactsRef,
    () => {
      if (!isSelectContactsOpen) return;
      setIsSelectContactsOpen(false);
    },
    isSelectContactsOpen
  );

  const toggleSelectContactsOpen = () => setIsSelectContactsOpen((p) => !p);

  // ----------------------------
  // Other existing state
  // ----------------------------
  const [salesProcess, setSalesProcess] = useState([
    { id: 11, process: "Discovery", notes: "Confirm pain + stakeholders", processDate: dayjs().subtract(10, "day").toISOString() },
    { id: 12, process: "Demo", notes: "Show pipeline + reports", processDate: dayjs().subtract(6, "day").toISOString() },
    { id: 13, process: "Proposal", notes: "Share pricing + scope", processDate: dayjs().subtract(2, "day").toISOString(), goLive: dayjs().add(30, "day").toISOString(), reason: "Fiscal cycle alignment" },
  ]);

  const [openDrawer, setOpenDrawer] = useState(true);
  const [showDates, setShowDates] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [meetingAttendees, setMeetingAttendees] = useState([]);
  const [editingNoteField, setEditingNoteField] = useState(null);
  const activeNoteEditorRef = useRef(null);

  // Add Contact (demo) modal
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  const emptyContactRow = () => ({
    tempId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    nameId: "",
    roleId: "",
    title: "",
    isKeyContact: false,
  });

  const [contactRows, setContactRows] = useState([emptyContactRow()]);

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
    // ✅ allow either selected nameId OR typed name
    const validRows = contactRows.filter((r) => (r.nameId || (r.name && r.name.trim())) && r.roleId);

    const mapped = validRows.map((r) => {
      const typedName = (r.name || "").trim();

      const selectedName =
        demoContactsDropdown.find((x) => String(x.id) === String(r.nameId))?.name || "";

      // ✅ final name: dropdown name OR typed name
      const finalName = selectedName || typedName;

      // ✅ id: use dropdown id OR generate a unique id for typed contact
      const finalId = r.nameId ? String(r.nameId) : `typed_${r.tempId}`;

      return {
        id: finalId,
        nameId: r.nameId || null,
        name: finalName,
        roleId: r.roleId,
        role: opportunityContactRoles.find((x) => String(x.id) === String(r.roleId))?.title || "",
        title: r.title || "",
        isKeyContact: !!r.isKeyContact,
      };
    });

    setContacts((prev) => {
      const map = new Map((prev || []).map((p) => [String(p.id), p]));
      mapped.forEach((m) => map.set(String(m.id), m));
      return Array.from(map.values());
    });

    closeAddContactModal();
  };


  // Meeting notes snapshots + editor states
  const [purposeHTML, setPurposeHTML] = useState("<p>Align on success criteria.</p>");
  const [backgroundHTML, setBackgroundHTML] = useState("<p>Current CRM usage is inconsistent.</p>");
  const [agendaHTML, setAgendaHTML] = useState("<ol><li>Overview</li><li>Risks</li><li>Next steps</li></ol>");
  const [alignmentHTML, setAlignmentHTML] = useState("<p>Agree on timeline and owners.</p>");

  const [purposeState, setPurposeState] = useState(htmlToEditorState(purposeHTML));
  const [backgroundState, setBackgroundState] = useState(htmlToEditorState(backgroundHTML));
  const [agendaState, setAgendaState] = useState(htmlToEditorState(agendaHTML));
  const [alignmentState, setAlignmentState] = useState(htmlToEditorState(alignmentHTML));
  const [showPricingBox, setShowPricingBox] = useState(false);

  const pricingBoxRef = useRef(null);

  useClickOutside(
    pricingBoxRef,
    () => {
      if (!showPricingBox) return;
      savePricingBox(); // auto-save
    },
    showPricingBox
  );

  const [pricingDraft, setPricingDraft] = useState({
    listPrice: null,
    discountPercentage: null,
    dealAmount: null,
  });

  // ✅ NEW: Logo UI state (menu + fetch popup)
  const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
  const [isFetchLogoOpen, setIsFetchLogoOpen] = useState(false);
  const [domainDraft, setDomainDraft] = useState("");
  // ✅ NEW: Upload Logo modal state
  const [isUploadLogoOpen, setIsUploadLogoOpen] = useState(false);
  const uploadLogoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [logoUploadDraft, setLogoUploadDraft] = useState({
    file: null,
    previewUrl: "",
    fileName: "",
  });
  const logoMenuRef = useRef(null);
  const fetchLogoRef = useRef(null);



  // open upload modal
  const openUploadLogoModal = () => {
    setIsLogoMenuOpen(false);
    setIsFetchLogoOpen(false);

    setLogoUploadDraft({
      file: null,
      previewUrl: opp.logoUrl || "",
      fileName: opp.logoFileName || "",
    });

    setIsUploadLogoOpen(true);
  };

  // close upload modal
  const closeUploadLogoModal = () => {
    setIsUploadLogoOpen(false);

    // cleanup preview url if it was newly created
    setLogoUploadDraft((p) => {
      if (p.previewUrl && p.previewUrl.startsWith("blob:")) {
        try { URL.revokeObjectURL(p.previewUrl); } catch (e) { }
      }
      return { file: null, previewUrl: "", fileName: "" };
    });
  };

  // click outside to close modal
  useClickOutside(
    uploadLogoRef,
    () => {
      if (!isUploadLogoOpen) return;
      closeUploadLogoModal();
    },
    isUploadLogoOpen
  );

  // file select
  const handlePickLogoFile = (file) => {
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a valid image (PNG, JPG, SVG, WEBP).");
      return;
    }

    // cleanup previous blob preview
    setLogoUploadDraft((prev) => {
      if (prev.previewUrl && prev.previewUrl.startsWith("blob:")) {
        try { URL.revokeObjectURL(prev.previewUrl); } catch (e) { }
      }
      return prev;
    });

    const previewUrl = URL.createObjectURL(file);

    setLogoUploadDraft({
      file,
      previewUrl,
      fileName: file.name || "logo",
    });
  };

  // save uploaded logo (demo: keep preview url in state)
  const handleSaveUploadedLogo = () => {
    if (!logoUploadDraft.previewUrl) return;

    setOpp((p) => ({
      ...p,
      logoType: "uploaded",      // ✅ new type
      logoDomain: "",
      logoUrl: logoUploadDraft.previewUrl,
      logoFileName: logoUploadDraft.fileName || "",
    }));

    setIsUploadLogoOpen(false);
  };


  const openLogoMenu = () => {
    setIsLogoMenuOpen((p) => !p);
    setIsFetchLogoOpen(false);
  };

  const handleChooseUploadLogo = () => {
    openUploadLogoModal()
  };

  const handleChooseFetchLogo = () => {
    setIsLogoMenuOpen(false);
    setIsFetchLogoOpen(true);
    setDomainDraft(opp.logoDomain || "");
  };

  const handleSaveFetchedLogo = () => {
    const d = normalizeDomain(domainDraft);
    if (!d) return;

    setOpp((p) => ({ ...p, logoType: "brandfetch", logoDomain: d }));
    setIsFetchLogoOpen(false);
    setDomainDraft("");
  };

  useClickOutside(
    logoMenuRef,
    () => {
      if (!isLogoMenuOpen) return;
      setIsLogoMenuOpen(false);
    },
    isLogoMenuOpen
  );

  useClickOutside(
    fetchLogoRef,
    () => {
      if (!isFetchLogoOpen) return;
      setIsFetchLogoOpen(false);
      setDomainDraft("");
    },
    isFetchLogoOpen
  );

  const getLogoNode = () => {
    // ✅ uploaded logo
    if (opp.logoType === "uploaded" && opp.logoUrl) {
      return (
        <img
          src={opp.logoUrl}
          alt={opp.logoFileName || "Uploaded Logo"}
          className="rounded-full w-24 h-24 object-cover"
        />
      );
    }

    // old local static (if you still want it for any reason)
    if (opp.logoType === "local") {
      return <img src="/images/logo/360Pipe_logo.png" alt="360Pipe Logo" className="w-24 h-24 object-contain" />;
    }

    // brandfetch
    if (opp.logoType === "brandfetch" && opp.logoDomain) {
      return (
        <img
          src={brandfetchSrc(opp.logoDomain)}
          alt="Logo"
          className="rounded-full w-24 h-24 object-cover"
        />
      );
    }

    // placeholder
    return (
      <>
        <CustomIcons iconName="fa-solid fa-image" css="mb-3 w-6 h-6" />
        <p className="text-center text-xs">{"Opportunity Logo"}</p>
      </>
    );
  };

  const moneyToNumber = (val) => {
    if (val === null || val === undefined || val === "") return null;
    const cleaned = val.toString().replace(/[$,]/g, "");
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? null : Number(num.toFixed(2));
  };

  const percentToNumber = (val) => {
    if (val === null || val === undefined || val === "") return null;
    const num = parseFloat(val);
    return Number.isNaN(num) ? null : Number(num.toFixed(2));
  };

  const openPricingBox = () => {
    setPricingDraft({
      listPrice: opp.listPrice ?? null,
      discountPercentage: opp.discountPercentage ?? null,
      dealAmount: opp.dealAmount ?? null,
    });
    setShowPricingBox(true);
  };

  const closePricingBox = () => {
    setShowPricingBox(false);
  };

  const savePricingBox = async () => {
    await handleSaveField("listPrice", pricingDraft.listPrice);
    await handleSaveField("discountPercentage", pricingDraft.discountPercentage);
    await handleSaveField("dealAmount", pricingDraft.dealAmount);
    setShowPricingBox(false);
  };

  const { control, setValue, watch } = useForm({
    defaultValues: {
      meetingDate: dayjs().format("MM/DD/YYYY"),
    },
  });

  const meetingDate = watch("meetingDate");
  // ----------------------------
  // Demo init effects
  // ----------------------------
  useEffect(() => {
    // init meetings
    const demoMeetings = [
      {
        id: 201,
        title: "Meeting with Tony",
        displayStart: `${dayjs().format("MM/DD/YYYY")} 10:00:00`,
        displayEnd: `${dayjs().format("MM/DD/YYYY")} 11:00:00`,
        description: "<p>Discuss solution fit.</p>",
      },
      {
        id: 202,
        title: "Stakeholder Review",
        displayStart: `${dayjs().add(1, "day").format("MM/DD/YYYY")} 15:00:00`,
        displayEnd: `${dayjs().add(1, "day").format("MM/DD/YYYY")} 16:00:00`,
        description: "<p>Review decision map.</p>",
      },
    ];
    setMeetings(demoMeetings);

    const dates = new Set(demoMeetings.map((m) => m.displayStart.split(" ")[0]));
    setShowDates(dates);
  }, []); // eslint-disable-line

  useEffect(() => {
    const data = meetings.filter((m) => m.displayStart.split(" ")[0] === meetingDate);
    setFilteredMeetings(data);
    setSelectedMeeting(null);
    setMeetingAttendees([]);
  }, [meetingDate, meetings]);

  // close editor on outside click (Notes tab meeting note fields)
  useEffect(() => {
    if (!editingNoteField) return;

    const onMouseDown = (e) => {
      const el = activeNoteEditorRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;

      if (editingNoteField) {
        const saveField = (key) => {
          if (key === "purpose") setPurposeHTML(editorStateToHtml(purposeState));
          if (key === "background") setBackgroundHTML(editorStateToHtml(backgroundState));
          if (key === "agenda") setAgendaHTML(editorStateToHtml(agendaState));
          if (key === "alignment") setAlignmentHTML(editorStateToHtml(alignmentState));
        };
        saveField(editingNoteField);
      }
      setEditingNoteField(null);
    };

    document.addEventListener("mousedown", onMouseDown, true);
    return () => document.removeEventListener("mousedown", onMouseDown, true);
  }, [editingNoteField]); // eslint-disable-line

  // ----------------------------
  // Demo handlers
  // ----------------------------
  const handleChangeTab = (value) => {
    setSelectedTab(value);

    if (value !== 1) {
      setOpenDrawer(true);
      setSelectedMeeting(null);
      setFilteredMeetings([]);
      setMeetingAttendees([]);
      setValue("meetingDate", dayjs().format("MM/DD/YYYY"));
    }
  };

  const getDisplayName = (id, options) => {
    const opt = options.find((o) => o.id === id);
    return opt ? opt.title : "—";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Demo save field (updates local opp)
  const handleSaveField = async (fieldName, newValue) => {
    setOpp((prev) => {
      const next = { ...prev, [fieldName]: newValue };

      const toNumber2 = (val) => {
        if (val === null || val === undefined || val === "") return null;
        const num = typeof val === "number" ? val : parseFloat(val);
        if (Number.isNaN(num)) return null;
        return Number(num.toFixed(2));
      };

      const listPrice = toNumber2(next.listPrice);
      const discountPercentage = toNumber2(next.discountPercentage);
      const dealAmount = toNumber2(next.dealAmount);

      if (["listPrice", "discountPercentage", "dealAmount"].includes(fieldName)) {
        let lp = listPrice;
        let dp = discountPercentage;
        let da = dealAmount;

        if (fieldName === "listPrice") {
          if (lp == null) {
            dp = null;
            da = null;
          } else if (dp != null) {
            da = toNumber2(lp - (lp * dp) / 100);
          } else if (da != null) {
            let pct = ((lp - da) / lp) * 100;
            if (pct < 0) pct = 0;
            if (pct > 100) pct = 100;
            dp = toNumber2(pct);
          } else {
            da = lp;
          }
        } else if (fieldName === "discountPercentage") {
          if (lp == null) {
            dp = null;
            da = null;
          } else if (dp == null) {
            da = lp;
          } else {
            da = toNumber2(lp - (lp * dp) / 100);
          }
        } else if (fieldName === "dealAmount") {
          if (da == null || lp == null) {
            dp = null;
          } else {
            let pct = ((lp - da) / lp) * 100;
            if (pct < 0) pct = 0;
            if (pct > 100) pct = 100;
            dp = toNumber2(pct);
          }
        }

        next.listPrice = lp;
        next.discountPercentage = dp;
        next.dealAmount = da;
      }

      return next;
    });
  };

  const OpportunityField = ({ label, value, type = "text", options = [], onSave, required = false, multiline = false, disabled = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const wrapRef = useRef(null);

    useEffect(() => {
      if (!isEditing) setEditValue(value);
    }, [value, isEditing]);

    const parseMoney = (val) => {
      if (val === null || val === undefined || val === "") return null;
      const cleaned = val.toString().replace(/[$,]/g, "");
      const num = parseFloat(cleaned);
      if (Number.isNaN(num)) return null;
      return parseFloat(num.toFixed(2));
    };

    const commit = async () => {
      if (!onSave) {
        setIsEditing(false);
        return;
      }
      if (required && (editValue === null || editValue === undefined || editValue === "")) return;

      let finalValue = editValue;

      if (type === "select") {
        if (label === "Account") {
          finalValue = options.find((o) => o.title === editValue || o.id === editValue)?.id ?? null;
        } else {
          finalValue = options.find((o) => o.title === editValue || o.id === editValue)?.title ?? null;
        }
      }

      if (label === "List Amount") finalValue = parseMoney(editValue);
      if (label === "Deal Amount") finalValue = parseMoney(editValue);

      await onSave(finalValue);
      setIsEditing(false);
    };

    useClickOutside(
      wrapRef,
      () => {
        if (!isEditing) return;
        commit();
      },
      isEditing
    );

    const handleStartEdit = () => {
      if (disabled) return;
      setIsEditing(true);
      setEditValue(value);
    };

    const displayValue = value || "—";

    return (
      <div ref={wrapRef} className="w-full py-1">
        <div className="text-gray-900 font-semibold">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              {type === "select" ? (
                <div className="w-60">
                  <Select
                    value={options?.find((o) => o.title === editValue || o.id === editValue)?.id || null}
                    options={options}
                    onChange={(_, newValue) => setEditValue(newValue)}
                    className="flex-1"
                    autoFocus
                    error={required && (!editValue || editValue === "")}
                    disabled={disabled}
                  />
                </div>
              ) : type === "date" ? (
                <div className="w-64">
                  <Input value={editValue ? dayjs(editValue).format("MM/DD/YYYY") : ""} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                </div>
              ) : (
                <div className="w-60">
                  <Input
                    value={editValue || ""}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    error={required && (!editValue || editValue === "")}
                    multiline={multiline}
                    rows={3}
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          ) : (
            <span onClick={handleStartEdit} className="cursor-pointer hover:bg-gray-100 px-1 rounded text-lg">
              {displayValue}
            </span>
          )}
        </div>
      </div>
    );
  };

  const StageTimeline = ({ stages, currentStageId }) => {
    const handleStageClick = (stage) => {
      if (stage.id === currentStageId) return;
      setOpp((p) => ({ ...p, salesStage: stage.title }));
    };

    return (
      <div className="py-4 mb-0">
        <div className="flex flex-wrap xl:justify-evenly gap-1 overflow-x-auto pb-1">
          {stages?.map((stage) => {
            const isActive = stage.id === currentStageId;
            const isCompleted = currentStageId !== null && stage.id < currentStageId;

            let pillClasses = "";
            if (isActive) pillClasses = "bg-[#1072E0] text-white border-[#1072E0] cursor-default";
            else if (isCompleted) pillClasses = "bg-[#E3F2FD] text-[#1072E0] border-[#B3D7FF] cursor-pointer";
            else pillClasses = "bg-white text-gray-700 border-gray-300 cursor-pointer";

            return (
              <div key={stage.id}>
                <div
                  onClick={() => handleStageClick(stage)}
                  className={`inline-flex items-center justify-center px-3 py-2 text-xs font-semibold border rounded-full whitespace-nowrap transition-all duration-150 ${pillClasses}`}
                >
                  <span className="truncate">{stage.title}</span>
                  {isCompleted && <CustomIcons iconName="fa-solid fa-check" css="h-3 w-3 inline-block ml-2" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DecisionMapTimeline = ({ items = [] }) => {
    if (!items || items.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-gray-400 italic">No decision map added yet.</p>
        </div>
      );
    }

    const formatStepDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
    };

    const goLiveItems = items.filter((step) => step.goLive);
    const lastGoLiveItem = goLiveItems.length
      ? goLiveItems.reduce((latest, current) => (new Date(current.goLive) > new Date(latest.goLive) ? current : latest))
      : null;

    const goLiveText = lastGoLiveItem ? new Date(lastGoLiveItem.goLive).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }) : null;
    const reasonText = lastGoLiveItem?.reason || null;

    return (
      <div className="w-full h-full flex flex-col justify-between">
        <div className="mt-4 mb-4 overflow-x-auto w-full pb-2 no-scrollbar">
          <div className="flex items-center min-w-max px-2">
            {items.map((step, index) => (
              <React.Fragment key={step.id ?? index}>
                <div className="flex flex-col items-center min-w-[70px] flex-shrink-0">
                  <Tooltip title={step.notes} arrow>
                    <span className="font-semibold text-sm text-gray-800 text-center leading-tight break-words px-1 cursor-pointer">
                      {step.process}
                    </span>
                  </Tooltip>
                  <span className="w-px h-3 bg-black my-1" />
                  <span className="text-sm text-gray-600">{formatStepDate(step.processDate)}</span>

                  <div className="flex items-center gap-2 mt-2">
                    <Tooltip title="Edit (demo)" arrow>
                      <div className="bg-blue-600 h-5 w-5 flex justify-center items-center rounded-full text-white">
                        <Components.IconButton>
                          <CustomIcons iconName={"fa-solid fa-pen-to-square"} css="cursor-pointer text-white h-2.5 w-2.5" />
                        </Components.IconButton>
                      </div>
                    </Tooltip>

                    <Tooltip title="Delete (demo)" arrow>
                      <div
                        className="bg-red-600 h-5 w-5 flex justify-center items-center rounded-full text-white"
                        onClick={() => setSalesProcess((prev) => prev.filter((x) => x.id !== step.id))}
                      >
                        <Components.IconButton>
                          <CustomIcons iconName={"fa-solid fa-xmark"} css="cursor-pointer text-white h-2.5 w-2.5" />
                        </Components.IconButton>
                      </div>
                    </Tooltip>
                  </div>
                </div>

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
        {/* 
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
        )} */}
      </div>
    );
  };

  const MeetingNotesTable = () => {
    const rows = [
      { placeHolder: "Enter purpose of meeting", key: "purpose", label: "Purpose of meeting (desired outcome)", html: purposeHTML, state: purposeState, setState: setPurposeState },
      { placeHolder: "Enter background", key: "background", label: "Context and Background", html: backgroundHTML, state: backgroundState, setState: setBackgroundState },
      { placeHolder: "Enter agenda of meeting", key: "agenda", label: "Agenda", html: agendaHTML, state: agendaState, setState: setAgendaState },
      { placeHolder: "Enter alignment", key: "alignment", label: "Alignment", html: alignmentHTML, state: alignmentState, setState: setAlignmentState },
    ];

    return (
      <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((r) => {
              const isEditing = editingNoteField === r.key;

              const handleOpenThisEditor = () => setEditingNoteField(r.key);

              return (
                <tr key={r.key} className="border-b last:border-b-0">
                  <td className="w-[25%] align-top bg-gray-50 border-r border-gray-300 px-4 py-2 font-bold text-gray-900">
                    {r.label}
                  </td>

                  <td className="align-top px-4 py-2">
                    {!isEditing ? (
                      <div className="cursor-pointer rounded-md p-2 transition" onClick={handleOpenThisEditor}>
                        {isEmptyHtml(r.html) ? (
                          <span className="text-gray-400 italic">{r.placeHolder}</span>
                        ) : (
                          <div className="editor-html max-w-none" dangerouslySetInnerHTML={{ __html: r.html }} />
                        )}
                      </div>
                    ) : (
                      <div ref={activeNoteEditorRef}>
                        <Editor
                          editorState={r.state}
                          wrapperClassName="border border-gray-300 rounded-md"
                          editorClassName="p-2 min-h-[140px] max-h-[240px] overflow-y-auto"
                          toolbarClassName="border-b border-gray-300"
                          onEditorStateChange={(st) => r.setState(st)}
                          toolbar={toolbarProperties}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const handleSelectMeeting = (mid) => {
    setSelectedMeeting(mid);
    setMeetingAttendees([
      { id: 1, name: "Tony Stark", title: "CTO", role: "Host", note: "Main stakeholder" },
      { id: 2, name: "Bruce Banner", title: "Architect", role: "Attendee", note: "Asked about integrations" },
    ]);
  };

  // ----------------------------
  // Render
  // ----------------------------
  const currentStageId = DEMO_STAGES.find((s) => s.title === opp.salesStage)?.id;

  return (
    <div className="mx-auto relative p-4 sm:p-6 my-3">
      <div>
        {selectedTab === 0 ? (
          <div className="absolute top-2 right-5">
            <p className="text-red-600 text-lg">
              <strong>Note:&nbsp;</strong>Fields can be edited by clicking.
            </p>
          </div>
        ) : null}
      </div>

      <div className="my-3">
        <Tabs tabsData={tableData} selectedTab={selectedTab} handleChange={handleChangeTab} />
      </div>

      {/* -------------------- TAB 0: OPP360 -------------------- */}
      {selectedTab === 0 && (
        <>
          <div className="flex justify-center items-center gap-10">
            {/* ✅ UPDATED: Opportunity Logo with menu + fetch popup */}
            <div className="flex justify-center md:justify-start items-center relative">
              <div
                className="w-24 h-24 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition"
                onClick={openLogoMenu}
                title="Click to change logo"
              >
                <div className="flex flex-col items-center justify-center text-gray-500">
                  {getLogoNode()}
                </div>
              </div>

              {/* Menu (Upload / Fetch) */}
              {isLogoMenuOpen && (
                <div
                  ref={logoMenuRef}
                  className="absolute z-50 left-0 top-28 w-48 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={handleChooseUploadLogo}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <CustomIcons iconName="fa-solid fa-upload" css="h-4 w-4 text-gray-700" />
                    Upload Logo
                  </button>

                  <button
                    type="button"
                    onClick={handleChooseFetchLogo}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 border-t"
                  >
                    <CustomIcons iconName="fa-solid fa-globe" css="h-4 w-4 text-gray-700" />
                    Fetch Logo
                  </button>
                </div>
              )}

              {/* Fetch popup (domain input) */}
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

                    {/* small preview
                    {normalizeDomain(domainDraft) ? (
                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={brandfetchSrc(normalizeDomain(domainDraft))}
                            alt="Preview"
                            className="h-12 w-12 object-cover"
                          />
                        </div>
                        <p className="text-xs text-gray-600">
                          Preview for <span className="font-semibold">{normalizeDomain(domainDraft)}</span>
                        </p>
                      </div>
                    ) : null} */}
                  </div>
                </div>
              )}

              {/* ✅ Upload Logo popup */}
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
                        onClick={closeUploadLogoModal}
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
                          onClick={closeUploadLogoModal}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className={`px-4 py-2 text-sm rounded-md text-white ${logoUploadDraft.previewUrl ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                            }`}
                          disabled={!logoUploadDraft.previewUrl}
                          onClick={handleSaveUploadedLogo}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center items-center w-full">
              <OpportunityField
                label="Account"
                value={getDisplayName(opp.accountId, DEMO_ACCOUNTS)}
                type="select"
                options={DEMO_ACCOUNTS}
                onSave={(newValue) => handleSaveField("accountId", newValue)}
              />

              <div className="relative w-full cursor-pointer">
                <p className="font-semibold text-black">
                  {opp.dealAmount != null
                    ? `$${Number(opp.dealAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "—"}
                </p>

                <div
                  className="absolute left-0 top-0 right-0 bottom-0"
                  onClick={(e) => {
                    const tag = e.target?.tagName?.toLowerCase();
                    if (tag === "input" || tag === "button" || tag === "svg" || tag === "path") return;
                    openPricingBox();
                  }}
                />

                {showPricingBox && (
                  <div ref={pricingBoxRef} className="absolute z-50 right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-lg py-2 px-4">
                    <div className="flex items-center justify-end mb-3">
                      <button onClick={closePricingBox} type="button">
                        <CustomIcons iconName="fa-solid fa-xmark" css="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex justify-start items-center gap-3 w-full">
                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">List Amount</label>
                        <input
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={pricingDraft.listPrice ?? ""}
                          onChange={(e) => setPricingDraft((p) => ({ ...p, listPrice: moneyToNumber(e.target.value) }))}
                          placeholder="e.g. 25000"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Discount (%)</label>
                        <input
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={pricingDraft.discountPercentage ?? ""}
                          onChange={(e) => setPricingDraft((p) => ({ ...p, discountPercentage: percentToNumber(e.target.value) }))}
                          placeholder="e.g. 10"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Deal Amount</label>
                        <input
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={pricingDraft.dealAmount ?? ""}
                          onChange={(e) => setPricingDraft((p) => ({ ...p, dealAmount: moneyToNumber(e.target.value) }))}
                          placeholder="e.g. 22500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <OpportunityField label="Opportunity Name" value={opp.opportunity} onSave={(newValue) => handleSaveField("opportunity", newValue)} required />
              <OpportunityField label="Close Date" value={formatDate(opp.closeDate)} type="date" onSave={(newValue) => handleSaveField("closeDate", newValue)} required />
              <OpportunityField label="Status" value={opp.status} type="select" options={DEMO_STATUS} onSave={(newValue) => handleSaveField("status", newValue)} required />
            </div>
          </div>

          <StageTimeline stages={DEMO_STAGES} currentStageId={currentStageId} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 my-3">
            {/* Why */}
            <div ref={whyCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 h-60">
              <div className="mb-4">
                <p className="font-medium text-black tracking-wider text-2xl text-center">Why Do Anything</p>
              </div>

              <div className="relative h-full">
                {!isEditingWhy ? (
                  <div className="h-full overflow-y-auto cursor-pointer rounded-md p-2 transition" onClick={() => setIsEditingWhy(true)}>
                    <div
                      className="editor-html space-y-1"
                      dangerouslySetInnerHTML={{
                        __html: whyDoAnythingStateHTML || "<span class='text-gray-400 italic'>-</span>",
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <Editor
                      editorState={whyDoAnythingState}
                      wrapperClassName="wrapper-class border border-gray-300 rounded-md"
                      editorClassName="editor-class p-2 h-40 overflow-y-auto"
                      toolbarClassName="toolbar-class border-b border-gray-300"
                      onEditorStateChange={(state) => setWhyDoAnythingState(state)}
                      toolbar={toolbarProperties}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Value */}
            <div ref={valueCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 h-60">
              <div className="mb-4">
                <p className="font-medium text-black tracking-wider text-2xl text-center">Value</p>
              </div>

              <div className="relative h-full">
                {!isEditingValue ? (
                  <div className="h-full overflow-y-auto cursor-pointer rounded-md p-2 transition" onClick={() => setIsEditingValue(true)}>
                    <div
                      className="editor-html space-y-1"
                      dangerouslySetInnerHTML={{
                        __html: businessValueStateHTML || "<span class='text-gray-400 italic'>-</span>",
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <Editor
                      editorState={businessValueState}
                      wrapperClassName="wrapper-class border border-gray-300 rounded-md"
                      editorClassName="editor-class p-2 h-40 overflow-y-auto"
                      toolbarClassName="toolbar-class border-b border-gray-300"
                      onEditorStateChange={(state) => setBusinessValueState(state)}
                      toolbar={toolbarProperties}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Key Contacts */}
            <div className="border-2 border-black p-3 rounded-3xl flex flex-col cursor-pointer relative h-60">
              <div className="flex justify-start items-center mb-4">
                <p className="font-medium text-black tracking-wider text-2xl text-center grow">Key Contacts</p>

                <div className="flex items-center gap-2">
                  {/* ✅ NEW: Select button */}
                  <Tooltip title="Select contacts (toggle key contacts)" arrow>
                    <button
                      type="button"
                      onClick={toggleSelectContactsOpen}
                      className={`h-6 px-3 rounded-full border text-xs font-semibold transition ${isSelectContactsOpen ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      Select
                    </button>
                  </Tooltip>

                  {/* Add contact */}
                  <Tooltip title="Add contact" arrow>
                    <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                      <Components.IconButton onClick={openAddContactModal}>
                        <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3 w-3" />
                      </Components.IconButton>
                    </div>
                  </Tooltip>

                  {/* ✅ Select Contacts Popup */}
                  {isSelectContactsOpen && (
                    <div
                      ref={selectContactsRef}
                      className="absolute top-10 right-2 z-20 w-[360px] rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Select Key Contacts</p>
                          <p className="text-xs text-gray-500">
                            Selected: <span className="font-semibold">{currentKeyContactsCount}</span>/4
                          </p>
                        </div>

                        <button
                          type="button"
                          className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-black"
                          onClick={() => setIsSelectContactsOpen(false)}
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                        {allContactsWithEdits?.length > 0 ? (
                          allContactsWithEdits.map((c) => {
                            const disableCheck = currentKeyContactsCount >= 4 && !c.isKeyContact; // max 4
                            return (
                              <div
                                key={c.id}
                                className={`flex items-start justify-between rounded-lg px-3 py-2 border ${c.isKeyContact ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
                                  }`}
                              >
                                <div className="flex items-start gap-2">
                                  <Checkbox
                                    checked={!!c.isKeyContact}
                                    disabled={disableCheck}
                                    onChange={() => handleToggleKeyContact(c.id, !c.isKeyContact)}
                                  />

                                  <div className="leading-tight">
                                    <p className="text-sm font-semibold text-indigo-700">
                                      {c.name}
                                      {c.title ? <span className="text-xs text-gray-500"> <span className="mx-1">–</span>{c.title}</span> : null}
                                    </p>
                                    {c.role ? <p className="text-xs text-indigo-600 mt-0.5">{c.role}</p> : null}
                                    {disableCheck ? <p className="text-[11px] text-red-500 mt-1">Max 4 key contacts allowed</p> : null}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-400 italic">No contacts available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add Contact Modal */}
                  {isAddContactOpen && (
                    <div className="absolute top-0 -left-80 right-20 z-10 max-w-4xl rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
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
                        <div className="grid grid-cols-12 gap-2 rounded-md bg-[#5B45A6] px-3 py-2 text-white text-sm font-medium">
                          <div className="col-span-3">Name</div>
                          <div className="col-span-3">Title</div>
                          <div className="col-span-3">Role</div>
                          <div className="col-span-2 text-center">Key</div>
                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={addContactRow}
                              className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                              title="Add row"
                            >
                              <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 space-y-2">
                          {contactRows.map((row) => (
                            <div key={row.tempId} className="grid grid-cols-12 gap-2 items-center px-2">
                              <div className="col-span-3">
                                <Select
                                  options={demoContactsDropdown}
                                  placeholder="Select name"
                                  freeSolo={true}
                                  value={row.nameId ? Number(row.nameId) : null}
                                  onChange={(e, newValue) => {
                                    // Selected from dropdown
                                    if (typeof newValue === "object" && newValue?.id) {
                                      updateContactRow(row.tempId, "nameId", String(newValue.id));
                                    }
                                  }}
                                  onInputChange={(e, inputValue) => {
                                    updateContactRow(row.tempId, "name", inputValue);
                                    if (inputValue) updateContactRow(row.tempId, "nameId", "");
                                  }}
                                />

                              </div>

                              <div className="col-span-3">
                                <Input
                                  value={row.title}
                                  placeholder="Enter title"
                                  type={`text`}
                                  onChange={(e) => updateContactRow(row.tempId, "title", e.target.value)}
                                />
                              </div>

                              <div className="col-span-3">
                                <Select
                                  options={opportunityContactRoles}
                                  label={null}
                                  placeholder="Select Role"
                                  value={row.roleId ? Number(row.roleId) : null}
                                  onChange={(_, newValue) => {
                                    updateContactRow(
                                      row.tempId,
                                      "roleId",
                                      newValue?.id ? String(newValue.id) : ""
                                    );
                                  }}
                                />

                              </div>

                              <div className="col-span-2 flex justify-center items-center gap-2">
                                <Checkbox
                                  checked={row.isKeyContact}
                                  onChange={(e) => updateContactRow(row.tempId, "isKeyContact", e.target.checked)}
                                />
                              </div>

                              <div className="col-span-1 flex justify-end">
                                <Components.IconButton onClick={() => removeContactRow(row.tempId)}>
                                  <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-red-600 h-4 w-4' />
                                </Components.IconButton>
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
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Display only Key Contacts (like your current UI) */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allContactsWithEdits.length > 0 ? (
                  <ul className="pl-3 text-base">
                    {allContactsWithEdits?.filter((row) => row.isKeyContact === true)?.length > 0 ? allContactsWithEdits?.filter((row) => row.isKeyContact === true)?.map((c) => (
                      <li key={c.id}>
                        <span className="font-medium text-indigo-600 text-base">
                          {c.name}
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
                ) : (
                  <p className="text-sm text-gray-400 italic">No contacts linked to this opportunity.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Decision Map */}
            <div className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 h-60">
              <div className="mb-4">
                <div className="flex justify-start items-center  mb-2 ">
                  <p className="font-medium text-black tracking-wider text-2xl text-center grow">Decision Map</p>

                  <Tooltip title="Add (demo)" arrow>
                    <div
                      className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white"
                      onClick={() =>
                        setSalesProcess((prev) => [
                          ...prev,
                          {
                            id: Date.now(),
                            process: `Step ${prev.length + 1}`,
                            notes: "Demo notes",
                            processDate: new Date().toISOString(),
                          },
                        ])
                      }
                    >
                      <Components.IconButton>
                        <CustomIcons iconName={"fa-solid fa-plus"} css="cursor-pointer text-white h-3 w-3" />
                      </Components.IconButton>
                    </div>
                  </Tooltip>
                </div>

                <div className="flex justify-start items-center gap-8">
                  <p className="text-red-600 text-sm">
                    <strong>Note:&nbsp;</strong>Hover on <strong>Step Name</strong> to read the step notes.
                  </p>
                </div>
              </div>

              <div className="h-full w-full">
                <DecisionMapTimeline items={salesProcess} />
              </div>
            </div>

            {/* Current Env */}
            <div ref={envCardRef} className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4 h-60">
              <div className="mb-4">
                <p className="font-medium text-black tracking-wider text-2xl text-center">Current Environment</p>
              </div>

              <div className="relative h-full">
                {!isEditingEnv ? (
                  <div className="h-full overflow-y-auto cursor-pointer rounded-md p-2 transition" onClick={() => setIsEditingEnv(true)}>
                    <div
                      className="editor-html space-y-1"
                      dangerouslySetInnerHTML={{
                        __html: currentEnvironmentHTML || "<span class='text-gray-400 italic'>-</span>",
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <Editor
                      editorState={currentEnvironmentState}
                      wrapperClassName="wrapper-class border border-gray-300 rounded-md"
                      editorClassName="editor-class p-2 h-40 overflow-y-auto"
                      toolbarClassName="toolbar-class border-b border-gray-300"
                      onEditorStateChange={(state) => setCurrentEnvironmentState(state)}
                      toolbar={toolbarProperties}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div ref={nextStepsRef} className="border-2 border-black p-3 rounded-3xl flex flex-col cursor-pointer relative h-60" onClick={() => setIsEditingNextSteps(true)}>
              <div className="mb-2">
                <p className="font-medium text-black tracking-wider text-2xl text-center">Next Steps</p>
              </div>

              {isEditingNextSteps ? (
                <Input multiline rows={6} value={opp.nextSteps} onChange={(e) => setOpp((p) => ({ ...p, nextSteps: e.target.value }))} />
              ) : opp.nextSteps ? (
                <div className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{opp.nextSteps}</div>
              ) : (
                <p className="text-sm text-gray-400 italic">No next steps defined.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* -------------------- TAB 1: NOTES -------------------- */}
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

            {filteredMeetings?.length > 0 && (
              <div className="rounded-md border border-gray-200 bg-white py-4 px-2 mt-3">
                <div className="flex h-[400px] w-full flex-col overflow-y-scroll">
                  {filteredMeetings.map((row, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectMeeting(row.id)}
                      className={`mb-2 group flex items-center gap-x-5 rounded-md px-2.5 py-2 transition-all duration-75 ${selectedMeeting === row.id ? "bg-blue-500" : "hover:bg-gray-100 "
                        } `}
                    >
                      <div className={`flex flex-col items-start justify-between font-light ${selectedMeeting === row.id ? "text-white" : "text-gray-600"} `}>
                        <p className="text-[15px] font-semibold">{row.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full">
            {selectedMeeting && (
              <div>
                {/* Attendees Table */}
                <div className="min-h-40 overflow-y-auto border rounded-md overflow-hidden">
                  <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <th colSpan={1}>
                          <div className="flex justify-start items-center pl-5">
                            {!openDrawer ? (
                              <Components.IconButton onClick={() => setOpenDrawer(true)}>
                                <CustomIcons iconName={`fa-solid fa-bars`} css={"text-black text-lg"} />
                              </Components.IconButton>
                            ) : (
                              <Components.IconButton onClick={() => setOpenDrawer(false)}>
                                <CustomIcons iconName={`fa-solid fa-angle-left`} css={"text-black text-lg"} />
                              </Components.IconButton>
                            )}
                          </div>
                        </th>
                        <th colSpan={3} className="px-4 py-3 text-center text-lg font-bold text-black">
                          Attendees
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold flex justify-end">
                          <Tooltip title="Add Attendees (demo)" arrow>
                            <div
                              className="bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white"
                              onClick={() =>
                                setMeetingAttendees((prev) => [
                                  ...prev,
                                  { id: Date.now(), name: "New Attendee", title: "Manager", role: "Attendee", note: "Demo note" },
                                ])
                              }
                            >
                              <Components.IconButton>
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
                          <tr key={row.id ?? i} className={`bg-white border-b-1 border-t-0 border-l-0 border-r-0 ${i !== meetingAttendees?.length - 1 ? "border" : ""}`}>
                            <td className="px-4 py-3 text-sm">{row.name || "—"}</td>
                            <td className="px-4 py-3 text-sm">{row.title || "—"}</td>
                            <td className="px-4 py-3 text-sm">{row.role || "—"}</td>
                            <td className="white-space-pre-line px-4 py-3 text-sm">{row.note || "—"}</td>
                            <td className="px-4 py-3 flex justify-end items-center gap-3">
                              <Tooltip title="Edit (demo)" arrow>
                                <div className="bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white">
                                  <Components.IconButton>
                                    <CustomIcons iconName={"fa-solid fa-pen-to-square"} css="cursor-pointer text-white h-4 w-4" />
                                  </Components.IconButton>
                                </div>
                              </Tooltip>

                              <Tooltip title="Delete (demo)" arrow>
                                <div
                                  className="bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white"
                                  onClick={() => setMeetingAttendees((prev) => prev.filter((x) => x.id !== row.id))}
                                >
                                  <Components.IconButton>
                                    <CustomIcons iconName={"fa-solid fa-trash"} css="cursor-pointer text-white h-4 w-4" />
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

                {/* Meeting notes */}
                <div className="my-4">
                  <MeetingNotesTable />
                </div>
              </div>
            )}

            {!selectedMeeting && (
              <div className="border border-gray-200 rounded-md p-6 text-gray-500 italic">
                Select a meeting from the left panel to view attendees & notes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- TAB 2: CALENDAR (DEMO) -------------------- */}
      {selectedTab === 2 && (
        <div className="border border-gray-200 rounded-md p-6">
          <p className="text-gray-700 font-semibold">Calendar (Demo)</p>
          {/* <img src="https://cdn.brandfetch.io/domain/webapp.salesandmarketing.ai?c=1id2vhiypCcqm7fpTjx" alt="Logo by Brandfetch" /> */}
        </div>
      )}
    </div>
  );
}