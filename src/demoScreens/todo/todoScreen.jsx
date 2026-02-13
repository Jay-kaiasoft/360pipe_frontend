import React, { useEffect, useMemo, useRef, useState } from "react";
import CustomIcons from "../../components/common/icons/CustomIcons";

// Real API services
import {
    getAllTodos,
    deleteTodo as deleteTodoApi,
} from "../../service/todo/todoService";
import {
    getAllTodosNotes,
    createTodoNote as createTodoNoteApi,
    updateTodoNote as updateTodoNoteApi,
    deleteTodoNote as deleteTodoNoteApi,
} from "../../service/todoNote/todoNoteService";
import { getOpportunityOptions } from "../../service/opportunities/opportunitiesService";

// Shared modal for add / edit
import AddTodo from "../../components/models/todo/addTodo";
import PermissionWrapper from "../../components/common/permissionWrapper/PermissionWrapper";
import AlertDialog from "../../components/common/alertDialog/alertDialog";
import { Tooltip } from "@mui/material";
import Components from "../../components/muiComponents/components";

// ----------------------------------------------------------------------
// Date & priority helpers (from real version)
// ----------------------------------------------------------------------
const formatDueShort = (iso) => {
    if (!iso) return "TBD";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const m = d.getMonth() + 1;
    const day = String(d.getDate()).padStart(2, "0");
    return `${m}/${day}`;
};

const formatDueLong = (iso) => {
    if (!iso) return "TBD";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatNoteDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${m}/${day}`;
};

const normalizeIsoDate = (v) => {
    if (!v) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return "";
};

const priorityIntToLabel = (p) => {
    if (p === 1) return "Critical";
    if (p === 2) return "High";
    return "Normal";
};

const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem("user") || localStorage.getItem("userData") || localStorage.getItem("profile");
        if (!raw) return {};
        return JSON.parse(raw) || {};
    } catch {
        return {};
    }
};

// ----------------------------------------------------------------------
// TodoScreen
// ----------------------------------------------------------------------
const TodoScreen = () => {
    // --- Refs for note auto-save (from copy) ---
    const noteInputRef = useRef(null);
    const noteInputWrapRef = useRef(null);

    // --- UI state (from copy) ---
    const [activeView, setActiveView] = useState("rep"); // "rep" | "manager"

    // --- Data from API ---
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    // --- Opportunity dropdown (for client mapping) ---
    const [opportunityOptions, setOpportunityOptions] = useState([]);
    const opportunityOptionsMap = useMemo(() => {
        const map = new Map();
        (opportunityOptions || []).forEach((o) => map.set(String(o.value), o.label));
        return map;
    }, [opportunityOptions]);

    // --- Loading states (from real version) ---
    const [loadingTodos, setLoadingTodos] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [deletingTodo, setDeletingTodo] = useState(false);

    // --- Notes state (from real version) ---
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [newNoteInput, setNewNoteInput] = useState("");

    // --- Modal state for AddTodo (from real version) ---
    const [addTodoOpen, setAddTodoOpen] = useState(false);
    const [editingTodoId, setEditingTodoId] = useState(null);

    const [todoId, setTodoId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    // ------------------------------------------------------------------
    // Mapping helpers (API ⇔ UI)
    // ------------------------------------------------------------------
    const mapApiAttachmentsToUiMaterials = (todoAttachmentsDtos = []) => {
        return (todoAttachmentsDtos || [])
            .filter(Boolean)
            .map((a) => {
                const isLink = (a.type || "").toLowerCase() === "link";
                if (isLink) {
                    return {
                        type: "link",
                        id: a.id,
                        name: a.linkName || a.fileName || "Link",
                        url: a.link || "",
                    };
                }
                return {
                    type: "file",
                    id: a.id,
                    name: a.fileName || a.imageName || "Attachment",
                    url: a.path || "",
                };
            });
    };

    const mapApiTodoToUi = (t) => {
        const oppId = t?.oppId ?? "";
        const opportunity = t?.opportunity;
        const due = normalizeIsoDate(t?.dueDate);

        return {
            id: t?.id,
            oppId,
            opportunity: opportunity || "—",
            title: t?.task || "",
            desc: t?.description || "",
            dueDate: due,
            priority: (typeof t?.priority === "number"
                ? priorityIntToLabel(t.priority)
                : (t?.priorityLabel || "Normal")
            ).toLowerCase(),
            materials: mapApiAttachmentsToUiMaterials(t?.todoAttachmentsDtos || t?.images || []),
            notes: [], // will be filled by refreshNotes
            assignedBy: t?.assignedByName || t?.assignedBy || "",
            team: t?.team || "",
            createdDate: t?.createdDate || "",
            completionProgress: t?.completionProgress ?? 0,
            assignees: t?.assignees || [],
            status: t?.status || { completed: 0, total: 0 },
        };
    };

    // ------------------------------------------------------------------
    // Data fetching
    // ------------------------------------------------------------------
    const refreshTodos = async (keepSelectedId = null) => {
        setLoadingTodos(true);
        try {
            const res = await getAllTodos();
            const list = res?.result || res?.data || res || [];
            const uiTodos = (Array.isArray(list) ? list : []).map(mapApiTodoToUi);
            setTasks(uiTodos);

            const selId = keepSelectedId ?? selectedTask?.id;
            if (selId) {
                const found = uiTodos.find((x) => x.id === selId);
                if (found) {
                    setSelectedTask(found);
                    await refreshNotes(found.id, found);
                } else {
                    setSelectedTask(null);
                }
            }
        } catch (e) {
            console.error("refreshTodos error:", e);
        } finally {
            setLoadingTodos(false);
        }
    };

    const refreshNotes = async (todoId, baseTask = null) => {
        if (!todoId) return;
        setLoadingNotes(true);
        try {
            const res = await getAllTodosNotes(todoId);
            const list = res?.result || res?.data || res || [];
            const notesUi = (Array.isArray(list) ? list : []).map((n) => ({
                id: n?.id,
                text: n?.note || "",
                createdOn: n?.createdAt || n?.createdOn || "",
                todoId: n?.todoId,
            }));

            setSelectedTask((prev) => {
                const next = { ...(baseTask || prev), notes: notesUi };
                return next;
            });
            setTasks((prev) =>
                (prev || []).map((t) => (t.id === todoId ? { ...t, notes: notesUi } : t))
            );
        } catch (e) {
            console.error("refreshNotes error:", e);
        } finally {
            setLoadingNotes(false);
        }
    };

    // ------------------------------------------------------------------
    // Initialisation
    // ------------------------------------------------------------------
    const init = async () => {
        try {
            const oppRes = await getOpportunityOptions();
            const list = oppRes?.result || [];
            const opts = list?.[0]?.opportunitiesNameOptions?.map((o) => ({
                value: o?.id ?? null,
                label: o?.title ?? "",
            }));
            setOpportunityOptions(opts || []);
        } catch (e) {
            console.error("Error fetching opportunities:", e);
        }
    };
    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        refreshTodos(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ------------------------------------------------------------------
    // Task CRUD (delete only – add/edit via AddTodo modal)
    // ------------------------------------------------------------------
    const handleDeleteTask = async (taskId) => {
        if (!taskId) return;
        setDeletingTodo(true);
        try {
            await deleteTodoApi(taskId);
            if (selectedTask?.id === taskId) setSelectedTask(null);
            await refreshTodos(null);
        } catch (e) {
            console.error(e);
        } finally {
            setDeletingTodo(false);
        }
    };

    const openAddModal = () => {
        setEditingTodoId(null);
        setAddTodoOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTodoId(task.id);
        setAddTodoOpen(true);
    };

    const handleCloseAddTodo = () => {
        setAddTodoOpen(false);
        setEditingTodoId(null);
    };

    // ------------------------------------------------------------------
    // Notes CRUD
    // ------------------------------------------------------------------
    const stripLegacyPrefix = (s = "") => s.replace(/^\s*\d{1,2}\/\d{1,2}\s*-\s*/g, "").trim();

    const handleEditNote = (noteObj) => {
        setEditingNoteId(noteObj.id);
        setNewNoteInput(stripLegacyPrefix(noteObj.text || ""));
    };

    const handleSaveNote = async () => {
        if (!selectedTask?.id) return;

        const updatedText = newNoteInput.trim();
        if (!updatedText) {
            setEditingNoteId(null);
            setNewNoteInput("");
            return;
        }

        const user = getCurrentUser();
        const customerId = user?.customerId ?? user?.customer ?? null;

        setSavingNote(true);
        try {
            if (editingNoteId === null) {
                // create
                const payload = {
                    id: null,
                    note: updatedText,
                    todoId: selectedTask.id,
                    customerId: customerId ?? null,
                    createdAt: null,
                };
                await createTodoNoteApi(payload);
                await refreshNotes(selectedTask.id);
                setNewNoteInput("");
            } else {
                // update
                const payload = {
                    id: editingNoteId,
                    note: updatedText,
                    todoId: selectedTask.id,
                    customerId: customerId ?? null,
                    createdAt: null,
                };
                await updateTodoNoteApi(editingNoteId, payload);
                await refreshNotes(selectedTask.id);
                setEditingNoteId(null);
                setNewNoteInput("");
            }
        } catch (e) {
            console.error("save note error:", e);
        } finally {
            setSavingNote(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!selectedTask?.id || !noteId) return;
        try {
            await deleteTodoNoteApi(noteId);
            await refreshNotes(selectedTask.id);
        } catch (e) {
            console.error("delete note error:", e);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSaveNote();
        } else if (e.key === "Escape") {
            setEditingNoteId(null);
            setNewNoteInput("");
        }
    };

    const handleNoteInputChange = (e) => setNewNoteInput(e.target.value);

    // Auto‑focus when editing a note
    useEffect(() => {
        if (editingNoteId !== null) {
            requestAnimationFrame(() => noteInputRef?.current?.focus?.());
        }
    }, [editingNoteId]);

    // Click‑outside auto‑save
    useEffect(() => {
        const onDocPointerDown = (e) => {
            if (!selectedTask?.id) return;
            if (editingNoteId === null && !newNoteInput.trim()) return;

            const wrap = noteInputWrapRef.current;
            if (wrap && wrap.contains(e.target)) return;

            handleSaveNote();
        };

        document.addEventListener("mousedown", onDocPointerDown, true);
        document.addEventListener("touchstart", onDocPointerDown, true);
        return () => {
            document.removeEventListener("mousedown", onDocPointerDown, true);
            document.removeEventListener("touchstart", onDocPointerDown, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingNoteId, newNoteInput, selectedTask?.id]);

    // ------------------------------------------------------------------
    // Priority icon & status text
    // ------------------------------------------------------------------
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case "critical":
                return <CustomIcons iconName="fa-solid fa-fire" css="text-red-500 text-lg" />;
            case "high":
                return <CustomIcons iconName="fa-solid fa-eye" css="text-blue-500 text-lg" />;
            case "normal":
                return <CustomIcons iconName="fa-solid fa-cog" css="text-slate-500 text-lg" />;
            default:
                return <CustomIcons iconName="fa-solid fa-circle" css="text-slate-300 text-xs" />;
        }
    };

    const getStatusText = (status) => {
        if (!status || status.total === 0) return "";
        return `${status.completed} / ${status.total} Complete`;
    };

    // ------------------------------------------------------------------
    // Manager View (UI from copy, logic from real)
    // ------------------------------------------------------------------
    const ManagerView = ({ task }) => (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Header info */}
            <div>
                <div className="text-sm text-slate-500 mb-1">Due: {formatDueLong(task.dueDate)}</div>
                <div className="text-sm text-slate-500">
                    Assigned by: {task.assignedBy || "N/A"} · Team: {task.team || "N/A"} · Created: {task.createdDate || "N/A"}
                </div>
            </div>

            {/* Description */}
            <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                <p className="text-slate-700 leading-relaxed">{task.desc || "No description provided."}</p>
            </div>

            {/* Required Materials */}
            {task.materials && task.materials.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Required Materials</h3>
                    <div className="space-y-2">
                        {task.materials.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm group">
                                {item.type === "link" ? (
                                    <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-4 w-4" />
                                ) : (
                                    <CustomIcons iconName="fa-solid fa-file-pdf" css="text-red-500 h-4 w-4" />
                                )}
                                <a
                                    href={item.url || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    {item.name}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completion Progress */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center">
                <h3 className="text-sm font-bold text-slate-800 w-56">Completion Progress</h3>
                <div className="flex items-center w-full gap-2">
                    <div className="flex justify-between text-sm text-slate-600 font-semibold">
                        <span>{task.completionProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.completionProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Assignees (if any) */}
            {task.assignees && task.assignees.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Team Progress</h3>
                    <div className="space-y-4">
                        {task.assignees.map((assignee) => (
                            <div key={assignee.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">
                                            {assignee.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-800">{assignee.name}</div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full ${assignee.status === 'pending' ? 'bg-red-500' : 'bg-green-500'}`} />
                                                <span className="capitalize">{assignee.status}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={() => console.log("Send reminder to", assignee.id)}
                                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                    >
                                        Send Reminder
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={() => openEditModal(task)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                    Edit Task
                </button>
                <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Close Task
                </button>
            </div>
        </div>
    );

    const handleOpenDeleteDialog = (todoId) => {
        setTodoId(todoId);
        setDialog({ open: true, title: 'Delete Todo', message: 'Are you sure! Do you want to delete this todo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setTodoId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteTodo = async () => {
        const res = await deleteTodoApi(todoId);
        if (res.status === 200) {
            setAlert({
                open: true,
                message: "Todo deleted successfully",
                type: "success"
            });
            refreshTodos(null);
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete todo",
                type: "error"
            });
        }
    }
    // ------------------------------------------------------------------
    // Render (UI from copy, adapted with real state & handlers)
    // ------------------------------------------------------------------
    return (
        <div className="min-h-screen p-6 font-sans text-slate-700">
            <div className="max-w-7xl mx-auto flex gap-6 h-[95vh]">
                {/* LEFT PANEL – Task list */}
                <div
                    className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300 ${selectedTask ? "w-2/3" : "w-full"
                        }`}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between rounded-t-xl">
                        <div className="flex gap-3">
                            <button
                                onClick={openAddModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
                            >
                                <CustomIcons iconName="fa-solid fa-plus" css="text-white h-4 w-4" />
                                New Task
                            </button>
                        </div>
                        {(loadingTodos || deletingTodo) && (
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                <span className="animate-pulse">Loading…</span>
                            </div>
                        )}
                    </div>

                    {/* Filter pills (static) */}
                    <div className="flex gap-2 ml-4">
                        <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 border border-slate-200">
                            View: My Tasks
                            <CustomIcons iconName="fa-solid fa-chevron-down" css="text-xs h-3 w-3" />
                        </button>
                        <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 border border-slate-200">
                            Team: Sales Team A
                            <CustomIcons iconName="fa-solid fa-chevron-down" css="text-xs h-3 w-3" />
                        </button>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full table-fixed border-collapse">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="border-b border-slate-100 text-sm font-semibold text-slate-500">
                                    <th className="text-left px-6 py-3">Action Item</th>
                                    <th className="text-right px-6 py-3">Due</th>
                                    <th className="text-right px-6 py-3">Status</th>
                                    <th className="text-right px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(tasks || []).map((task) => {
                                    const isSelected = selectedTask && selectedTask.id === task.id;
                                    return (
                                        <tr
                                            key={task.id}
                                            onClick={async () => {
                                                setSelectedTask(task);
                                                setActiveView("rep");
                                                setNewNoteInput("");
                                                setEditingNoteId(null);
                                                await refreshNotes(task.id, task);
                                            }}
                                            className={`cursor-pointer transition-colors border-b border-slate-50 ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                                                }`}
                                        >
                                            {/* Action Item: client + title */}
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-stretch">
                                                    <div
                                                        className={`mr-3 w-1 rounded-full ${isSelected ? "bg-blue-600" : "bg-transparent"
                                                            }`}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {/* {getPriorityIcon(task.priority)} */}
                                                            <div>
                                                                <div className="font-bold text-slate-800 text-sm truncate">
                                                                    {task.opportunity}
                                                                </div>
                                                                <div className="text-slate-500 text-sm truncate">
                                                                    {task.title}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Due date */}
                                            <td className="px-6 py-4 align-middle text-right text-sm text-slate-600 font-medium">
                                                {formatDueShort(task.dueDate)}
                                            </td>
                                            {/* Status */}
                                            <td className="px-6 py-4 align-middle text-right">
                                                {task.status && task.status.total > 0 ? (
                                                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                        {getStatusText(task.status)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-slate-400">
                                                        Not Started
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 align-middle flex justify-end text-sm text-slate-600 font-medium">
                                                <PermissionWrapper
                                                    functionalityName="Todo"
                                                    moduleName="Todo"
                                                    actionId={3}
                                                    component={
                                                        <Tooltip title="Delete" arrow>
                                                            <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                <Components.IconButton onClick={() => handleOpenDeleteDialog(task.id)}>
                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!loadingTodos && (!tasks || tasks.length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                                            No tasks found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT PANEL – Task details (conditional) */}
                {selectedTask && (
                    <div className="w-1/2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col animate-fadeIn">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedTask.opportunity}</h2>
                                <div className="text-sm text-slate-500">Due: {formatDueLong(selectedTask.dueDate)}</div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedTask(null);
                                    setActiveView("rep");
                                    setNewNoteInput("");
                                }}
                                className="p-2 rounded-lg hover:bg-slate-100 transition"
                            >
                                <CustomIcons iconName="fa-solid fa-xmark" css="text-black h-5 w-5 cursor-pointer" />
                            </button>
                        </div>

                        {/* View Tabs */}
                        <div className="border-b border-slate-100">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveView("rep")}
                                    className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeView === "rep"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <CustomIcons
                                        iconName="fa-solid fa-user"
                                        css={`mr-2 h-4 w-4 ${activeView === "rep" ? "text-blue-600" : "text-slate-400"}`}
                                    />
                                    Rep View
                                </button>
                                <button
                                    onClick={() => setActiveView("manager")}
                                    className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeView === "manager"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <CustomIcons
                                        iconName="fa-solid fa-user-tie"
                                        css={`mr-2 h-4 w-4 ${activeView === "manager" ? "text-blue-600" : "text-slate-400"}`}
                                    />
                                    Manager View
                                </button>
                            </div>
                        </div>

                        {/* Tab content */}
                        {activeView === "rep" ? (
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {/* Description */}
                                <div>
                                    <p className="text-slate-700 leading-relaxed">
                                        {selectedTask.desc || "No description provided."}
                                    </p>
                                </div>

                                {/* Required Materials */}
                                {selectedTask.materials && selectedTask.materials.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Required Materials</h3>
                                        <div className="space-y-2">
                                            {selectedTask.materials.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm group">
                                                    {item.type === "link" ? (
                                                        <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-4 w-4" />
                                                    ) : (
                                                        <CustomIcons iconName="fa-solid fa-file" css="text-red-500 h-4 w-4" />
                                                    )}
                                                    <a
                                                        href={item.url || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-600 hover:underline font-medium"
                                                    >
                                                        {item.name}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes Section */}
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-slate-800">My Notes</h3>
                                        {loadingNotes && (
                                            <span className="text-xs text-slate-400 animate-pulse">Loading…</span>
                                        )}
                                    </div>

                                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                                        {(selectedTask.notes || []).length > 0 ? (
                                            selectedTask.notes.map((note) => (
                                                <div key={note.id} className="flex items-start gap-2 group">
                                                    <span className="text-black font-semibold text-sm">
                                                        {formatNoteDate(note.createdOn)}
                                                    </span>
                                                    <p
                                                        className="text-slate-600 flex-1 cursor-text text-sm"
                                                        onClick={() => handleEditNote(note)}
                                                    >
                                                        {stripLegacyPrefix(note.text)}
                                                    </p>
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="p-1 rounded hover:bg-red-100 transition"
                                                        title="Delete note"
                                                    >
                                                        <CustomIcons iconName="fa-solid fa-trash" css="text-red-500 h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No notes yet. Add your first note below.</p>
                                        )}
                                    </div>

                                    {/* Note input – auto‑saves on click outside */}
                                    <div ref={noteInputWrapRef} className="my-2">
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">
                                            {editingNoteId !== null ? "Edit note..." : "Add a note..."}
                                            {savingNote && <span className="ml-2 text-slate-400 text-xs">Saving…</span>}
                                        </label>
                                        <input
                                            ref={noteInputRef}
                                            type="text"
                                            value={newNoteInput}
                                            onChange={handleNoteInputChange}
                                            onKeyDown={handleKeyPress}
                                            placeholder="Type your note"
                                            className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => openEditModal(selectedTask)}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                                    >
                                        Edit Task
                                    </button>
                                    <button
                                        onClick={() => console.log("Mark complete", selectedTask.id)}
                                        className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors"
                                    >
                                        Mark Complete
                                        <CustomIcons iconName="fa-solid fa-chevron-down" css="text-xs h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <ManagerView task={selectedTask} />
                        )}
                    </div>
                )}
            </div>

            {/* Shared AddTodo Modal */}
            <AddTodo
                open={addTodoOpen}
                handleClose={handleCloseAddTodo}
                todoId={editingTodoId}
                handleGetAllTodos={refreshTodos}
            />
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteTodo()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </div>
    );
};

export default TodoScreen;