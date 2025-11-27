import React from "react";
import { useDropzone } from "react-dropzone";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../redux/commonReducers/commonReducers";
import CustomIcons from "../common/icons/CustomIcons";
import { deleteImagesById } from "../../service/todo/todoService";
import Components from "../muiComponents/components";
import { deleteOpportunitiesDocs } from "../../service/opportunities/opportunitiesService";
import PermissionWrapper from "../common/permissionWrapper/PermissionWrapper";

function MultipleFileUpload({
  files,
  setFiles,
  setAlert,
  setValue,
  existingImages,
  setExistingImages,
  type,
  multiple = true,
  placeHolder,
  uploadedFiles,
  setDeleteLogo
}) {
  // --- Helpers ---
  const getExt = (name = "", fallbackMime = "") => {
    const qless = name.split("?")[0];
    const idx = qless.lastIndexOf(".");
    if (idx !== -1) return qless.slice(idx + 1).toLowerCase();
    if (fallbackMime && fallbackMime.includes("/")) {
      const sub = fallbackMime.split("/")[1];
      if (sub.includes("pdf")) return "pdf";
      if (sub.includes("word")) return "docx";
      if (sub === "msword") return "doc";
      if (sub.includes("excel") || sub.includes("sheet"))
        return sub.includes("sheet") ? "xlsx" : "xls";
      if (sub.includes("jpeg")) return "jpeg";
      if (sub.includes("png")) return "png";
      if (sub.includes("html")) return "html";
    }
    return "";
  };

  const isImageExt = (ext) => ["png", "jpg", "jpeg"].includes(ext);

  const iconForExt = (ext) => {
    switch (ext) {
      case "pdf":
        return { icon: "fa-regular fa-file-pdf", badge: "PDF", color: "bg-red-500" };
      case "doc":
      case "docx":
        return { icon: "fa-regular fa-file-word", badge: "DOC", color: "bg-blue-500" };
      case "xls":
      case "xlsx":
        return { icon: "fa-regular fa-file-excel", badge: "XLS", color: "bg-green-500" };
      case "html":
        return { icon: "fa-regular fa-file-code", badge: "HTML", color: "bg-orange-500" };
      default:
        return {
          icon: "fa-regular fa-file",
          badge: ext ? ext.toUpperCase() : "FILE",
          color: "bg-gray-500"
        };
    }
  };

  const TileFrame = ({ children }) => (
    <div className="relative flex flex-col justify-start items-center w-28 h-32 border border-gray-300 rounded-lg overflow-hidden m-2 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      {children}
    </div>
  );

  const RemoveButton = ({ onClick }) => (
    <div className="bg-red-500 hover:bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white absolute top-1 right-1 transition-colors duration-200">
      <Components.IconButton onClick={onClick} className="p-0">
        <CustomIcons iconName={"fa-solid fa-trash"} css="cursor-pointer text-white h-3 w-3" />
      </Components.IconButton>
    </div>
  );

  const InternalCheckbox = ({ checked, onChange }) => (
    <div className="absolute top-1 left-1 flex items-center bg-white/90 rounded-md px-1 py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
      />
      <label className="ml-1 text-[10px] text-gray-700 whitespace-nowrap cursor-pointer">
        Internal
      </label>
    </div>
  );

  // ✅ Toggle internal flag for either "files" or "existingImages"
  const handleCheckboxChange = (source, index, isChecked) => {
    console.log("source", source, "index", index, "isChecked", isChecked);

    if (source === "files") {
      // keep File instances intact
      setFiles((prev) => {
        const updated = [...prev];
        const file = updated[index];
        if (file) {
          file.isInternal = isChecked;
        }
        return updated;
      });
    }

    if (source === "existing") {
      // update server-side images metadata
      setExistingImages?.((prev) =>
        prev?.map((img, i) =>
          i === index ? { ...img, isInternal: isChecked } : img
        )
      );
    }
  };

  const renderFileTile = ({
    url,
    name,
    ext,
    removable,
    onRemove,
    isInternal = false,
    onCheckboxChange
  }) => {
    const isImg = isImageExt(ext);
    const fileInfo = iconForExt(ext);

    return (
      <TileFrame key={name}>
        <div className="relative w-full h-20 flex justify-center items-center">
          <NavLink
            target="_blank"
            to={url}
            className="w-full h-full flex justify-center items-center"
          >
            {isImg ? (
              <img src={url} alt={name} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center gap-1 px-1 text-center">
                <CustomIcons iconName={fileInfo.icon} css="text-gray-700 text-2xl" />
              </div>
            )}
          </NavLink>

          {/* only show checkbox when handler is provided */}
          <PermissionWrapper
            functionalityName="Opportunities"
            moduleName="Opportunities"
            actionId={2}
            component={
              <>
                {type === "oppDocs" && typeof onCheckboxChange === "function" && (
                  <InternalCheckbox checked={isInternal} onChange={onCheckboxChange} />
                )}
                {removable && <RemoveButton onClick={onRemove} />}
              </>
            }
          />
        </div>

        <div className="w-full px-1 py-1 bg-gray-50 border-t border-gray-200">
          <div className="text-[10px] leading-tight line-clamp-2 break-all text-center text-gray-700">
            {name}
          </div>
        </div>
      </TileFrame>
    );
  };

  // --- Dropzone ---
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/html": [".html"]
    },
    multiple: multiple,
    onDrop: (acceptedFiles) => {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/html"
      ];

      const approved = [];
      const rejected = [];

      acceptedFiles.forEach((file) => {
        if (allowedTypes.includes(file.type)) {
          approved.push(file);
        } else {
          rejected.push(file);
        }
      });

      if (rejected.length) {
        const bad = rejected.map((f) => f.name).join(", ");
        setAlert({
          open: true,
          message: `Some files are not allowed: ${bad}. Only images (png, jpg, jpeg), PDF, Word, Excel, HTML.`,
          type: "error"
        });
      }

      if (approved.length) {
        setFiles((prev) => {
          const newFiles = approved.filter(
            (newFile) => !prev.some((p) => p.name === newFile.name)
          );
          return [
            ...prev,
            ...newFiles.map((file) =>
              Object.assign(file, {
                preview: URL.createObjectURL(file),
                isInternal: false
              })
            )
          ];
        });
      }
    }
  });

  // --- Actions ---
  const removeFile = (fileName) => {
    setFiles((prevFiles) => {
      const remaining = [];
      prevFiles.forEach((file) => {
        if (file.name === fileName) {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        } else {
          remaining.push(file);
        }
      });
      return remaining;
    });
  };

  const handleRemoveImages = async (id) => {
    if (type === "todo") {
      const response = await deleteImagesById(id);
      if (response?.status === 200) {
        const data = existingImages?.filter((row) => row.imageId !== id);
        setExistingImages(data);
      } else {
        setAlert({ open: true, message: response.message, type: "error" });
      }
    }
    if (type === "oppDocs") {
      const response = await deleteOpportunitiesDocs(id);
      if (response?.status === 200) {
        const data = existingImages?.filter((row) => row.imageId !== id);
        setExistingImages(data);
      } else {
        setAlert({ open: true, message: response.message, type: "error" });
      }
    }
  };

  return (

    <div className="py-4">
      <PermissionWrapper
        functionalityName="Opportunities"
        moduleName="Opportunities"
        actionId={2}
        component={
          <div
            {...getRootProps({
              className:
                "flex justify-center items-center w-full h-20 px-[20px] border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            })}
          >
            <input {...getInputProps()} />
            <p className="text-gray-700 text-center text-sm">
              {placeHolder
                ? placeHolder
                : "Drag & drop files here, or click to select files (png, jpg, jpeg, pdf, doc, docx, xls, xlsx, html)"}
            </p>
          </div>
        }
      />

      <aside className="flex flex-wrap mt-4 justify-start">
        {/* Existing (server) files */}
        {existingImages?.map((item, idx) => {
          const ext = getExt(item.imageName || item.imageURL || "");
          const url = item.imageURL;
          const name = item.imageName || `file-${idx}.${ext || "bin"}`;
          return (
            <div key={`existing-${idx}`} className="relative">
              {renderFileTile({
                url,
                name,
                ext,
                removable: true,
                onRemove: () => handleRemoveImages(item.imageId),
                isInternal: !!item.isInternal,
                onCheckboxChange: (checked) =>
                  handleCheckboxChange("existing", idx, checked)
              })}
            </div>
          );
        })}

        {/* Newly added (client) files */}
        {files?.map((file, index) => {
          const ext = getExt(file.name, file.type);
          const url = file.preview;
          const name = file.name;
          return renderFileTile({
            url,
            name,
            ext,
            removable: true,
            onRemove: () => removeFile(file.name),
            isInternal: !!file.isInternal,
            onCheckboxChange: (checked) =>
              handleCheckboxChange("files", index, checked)
          });
        })}

        {/* Previously uploadedFiles (fallback list, read-only) */}
        {!files?.length &&
          uploadedFiles?.map((item, idx) => {
            const ext = getExt(item.imageName || item.imageURL || "");
            const url = item.imageURL;
            const name = item.imageName || `file-${idx}.${ext || "bin"}`;
            return renderFileTile({
              url,
              name,
              ext,
              removable: false,
              isInternal: !!item.isInternal
            });
          })}
      </aside>
    </div>
  );
}

const mapDispatchToProps = {
  setAlert
};

export default connect(null, mapDispatchToProps)(MultipleFileUpload);