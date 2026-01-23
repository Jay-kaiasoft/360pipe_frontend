import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Editor } from "react-draft-wysiwyg";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import dayjs from "dayjs";
import { Tooltip } from "@mui/material";

import Components from "./components/muiComponents/components";
import CustomIcons from "./components/common/icons/CustomIcons";
import Input from "./components/common/input/input";
import Select from "./components/common/select/select";
import Checkbox from "./components/common/checkBox/checkbox";
import { Tabs } from "./components/common/tabs/tabs";
import DatePickerComponent from "./components/common/datePickerComponent/datePickerComponent";
import { opportunityContactRoles } from "./service/common/commonService";

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

const demoContactsArray = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Tony Stark" },
  { id: 3, name: "Emma Watson" },
  { id: 4, name: "Michael Scott" },
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

// ----------------------------
// Demo Screen
// ----------------------------
export default function Demo() {
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
    logo: null,
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
  const envCardRef = useRef(null)
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


  useClickOutside(nextStepsRef, () => {
    if (!isEditingNextSteps) return;
    setIsEditingNextSteps(false); // since you already keep value in opp state, this is "saved"
  }, isEditingNextSteps);

  const [contacts, setContacts] = useState([demoContactsArray]);
  const [initialIsKey, setInitialIsKey] = useState({});
  const [editedContacts, setEditedContacts] = useState([]);

  const [allContactsWithEdits, setAllContactsWithEdits] = useState(
    contacts.map((c) => {
      const edit = editedContacts.find((e) => e.id === c.id);
      return { ...c, isKeyContact: edit ? edit.isKeyContact : c.isKeyContact };
    })
  );

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
    nameId: "",           // selected contact id
    nameText: "",         // typed text in input
    isNameOpen: false,    // dropdown open/close

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
    // Basic validation: require name + role (and optional title)
    const validRows = contactRows.filter((r) => r.nameId && r.roleId);

    // only key contacts
    const keyContacts = validRows.filter((r) => r.isKeyContact === true);

    // map to your final structure
    const mapped = keyContacts.map((r) => ({
      id: r.nameId + "-" + r.roleId, // demo id (you can change)
      nameId: r.nameId,
      name: demoContactsArray.find((x) => String(x.id) === String(r.nameId))?.name || "",
      roleId: r.roleId,
      role: opportunityContactRoles.find((x) => String(x.id) === String(r.roleId))?.title || "",
      title: r.title || "",
      isKeyContact: true,
    }));

    setAllContactsWithEdits((prev) => {
      // remove duplicates by nameId (optional)
      const prevMap = new Map(prev.map((p) => [String(p.nameId), p]));
      mapped.forEach((m) => prevMap.set(String(m.nameId), m));
      return Array.from(prevMap.values()).filter((x) => x.isKeyContact === true);
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

  useClickOutside(pricingBoxRef, () => {
    if (!showPricingBox) return;
    savePricingBox(); // auto-save
  }, showPricingBox);

  const [pricingDraft, setPricingDraft] = useState({
    listPrice: null,
    discountPercentage: null,
    dealAmount: null,
  });


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

  // keep your existing effect logic, but remove your local meetingDate state
  // (remove: const [meetingDate, setMeetingDate] = useState(...))


  // ----------------------------
  // Demo init effects
  // ----------------------------
  useEffect(() => {
    // init initialIsKey map
    const map = {};
    contacts.forEach((c) => (map[c.id] = !!c.isKeyContact));
    setInitialIsKey(map);

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
    // filter meetings by selected date
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

      // outside click -> close editor (demo: just close, no confirm)
      // autosave the currently editing field
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
  }, [editingNoteField]);

  // ----------------------------
  // Demo handlers
  // ----------------------------
  const handleChangeTab = (value) => {
    setSelectedTab(value);

    // mimic your behavior
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

      // Keep listPrice/discount/deal relationship similar to your real screen
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

  const OpportunityField = ({
    label,
    value,
    type = "text",
    options = [],
    onSave,
    required = false,
    multiline = false,
    disabled = false,
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const wrapRef = useRef(null);

    useEffect(() => {
      // keep input synced when outside updates happen
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

      // required check
      if (required && (editValue === null || editValue === undefined || editValue === "")) {
        return; // keep open
      }

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

    // 🔥 autosave when click outside
    useClickOutside(wrapRef, () => {
      if (!isEditing) return;
      commit();
    }, isEditing);

    const handleStartEdit = () => {
      if (disabled) return;
      setIsEditing(true);
      setEditValue(value);
    };

    const displayValue = value || "—";

    return (
      <div ref={wrapRef} className="w-full flex justify-start items-center py-1">
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
                  <Input
                    value={editValue ? dayjs(editValue).format("MM/DD/YYYY") : ""}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
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
      <div className="px-3 py-4 mb-0">
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
                  className={`inline-flex items-center justify-center px-3 py-2 text-sm font-semibold border rounded-full whitespace-nowrap transition-all duration-150 ${pillClasses}`}
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

  const currentKeyContactsCount = allContactsWithEdits.filter((c) => c.isKeyContact).length;

  const handleToggleKeyContact = (id, isKeyContact) => {
    setEditedContacts((prev) => {
      const next = [...prev];
      const idx = next.findIndex((e) => e.id === id);

      if (idx >= 0) next[idx] = { id, isKeyContact };
      else next.push({ id, isKeyContact });

      const original = initialIsKey[id] ?? false;
      const idxAfter = next.findIndex((e) => e.id === id);
      if (idxAfter >= 0 && next[idxAfter].isKeyContact === original) next.splice(idxAfter, 1);

      return next;
    });
  };

  const handleSaveKeyContacts = () => {
    // apply edits to contacts + reset
    setContacts((prev) =>
      prev.map((c) => {
        const edit = editedContacts.find((e) => e.id === c.id);
        return edit ? { ...c, isKeyContact: edit.isKeyContact } : c;
      })
    );

    // rebuild initial map to match saved
    const map = {};
    allContactsWithEdits.forEach((c) => (map[c.id] = !!c.isKeyContact));
    setInitialIsKey(map);

    setEditedContacts([]);
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
      ? goLiveItems.reduce((latest, current) =>
        new Date(current.goLive) > new Date(latest.goLive) ? current : latest
      )
      : null;

    const goLiveText = lastGoLiveItem
      ? new Date(lastGoLiveItem.goLive).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
      : null;

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

                  {/* Demo actions */}
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

              const handleOpenThisEditor = () => {
                setEditingNoteField(r.key);
              };

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
                          onEditorStateChange={(st) => {
                            r.setState(st);
                            // update snapshot in real time for demo preview (optional)
                          }}
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

    // demo attendees
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
        <div className="absolute top-1 left-5">
          <div className="w-10 h-10 p-2 cursor-pointer flex items-center justify-center" onClick={() => console.log("Back (demo)")}>
            <CustomIcons iconName="fa-solid fa-arrow-left" css="h-5 w-5 text-gray-600" />
          </div>
        </div>

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
          <StageTimeline stages={DEMO_STAGES} currentStageId={currentStageId} />

          <div className="flex justify-start items-center gap-10">
            {/* Left: Logo placeholder */}
            <div className="flex justify-center md:justify-start items-center">
              <div className="w-32 h-32 border border-gray-200 rounded-full flex items-center justify-center text-gray-400">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <CustomIcons
                    iconName="fa-solid fa-image"
                    css="mb-3 w-6 h-6"
                  />
                  <p className="text-center text-xs">
                    {'Opportunity Logo'}
                  </p>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className='flex justify-center items-center w-full'>
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
                    ? `$${Number(opp.dealAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                    : "—"}
                </p>

                {/* Click target to open mini box (click on the value area) */}
                <div
                  className="absolute left-0 top-0 right-0 bottom-0"
                  onClick={(e) => {
                    // Allow the internal edit input clicks (save/cancel) to work:
                    // Only open pricing box when NOT currently editing Deal Amount itself
                    // (simple heuristic: if click is on a button/icon/input, ignore)
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
                      {/* List Amount */}
                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          List Amount
                        </label>
                        <input
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={pricingDraft.listPrice ?? ""}
                          onChange={(e) =>
                            setPricingDraft((p) => ({
                              ...p,
                              listPrice: moneyToNumber(e.target.value),
                            }))
                          }
                          placeholder="e.g. 25000"
                        />
                      </div>

                      {/* Discount */}
                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Discount (%)
                        </label>
                        <input
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={pricingDraft.discountPercentage ?? ""}
                          onChange={(e) =>
                            setPricingDraft((p) => ({
                              ...p,
                              discountPercentage: percentToNumber(e.target.value),
                            }))
                          }
                          placeholder="e.g. 10"
                        />
                      </div>

                      {/* Deal Amount */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Deal Amount
                        </label>
                        <input
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={pricingDraft.dealAmount ?? ""}
                          onChange={(e) =>
                            setPricingDraft((p) => ({
                              ...p,
                              dealAmount: moneyToNumber(e.target.value),
                            }))
                          }
                          placeholder="e.g. 22500"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>


              <OpportunityField
                label="Opportunity Name"
                value={opp.opportunity}
                onSave={(newValue) => handleSaveField("opportunity", newValue)}
                required
              />

              <OpportunityField
                label="Close Date"
                value={formatDate(opp.closeDate)}
                type="date"
                onSave={(newValue) => handleSaveField("closeDate", newValue)}
                required
              />

              <OpportunityField
                label="Status"
                value={opp.status}
                type="select"
                options={DEMO_STATUS}
                onSave={(newValue) => handleSaveField("status", newValue)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 my-3">
            {/* Why */}
            <div
              ref={whyCardRef}
              className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4"
            >
              <div className="mb-4">
                <p className="font-medium text-black tracking-wider text-xl text-center">Why Do Anything</p>
              </div>

              <div className="relative h-60">
                {!isEditingWhy ? (
                  <div
                    className="h-full overflow-y-auto cursor-pointer rounded-md p-2 transition"
                    onClick={() => setIsEditingWhy(true)}
                  >
                    <div
                      className="editor-html space-y-1"
                      dangerouslySetInnerHTML={{
                        __html:
                          whyDoAnythingStateHTML ||
                          "<span class='text-gray-400 italic'>-</span>",
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
                      onEditorStateChange={(state) => {
                        setWhyDoAnythingState(state);
                      }}
                      toolbar={toolbarProperties}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Value */}
            <div
              ref={valueCardRef}
              className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4"
            >
              <div className="mb-4">
                <p className="font-medium text-black tracking-wider text-xl text-center">Value</p>
              </div>

              <div className="relative h-60">
                {!isEditingValue ? (
                  <div
                    className="h-full overflow-y-auto cursor-pointer rounded-md p-2 transition"
                    onClick={() => setIsEditingValue(true)}
                  >
                    <div
                      className="editor-html space-y-1"
                      dangerouslySetInnerHTML={{
                        __html:
                          businessValueStateHTML ||
                          "<span class='text-gray-400 italic'>-</span>",
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
                      onEditorStateChange={(state) => {
                        setBusinessValueState(state);
                      }}
                      toolbar={toolbarProperties}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Key Contacts */}
            <div className="border-2 border-black p-3 rounded-3xl flex flex-col cursor-pointer relative">
              <div className="flex justify-start items-center mb-2">
                <p className="font-medium text-black tracking-wider text-xl text-center grow">Key Contacts</p>

                <div className="flex items-center gap-2">
                  {editedContacts.length > 0 && (
                    <Tooltip title="Save key contacts" arrow>
                      <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white" onClick={handleSaveKeyContacts}>
                        <Components.IconButton>
                          <CustomIcons iconName="fa-solid fa-floppy-disk" css="cursor-pointer text-white h-3 w-3" />
                        </Components.IconButton>
                      </div>
                    </Tooltip>
                  )}

                  <Tooltip title="Add contact" arrow>
                    <div
                      className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white"
                    >
                      <Components.IconButton onClick={openAddContactModal}>
                        <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3 w-3" />
                      </Components.IconButton>
                    </div>
                  </Tooltip>

                  {isAddContactOpen && (
                    <div className="absolute top-0 -left-60 right-20 z-10 max-w-4xl rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
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
                        {/* Purple header row like screenshot */}
                        <div className="grid grid-cols-12 gap-2 rounded-md bg-[#5B45A6] px-3 py-2 text-white text-sm font-medium">
                          <div className="col-span-3">Name</div>
                          <div className="col-span-3">Title</div>
                          <div className="col-span-3">Role</div>
                          <div className="col-span-2">Key</div>
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

                        {/* Rows */}
                        <div className="mt-2 space-y-2">
                          {contactRows.map((row) => (
                            <div key={row.tempId} className="grid grid-cols-12 gap-2 items-center px-2">
                              {/* Name */}
                              <div className="col-span-3">
                                <select
                                  className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                  value={row.nameId}
                                  onChange={(e) => updateContactRow(row.tempId, "nameId", e.target.value)}
                                >
                                  <option value="">Select</option>
                                  {demoContactsArray.map((x) => (
                                    <option key={x.id} value={String(x.id)}>
                                      {x.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Title */}
                              <div className="col-span-3">
                                <input
                                  className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Title"
                                  value={row.title}
                                  onChange={(e) => updateContactRow(row.tempId, "title", e.target.value)}
                                />
                              </div>

                              {/* Role */}
                              <div className="col-span-3">
                                <select
                                  className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                  value={row.roleId}
                                  onChange={(e) => updateContactRow(row.tempId, "roleId", e.target.value)}
                                >
                                  <option value="">Select</option>
                                  {opportunityContactRoles.map((r) => (
                                    <option key={r.id} value={String(r.id)}>
                                      {r.title}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Key Contact */}
                              <div className="col-span-2 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={row.isKeyContact}
                                  onChange={(e) => updateContactRow(row.tempId, "isKeyContact", e.target.checked)}
                                />
                              </div>

                              {/* Remove */}
                              <div className="col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => removeContactRow(row.tempId)}
                                  className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                                  title="Remove row"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
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

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allContactsWithEdits.length > 0 ? (
                  allContactsWithEdits.map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between rounded-md px-2 py-1 border text-sm ${c.isKeyContact ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={!!c.isKeyContact}
                          disabled={currentKeyContactsCount >= 4 && !c.isKeyContact}
                          onChange={() => handleToggleKeyContact(c.id, !c.isKeyContact)}
                        />

                        <div>
                          <p className="font-semibold text-indigo-600">
                            {c.name}
                            {c.title && (
                              <span className="text-xs text-gray-500">
                                <span className="mx-1 text-indigo-600">–</span>
                                {c.title}
                              </span>
                            )}
                            {c.role && (
                              <>
                                <span className="mx-1 text-indigo-600">–</span>
                                <span className="text-xs text-indigo-600">{c.role}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No contacts linked to this opportunity.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Decision Map */}
            <div className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4">
              <div className="mb-4">
                <div className="flex justify-start items-center  mb-2 ">
                  <p className="font-medium text-black tracking-wider text-xl text-center grow">Decision Map</p>

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

              <div className="h-60 w-full">
                <DecisionMapTimeline items={salesProcess} />
              </div>
            </div>

            {/* Current Env */}
            <div
              ref={envCardRef}
              className="w-full rounded-3xl shadow-sm border-2 border-black px-5 py-4"
            >
              <div className="mb-4">
                <p className="font-medium text-black tracking-wider text-xl text-center">Current Environment</p>
              </div>

              <div className="relative h-60">
                {!isEditingEnv ? (
                  <div
                    className="h-full overflow-y-auto cursor-pointer rounded-md p-2 transition"
                    onClick={() => setIsEditingEnv(true)}
                  >
                    <div
                      className="editor-html space-y-1"
                      dangerouslySetInnerHTML={{
                        __html:
                          currentEnvironmentHTML ||
                          "<span class='text-gray-400 italic'>-</span>",
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
                      onEditorStateChange={(state) => {
                        setCurrentEnvironmentState(state);
                      }}
                      toolbar={toolbarProperties}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div
              ref={nextStepsRef}
              className="border-2 border-black p-3 rounded-3xl flex flex-col cursor-pointer relative" onClick={() => setIsEditingNextSteps(true)}>
              <div className="mb-2">
                <p className="font-medium text-black tracking-wider text-xl text-center">Next Steps</p>
              </div>

              {isEditingNextSteps ? (
                <Input
                  multiline
                  rows={9}
                  value={opp.nextSteps}
                  onChange={(e) => setOpp((p) => ({ ...p, nextSteps: e.target.value }))}
                />
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


            {/* Demo date input fallback (in case DatePickerComponent is tied to RHF)
            <div className="mt-2">
              <Input value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
            </div> */}

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
        </div>
      )}
    </div>
  );
}
