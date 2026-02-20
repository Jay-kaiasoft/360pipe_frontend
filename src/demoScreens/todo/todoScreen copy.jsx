import React, { useEffect, useRef, useState } from 'react';
import Components from '../../components/muiComponents/components';
import CustomIcons from '../../components/common/icons/CustomIcons';
import MultipleFileUpload from '../../components/fileInputBox/multipleFileUpload';

// --- Due Date formatters (store dueDate as ISO: YYYY-MM-DD) ---
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

const TodoScreen = () => {
    // --- State Management ---
    // Notes: focus + click-outside save
    const noteInputRef = useRef(null);
    const noteInputWrapRef = useRef(null);

    const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [newNoteInput, setNewNoteInput] = useState("");

    const [activeView, setActiveView] = useState('rep'); // 'rep' or 'manager'  

    // Initial Mock Data (updated with status)
    const [tasks, setTasks] = useState([
        {
            id: 1,
            client: 'Acme',
            title: 'Build Architecture Diagram',
            dueDate: '2024-01-08',
            priority: 'critical',
            desc: 'Create high-level system design.',
            materials: [],
            notes: [
                { id: 1, text: "Reviewed the first half of the training module", createdOn: "2026-02-09" },
                { id: 2, text: "Finished the full training module, still need to practice the demo scriptd", createdOn: "2026-02-08" }
            ],
            // Manager View Fields
            assignedBy: 'John Smith',
            team: 'Engineering Team',
            createdDate: 'Jan 3, 2024',
            completionProgress: 40,
            assignees: [],
            // Status field
            status: { completed: 3, total: 5 }
        },
        {
            id: 5, // Matching the screenshot example
            client: 'Q1 Product Training',
            title: 'Complete Product Training',
            dueDate: '2024-01-08',
            priority: 'high',
            desc: 'Complete the Q1 product training module. Make sure to review all key features and the sales demo script.',
            materials: [],
            notes: [
                { id: 1, text: "Reviewed the first half of the training module", createdOn: "2026-02-09" },
                { id: 2, text: "Finished the full training module, still need to practice the demo scriptd", createdOn: "2026-02-08" }
            ],
            // Manager View Fields
            assignedBy: 'Sarah Miller',
            team: 'Sales Team A',
            createdDate: 'Jan 3, 2024',
            completionProgress: 60,
            assignees: [
                { id: 1, name: 'Mike Adams', status: 'pending', role: 'Sales Rep' },
                { id: 2, name: 'Alex Chen', status: 'pending', role: 'Sales Rep' }
            ],
            // Status field
            status: { completed: 3, total: 5 }
        },
        {
            id: 2,
            client: 'Globex',
            title: 'Identify Stakeholders',
            dueDate: '2024-01-08',
            priority: 'normal',
            desc: 'List all key stakeholders.',
            materials: [],
            notes: [
                { id: 1, text: "Reviewed the first half of the training module", createdOn: "2026-02-09" },
                { id: 2, text: "Finished the full training module, still need to practice the demo scriptd", createdOn: "2026-02-08" }
            ],
            // Manager View Fields
            assignedBy: 'Jane Doe',
            team: 'Business Team',
            createdDate: 'Jan 5, 2024',
            completionProgress: 30,
            assignees: [],
            // Status field
            status: { completed: 3, total: 5 }
        },
        {
            id: 3,
            client: 'Initech',
            title: 'Prepare Proposal',
            dueDate: '2024-01-08',
            priority: 'normal',
            desc: 'Prepare the proposal document.',
            materials: [],
            notes: [
                { id: 1, text: "Reviewed the first half of the training module", createdOn: "2026-02-09" },
                { id: 2, text: "Finished the full training module, still need to practice the demo scriptd", createdOn: "2026-02-08" }
            ],
            assignedBy: 'John Doe',
            team: 'Business Team',
            createdDate: 'Jan 6, 2024',
            completionProgress: 80,
            assignees: [],
            // Status field
            status: { completed: 0, total: 5 }
        },
        {
            id: 4,
            client: 'Hooli',
            title: 'Schedule Kickoff Call',
            dueDate: '2024-01-08',
            priority: 'normal',
            desc: 'Schedule the project kickoff call.',
            materials: [],
            notes: [
                { id: 1, text: "Reviewed the first half of the training module", createdOn: "2026-02-09" },
                { id: 2, text: "Finished the full training module, still need to practice the demo scriptd", createdOn: "2026-02-08" }
            ],
            assignedBy: 'Jane Smith',
            team: 'Operations Team',
            createdDate: 'Jan 7, 2024',
            completionProgress: 30,
            assignees: [],
            // Status field
            status: { completed: 0, total: 5 }
        },
        {
            id: 6,
            client: 'Warrior Game',
            title: 'Send Box Invites',
            dueDate: '2024-01-08',
            priority: 'normal',
            desc: 'Send invites for the game launch.',
            materials: [],
            notes: [
                { id: 1, text: "Reviewed the first half of the training module", createdOn: "2026-02-09" },
                { id: 2, text: "Finished the full training module, still need to practice the demo scriptd", createdOn: "2026-02-08" }
            ],
            assignedBy: 'Mike Johnson',
            team: 'Marketing Team',
            createdDate: 'Jan 10, 2024',
            completionProgress: 54,
            assignees: [],
            // Status field
            status: { completed: 0, total: 5 }
        },
        {
            id: 7,
            client: 'Commit, Upside',
            title: 'Review Documentation',
            dueDate: '2024-01-08',
            priority: 'normal',
            desc: 'Review the project documentation.',
            materials: [],
            notes: [
                { id: 1, text: "Reviewed the first half of the training module", createdOn: "2026-02-09" },
                { id: 2, text: "Finished the full training module, still need to practice the demo scriptd", createdOn: "2026-02-08" }
            ],
            assignedBy: 'Sarah Johnson',
            team: 'Development Team',
            createdDate: 'Jan 12, 2024',
            completionProgress: 0,
            assignees: [],
            // Status field - empty for this one as shown in image
            status: { completed: 0, total: 0 }
        }
    ]);

    // Form State for New Task Main Fields
    const [newTaskForm, setNewTaskForm] = useState({
        project: 'Acme',
        taskName: '',
        assignedTo: 'Joseph Williams',
        dueDate: '',
        description: '',
        priority: 'Normal'
    });

    // State for Links being added in the modal
    const [linkInput, setLinkInput] = useState({ name: '', url: '' });
    const [tempLinks, setTempLinks] = useState([]); // Stores links before task is created
    const [tempFileRows, setTempFileRows] = useState([]); // [{ id, fileName, files: File[] }]

    const safeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const fileBaseName = (name = "") => {
        const clean = name.split("?")[0];
        const dot = clean.lastIndexOf(".");
        return dot > 0 ? clean.slice(0, dot) : clean;
    };

    const addFileRow = () => {
        setTempFileRows((prev) => [...prev, { id: safeId(), fileName: "", files: [], existingImages: [] }]);
    };

    const removeFileRow = (rowId) => {
        setTempFileRows((prev) => {
            const row = prev.find(r => r.id === rowId);

            // revoke previews
            row?.files?.forEach((f) => f?.preview && URL.revokeObjectURL(f.preview));
            row?.existingImages?.forEach((x) => x?.__local && x?.imageURL?.startsWith("blob:") && URL.revokeObjectURL(x.imageURL));

            return prev.filter((r) => r.id !== rowId);
        });
    };

    const setRowFileName = (rowId, value) => {
        setTempFileRows((prev) => prev.map(r => r.id === rowId ? { ...r, fileName: value } : r));
    };

    const setRowFiles = (rowId, nextFilesOrUpdater) => {
        setTempFileRows((prev) =>
            prev.map((r) => {
                if (r.id !== rowId) return r;

                const nextFiles =
                    typeof nextFilesOrUpdater === "function" ? nextFilesOrUpdater(r.files) : nextFilesOrUpdater;

                // auto fill fileName if empty
                const autoName = (!r.fileName && nextFiles?.length) ? fileBaseName(nextFiles[0].name) : r.fileName;

                return { ...r, files: nextFiles, fileName: autoName };
            })
        );
    };

    const setRowExistingImages = (rowId, updater) => {
        setTempFileRows((prev) =>
            prev.map((r) => {
                if (r.id !== rowId) return r;
                const next = typeof updater === "function" ? updater(r.existingImages) : updater;
                return { ...r, existingImages: next };
            })
        );
    };

    // --- Handlers ---
    const openAddModal = () => {
        setModalMode("add");
        setEditingTaskId(null);
        setShowModal(true);

        setNewTaskForm({
            project: "Acme",
            taskName: "",
            assignedTo: "Joseph Williams",
            dueDate: "",
            description: "",
            priority: "Normal",
        });

        setTempLinks([]);
        setTempFileRows([]); // start empty; user clicks “Add Files”
    };

    const openEditModal = (task) => {
        setModalMode("edit");
        setEditingTaskId(task.id);
        setShowModal(true);

        setNewTaskForm({
            project: task.client || "Acme",
            taskName: task.title || "",
            assignedTo: task.assignedBy || "Joseph Williams",
            dueDate: task.dueDate || "",
            description: task.desc || "",
            priority: (task.priority ? task.priority[0].toUpperCase() + task.priority.slice(1) : "Normal"),
        });

        // Prefill Links
        const links = (task.materials || []).filter(m => m.type === "link");
        setTempLinks(links.length ? links.map(l => ({ ...l })) : []);

        // Prefill Attachments (anything not link)
        const files = (task.materials || []).filter(m => m.type !== "link");

        // each existing file becomes a row with existingImages so MultipleFileUpload can display it
        const rows = files.map((f) => ({
            id: safeId(),
            fileName: f.name || "",
            files: [], // new uploads
            existingImages: [
                {
                    __local: true, // means local display (not server delete)
                    imageId: f.id || null,
                    imageName: f.name || "Attachment",
                    imageURL: f.url || "#",
                    isInternal: !!f.isInternal
                }
            ]
        }));

        setTempFileRows(rows);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTaskForm({ ...newTaskForm, [name]: value });
    };

    const buildMaterialsPayload = () => {
        // links
        const cleanLinks = (tempLinks || [])
            .filter(l => (l?.name || "").trim() && (l?.url || "").trim())
            .map(l => ({ type: "link", name: l.name.trim(), url: l.url.trim() }));

        // attachments
        const attachments = (tempFileRows || []).flatMap((row) => {
            const rowName = (row.fileName || "").trim();

            // existing (already attached)
            const existing = (row.existingImages || []).map((x) => ({
                type: "file",
                name: rowName || x.imageName,
                url: x.imageURL,
                id: x.imageId || null,
                isInternal: !!x.isInternal
            }));

            // newly uploaded
            const uploaded = (row.files || []).map((file) => ({
                type: "file",
                name: rowName || file.name,
                file,
                url: file.preview,
                mimeType: file.type
            }));

            return [...existing, ...uploaded];
        });

        return [...cleanLinks, ...attachments];
    };

    const handleSaveTask = () => {
        if (!newTaskForm.taskName) return;

        const materials = buildMaterialsPayload();

        if (modalMode === "add") {
            const newTask = {
                id: Date.now(),
                client: newTaskForm.project,
                title: newTaskForm.taskName,
                dueDate: newTaskForm.dueDate || "",
                priority: newTaskForm.priority.toLowerCase(),
                desc: newTaskForm.description,
                materials,
                notes: [],
                assignedBy: newTaskForm.assignedTo,
                team: "Sales Team A",
                createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                completionProgress: 0,
                assignees: [],
                status: { completed: 0, total: 5 },
            };

            setTasks((prev) => [...prev, newTask]);
            resetModal();
            return;
        }

        // EDIT mode
        setTasks((prev) =>
            prev.map((t) =>
                t.id === editingTaskId
                    ? {
                        ...t,
                        client: newTaskForm.project,
                        title: newTaskForm.taskName,
                        dueDate: newTaskForm.dueDate || "",
                        priority: newTaskForm.priority.toLowerCase(),
                        desc: newTaskForm.description,
                        assignedBy: newTaskForm.assignedTo,
                        materials,
                    }
                    : t
            )
        );

        // update right panel if currently selected
        if (selectedTask?.id === editingTaskId) {
            setSelectedTask((prev) => ({
                ...prev,
                client: newTaskForm.project,
                title: newTaskForm.taskName,
                dueDate: newTaskForm.dueDate || "",
                priority: newTaskForm.priority.toLowerCase(),
                desc: newTaskForm.description,
                assignedBy: newTaskForm.assignedTo,
                materials,
            }));
        }

        resetModal();
    };

    const resetModal = () => {
        setShowModal(false);
        setModalMode("add");
        setEditingTaskId(null);

        setNewTaskForm({
            project: "Acme",
            taskName: "",
            assignedTo: "Joseph Williams",
            dueDate: "",
            description: "",
            priority: "Normal",
        });

        setTempLinks([]);
        setLinkInput({ name: "", url: "" });

        setTempFileRows((prev) => {
            prev?.forEach((r) => {
                r?.files?.forEach((f) => f?.preview && URL.revokeObjectURL(f.preview));
                r?.existingImages?.forEach((x) => x?.__local && x?.imageURL?.startsWith("blob:") && URL.revokeObjectURL(x.imageURL));
            });
            return [];
        });
    };


    // Get priority icon with different styles based on priority
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'critical':
                return <CustomIcons iconName="fa-solid fa-fire" css="text-red-500 text-lg" />;
            case 'high':
                return <CustomIcons iconName="fa-solid fa-eye" css="text-blue-500 text-lg" />;
            case 'normal':
                return <CustomIcons iconName="fa-solid fa-cog" css="text-slate-500 text-lg" />;
            default:
                return <CustomIcons iconName="fa-solid fa-circle" css="text-slate-300 text-xs" />;
        }
    };

    // Get status display text
    const getStatusText = (status) => {
        if (status.total === 0) {
            return '';
        }
        return `${status.completed} / ${status.total} Complete`;
    };

    const handleSaveNote = () => {
        if (!selectedTask) return;

        const updatedText = newNoteInput.trim();

        // If empty, just cancel
        if (!updatedText) {
            setEditingNoteId(null);
            setNewNoteInput("");
            return;
        }

        const todayIso = new Date().toISOString().slice(0, 10);

        // -------- ADD MODE (no note selected) --------
        if (editingNoteId === null) {
            const newNote = {
                id: Date.now(),
                text: updatedText,
                createdOn: todayIso,
            };

            setTasks((prev) =>
                prev.map((t) =>
                    t.id === selectedTask.id
                        ? { ...t, notes: [...(t.notes || []), newNote] }
                        : t
                )
            );

            setSelectedTask((prev) => ({
                ...prev,
                notes: [...(prev.notes || []), newNote],
            }));

            setNewNoteInput("");
            return;
        }

        // -------- EDIT MODE --------
        setTasks((prev) =>
            prev.map((t) =>
                t.id === selectedTask.id
                    ? {
                        ...t,
                        notes: (t.notes || []).map((n) =>
                            n.id === editingNoteId ? { ...n, text: updatedText } : n
                        ),
                    }
                    : t
            )
        );

        setSelectedTask((prev) => ({
            ...prev,
            notes: (prev.notes || []).map((n) =>
                n.id === editingNoteId ? { ...n, text: updatedText } : n
            ),
        }));

        setEditingNoteId(null);
        setNewNoteInput("");
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

    // Delete note
    const handleDeleteNote = (noteIndex) => {
        if (!selectedTask) return;

        const updatedTasks = tasks.map(task => {
            if (task.id === selectedTask.id) {
                const updatedNotes = [...task.notes];
                updatedNotes.splice(noteIndex, 1);
                return {
                    ...task,
                    notes: updatedNotes
                };
            }
            return task;
        });

        setTasks(updatedTasks);
        const updatedSelectedTask = updatedTasks.find(task => task.id === selectedTask.id);
        setSelectedTask(updatedSelectedTask);
    };

    const stripLegacyPrefix = (s = "") => {
        // removes "1/29 - " style prefix if it exists
        return s.replace(/^\s*\d{1,2}\/\d{1,2}\s*-\s*/g, "").trim();
    };

    const handleEditNote = (noteObj) => {
        setEditingNoteId(noteObj.id);
        setNewNoteInput(stripLegacyPrefix(noteObj.text || ""));
    };

    useEffect(() => {
        if (editingNoteId !== null) {
            requestAnimationFrame(() => {
                noteInputRef?.current?.focus?.();
            });
        }
    }, [editingNoteId]);

    useEffect(() => {
        const onDocPointerDown = (e) => {
            // nothing to save
            if (editingNoteId === null && !newNoteInput.trim()) return;

            const wrap = noteInputWrapRef.current;
            // If the click is inside the input area, ignore
            if (wrap && wrap.contains(e.target)) return;

            handleSaveNote();
        };

        document.addEventListener('mousedown', onDocPointerDown, true);
        document.addEventListener('touchstart', onDocPointerDown, true);
        return () => {
            document.removeEventListener('mousedown', onDocPointerDown, true);
            document.removeEventListener('touchstart', onDocPointerDown, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingNoteId, newNoteInput, selectedTask]);


    const ManagerView = ({ task }) => {
        const handleSendReminder = (assigneeId) => {
            console.log(`Send reminder to assignee ${assigneeId}`);
        };

        const handleEditTask = () => openEditModal(task);

        const handleCloseTask = () => {
            console.log('Close task:', task.id);
        };

        return (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Task Header Info */}
                <div className="">
                    <div className="text-sm text-slate-500 mb-1">
                        Due: {formatDueLong(task.dueDate)}
                    </div>
                    <div className="text-sm text-slate-500">
                        Assigned by: {task.assignedBy || 'N/A'} ·
                        Team: {task.team || 'N/A'} ·
                        Created: {task.createdDate || 'N/A'}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                    <p className="text-slate-700 leading-relaxed">
                        {task.desc || "No description provided."}
                    </p>
                </div>

                {/* Required Materials */}
                {task.materials && task.materials.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3">Required Materials</h3>
                        <div className="space-y-2">
                            {task.materials.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm group">
                                    {item.type === 'link' ? (
                                        <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-4 w-4" />
                                    ) : (
                                        <CustomIcons iconName="fa-solid fa-file-pdf" css="text-red-500 h-4 w-4" />
                                    )}
                                    <a href={item.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                                        {item.name}
                                    </a>
                                    {item.size && <span className="text-slate-400 text-xs">{item.size}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completion Progress */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center">
                    <h3 className="text-sm font-bold text-slate-800 w-56">Completion Progress</h3>
                    <div className='flex items-center w-full gap-2'>
                        <div className="flex justify-between text-sm text-slate-600 font-semibold">
                            <span>{task.completionProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.completionProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Assignees Section */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Team Progress</h3>
                    <div className="space-y-4">
                        {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.map((assignee) => (
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
                                                {/* {assignee.role && <span>{assignee.role}</span>} */}
                                                <span className="flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full ${assignee.status === 'pending' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                                    <span className="capitalize">{assignee.status}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSendReminder(assignee.id)}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                        >
                                            Send Reminder
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-slate-400">
                                No assignees for this task.
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={handleEditTask}
                        className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                    >
                        Edit Task
                    </button>
                    <button
                        onClick={handleCloseTask}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        Close Task
                    </button>
                </div>
            </div>
        );
    };

    const handleEditTask = (task) => openEditModal(task);

    return (
        <div className="min-h-screen p-6 font-sans text-slate-700">
            <div className="max-w-7xl mx-auto flex gap-6 h-[95vh]">
                <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300 ${selectedTask ? 'w-2/3' : 'w-full'}`}>
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
                    </div>

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

                    {/* Table Header + Rows (TABLE version) */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full table-fixed border-collapse">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="border-b border-slate-100 text-sm font-semibold text-slate-500">
                                    <th className="w-6/12 text-left px-6 py-3">Action Item</th>
                                    <th className="w-2/12 text-right px-6 py-3">Due</th>
                                    <th className="w-4/12 text-right px-6 py-3">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tasks?.map((task) => {
                                    const isSelected = selectedTask && selectedTask.id === task.id;

                                    return (
                                        <tr
                                            key={task.id}
                                            onClick={() => {
                                                setSelectedTask(task);
                                                setActiveView("rep");
                                                setNewNoteInput("");
                                            }}
                                            className={`cursor-pointer transition-colors border-b border-slate-50
              ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}
            `}
                                        >
                                            {/* Action Item */}
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-stretch">
                                                    {/* left selection bar */}
                                                    <div
                                                        className={`mr-3 w-1 rounded-full ${isSelected ? "bg-blue-600" : "bg-transparent"
                                                            }`}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-800 text-sm truncate">
                                                            {task.client}
                                                        </div>
                                                        <div className="text-slate-500 text-sm truncate">
                                                            {task.title}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Due */}
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* --- RIGHT PANEL: DETAILS (Conditional) --- */}
                {selectedTask && (
                    <div className="w-1/2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col animate-fadeIn">
                        {/* Detail Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedTask.client}</h2>
                                <div className="text-sm text-slate-500">Due: {formatDueLong(selectedTask.dueDate)}</div>
                            </div>

                            <Components.IconButton onClick={() => {
                                setSelectedTask(null);
                                setActiveView('rep'); // Reset to rep view when closing
                                setNewNoteInput(''); // Clear note input when closing
                            }}>
                                <CustomIcons iconName="fa-solid fa-xmark" css="text-black h-5 w-5 cursor-pointer" />
                            </Components.IconButton>
                        </div>

                        {/* View Tabs */}
                        <div className="border-b border-slate-100">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveView('rep')}
                                    className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeView === 'rep' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    <CustomIcons
                                        iconName="fa-solid fa-user"
                                        css={`mr-2 h-4 w-4 ${activeView === 'rep' ? 'text-blue-600' : 'text-slate-400'}`}
                                    />
                                    Rep View
                                </button>
                                <button
                                    onClick={() => setActiveView('manager')}
                                    className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeView === 'manager' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    <CustomIcons
                                        iconName="fa-solid fa-user-tie"
                                        css={`mr-2 h-4 w-4 ${activeView === 'manager' ? 'text-blue-600' : 'text-slate-400'}`}
                                    />
                                    Manager View
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeView === 'rep' ? (
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {/* Description */}
                                <div>
                                    <p className="text-slate-700 leading-relaxed">
                                        {selectedTask.desc || "No description provided."}
                                    </p>
                                </div>

                                {/* Required Materials Section */}
                                {selectedTask.materials && selectedTask.materials.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Required Materials</h3>
                                        <div className="space-y-2">
                                            {selectedTask.materials.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm group">
                                                    {item.type === 'link' ? (
                                                        <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-4 w-4" />
                                                    ) : (
                                                        <CustomIcons iconName="fa-solid fa-file" css="text-red-500 h-4 w-4" />
                                                    )}
                                                    <a href={item.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                                                        {item.name}
                                                    </a>
                                                    {/* {item.size && <span className="text-slate-400 text-xs">{item.size}</span>} */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Enhanced Notes Section */}
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-800 mb-3">My Notes</h3>

                                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                                        {selectedTask.notes.length > 0 ? (
                                            selectedTask.notes.map((note, idx) => (
                                                <div key={idx} className="flex items-start gap-2 group">
                                                    <span className="text-black font-semibold">
                                                        {formatNoteDate(note.createdOn)}
                                                    </span>
                                                    <p
                                                        className="text-slate-600 flex-1 cursor-text"
                                                        onClick={() => handleEditNote(note)}
                                                    >
                                                        {stripLegacyPrefix(note.text)}
                                                    </p>
                                                    <button
                                                        onClick={() => handleDeleteNote(idx)}
                                                        className="transition-opacity p-1 rounded"
                                                        //opacity-0 group-hover:opacity-100 
                                                        title="Delete note"
                                                    >
                                                        <CustomIcons
                                                            iconName="fa-solid fa-trash"
                                                            css="text-red-500 h-3 w-3"
                                                        />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No notes yet. Add your first note below.</p>
                                        )}
                                    </div>


                                </div>

                                {/* Add/Edit Note Input (auto-saves on click-outside) */}
                                <div className="my-2" ref={noteInputWrapRef}>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">
                                        {editingNoteId !== null ? 'Edit note...' : 'Add a note...'}
                                    </label>

                                    <div className="relative">
                                        <input
                                            ref={noteInputRef}
                                            type="text"
                                            value={newNoteInput}
                                            onChange={handleNoteInputChange}
                                            onBlur={handleSaveNote}
                                            onKeyDown={handleKeyPress}
                                            placeholder={"Type your note"}
                                            className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                                        />
                                    </div>
                                </div>


                                {/* Mark Complete Button */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleEditTask(selectedTask)}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                                    >
                                        Edit Task
                                    </button>
                                    <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors">
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

            {/* --- MODAL: NEW TASK --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-scaleIn custom-scrollbar">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-indigo-100 flex justify-between items-center bg-white/50 sticky top-0 backdrop-blur-md z-10">
                            <h2 className="text-xl font-bold text-slate-800">New Task</h2>
                            <Components.IconButton onClick={resetModal}>
                                <CustomIcons iconName="fa-solid fa-xmark" css="text-black h-5 w-5 cursor-pointer" />
                            </Components.IconButton>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Project Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Project <span className="text-red-500">*</span></label>
                                <select
                                    name="project"
                                    value={newTaskForm.project}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                >
                                    <option>Acme</option>
                                    <option>Globex</option>
                                    <option>Initech</option>
                                    <option>Hooli</option>
                                </select>
                            </div>

                            {/* Task Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Task Name</label>
                                <input
                                    type="text"
                                    name="taskName"
                                    value={newTaskForm.taskName}
                                    onChange={handleInputChange}
                                    placeholder="Enter task name..."
                                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none transition-colors"
                                />
                            </div>

                            {/* Row: Assigned & Due Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Assigned To</label>
                                    <div className="relative">
                                        <select
                                            name="assignedTo"
                                            value={newTaskForm.assignedTo}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 appearance-none outline-none"
                                        >
                                            <option>Joseph Williams</option>
                                            <option>Jane Doe</option>
                                        </select>
                                        <div className="absolute right-3 top-3.5 pointer-events-none">
                                            <CustomIcons iconName="fa-solid fa-chevron-down" css="text-slate-400 text-xs h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Due Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={newTaskForm.dueDate}
                                            onChange={handleInputChange}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description & Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={newTaskForm.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter task description..."
                                        className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Priority</label>
                                    <div className="relative">
                                        <select
                                            name="priority"
                                            value={newTaskForm.priority}
                                            onChange={handleInputChange}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 appearance-none outline-none"
                                        >
                                            <option>Normal</option>
                                            <option>High</option>
                                            <option>Critical</option>
                                        </select>
                                        <div className="absolute right-3 top-3.5 pointer-events-none">
                                            <CustomIcons iconName="fa-solid fa-chevron-down" css="text-slate-400 text-xs h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Section (table rows) */}
                            <div className="bg-white/50 rounded-lg p-4 border border-indigo-100">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-semibold text-slate-600">
                                        Attachments (optional)
                                    </label>

                                    <button
                                        type="button"
                                        onClick={addFileRow}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                        <CustomIcons iconName="fa-solid fa-plus" css="text-white h-3 w-3" />
                                        Add Files
                                    </button>
                                </div>

                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                    <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
                                        <div className="col-span-4">File name</div>
                                        <div className="col-span-7">File</div>
                                        <div className="col-span-1 text-right">Action</div>
                                    </div>

                                    {tempFileRows.map((row) => (
                                        <div key={row.id} className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-slate-100 last:border-0">
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    value={row.fileName}
                                                    onChange={(e) => setRowFileName(row.id, e.target.value)}
                                                    placeholder="Enter file name"
                                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-400"
                                                />
                                            </div>

                                            <div className="col-span-7 -mt-2">
                                                <MultipleFileUpload
                                                    files={row.files}
                                                    setFiles={(v) => setRowFiles(row.id, v)}
                                                    existingImages={row.existingImages}
                                                    setExistingImages={(v) => setRowExistingImages(row.id, v)}
                                                    placeHolder="Drag & drop files here, or click to select files"
                                                    isFileUpload={true}
                                                    removableExistingAttachments={true}
                                                    flexView={true}
                                                    multiple={false}
                                                    type={"todo"}
                                                    preview={false}
                                                />
                                            </div>

                                            <div className="col-span-1 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFileRow(row.id)}
                                                    className="bg-red-100 hover:bg-red-200 text-red-600 h-10 w-10 rounded-lg transition-colors flex items-center justify-center"
                                                    title="Remove row"
                                                >
                                                    <CustomIcons iconName="fa-solid fa-trash" css="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {tempFileRows.length === 0 && (
                                        <div className="p-6 text-center text-slate-400 text-sm">
                                            No files added yet. Click "Add Files" to add an attachment.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Links Section */}
                            <div className="bg-white/50 rounded-lg p-4 border border-indigo-100">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-semibold text-slate-600">Add Links (optional)</label>
                                    <button
                                        type="button"
                                        onClick={() => setTempLinks([...tempLinks, { type: 'link', name: '', url: '' }])}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                    >
                                        <CustomIcons iconName="fa-solid fa-plus" css="text-white h-3 w-3" />
                                        Add New Row
                                    </button>
                                </div>

                                {/* Dynamic Link Rows */}
                                {tempLinks.map((link, index) => (
                                    <div key={index} className="flex gap-2 mb-3 items-center">
                                        <input
                                            type="text"
                                            value={link.name}
                                            onChange={(e) => {
                                                const newLinks = [...tempLinks];
                                                newLinks[index].name = e.target.value;
                                                setTempLinks(newLinks);
                                            }}
                                            placeholder="Name (e.g. Workday Product Training)"
                                            className="flex-1 border border-slate-200 rounded-lg p-2 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => {
                                                const newLinks = [...tempLinks];
                                                newLinks[index].url = e.target.value;
                                                setTempLinks(newLinks);
                                            }}
                                            placeholder="URL (e.g. www.workday.com/training)"
                                            className="flex-[1.5] border border-slate-200 rounded-lg p-2 text-sm outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newLinks = tempLinks.filter((_, i) => i !== index);
                                                setTempLinks(newLinks);
                                            }}
                                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors flex-shrink-0"
                                            title="Remove row"
                                        >
                                            <CustomIcons iconName="fa-solid fa-trash" css="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* Helper text when no links added */}
                                {tempLinks.length === 0 && (
                                    <div className="text-center py-3 text-slate-400 text-sm">
                                        No links added yet. Click "Add New Row" to add a link.
                                    </div>
                                )}

                                {/* Display added links for confirmation */}
                                {tempLinks.filter(link => link.name && link.url).length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-xs font-semibold text-slate-500 mb-2">Links to be added:</h4>
                                        <div className="space-y-1">
                                            {tempLinks
                                                .filter(link => link.name && link.url)
                                                .map((link, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded px-3 py-2 text-sm">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-3 w-3 flex-shrink-0" />
                                                            <span className="font-medium text-slate-700 truncate">{link.name}</span>
                                                            <span className="text-slate-400 text-xs truncate max-w-[200px]">{link.url}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-indigo-100 flex justify-end gap-3 bg-white/50 sticky bottom-0 backdrop-blur-md">
                            <button
                                onClick={resetModal}
                                className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTask}
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
                            >
                                {modalMode === "edit" ? "Update Task" : "Create Task"}
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TodoScreen;




// import React, { useEffect, useRef, useState } from "react";
// import CustomIcons from "../../components/common/icons/CustomIcons";

// // Real API services
// import {
//     getAllTodos,
//     deleteTodo as deleteTodoApi,
//     completeTodo,
//     getTodoByTeam,
// } from "../../service/todo/todoService";
// import {
//     getAllTodosNotes,
//     createTodoNote as createTodoNoteApi,
//     updateTodoNote as updateTodoNoteApi,
//     deleteTodoNote as deleteTodoNoteApi,
// } from "../../service/todoNote/todoNoteService";


// // Shared modal for add / edit
// import AddTodo from "../../components/models/todo/addTodo";
// import PermissionWrapper from "../../components/common/permissionWrapper/PermissionWrapper";
// import AlertDialog from "../../components/common/alertDialog/alertDialog";
// import { Tooltip } from "@mui/material";
// import Components from "../../components/muiComponents/components";
// import { setAlert } from "../../redux/commonReducers/commonReducers";
// import { connect } from "react-redux";
// import { sendTaskReminder } from "../../service/todoAssign/todoAssignService";
// import Button from "../../components/common/buttons/button";
// import { getAllTeams } from "../../service/teamDetails/teamDetailsService";
// import CheckBoxSelect from "../../components/common/select/checkBoxSelect";
// import { NavLink } from "react-router-dom";

// // ----------------------------------------------------------------------
// // Date & priority helpers (from real version)
// // ----------------------------------------------------------------------
// const formatDueShort = (iso) => {
//     if (!iso) return "TBD";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     const m = d.getMonth() + 1;
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${m}/${day}`;
// };

// const formatDueLong = (iso) => {
//     if (!iso) return "TBD";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
// };

// const formatNoteDate = (iso) => {
//     if (!iso) return "";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     const m = d.getMonth() + 1;
//     const day = d.getDate();
//     return `${m}/${day}`;
// };

// const normalizeIsoDate = (v) => {
//     if (!v) return "";
//     if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
//     const d = new Date(v);
//     if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
//     return "";
// };

// const priorityIntToLabel = (p) => {
//     if (p === 1) return "Critical";
//     if (p === 2) return "High";
//     return "Normal";
// };

// const getCurrentUser = () => {
//     try {
//         const raw = localStorage.getItem("user") || localStorage.getItem("userData") || localStorage.getItem("profile");
//         if (!raw) return {};
//         return JSON.parse(raw) || {};
//     } catch {
//         return {};
//     }
// };

// // ----------------------------------------------------------------------
// // TodoScreen
// // ----------------------------------------------------------------------
// const TodoScreen = ({ setAlert }) => {
//     // --- Refs for note auto-save (from copy) ---
//     const noteInputRef = useRef(null);
//     const noteInputWrapRef = useRef(null);

//     // --- UI state (from copy) ---
//     const [activeView, setActiveView] = useState("rep"); // "rep" | "manager"

//     // --- Data from API ---
//     const [tasks, setTasks] = useState([]);
//     const [teams, setTeams] = useState([]);
//     const [selectedTeam, setSelectedTeam] = useState([]);

//     const [selectedTask, setSelectedTask] = useState(null);

//     // --- Notes state (from real version) ---
//     const [editingNoteId, setEditingNoteId] = useState(null);
//     const [newNoteInput, setNewNoteInput] = useState("");

//     // --- Modal state for AddTodo (from real version) ---
//     const [addTodoOpen, setAddTodoOpen] = useState(false);
//     const [editingTodoId, setEditingTodoId] = useState(null);

//     const [todoId, setTodoId] = useState(null);
//     const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

//     // ------------------------------------------------------------------
//     // Mapping helpers (API ⇔ UI)
//     // ------------------------------------------------------------------
//     const mapApiAttachmentsToUiMaterials = (todoAttachmentsDtos = []) => {
//         return (todoAttachmentsDtos || [])
//             .filter(Boolean)
//             .map((a) => {
//                 const isLink = (a.type || "").toLowerCase() === "link";
//                 if (isLink) {
//                     return {
//                         type: "link",
//                         id: a.id,
//                         name: a.linkName || a.fileName || "Link",
//                         url: a.link || "",
//                     };
//                 }
//                 return {
//                     type: "file",
//                     id: a.id,
//                     name: a.fileName || a.imageName || "Attachment",
//                     url: a.path || "",
//                 };
//             });
//     };

//     const mapApiTodoToUi = (t) => {
//         const oppId = t?.oppId ?? "";
//         const opportunity = t?.opportunity;
//         const due = normalizeIsoDate(t?.dueDate);
//         const todoAssignData = t?.todoAssignData || [];
//         const totalAssignees = todoAssignData.length;
//         const completedAssignees = todoAssignData.filter(a => a.complectedWork === 100).length;
//         const completionProgress = todoAssignData?.filter(a => a.complectedWork > 0).length;
//         const completionProgressPercent = totalAssignees > 0 ? Math.round((completedAssignees / totalAssignees) * 100) : 0;
//         const statusColor = completionProgress === 0 ? "#D7D8F4" : (completedAssignees === totalAssignees ? "#2e8500" : "#EED5B9");
//         return {
//             id: t?.id,
//             oppId,
//             opportunity: opportunity || "—",
//             title: t?.task || "",
//             desc: t?.description || "",
//             dueDate: due,
//             priority: (typeof t?.priority === "number"
//                 ? priorityIntToLabel(t.priority)
//                 : (t?.priorityLabel || "Normal")
//             ).toLowerCase(),
//             materials: mapApiAttachmentsToUiMaterials(t?.todoAttachmentsDtos || t?.images || []),
//             notes: [], // will be filled by refreshNotes
//             assignedBy: t?.assignedByName || t?.assignedBy || "",
//             team: t?.team || "",
//             createdDate: t?.createdDate || "",
//             assignees: t?.assignees || [],
//             totalAssignees,
//             completedAssignees,
//             statusColor,
//             completionProgressPercent,
//             createdByName: t?.createdByName,
//             teamName: t?.teamName,
//             todoAssignData
//         };
//     };

//     // ------------------------------------------------------------------
//     // Data fetching
//     // ------------------------------------------------------------------
//     const refreshTodos = async (keepSelectedId = null) => {
//         try {
//             const res = await getAllTodos();
//             const list = res?.result || res?.data || res || [];
//             const uiTodos = (Array.isArray(list) ? list : []).map(mapApiTodoToUi);

//             setTasks(uiTodos);

//             const selId = keepSelectedId ?? selectedTask?.id;
//             if (selId) {
//                 const found = uiTodos.find((x) => x.id === selId);
//                 if (found) {
//                     setSelectedTask(found);
//                     await refreshNotes(found.id, found);
//                 } else {
//                     setSelectedTask(null);
//                 }
//             }
//         } catch (e) {
//             console.error("refreshTodos error:", e);
//         }
//     };

//     const refreshNotes = async (todoId, baseTask = null) => {
//         if (!todoId) return;
//         try {
//             const res = await getAllTodosNotes(todoId);
//             const list = res?.result || res?.data || res || [];
//             const notesUi = (Array.isArray(list) ? list : []).map((n) => ({
//                 id: n?.id,
//                 text: n?.note || "",
//                 createdOn: n?.createdAt || n?.createdOn || "",
//                 todoId: n?.todoId,
//             }));

//             setSelectedTask((prev) => {
//                 const next = { ...(baseTask || prev), notes: notesUi };
//                 return next;
//             });
//             setTasks((prev) =>
//                 (prev || []).map((t) => (t.id === todoId ? { ...t, notes: notesUi } : t))
//             );
//         } catch (e) {
//             console.error("refreshNotes error:", e);
//         }
//     };

//     const handleGetAllTeams = async () => {
//         const res = await getAllTeams();
//         const data = res?.result?.map((t) => ({ id: t.id, title: t.name })) || [];
//         setTeams(data);
//     }

//     const handleTeamChange = async (event, newValue) => {
//         setSelectedTeam(newValue);
//     }

//     const handleGetTodoByTeam = async () => {
//         if (!selectedTeam) {
//             refreshTodos(null);
//         } else {
//             const teamIds = selectedTeam.map(t => t.id);
//             if (teamIds?.length > 0) {
//                 const res = await getTodoByTeam({ teamIds });
//                 const uiTodos = (Array.isArray(res?.result) ? res.result : []).map(mapApiTodoToUi);
//                 setTasks(uiTodos);
//             } else {
//                 refreshTodos(null);
//             }
//         }
//     }

//     useEffect(() => {
//         refreshTodos(null);
//         handleGetAllTeams()
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     useEffect(() => {
//         handleGetTodoByTeam();
//     }, [selectedTeam])

//     const openAddModal = () => {
//         setEditingTodoId(null);
//         setAddTodoOpen(true);
//     };

//     const openEditModal = (task) => {
//         setEditingTodoId(task.id);
//         setAddTodoOpen(true);
//     };

//     const handleCloseAddTodo = () => {
//         setAddTodoOpen(false);
//         setEditingTodoId(null);
//     };

//     // ------------------------------------------------------------------
//     // Notes CRUD
//     // ------------------------------------------------------------------
//     const stripLegacyPrefix = (s = "") => s.replace(/^\s*\d{1,2}\/\d{1,2}\s*-\s*/g, "").trim();

//     const handleEditNote = (noteObj) => {
//         setEditingNoteId(noteObj.id);
//         setNewNoteInput(stripLegacyPrefix(noteObj.text || ""));
//     };

//     const handleSaveNote = async () => {
//         if (!selectedTask?.id) return;

//         const updatedText = newNoteInput.trim();
//         if (!updatedText) {
//             setEditingNoteId(null);
//             setNewNoteInput("");
//             return;
//         }

//         const user = getCurrentUser();
//         const customerId = user?.customerId ?? user?.customer ?? null;

//         try {
//             if (editingNoteId === null) {
//                 // create
//                 const payload = {
//                     id: null,
//                     note: updatedText,
//                     todoId: selectedTask.id,
//                     customerId: customerId ?? null,
//                     createdAt: null,
//                 };
//                 await createTodoNoteApi(payload);
//                 await refreshNotes(selectedTask.id);
//                 setNewNoteInput("");
//             } else {
//                 // update
//                 const payload = {
//                     id: editingNoteId,
//                     note: updatedText,
//                     todoId: selectedTask.id,
//                     customerId: customerId ?? null,
//                     createdAt: null,
//                 };
//                 await updateTodoNoteApi(editingNoteId, payload);
//                 await refreshNotes(selectedTask.id);
//                 setEditingNoteId(null);
//                 setNewNoteInput("");
//             }
//         } catch (e) {
//             console.error("save note error:", e);
//         }
//     };

//     const handleDeleteNote = async (noteId) => {
//         if (!selectedTask?.id || !noteId) return;
//         try {
//             await deleteTodoNoteApi(noteId);
//             await refreshNotes(selectedTask.id);
//         } catch (e) {
//             console.error("delete note error:", e);
//         }
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === "Enter") {
//             e.preventDefault();
//             handleSaveNote();
//         } else if (e.key === "Escape") {
//             setEditingNoteId(null);
//             setNewNoteInput("");
//         }
//     };

//     const handleNoteInputChange = (e) => setNewNoteInput(e.target.value);

//     // Auto‑focus when editing a note
//     useEffect(() => {
//         if (editingNoteId !== null) {
//             requestAnimationFrame(() => noteInputRef?.current?.focus?.());
//         }
//     }, [editingNoteId]);

//     // Click‑outside auto‑save
//     useEffect(() => {
//         const onDocPointerDown = (e) => {
//             if (!selectedTask?.id) return;
//             if (editingNoteId === null && !newNoteInput.trim()) return;

//             const wrap = noteInputWrapRef.current;
//             if (wrap && wrap.contains(e.target)) return;

//             handleSaveNote();
//         };

//         document.addEventListener("mousedown", onDocPointerDown, true);
//         document.addEventListener("touchstart", onDocPointerDown, true);
//         return () => {
//             document.removeEventListener("mousedown", onDocPointerDown, true);
//             document.removeEventListener("touchstart", onDocPointerDown, true);
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [editingNoteId, newNoteInput, selectedTask?.id]);

//     const handleSendTaskReminder = async (userId, todoId, assignId) => {
//         // console.log("first", userId, todoId, assignId)
//         const res = await sendTaskReminder(userId, todoId, assignId);
//         if (res.status === 200) {
//             setAlert({
//                 open: true,
//                 message: "Reminder sent successfully",
//                 type: "success"
//             })
//         } else {
//             setAlert({
//                 open: true,
//                 message: res?.message || "Failed to send reminder",
//                 type: "error"
//             })
//         }
//     }

//     const handleCompleteTodo = async (id) => {
//         const res = await completeTodo(id);
//         if (res.status === 200) {
//             refreshTodos(null)
//             setAlert({
//                 open: true,
//                 message: "Task closed successfully",
//                 type: "success"
//             })
//         } else {
//             setAlert({
//                 open: true,
//                 message: res?.message || "Failed to close task",
//                 type: "error"
//             })
//         }
//     }

//     // ------------------------------------------------------------------
//     // Manager View (UI from copy, logic from real)
//     // ------------------------------------------------------------------
//     const ManagerView = ({ task }) => (
//         <div className="flex-1 overflow-y-auto p-6 space-y-4">
//             {/* Header info */}
//             <div>
//                 <div className="text-sm text-black mb-1 font-bold">Due: {formatDueLong(task.dueDate)}</div>
//                 <div className="text-sm text-black">
//                     <strong>Assigned by:</strong> {task.createdByName || "N/A"} &nbsp; <strong>Team:</strong> {task.teamName || "N/A"}
//                 </div>
//             </div>

//             {/* Description */}
//             <div>
//                 <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
//                 <p className="text-slate-700 leading-relaxed">{task.desc || "No description provided."}</p>
//             </div>

//             {/* Required Materials */}
//             {task.materials && task.materials.length > 0 && (
//                 <div>
//                     <h3 className="text-sm font-bold text-slate-800 mb-3">Required Materials</h3>
//                     <div className="space-y-2">
//                         {task.materials.map((item, idx) => (
//                             <div key={idx} className="flex items-center gap-2 text-sm group">
//                                 {item.type === "link" ? (
//                                     <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-4 w-4" />
//                                 ) : (
//                                     <CustomIcons iconName="fa-solid fa-file-pdf" css="text-red-500 h-4 w-4" />
//                                 )}
//                                 <a
//                                     href={item.url || "#"}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                     className="text-blue-600 hover:underline font-medium"
//                                 >
//                                     {item.name}
//                                 </a>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Completion Progress */}
//             <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center">
//                 <h3 className="text-sm font-bold text-slate-800 w-56">Completion Progress</h3>
//                 <div className="flex items-center w-full gap-2">
//                     <div className="flex justify-between text-sm text-slate-600 font-semibold">
//                         <span>{task.completionProgressPercent}%</span>
//                     </div>
//                     <div className="w-full bg-slate-200 rounded-full h-2">
//                         <div
//                             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                             style={{ width: `${task.completionProgressPercent}%` }}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Assignees (if any) */}
//             {task.todoAssignData && task.todoAssignData.length > 0 && (
//                 <div className="bg-white rounded-lg p-4 border border-slate-200">
//                     <h3 className="text-sm font-bold text-slate-800 mb-3">Team Progress</h3>
//                     <div className="space-y-4">
//                         {task.todoAssignData.map((assignee) => (
//                             <div key={assignee.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
//                                         <span className="text-blue-600 font-semibold text-sm">
//                                             {assignee.userName.split(' ').map(n => n[0]).join('')}
//                                         </span>
//                                     </div>
//                                     <div>
//                                         <div className="font-semibold text-slate-800">{assignee.userName}</div>
//                                         <div className="flex items-center gap-2 text-sm">
//                                             <span className="flex items-center gap-1">
//                                                 <CustomIcons iconName={assignee.complectedWork !== 100 ? 'fa-solid fa-clock' : "fa-solid fa-circle-check"} css={`${assignee.complectedWork !== 100 ? 'text-yellow-500' : 'text-green-500'}`} />
//                                                 <span className={`font-medium capitalize ${assignee.complectedWork !== 100 ? 'text-yellow-500' : 'text-green-500'}`}>{assignee.complectedWork !== 100 ? "Pendding" : "Complected"}</span>
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     {
//                                         assignee.complectedWork !== 100 && (
//                                             <Button
//                                                 onClick={() => handleSendTaskReminder(assignee.userId, task.id, assignee.id)}
//                                                 text={"Send Reminder"}
//                                                 useFor="error"
//                                             />
//                                         )
//                                     }
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex gap-3 pt-4 justify-end">
//                 <Button
//                     useFor="success"
//                     onClick={() => openEditModal(task)}
//                     text={'Edit Task'}
//                 />

//                 <Button
//                     disabled={task?.completionProgressPercent === 100}
//                     onClick={() => handleCompleteTodo(task.id)}
//                     text={"Close Task"}
//                 />
//             </div>
//         </div>
//     );

//     const handleOpenDeleteDialog = (todoId) => {
//         setTodoId(todoId);
//         setDialog({ open: true, title: 'Delete Todo', message: 'Are you sure! Do you want to delete this todo?', actionButtonText: 'yes' });
//     }

//     const handleCloseDeleteDialog = () => {
//         setTodoId(null);
//         setDialog({ open: false, title: '', message: '', actionButtonText: '' });
//     }

//     const handleDeleteTodo = async () => {
//         const res = await deleteTodoApi(todoId);
//         if (res.status === 200) {
//             setAlert({
//                 open: true,
//                 message: "Todo deleted successfully",
//                 type: "success"
//             });
//             refreshTodos(null);
//             handleCloseDeleteDialog();
//         } else {
//             setAlert({
//                 open: true,
//                 message: res?.message || "Failed to delete todo",
//                 type: "error"
//             });
//         }
//     }

//     const StatusPill = ({ statusColor, statusColorcompletedAssignees, totalAssignees }) => {
//         const completed = Number(statusColorcompletedAssignees || 0);
//         const total = Number(totalAssignees || 0);

//         const bg =
//             typeof statusColor === "function"
//                 ? statusColor(completed, total)
//                 : statusColor || "#E5E7EB";

//         return (
//             <div className="flex justify-end">
//                 <div
//                     className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold"
//                     style={{
//                         backgroundColor: bg,
//                         boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
//                     }}
//                 >
//                     <span className={`${completed === total ? "text-white" : "text-black"} opacity-90`}>
//                         {completed} / {total} Complete
//                     </span>
//                 </div>
//             </div>
//         );
//     };

//     // ------------------------------------------------------------------
//     // Render (UI from copy, adapted with real state & handlers)
//     // ------------------------------------------------------------------
//     return (
//         <div className="min-h-screen p-6 font-sans text-slate-700">
//             <div className="max-w-7xl mx-auto flex gap-6 h-[95vh]">
//                 <div
//                     className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300 ${selectedTask ? "w-2/3" : "w-full"
//                         }`}
//                 >
//                     <div className="p-4 flex items-center justify-between rounded-t-xl">
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={openAddModal}
//                                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
//                             >
//                                 <CustomIcons iconName="fa-solid fa-plus" css="text-white h-4 w-4" />
//                                 New Task
//                             </button>
//                         </div>
//                     </div>

//                     <div className="flex gap-2 ml-4">
//                         <div className='w-60'>
//                             <CheckBoxSelect
//                                 placeholder="Select teams"
//                                 options={teams || []}
//                                 value={selectedTeam}
//                                 onChange={handleTeamChange}
//                             />
//                         </div>
//                     </div>

//                     <div className="flex-1 overflow-y-auto">
//                         <table className="w-full table-fixed border-collapse">
//                             <thead className="sticky top-0 bg-white z-10">
//                                 <tr className="border-b border-slate-100 text-sm font-semibold text-slate-500">
//                                     <th className="text-left px-6 py-3">Action Item</th>
//                                     <th className="text-right px-6 py-3">Due</th>
//                                     <th className="text-right px-6 py-3">Status</th>
//                                     <th className="text-right px-6 py-3">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {(tasks || []).map((task) => {
//                                     const isSelected = selectedTask && selectedTask.id === task.id;
//                                     return (
//                                         <tr
//                                             key={task.id}
//                                             onClick={async () => {
//                                                 setSelectedTask(task);
//                                                 setActiveView("rep");
//                                                 setNewNoteInput("");
//                                                 setEditingNoteId(null);
//                                                 await refreshNotes(task.id, task);
//                                             }}
//                                             className={`cursor-pointer transition-colors border-b border-slate-50 ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"
//                                                 }`}
//                                         >
//                                             <td className="px-6 py-4 align-middle">
//                                                 <div className="flex items-stretch">
//                                                     <div
//                                                         className={`mr-3 w-1 rounded-full ${isSelected ? "bg-blue-600" : "bg-transparent"
//                                                             }`}
//                                                     />
//                                                     <div className="min-w-0">
//                                                         <div className="flex items-center gap-2">
//                                                             <div>
//                                                                 <div className="font-bold text-slate-800 text-sm truncate">
//                                                                     {task.opportunity}
//                                                                 </div>
//                                                                 <div className="text-slate-500 text-sm truncate">
//                                                                     {task.title}
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 align-middle text-right text-sm text-slate-600 font-medium">
//                                                 {formatDueShort(task.dueDate)}
//                                             </td>
//                                             <td className="px-6 py-4 align-middle text-right">
//                                                 <StatusPill
//                                                     statusColor={task?.statusColor}
//                                                     statusColorcompletedAssignees={task?.completedAssignees}
//                                                     totalAssignees={task?.totalAssignees}
//                                                 />

//                                             </td>
//                                             <td className="px-6 py-4 align-middle flex justify-end text-sm text-slate-600 font-medium">
//                                                 <PermissionWrapper
//                                                     functionalityName="Todo"
//                                                     moduleName="Todo"
//                                                     actionId={3}
//                                                     component={
//                                                         <Tooltip title="Delete" arrow>
//                                                             <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
//                                                                 <Components.IconButton onClick={() => handleOpenDeleteDialog(task.id)}>
//                                                                     <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
//                                                                 </Components.IconButton>
//                                                             </div>
//                                                         </Tooltip>
//                                                     }
//                                                 />
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                                 {(!tasks && tasks?.length === 0) && (
//                                     <tr>
//                                         <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
//                                             No tasks found.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* RIGHT PANEL – Task details (conditional) */}
//                 {selectedTask && (
//                     <div className="w-1/2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col animate-fadeIn">
//                         <div className="p-6 border-b border-slate-100 flex justify-between items-start">
//                             <div>
//                                 <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedTask.opportunity}</h2>
//                                 <div className="text-sm text-slate-500">Due: {formatDueLong(selectedTask.dueDate)}</div>
//                             </div>
//                             <button
//                                 onClick={() => {
//                                     setSelectedTask(null);
//                                     setActiveView("rep");
//                                     setNewNoteInput("");
//                                 }}
//                                 className="p-2 rounded-lg hover:bg-slate-100 transition"
//                             >
//                                 <CustomIcons iconName="fa-solid fa-xmark" css="text-black h-5 w-5 cursor-pointer" />
//                             </button>
//                         </div>

//                         <div className="border-b border-slate-100">
//                             <div className="flex">
//                                 <button
//                                     onClick={() => setActiveView("rep")}
//                                     className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeView === "rep"
//                                         ? "border-blue-600 text-blue-600"
//                                         : "border-transparent text-slate-500 hover:text-slate-700"
//                                         }`}
//                                 >
//                                     <CustomIcons
//                                         iconName="fa-solid fa-user"
//                                         css={`mr-2 h-4 w-4 ${activeView === "rep" ? "text-blue-600" : "text-slate-400"}`}
//                                     />
//                                     Rep View
//                                 </button>
//                                 <button
//                                     onClick={() => setActiveView("manager")}
//                                     className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeView === "manager"
//                                         ? "border-blue-600 text-blue-600"
//                                         : "border-transparent text-slate-500 hover:text-slate-700"
//                                         }`}
//                                 >
//                                     <CustomIcons
//                                         iconName="fa-solid fa-user-tie"
//                                         css={`mr-2 h-4 w-4 ${activeView === "manager" ? "text-blue-600" : "text-slate-400"}`}
//                                     />
//                                     Manager View
//                                 </button>
//                             </div>
//                         </div>

//                         {activeView === "rep" ? (
//                             <div className="flex-1 overflow-y-auto p-6 space-y-4">
//                                 <div>
//                                     <p className="text-slate-700 leading-relaxed">
//                                         {selectedTask.desc || "No description provided."}
//                                     </p>
//                                 </div>

//                                 {selectedTask.materials && selectedTask.materials.length > 0 && (
//                                     <div>
//                                         <h3 className="text-sm font-bold text-slate-800 mb-3">Required Materials</h3>
//                                         <div className="space-y-2">
//                                             {selectedTask.materials.map((item, idx) => (
//                                                 <div key={idx} className="flex items-center gap-2 text-sm group">
//                                                     {item.type === "link" ? (
//                                                         <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-4 w-4" />
//                                                     ) : (
//                                                         <CustomIcons iconName="fa-solid fa-file" css="text-red-500 h-4 w-4" />
//                                                     )}
//                                                     {item.type === "link" ? (
//                                                         <NavLink
//                                                             href={item.url || "#"}
//                                                             target="_blank"
//                                                             rel="noreferrer"
//                                                             className="text-blue-600 hover:underline font-medium"
//                                                         >
//                                                             {item.name}
//                                                         </NavLink>
//                                                     ) : (
//                                                         <p className="text-blue-600 font-medium">
//                                                             {item.name}
//                                                         </p>
//                                                     )
//                                                     }
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}

//                                 <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
//                                     <div className="flex items-center justify-between mb-3">
//                                         <h3 className="text-sm font-bold text-slate-800">My Notes</h3>
//                                     </div>

//                                     <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
//                                         {(selectedTask.notes || []).length > 0 ? (
//                                             selectedTask.notes.map((note) => (
//                                                 <div key={note.id} className="flex items-start gap-2 group">
//                                                     <span className="text-black font-semibold text-sm">
//                                                         {formatNoteDate(note.createdOn)}
//                                                     </span>
//                                                     <p
//                                                         className="text-slate-600 flex-1 cursor-text text-sm"
//                                                         onClick={() => handleEditNote(note)}
//                                                     >
//                                                         {stripLegacyPrefix(note.text)}
//                                                     </p>
//                                                     <button
//                                                         onClick={() => handleDeleteNote(note.id)}
//                                                         className="p-1 rounded hover:bg-red-100 transition"
//                                                         title="Delete note"
//                                                     >
//                                                         <CustomIcons iconName="fa-solid fa-trash" css="text-red-500 h-3 w-3" />
//                                                     </button>
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <p className="text-sm text-slate-400 italic">No notes yet. Add your first note below.</p>
//                                         )}
//                                     </div>
//                                 </div>
//                                 <div ref={noteInputWrapRef} className="my-2">
//                                     <input
//                                         ref={noteInputRef}
//                                         type="text"
//                                         value={newNoteInput}
//                                         onChange={handleNoteInputChange}
//                                         onKeyDown={handleKeyPress}
//                                         placeholder="Type your note"
//                                         className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
//                                     />
//                                 </div>
//                                 <div className="flex gap-3 justify-end">
//                                     <Button
//                                         useFor="success"
//                                         onClick={() => openEditModal(selectedTask)}
//                                         text={'Edit Task'}
//                                     />
//                                     <Button
//                                         disabled={selectedTask?.completionProgressPercent === 100}
//                                         onClick={() => handleCompleteTodo(selectedTask.id)}
//                                         text={"Mark Complete"}
//                                     />
//                                 </div>
//                             </div>
//                         ) : (
//                             <ManagerView task={selectedTask} />
//                         )}
//                     </div>
//                 )}
//             </div>

//             <AddTodo
//                 open={addTodoOpen}
//                 handleClose={handleCloseAddTodo}
//                 todoId={editingTodoId}
//                 handleGetAllTodos={refreshTodos}
//             />
//             <AlertDialog
//                 open={dialog.open}
//                 title={dialog.title}
//                 message={dialog.message}
//                 actionButtonText={dialog.actionButtonText}
//                 handleAction={() => handleDeleteTodo()}
//                 handleClose={() => handleCloseDeleteDialog()}
//             />
//         </div>
//     );
// };

// const mapDispatchToProps = {
//     setAlert,
// }

// export default connect(null, mapDispatchToProps)(TodoScreen)