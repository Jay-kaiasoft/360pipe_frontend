import React, { useState } from "react";
import { Tooltip } from "@mui/material";

import Components from "../components/muiComponents/components";
import CustomIcons from "../components/common/icons/CustomIcons";

export default function EnvTable() {
    const [currentEnvRows, setcurrentEnvRow] = useState([
        {
            solution: "CRM",
            vendor: [{ title: "Salesforce" }, { title: "SugarCRM" }, { title: "HubSpot" }],
        },
    ]);

    // Track which solution cell is being edited (row index)
    const [editingSolutionRow, setEditingSolutionRow] = useState(null);
    const [solutionDraft, setSolutionDraft] = useState("");

    // Track vendor editing per row + vendor index
    const [editingVendor, setEditingVendor] = useState({ rowIndex: null, vendorIndex: null });
    const [vendorDraft, setVendorDraft] = useState("");

    // Track "new vendor input boxes" per row (array of strings)
    // Example: { 0: ["", ""] } means row 0 has 2 vendor inputs open
    const [newVendorInputs, setNewVendorInputs] = useState({});

    // ------------------ ROW (SOLUTION) ------------------
    const handleAddRow = () => {
        setcurrentEnvRow((prev) => [...prev, { solution: "", vendor: [] }]);
        const newIndex = currentEnvRows.length; // next index
        setEditingSolutionRow(newIndex);
        setSolutionDraft("");
    };

    const handleEditSolution = (rowIndex) => {
        setEditingSolutionRow(rowIndex);
        setSolutionDraft(currentEnvRows[rowIndex]?.solution || "");
    };

    const handleSaveSolution = (rowIndex) => {
        const val = solutionDraft.trim();
        setcurrentEnvRow((prev) =>
            prev.map((r, i) => (i === rowIndex ? { ...r, solution: val } : r))
        );
        setEditingSolutionRow(null);
        setSolutionDraft("");
    };

    // ------------------ VENDOR ------------------
    const handleAddVendorInput = (rowIndex) => {
        setNewVendorInputs((prev) => {
            const arr = prev[rowIndex] ? [...prev[rowIndex]] : [];
            arr.push(""); // new empty input
            return { ...prev, [rowIndex]: arr };
        });
    };

    const handleVendorInputChange = (rowIndex, inputIndex, value) => {
        setNewVendorInputs((prev) => {
            const arr = [...(prev[rowIndex] || [])];
            arr[inputIndex] = value;
            return { ...prev, [rowIndex]: arr };
        });
    };

    const handleSaveNewVendor = (rowIndex, inputIndex) => {
        const val = (newVendorInputs[rowIndex]?.[inputIndex] || "").trim();
        if (!val) return;

        // push vendor into row.vendor
        setcurrentEnvRow((prev) =>
            prev.map((r, i) =>
                i === rowIndex ? { ...r, vendor: [...(r.vendor || []), { title: val }] } : r
            )
        );

        // remove that input box after save
        setNewVendorInputs((prev) => {
            const arr = [...(prev[rowIndex] || [])];
            arr.splice(inputIndex, 1);
            return { ...prev, [rowIndex]: arr };
        });
    };

    const handleEditVendor = (rowIndex, vendorIndex) => {
        setEditingVendor({ rowIndex, vendorIndex });
        setVendorDraft(currentEnvRows[rowIndex]?.vendor?.[vendorIndex]?.title || "");
    };

    const handleSaveVendorEdit = () => {
        const { rowIndex, vendorIndex } = editingVendor;
        const val = vendorDraft.trim();

        setcurrentEnvRow((prev) =>
            prev.map((r, i) => {
                if (i !== rowIndex) return r;
                const vendors = (r.vendor || []).map((v, j) => (j === vendorIndex ? { ...v, title: val } : v));
                return { ...r, vendor: vendors };
            })
        );

        setEditingVendor({ rowIndex: null, vendorIndex: null });
        setVendorDraft("");
    };

    return (
        <div className="absolute -top-32 lg:-right-96 z-10 rounded-md bg-white shadow-xl border-4 border-[#9E9E9E] overflow-hidden">
            <div className="w-[30rem] overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#D9D9D9] text-black text-base font-bold">
                            <th className="border-4 border-[#9E9E9E] px-4 py-2 text-left w-52">
                                <div className="flex items-center gap-3">
                                    <span className="grow">Solution</span>

                                    <Tooltip title="Add Row" arrow>
                                        <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                            <Components.IconButton onClick={handleAddRow}>
                                                <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3 w-3" />
                                            </Components.IconButton>
                                        </div>
                                    </Tooltip>
                                </div>
                            </th>
                            <th className="border-4 border-[#9E9E9E] px-4 py-2 text-left">Vendor(s)</th>
                        </tr>
                    </thead>

                    <tbody className="text-base">
                        {currentEnvRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {/* Solution column */}
                                <td className="border-4 border-[#9E9E9E] px-4 py-3 font-semibold align-top">
                                    {editingSolutionRow === rowIndex ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                className="border border-gray-300 rounded px-2 py-1 w-full"
                                                value={solutionDraft}
                                                onChange={(e) => setSolutionDraft(e.target.value)}
                                                placeholder="Enter solution..."
                                            />
                                            <div className="flex justify-end mt-1">
                                                <Tooltip title="Save" arrow>
                                                    <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                        <Components.IconButton onClick={() => handleSaveSolution(rowIndex)}>
                                                            <CustomIcons iconName="fa-solid fa-floppy-disk" css="cursor-pointer text-white h-3 w-3" />
                                                        </Components.IconButton>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    ) : (
                                        <span
                                            className="cursor-pointer"
                                            onClick={() => handleEditSolution(rowIndex)}
                                            title="Click to edit"
                                        >
                                            {row.solution || <span className="text-gray-400">Click to add</span>}
                                        </span>
                                    )}
                                </td>

                                {/* Vendor column */}
                                <td className="border-4 border-[#9E9E9E] px-4 py-3">
                                    <div className="flex justify-end items-center">
                                        <Tooltip title="Add Vendor" arrow>
                                            <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                <Components.IconButton onClick={() => handleAddVendorInput(rowIndex)}>
                                                    <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3 w-3" />
                                                </Components.IconButton>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    {/* New Vendor Inputs (multiple) */}
                                    {(newVendorInputs[rowIndex] || []).length > 0 && (
                                        <div className="flex flex-col gap-2 mb-3">
                                            {(newVendorInputs[rowIndex] || []).map((val, inputIndex) => (
                                                <div key={inputIndex} className="flex items-center gap-2">
                                                    <input
                                                        className="border border-gray-300 rounded px-2 py-1 w-full"
                                                        value={val}
                                                        onChange={(e) => handleVendorInputChange(rowIndex, inputIndex, e.target.value)}
                                                        placeholder="Enter vendor..."
                                                    />
                                                    {/* <button
                                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                                        onClick={() => handleSaveNewVendor(rowIndex, inputIndex)}
                                                    >
                                                        Save
                                                    </button> */}
                                                    <Tooltip title="Save" arrow>
                                                        <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                            <Components.IconButton onClick={() => handleSaveNewVendor(rowIndex, inputIndex)}>
                                                                <CustomIcons iconName="fa-solid fa-floppy-disk" css="cursor-pointer text-white h-3 w-3" />
                                                            </Components.IconButton>
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Saved Vendors */}
                                    <div className="flex flex-col gap-2">
                                        {row.vendor.map((item, vendorIndex) => (
                                            <div key={vendorIndex} className="flex items-center gap-2">
                                                <input type="checkbox" />

                                                {editingVendor.rowIndex === rowIndex && editingVendor.vendorIndex === vendorIndex ? (
                                                    <div className="flex items-center gap-2 w-full">
                                                        <input
                                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                                            value={vendorDraft}
                                                            onChange={(e) => setVendorDraft(e.target.value)}
                                                        />
                                                        <Tooltip title="Save" arrow>
                                                            <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                <Components.IconButton onClick={() => handleSaveVendorEdit()}>
                                                                    <CustomIcons iconName="fa-solid fa-floppy-disk" css="cursor-pointer text-white h-3 w-3" />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className="cursor-pointer"
                                                        onClick={() => handleEditVendor(rowIndex, vendorIndex)}
                                                        title="Click to edit"
                                                    >
                                                        {item.title}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
