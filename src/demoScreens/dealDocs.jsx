import React, { useMemo, useState } from "react";
import MultipleFileUpload from "../components/fileInputBox/multipleFileUpload";
import { Tooltip } from "@mui/material";
import Components from "../components/muiComponents/components";
import CustomIcons from "../components/common/icons/CustomIcons";

const uid = () => crypto?.randomUUID?.() || String(Date.now() + Math.random());

const toExistingImageFromFile = (file) => ({
    imageId: `temp-${crypto?.randomUUID?.() || Date.now()}`,
    imageURL: file?.preview || URL.createObjectURL(file),
    imageName: file?.name,
    isInternal: !!file?.isInternal,
    __local: true,
    __file: file,
});

const DealDocs = () => {
    const [categories, setCategories] = useState([]);
    const [originalCategoryName, setOriginalCategoryName] = useState("");

    // category edit
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categoryDraft, setCategoryDraft] = useState("");

    // modal add/edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [editingResourceId, setEditingResourceId] = useState(null);

    // edit-mode modal fields
    const [resourceName, setResourceName] = useState("");
    const [modalFiles, setModalFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    // ✅ add-mode rows
    const [fileRows, setFileRows] = useState([]); // [{id, fileName, files:[], existingImages:[]}]

    const activeCategory = useMemo(
        () => categories.find((c) => c.id === activeCategoryId),
        [categories, activeCategoryId]
    );

    const editingResource = useMemo(() => {
        if (!activeCategoryId || !editingResourceId) return null;
        const cat = categories.find((c) => c.id === activeCategoryId);
        return cat?.resources?.find((r) => r.id === editingResourceId) || null;
    }, [categories, activeCategoryId, editingResourceId]);

    // ✅ Add Category row
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

    // ✅ Open modal (ADD)
    const openAddResourceModal = (catId) => {
        setModalMode("add");
        setActiveCategoryId(catId);
        setEditingResourceId(null);

        // reset edit-mode states (not used in add table)
        setResourceName("");
        setModalFiles([]);
        setExistingImages([]);

        // ✅ start with 1 empty row
        setFileRows([
            {
                id: uid(),
                fileName: "",
                files: [],
                existingImages: [],
            },
        ]);

        setIsModalOpen(true);
    };

    // ✅ Open modal (EDIT)
    const openEditResourceModal = (catId, resId) => {
        const cat = categories.find((c) => c.id === catId);
        const res = cat?.resources?.find((r) => r.id === resId);
        if (!res) return;

        setModalMode("edit");
        setActiveCategoryId(catId);
        setEditingResourceId(resId);

        // clear add-mode rows
        setFileRows([]);

        setResourceName(res.name || "");
        setModalFiles([]);

        if (res?.file) {
            const existing = [toExistingImageFromFile(res.file)];
            setExistingImages(existing);
        } else {
            setExistingImages([]);
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode("add");
        setActiveCategoryId(null);
        setEditingResourceId(null);

        setResourceName("");
        setModalFiles([]);
        setExistingImages([]);

        setFileRows([]);
    };

    const fileBaseName = (name = "") => name.replace(/\.[^/.]+$/, "");

    // ============ ADD MODE ROW HELPERS ============
    const addFileRow = () => {
        setFileRows((prev) => [
            ...(prev || []),
            {
                id: uid(),
                fileName: "",
                files: [],
                existingImages: [],
            },
        ]);
    };

    const deleteFileRow = (rowId) => {
        setFileRows((prev) => (prev || []).filter((r) => r.id !== rowId));
    };

    const updateRowName = (rowId, value) => {
        setFileRows((prev) =>
            (prev || []).map((r) => (r.id === rowId ? { ...r, fileName: value } : r))
        );
    };

    // ✅ supports: setFiles(value) AND setFiles(prev => value)
    const setRowFiles = (rowId, valueOrUpdater) => {
        setFileRows((prev) =>
            (prev || []).map((r) => {
                if (r.id !== rowId) return r;

                const prevFiles = Array.isArray(r.files) ? r.files : [];
                const nextFiles =
                    typeof valueOrUpdater === "function"
                        ? valueOrUpdater(prevFiles)
                        : valueOrUpdater;

                const safe = Array.isArray(nextFiles) ? nextFiles : [];

                // ✅ keep single file (optional)
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
                const nextEx =
                    typeof valueOrUpdater === "function"
                        ? valueOrUpdater(prevEx)
                        : valueOrUpdater;

                return { ...r, existingImages: Array.isArray(nextEx) ? nextEx : [] };
            })
        );
    };


    // ✅ SAVE / UPDATE resource
    const handleSaveOrUpdate = () => {
        if (!activeCategoryId) return;

        // ============ ADD MODE (TABLE) ============
        if (modalMode === "add") {
            const rowsWithFiles = (fileRows || []).filter((r) => r?.files?.length);

            if (!rowsWithFiles.length) return;

            const newResources = rowsWithFiles.map((row) => {
                const f = row.files[0];
                const nextName = (row.fileName || "").trim() || fileBaseName(f?.name) || "Untitled";

                return {
                    id: uid(),
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

        // ============ EDIT MODE ============
        if (modalMode === "edit") {
            if (!editingResourceId) return;

            const nextNameFallback = "Untitled";

            setCategories((prev) =>
                prev.map((c) => {
                    if (c.id !== activeCategoryId) return c;

                    return {
                        ...c,
                        resources: (c.resources || []).map((r) => {
                            if (r.id !== editingResourceId) return r;

                            const nextName = resourceName.trim() || r.name || nextNameFallback;

                            // CASE 1: user uploaded a NEW file
                            if (modalFiles?.length) {
                                const f = modalFiles[0];
                                return {
                                    ...r,
                                    name: nextName,
                                    file: f,
                                };
                            }

                            // CASE 2: user removed existing tile => remove file
                            if (!existingImages?.length) {
                                return {
                                    ...r,
                                    name: nextName,
                                    file: null,
                                };
                            }

                            const ex = existingImages[0];

                            // restore local file
                            if (ex?.__local && ex?.__file) {
                                const localFile = ex.__file;
                                if (!localFile.preview) {
                                    localFile.preview = URL.createObjectURL(localFile);
                                }
                                return {
                                    ...r,
                                    name: nextName,
                                    file: localFile,
                                };
                            }

                            return { ...r, name: nextName };
                        }),
                    };
                })
            );

            closeModal();
        }
    };

    const isAddDisabled =
        modalMode === "add" ? !(fileRows || []).some((r) => r?.files?.length) : false;

    return (
        <div className="w-full p-4">
            <div className="border border-gray-400 bg-white overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[52px_1.1fr_2fr]">
                    <div className="border-r border-gray-400" />
                    <div className="border-r border-gray-400 px-4 py-3 font-semibold text-center">
                        <div className="flex items-center justify-center gap-3">
                            <span>Category</span>
                            <Tooltip title="Add Row" arrow>
                                <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                    <Components.IconButton onClick={addCategoryRow}>
                                        <CustomIcons
                                            iconName="fa-solid fa-plus"
                                            css="cursor-pointer text-white h-3 w-3"
                                        />
                                    </Components.IconButton>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="px-4 py-3 font-semibold text-center">Resource</div>
                </div>

                {/* Rows */}
                {categories.length === 0 ? (
                    <div className="border-t border-gray-400">
                        <div className="px-6 py-10">
                            <div className="mx-auto max-w-md text-center">
                                <h3 className="mt-4 text-base font-semibold text-gray-900">No categories yet</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Create your first category and start adding resources (files, PDFs, docs, etc.).
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="grid grid-cols-[52px_1.1fr_2fr] border-t border-gray-400">
                            {/* left plus for resource */}
                            <div className="border-r border-gray-400 flex items-start justify-center py-3">
                                <Tooltip title="Add Row" arrow>
                                    <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                        <Components.IconButton onClick={() => openAddResourceModal(cat.id)}>
                                            <CustomIcons
                                                iconName="fa-solid fa-plus"
                                                css="cursor-pointer text-white h-3 w-3"
                                            />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            </div>

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
                                                        prev.map((c) =>
                                                            c.id === cat.id ? { ...c, name: originalCategoryName } : c
                                                        )
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
                            <div className="px-4 py-3">
                                {cat.resources?.length ? (
                                    <div className="flex flex-col gap-1">
                                        {cat.resources.map((res) => (
                                            <button
                                                key={res.id}
                                                type="button"
                                                className="text-blue-600 underline hover:text-blue-700 text-left"
                                                onClick={() => openEditResourceModal(cat.id, res.id)}
                                                title="Click to edit resource"
                                            >
                                                {res.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 italic">No resources</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
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
                                    {modalMode === "edit" ? "Update Resource" : "Add Resource"}
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
                            {/* ✅ ADD MODE TABLE */}
                            {modalMode === "add" ? (
                                <>
                                    <div className="flex justify-end">
                                        <Tooltip title="Add files" arrow>
                                            <div className="bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white">
                                                <Components.IconButton onClick={addFileRow}>
                                                    <CustomIcons
                                                        iconName="fa-solid fa-plus"
                                                        css="cursor-pointer text-white h-4 w-4"
                                                    />
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
                                                            {/* File name */}
                                                            <td className="px-4 py-4 border-b">
                                                                <input
                                                                    value={row.fileName}
                                                                    onChange={(e) => updateRowName(row.id, e.target.value)}
                                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                                                    placeholder="Enter file name"
                                                                />
                                                            </td>

                                                            {/* Upload */}
                                                            <td className="px-4 py-4 border-b">
                                                                <MultipleFileUpload
                                                                    files={row.files}
                                                                    setFiles={(v) => setRowFiles(row.id, v)}
                                                                    existingImages={row.existingImages}
                                                                    setExistingImages={(v) => setRowExistingImages(row.id, v)}
                                                                    placeHolder="Drag & drop files here, or click to select files (png, jpg, jpeg, pdf, doc, docx, xls, xlsx, html)"
                                                                    isFileUpload={true}
                                                                    removableExistingAttachments={true}
                                                                    flexView={true}
                                                                />
                                                            </td>

                                                            {/* Action */}
                                                            <td className="px-4 py-4 border-b text-center">
                                                                <Tooltip title="Delete row" arrow>
                                                                    <span>
                                                                        <Components.IconButton onClick={() => deleteFileRow(row.id)}>
                                                                            <CustomIcons
                                                                                iconName="fa-solid fa-trash"
                                                                                css="cursor-pointer text-red-600 h-5 w-5"
                                                                            />
                                                                        </Components.IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* if no rows */}
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
                            ) : (
                                /* ✅ EDIT MODE (unchanged) */
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            File name
                                        </label>
                                        <input
                                            value={resourceName}
                                            onChange={(e) => setResourceName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                            placeholder="Enter file name"
                                        />
                                    </div>

                                    <MultipleFileUpload
                                        files={modalFiles}
                                        setFiles={setModalFiles}
                                        existingImages={existingImages}
                                        setExistingImages={setExistingImages}
                                        placeHolder="Drag & drop files here, or click to select files (png, jpg, jpeg, pdf, doc, docx, xls, xlsx, html)"
                                        isFileUpload={true}
                                        removableExistingAttachments={true}
                                    />
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
                                disabled={isAddDisabled}
                                className={[
                                    "px-4 py-2 rounded-md text-sm text-white",
                                    isAddDisabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700",
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