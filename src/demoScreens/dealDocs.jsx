import React, { useMemo, useRef, useState } from "react";
import MultipleFileUpload from "../components/fileInputBox/multipleFileUpload";
import { Tooltip } from "@mui/material";
import Components from "../components/muiComponents/components";
import CustomIcons from "../components/common/icons/CustomIcons";

const uid = () => crypto?.randomUUID?.() || String(Date.now() + Math.random());

const DEFAULT_CATEGORIES = [
    { id: "account-information", name: "Account Information", resources: [] },
    { id: "sent-to-customer", name: "Sent to Customer", resources: [] },
    { id: "shared-by-customer", name: "Shared by Customer", resources: [] },
    { id: "internal-documents", name: "Internal Documents", resources: [] },
];

const fileBaseName = (name = "") => name.replace(/\.[^/.]+$/, "");

const toExistingImageFromFile = (file) => ({
    imageId: `temp-${crypto?.randomUUID?.() || Date.now()}`,
    imageURL: file?.preview || URL.createObjectURL(file),
    imageName: file?.name,
    isInternal: !!file?.isInternal,
    __local: true,
    __file: file,
});

const DealDocs = () => {
    // ✅ default 4 categories
    const [categories, setCategories] = useState(() => DEFAULT_CATEGORIES);
    const [originalCategoryName, setOriginalCategoryName] = useState("");

    // category edit
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categoryDraft, setCategoryDraft] = useState("");

    // ✅ add-resource menu (per category)
    const [resourceMenuForCatId, setResourceMenuForCatId] = useState(null);

    // modal add/edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
    const [modalType, setModalType] = useState("file"); // "file" | "link"
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [editingResourceId, setEditingResourceId] = useState(null);

    // -------- FILE EDIT MODE fields
    const [resourceName, setResourceName] = useState("");
    const [modalFiles, setModalFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    // ✅ FILE ADD MODE rows
    const [fileRows, setFileRows] = useState([]); // [{id, fileName, files:[], existingImages:[]}]

    // ✅ LINK ADD MODE rows
    const [linkRows, setLinkRows] = useState([]); // [{id, name, url}]

    // ✅ LINK EDIT MODE fields
    const [linkName, setLinkName] = useState("");
    const [linkUrl, setLinkUrl] = useState("");

    const activeCategory = useMemo(
        () => categories.find((c) => c.id === activeCategoryId),
        [categories, activeCategoryId]
    );

    // ---------------- Category helpers ----------------
    const addCategoryRow = () => {
        const newId = uid();
        setCategories((prev) => [...prev, { id: newId, name: "New Category", resources: [] }]);
        setEditingCategoryId(newId);
        setCategoryDraft("New Category");
    };

    const startEditCategory = (cat) => {
        setEditingCategoryId(cat.id);
        setCategoryDraft(cat.name || "");
        setOriginalCategoryName(cat.name || "");
    };

    // ---------------- Menu helpers ----------------
    const openResourceMenu = (catId) => setResourceMenuForCatId(catId);
    const closeResourceMenu = () => setResourceMenuForCatId(null);

    // ---------------- Modal open/close ----------------
    const resetModalState = () => {
        setModalMode("add");
        setModalType("file");
        setActiveCategoryId(null);
        setEditingResourceId(null);

        setResourceName("");
        setModalFiles([]);
        setExistingImages([]);
        setFileRows([]);

        setLinkRows([]);
        setLinkName("");
        setLinkUrl("");
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetModalState();
    };

    // ---------------- FILE: add mode ----------------
    const openAddAttachmentModal = (catId) => {
        closeResourceMenu();

        setModalMode("add");
        setModalType("file");
        setActiveCategoryId(catId);
        setEditingResourceId(null);

        setResourceName("");
        setModalFiles([]);
        setExistingImages([]);

        // start with 1 empty row
        setFileRows([
            {
                id: uid(),
                fileName: "",
                files: [],
                existingImages: [],
            },
        ]);

        setLinkRows([]);
        setIsModalOpen(true);
    };

    const addFileRow = () => {
        setFileRows((prev) => [
            ...(prev || []),
            { id: uid(), fileName: "", files: [], existingImages: [] },
        ]);
    };

    const deleteFileRow = (rowId) => {
        setFileRows((prev) => (prev || []).filter((r) => r.id !== rowId));
    };

    const updateRowName = (rowId, value) => {
        setFileRows((prev) => (prev || []).map((r) => (r.id === rowId ? { ...r, fileName: value } : r)));
    };

    // supports setFiles(value) AND setFiles(prev => value)
    const setRowFiles = (rowId, valueOrUpdater) => {
        setFileRows((prev) =>
            (prev || []).map((r) => {
                if (r.id !== rowId) return r;

                const prevFiles = Array.isArray(r.files) ? r.files : [];
                const nextFiles = typeof valueOrUpdater === "function" ? valueOrUpdater(prevFiles) : valueOrUpdater;

                const safe = Array.isArray(nextFiles) ? nextFiles : [];
                // keep 1 file only (last picked)
                const one = safe.length ? [safe[safe.length - 1]] : [];

                return { ...r, files: one };
            })
        );
    };

    const setRowExistingImages = (rowId, valueOrUpdater) => {
        setFileRows((prev) =>
            (prev || []).map((r) => {
                if (r.id !== rowId) return r;

                const prevEx = Array.isArray(r.existingImages) ? r.existingImages : [];
                const nextEx = typeof valueOrUpdater === "function" ? valueOrUpdater(prevEx) : valueOrUpdater;

                return { ...r, existingImages: Array.isArray(nextEx) ? nextEx : [] };
            })
        );
    };

    // ---------------- LINK: add mode ----------------
    const openAddLinksModal = (catId) => {
        closeResourceMenu();

        setModalMode("add");
        setModalType("link");
        setActiveCategoryId(catId);
        setEditingResourceId(null);

        // start with 1 row
        setLinkRows([{ id: uid(), name: "", url: "" }]);

        // clear file mode stuff
        setFileRows([]);
        setResourceName("");
        setModalFiles([]);
        setExistingImages([]);

        setIsModalOpen(true);
    };

    const addLinkRow = () => {
        setLinkRows((prev) => [...(prev || []), { id: uid(), name: "", url: "" }]);
    };

    const deleteLinkRow = (rowId) => {
        setLinkRows((prev) => (prev || []).filter((r) => r.id !== rowId));
    };

    const updateLinkRow = (rowId, key, value) => {
        setLinkRows((prev) => (prev || []).map((r) => (r.id === rowId ? { ...r, [key]: value } : r)));
    };

    // ---------------- EDIT: file/link ----------------
    const openEditResourceModal = (catId, resId) => {
        const cat = categories.find((c) => c.id === catId);
        const res = cat?.resources?.find((r) => r.id === resId);
        if (!res) return;

        setModalMode("edit");
        setActiveCategoryId(catId);
        setEditingResourceId(resId);

        // clear add-mode rows
        setFileRows([]);
        setLinkRows([]);

        if (res.type === "link") {
            setModalType("link");
            setLinkName(res.name || "");
            setLinkUrl(res.url || "");
            setIsModalOpen(true);
            return;
        }

        // default: file
        setModalType("file");
        setResourceName(res.name || "");
        setModalFiles([]);

        if (res?.file) {
            setExistingImages([toExistingImageFromFile(res.file)]);
        } else {
            setExistingImages([]);
        }

        setIsModalOpen(true);
    };

    // ---------------- Save / Update ----------------
    const handleSaveOrUpdate = () => {
        if (!activeCategoryId) return;

        // ===== ADD MODE =====
        if (modalMode === "add") {
            // ---- ADD FILES (table)
            if (modalType === "file") {
                const rowsWithFiles = (fileRows || []).filter((r) => r?.files?.length);
                if (!rowsWithFiles.length) return;

                const newResources = rowsWithFiles.map((row) => {
                    const f = row.files[0];
                    const nextName = (row.fileName || "").trim() || fileBaseName(f?.name) || "Untitled";

                    return {
                        id: uid(),
                        type: "file",
                        name: nextName,
                        file: f,
                    };
                });

                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === activeCategoryId
                            ? { ...c, resources: [...(c.resources || []), ...newResources] }
                            : c
                    )
                );

                closeModal();
                return;
            }

            // ---- ADD LINKS (table)
            if (modalType === "link") {
                const validLinks = (linkRows || []).filter(
                    (r) => (r?.name || "").trim() && (r?.url || "").trim()
                );
                if (!validLinks.length) return;

                const newResources = validLinks.map((r) => ({
                    id: uid(),
                    type: "link",
                    name: (r.name || "").trim(),
                    url: (r.url || "").trim(),
                }));

                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === activeCategoryId
                            ? { ...c, resources: [...(c.resources || []), ...newResources] }
                            : c
                    )
                );

                closeModal();
                return;
            }
        }

        // ===== EDIT MODE =====
        if (modalMode === "edit") {
            if (!editingResourceId) return;

            // ---- UPDATE LINK (one at a time)
            if (modalType === "link") {
                const n = linkName.trim();
                const u = linkUrl.trim();
                if (!n || !u) return;

                setCategories((prev) =>
                    prev.map((c) => {
                        if (c.id !== activeCategoryId) return c;

                        return {
                            ...c,
                            resources: (c.resources || []).map((r) =>
                                r.id === editingResourceId
                                    ? { ...r, type: "link", name: n, url: u }
                                    : r
                            ),
                        };
                    })
                );

                closeModal();
                return;
            }

            // ---- UPDATE FILE (one at a time)
            if (modalType === "file") {
                setCategories((prev) =>
                    prev.map((c) => {
                        if (c.id !== activeCategoryId) return c;

                        return {
                            ...c,
                            resources: (c.resources || []).map((r) => {
                                if (r.id !== editingResourceId) return r;

                                const nextName = resourceName.trim() || r.name || "Untitled";

                                // user uploaded NEW file
                                if (modalFiles?.length) {
                                    return { ...r, type: "file", name: nextName, file: modalFiles[0] };
                                }

                                // removed existing
                                if (!existingImages?.length) {
                                    return { ...r, type: "file", name: nextName, file: null };
                                }

                                const ex = existingImages[0];

                                // restore local file if available
                                if (ex?.__local && ex?.__file) {
                                    const localFile = ex.__file;
                                    if (!localFile.preview) localFile.preview = URL.createObjectURL(localFile);
                                    return { ...r, type: "file", name: nextName, file: localFile };
                                }

                                return { ...r, type: "file", name: nextName };
                            }),
                        };
                    })
                );

                closeModal();
            }
        }
    };

    const isSaveDisabled = useMemo(() => {
        if (modalMode === "add") {
            if (modalType === "file") return !(fileRows || []).some((r) => r?.files?.length);
            if (modalType === "link")
                return !(linkRows || []).some((r) => (r?.name || "").trim() && (r?.url || "").trim());
        } else {
            if (modalType === "file") return false;
            if (modalType === "link") return !(linkName.trim() && linkUrl.trim());
        }
        return false;
    }, [modalMode, modalType, fileRows, linkRows, linkName, linkUrl]);

    const renderResourceIcon = (res) => {
        if (res?.type === "link") {
            return <CustomIcons iconName="fa-solid fa-link" css="text-indigo-600 h-4 w-4" />;
        }        
        // return <CustomIcons iconName="fa-solid fa-file" css="text-indigo-600 h-4 w-4" />;
        return <CustomIcons iconName="fa-solid fa-paperclip" css="text-indigo-600 h-4 w-4" />;
    };

    return (
        <div className="w-full p-4">
            <div className="border border-gray-400 bg-white overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1.1fr_2fr]">
                    <div className="border-r border-gray-400 px-4 py-3 font-semibold text-center">
                        <div className="flex items-center justify-center gap-3">
                            <span>Category</span>
                            <Tooltip title="Add Category" arrow>
                                <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                    <Components.IconButton onClick={addCategoryRow}>
                                        <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3 w-3" />
                                    </Components.IconButton>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="px-4 py-3 font-semibold text-center">Resource</div>
                </div>

                {/* Rows */}
                {categories.map((cat) => (
                    <div key={cat.id} className="grid grid-cols-[1.1fr_2fr] border-t border-gray-400">
                        {/* category cell */}
                        <div className="border-r border-gray-400 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                                {editingCategoryId === cat.id ? (
                                    <input
                                        value={categoryDraft}
                                        autoFocus
                                        onChange={(e) => setCategoryDraft(e.target.value)}
                                        onBlur={() => {
                                            const name = categoryDraft.trim() || "Untitled Category";
                                            setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, name } : c)));
                                            setEditingCategoryId(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") e.target.blur();
                                            if (e.key === "Escape") {
                                                setCategories((prev) =>
                                                    prev.map((c) => (c.id === cat.id ? { ...c, name: originalCategoryName } : c))
                                                );
                                                setEditingCategoryId(null);
                                            }
                                        }}
                                        className="w-full border border-blue-400 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                        placeholder="Category name"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => startEditCategory(cat)}
                                        className="text-left font-medium hover:underline"
                                        title="Click to edit category"
                                    >
                                        {cat.name}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* resources cell */}
                        <div className="px-4 py-3 relative">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    {cat.resources?.length ? (
                                        <div className="flex flex-col gap-2">
                                            {cat.resources.map((res) => (
                                                <button
                                                    key={res.id}
                                                    type="button"
                                                    className="flex items-center gap-2 text-left"
                                                    onClick={() => openEditResourceModal(cat.id, res.id)}
                                                    title="Click to update"
                                                >
                                                    <span className="shrink-0">{renderResourceIcon(res)}</span>
                                                    <span className="text-blue-600 underline hover:text-blue-700 truncate">
                                                        {res.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 italic">No resources</div>
                                    )}
                                </div>

                                {/* ✅ Add resource button -> opens menu (Attachment / Links) */}
                                <Tooltip title="Add resource" arrow>
                                    <div className="bg-blue-600 h-7 w-7 flex justify-center items-center rounded-full text-white shrink-0">
                                        <Components.IconButton onClick={() => openResourceMenu(cat.id)}>
                                            <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3.5 w-3.5" />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            </div>

                            {/* ✅ Menu like image (Upload Logo / Fetch Logo style) */}
                            {resourceMenuForCatId === cat.id && (
                                <>
                                    {/* click-away */}
                                    <div className="fixed inset-0 z-40" onClick={closeResourceMenu} />

                                    <div className="absolute right-2 top-10 z-50 w-56 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                                        <button
                                            type="button"
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                                            onClick={() => openAddAttachmentModal(cat.id)}
                                        >
                                            <CustomIcons iconName="fa-solid fa-paperclip" css="text-gray-700 h-4 w-4" />
                                            <span className="text-gray-800 font-medium">Add Attachment</span>
                                        </button>

                                        <div className="h-px bg-gray-200" />

                                        <button
                                            type="button"
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                                            onClick={() => openAddLinksModal(cat.id)}
                                        >
                                            <CustomIcons iconName="fa-solid fa-link" css="text-gray-700 h-4 w-4" />
                                            <span className="text-gray-800 font-medium">Add Links</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

                    <div
                        className="relative w-[92%] max-w-5xl rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <div>
                                <div className="text-lg font-semibold">
                                    {modalMode === "edit"
                                        ? modalType === "link"
                                            ? "Update Link"
                                            : "Update Attachment"
                                        : modalType === "link"
                                            ? "Add Links"
                                            : "Add Attachment"}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Category: <span className="font-medium">{activeCategory?.name}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="h-9 w-9 rounded-md hover:bg-gray-100 flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        {/* body */}
                        <div className="px-5 py-5 space-y-4">
                            {/* ================== ADD LINKS ================== */}
                            {modalMode === "add" && modalType === "link" && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={addLinkRow}
                                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                                        >
                                            + Add Link
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {(linkRows || []).map((row, index) => (
                                            <div key={row.id} className="border border-gray-200 rounded-xl p-4">
                                                <div className="grid grid-cols-12 gap-3 items-center">
                                                    <div className="col-span-5">
                                                        <input
                                                            value={row.name}
                                                            onChange={(e) => updateLinkRow(row.id, "name", e.target.value)}
                                                            placeholder="Name (e.g. Workday Product Training)"
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                                        />
                                                    </div>

                                                    <div className="col-span-6">
                                                        <input
                                                            value={row.url}
                                                            onChange={(e) => updateLinkRow(row.id, "url", e.target.value)}
                                                            placeholder="URL (e.g. www.workday.com/training)"
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                                        />
                                                    </div>
                                                    {
                                                        index !== 0 && (
                                                            <div className="col-span-1 flex justify-end">
                                                                <Tooltip title="Delete row" arrow>
                                                                    <span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => deleteLinkRow(row.id)}
                                                                            className="h-10 w-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center"
                                                                        >
                                                                            <CustomIcons iconName="fa-solid fa-trash" css="text-red-600 h-5 w-5" />
                                                                        </button>
                                                                    </span>
                                                                </Tooltip>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ================== EDIT LINK (one item) ================== */}
                            {modalMode === "edit" && modalType === "link" && (
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-5">
                                            <div className="text-xs text-gray-500 mb-1">Name</div>
                                            <input
                                                value={linkName}
                                                onChange={(e) => setLinkName(e.target.value)}
                                                placeholder="Link name"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                        </div>

                                        <div className="col-span-7">
                                            <div className="text-xs text-gray-500 mb-1">URL</div>
                                            <input
                                                value={linkUrl}
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                                placeholder="https://..."
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ================== ADD FILES (table) ================== */}
                            {modalMode === "add" && modalType === "file" && (
                                <>
                                    <div className="flex justify-end">
                                        <Tooltip title="Add files" arrow>
                                            <div className="bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white">
                                                <Components.IconButton onClick={addFileRow}>
                                                    <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-4 w-4" />
                                                </Components.IconButton>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="text-left text-sm font-semibold text-gray-700 bg-white">
                                                        <th className="px-4 py-3 border-b w-[260px]">File name</th>
                                                        <th className="px-4 py-3 border-b">File</th>
                                                        <th className="px-4 py-3 border-b w-[90px] text-center">Action</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {(fileRows || []).map((row) => (
                                                        <tr key={row.id} className="align-top">
                                                            <td className="px-4 py-4 border-b">
                                                                <input
                                                                    value={row.fileName}
                                                                    onChange={(e) => updateRowName(row.id, e.target.value)}
                                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                                                    placeholder="Enter file name"
                                                                />
                                                            </td>

                                                            <td className="px-4 border-b">
                                                                <MultipleFileUpload
                                                                    files={row.files}
                                                                    setFiles={(v) => setRowFiles(row.id, v)}
                                                                    existingImages={row.existingImages}
                                                                    setExistingImages={(v) => setRowExistingImages(row.id, v)}
                                                                    placeHolder="Drag & drop files here, or click to select files"
                                                                    isFileUpload={true}
                                                                    removableExistingAttachments={true}
                                                                    flexView={true}
                                                                    type={"OppDemo"}
                                                                />
                                                            </td>

                                                            <td className="px-4 py-4 border-b text-center">
                                                                <Tooltip title="Delete row" arrow>
                                                                    <span>
                                                                        <Components.IconButton onClick={() => deleteFileRow(row.id)}>
                                                                            <CustomIcons iconName="fa-solid fa-trash" css="cursor-pointer text-red-600 h-5 w-5" />
                                                                        </Components.IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {(!fileRows || fileRows.length === 0) && (
                                                        <tr>
                                                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={3}>
                                                                No file rows. Click <b>+</b> to add.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ================== EDIT FILE ================== */}
                            {modalMode === "edit" && modalType === "file" && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="text-left text-sm font-semibold text-gray-700 bg-white">
                                                    <th className="px-4 py-3 border-b w-[260px]">File name</th>
                                                    <th className="px-4 py-3 border-b">File</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr className="align-top">
                                                    <td className="px-4 py-4 border-b">
                                                        <input
                                                            value={resourceName}
                                                            onChange={(e) => setResourceName(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                                            placeholder="Enter file name"
                                                        />
                                                    </td>

                                                    <td className="px-4 border-b">
                                                        <MultipleFileUpload
                                                            files={modalFiles}
                                                            setFiles={setModalFiles}
                                                            existingImages={existingImages}
                                                            setExistingImages={setExistingImages}
                                                            placeHolder="Drag & drop files here, or click to select files"
                                                            isFileUpload={true}
                                                            removableExistingAttachments={true}
                                                            flexView={true}
                                                            type={"OppDemo"}
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* footer */}
                        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveOrUpdate}
                                disabled={isSaveDisabled}
                                className={[
                                    "px-4 py-2 rounded-md text-sm text-white",
                                    isSaveDisabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700",
                                ].join(" ")}
                            >
                                {modalMode === "edit" ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealDocs;