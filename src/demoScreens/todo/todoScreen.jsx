import React, { useState } from 'react';
import Components from '../../components/muiComponents/components';
import CustomIcons from '../../components/common/icons/CustomIcons';

const TodoScreen = () => {
    // --- State Management ---
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newNoteInput, setNewNoteInput] = useState('');
    const [activeView, setActiveView] = useState('rep'); // 'rep' or 'manager'  

    // Initial Mock Data (updated with status)
    const [tasks, setTasks] = useState([
        {
            id: 1,
            client: 'Acme',
            title: 'Build Architecture Diagram',
            due: '1/08',
            fullDate: 'Jan 08, 2024',
            priority: 'critical',
            desc: 'Create high-level system design.',
            materials: [],
            notes: [],
            // Manager View Fields
            assignedBy: 'John Smith',
            team: 'Engineering Team',
            createdDate: 'Jan 3, 2024',
            completionProgress: 0,
            assignees: [],
            // Status field
            status: { completed: 3, total: 5 }
        },
        {
            id: 5, // Matching the screenshot example
            client: 'Q1 Product Training',
            title: 'Complete Product Training',
            due: '1/14',
            fullDate: 'Mar 25, 2024',
            priority: 'high',
            desc: 'Complete the Q1 product training module. Make sure to review all key features and the sales demo script.',
            materials: [
                { type: 'link', name: 'Product Training Module', url: '#' },
                { type: 'pdf', name: 'Sales Demo Script.pdf', size: '1.2 MB' }
            ],
            notes: [
                '1/29 - Reviewed the first half of the training module',
                '1/30 - Finished the full training module, still need to practice the demo script'
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
            due: '1/15',
            fullDate: 'Jan 15, 2024',
            priority: 'normal',
            desc: 'List all key stakeholders.',
            materials: [],
            notes: [],
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
            due: '1/16',
            fullDate: 'Jan 16, 2024',
            priority: 'normal',
            desc: 'Prepare the proposal document.',
            materials: [],
            notes: [],
            assignedBy: 'John Doe',
            team: 'Business Team',
            createdDate: 'Jan 6, 2024',
            completionProgress: 0,
            assignees: [],
            // Status field
            status: { completed: 0, total: 5 }
        },
        {
            id: 4,
            client: 'Hooli',
            title: 'Schedule Kickoff Call',
            due: '1/18',
            fullDate: 'Jan 18, 2024',
            priority: 'normal',
            desc: 'Schedule the project kickoff call.',
            materials: [],
            notes: [],
            assignedBy: 'Jane Smith',
            team: 'Operations Team',
            createdDate: 'Jan 7, 2024',
            completionProgress: 0,
            assignees: [],
            // Status field
            status: { completed: 0, total: 5 }
        },
        {
            id: 6,
            client: 'Warrior Game',
            title: 'Send Box Invites',
            due: '1/23',
            fullDate: 'Jan 23, 2024',
            priority: 'normal',
            desc: 'Send invites for the game launch.',
            materials: [],
            notes: [],
            assignedBy: 'Mike Johnson',
            team: 'Marketing Team',
            createdDate: 'Jan 10, 2024',
            completionProgress: 0,
            assignees: [],
            // Status field
            status: { completed: 0, total: 5 }
        },
        {
            id: 7,
            client: 'Commit, Upside',
            title: 'Review Documentation',
            due: '1/26',
            fullDate: 'Jan 26, 2024',
            priority: 'normal',
            desc: 'Review the project documentation.',
            materials: [],
            notes: [],
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

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTaskForm({ ...newTaskForm, [name]: value });
    };

    const handleCreateTask = () => {
        if (!newTaskForm.taskName) return;

        const newTask = {
            id: Date.now(),
            client: newTaskForm.project,
            title: newTaskForm.taskName,
            due: newTaskForm.dueDate ? new Date(newTaskForm.dueDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) : 'TBD',
            fullDate: newTaskForm.dueDate || 'TBD',
            priority: newTaskForm.priority.toLowerCase(),
            desc: newTaskForm.description,
            materials: [...tempLinks], // Add the collected links here
            notes: [],
            // Default manager view fields
            assignedBy: 'Joseph Williams', // Default to current user
            team: 'Sales Team A',
            createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            completionProgress: 0,
            assignees: [], // Can be populated later
            // Default status
            status: { completed: 0, total: 5 }
        };

        setTasks([...tasks, newTask]);
        resetModal();
        setActiveView('rep'); // Reset to rep view
    };

    const resetModal = () => {
        setShowModal(false);
        setNewTaskForm({ project: 'Acme', taskName: '', assignedTo: 'Joseph Williams', dueDate: '', description: '', priority: 'Normal' });
        setTempLinks([]);
        setLinkInput({ name: '', url: '' });
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

    // Handle note input change
    const handleNoteInputChange = (e) => {
        setNewNoteInput(e.target.value);
    };

    // Save note when input loses focus (onBlur)
    const handleSaveNote = () => {
        if (!newNoteInput.trim() || !selectedTask) return;

        // Create note with timestamp
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const noteWithTimestamp = `${dateStr} - ${newNoteInput}`;

        // Update tasks array with new note
        const updatedTasks = tasks.map(task => {
            if (task.id === selectedTask.id) {
                return {
                    ...task,
                    notes: [...task.notes, noteWithTimestamp]
                };
            }
            return task;
        });

        // Update state
        setTasks(updatedTasks);

        // Update selectedTask to reflect changes
        const updatedSelectedTask = updatedTasks.find(task => task.id === selectedTask.id);
        setSelectedTask(updatedSelectedTask);

        // Clear input
        setNewNoteInput('');
    };

    // Save note on Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveNote();
        }
    };

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

    const ManagerView = ({ task }) => {
        const handleSendReminder = (assigneeId) => {
            console.log(`Send reminder to assignee ${assigneeId}`);
        };

        const handleEditTask = () => {
            console.log('Edit task:', task.id);
        };

        const handleCloseTask = () => {
            console.log('Close task:', task.id);
        };

        return (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Task Header Info */}
                <div className="mb-4">
                    <div className="text-sm text-slate-500 mb-1">
                        Due: {task.fullDate}
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
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Completion Progress</h3>
                    <div className="mb-3">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                            <span>{task.completionProgress}% Complete</span>
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
                                                {assignee.role && <span>{assignee.role}</span>}
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

    return (
        <div className="min-h-screen p-6 font-sans text-slate-700">
            <div className="max-w-7xl mx-auto flex gap-6 h-[85vh]">
                <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300 ${selectedTask ? 'w-1/2' : 'w-full'}`}>
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between rounded-t-xl">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(true)}
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

                    {/* Table Header - Updated for 4 columns */}
                    <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold text-slate-500 border-b border-slate-100">
                        <div className="col-span-6">Action Item</div>
                        <div className="col-span-2 text-right">Due</div>
                        <div className="col-span-4 text-right">Status</div>
                    </div>

                    {/* List Items Scrollable Area */}
                    <div className="flex-1 overflow-y-auto">
                        {tasks?.reverse().map((task) => (
                            <div
                                key={task.id}
                                onClick={() => {
                                    setSelectedTask(task);
                                    setActiveView('rep'); // Reset to rep view when selecting a task
                                    setNewNoteInput(''); // Clear note input when selecting new task
                                }}
                                className={`grid grid-cols-12 items-center px-6 py-4 border-b border-slate-50 cursor-pointer transition-colors
                  ${selectedTask && selectedTask.id === task.id ? 'bg-blue-50 border-l-4 border-l-blue-600 pl-5' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}
                `}
                            >
                                {/* Icon Column
                                <div className="col-span-1 flex justify-center">
                                    {getPriorityIcon(task.priority)}
                                </div> */}

                                {/* Text Column - Adjusted for 6 columns total */}
                                <div className="col-span-5 pl-2">
                                    <div className="font-bold text-slate-800 text-sm">{task.client}</div>
                                    <div className="text-slate-500 text-sm">{task.title}</div>
                                </div>

                                {/* Due Date Column */}
                                <div className="col-span-2 text-right text-sm text-slate-600 font-medium">
                                    {task.due}
                                </div>

                                {/* Status Column */}
                                <div className="col-span-4 text-right">
                                    {task.status && task.status.total > 0 ? (
                                        <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                            {getStatusText(task.status)}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-slate-400">
                                            Not Started
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT PANEL: DETAILS (Conditional) --- */}
                {selectedTask && (
                    <div className="w-1/2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col animate-fadeIn">
                        {/* Detail Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedTask.client}</h2>
                                <div className="text-sm text-slate-500">Due: {selectedTask.fullDate}</div>
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
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

                                {/* Enhanced Notes Section */}
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-800 mb-3">My Notes</h3>

                                    {/* Existing Notes List */}
                                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                                        {selectedTask.notes.length > 0 ? (
                                            selectedTask.notes.map((note, idx) => (
                                                <div key={idx} className="flex items-start gap-2 group">
                                                    <CustomIcons
                                                        iconName="fa-regular fa-circle"
                                                        css="text-slate-400 text-xs mt-1 flex-shrink-0"
                                                    />
                                                    <p className="text-sm text-slate-600 flex-1">{note}</p>
                                                    <button
                                                        onClick={() => handleDeleteNote(idx)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded"
                                                        title="Delete note"
                                                    >
                                                        <CustomIcons
                                                            iconName="fa-solid fa-trash"
                                                            css="text-slate-400 hover:text-red-500 h-3 w-3"
                                                        />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No notes yet. Add your first note below.</p>
                                        )}
                                    </div>

                                </div>
                                {/* Add Note Input */}
                                <div className="mt-4">
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">
                                        Add a note...
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newNoteInput}
                                            onChange={handleNoteInputChange}
                                            onBlur={handleSaveNote} // Save when input loses focus
                                            onKeyDown={handleKeyPress} // Save on Enter key
                                            placeholder="Type your note here..."
                                            className="w-full border border-slate-200 rounded p-2 pr-10 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                                        />
                                        {newNoteInput && (
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                                                <button
                                                    onClick={handleSaveNote}
                                                    className="text-blue-600 hover:text-blue-700 p-1"
                                                    title="Save note"
                                                >
                                                    <CustomIcons iconName="fa-solid fa-check" css="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setNewNoteInput('')}
                                                    className="text-slate-400 hover:text-slate-600 p-1"
                                                    title="Clear note"
                                                >
                                                    <CustomIcons iconName="fa-solid fa-times" css="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mark Complete Button */}
                                <div className="mt-4 flex justify-end">
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
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-scaleIn custom-scrollbar">
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

                            {/* Attachments Section */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Attachments (optional)</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" placeholder="Name" className="flex-1 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-400" />
                                    <div className="flex-1 relative">
                                        <input type="text" value="Pricing_Guide.pdf" readOnly className="w-full border border-slate-200 rounded-lg p-2 text-sm pr-16 text-slate-500" />
                                        <button className="absolute right-1 top-1 bottom-1 bg-blue-500 hover:bg-blue-600 text-white px-3 rounded text-xs font-medium transition-colors">Save</button>
                                    </div>
                                </div>
                                <div className="border-2 border-dashed border-indigo-200 rounded-lg p-4 text-center bg-indigo-50/50 flex flex-col items-center justify-center gap-2">
                                    <CustomIcons iconName="fa-solid fa-paperclip" css="text-indigo-400 h-5 w-5" />
                                    <p className="text-indigo-400 text-sm">Drag and drop files here or click to upload</p>
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
                                onClick={handleCreateTask}
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TodoScreen;