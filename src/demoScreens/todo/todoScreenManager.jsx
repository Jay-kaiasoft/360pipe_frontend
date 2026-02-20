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

const TodoScreenManager = () => {
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
            dueDate: '2024-02-20',
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
            dueDate: '2024-02-20',
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
            status: { completed: 3, total: 3 }
        },
        {
            id: 2,
            client: 'Globex',
            title: 'Identify Stakeholders',
            dueDate: '2024-02-20',
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
            status: { completed: 1, total: 2 }
        },
        {
            id: 3,
            client: 'Initech',
            title: 'Prepare Proposal',
            dueDate: '2024-02-20',
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
            status: { completed: 0, total: 2 }
        },
        {
            id: 4,
            client: 'Hooli',
            title: 'Schedule Kickoff Call',
            dueDate: '2024-02-20',
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
            dueDate: '2024-02-20',
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
            dueDate: '2024-02-20',
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
            status: { completed: 0, total: 2 }
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

    // --- Auto-expanding textarea for description ---
    const descriptionRef = useRef(null);

    const adjustTextareaHeight = () => {
        const textarea = descriptionRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [newTaskForm.description]);

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

    const getStatusColor = (status) => {
        if (status.total === 0) return "bg-gray-300 text-gray-700";
        const ratio = status.completed / status.total;
        if (ratio === 1) return "bg-[#2e8500] text-white";
        if (ratio >= 0.5) return "bg-[#EED5B9] text-black";
        return "bg-[#D7D8F4] text-black";
    }

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
                                                {task.status && (
                                                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                        {getStatusText(task.status)}
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

                        <ManagerView task={selectedTask} />
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
                                    {/* REPLACED input WITH auto-expanding textarea */}
                                    <textarea
                                        ref={descriptionRef}
                                        name="description"
                                        value={newTaskForm.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter task description..."
                                        className="w-full border border-slate-200 rounded-lg p-2.5 outline-none resize-none overflow-hidden"
                                        rows={1}
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

export default TodoScreenManager;