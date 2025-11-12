import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../redux/commonReducers/commonReducers";
import CustomIcons from "../common/icons/CustomIcons";
import { deleteImagesById } from "../../service/todo/todoService";
import Components from "../muiComponents/components";

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
    // fallback from mime: e.g. "application/pdf"
    if (fallbackMime && fallbackMime.includes("/")) {
      const sub = fallbackMime.split("/")[1];
      // some mimes are long; keep common ones mapped
      if (sub.includes("pdf")) return "pdf";
      if (sub.includes("word")) return "docx";
      if (sub === "msword") return "doc";
      if (sub.includes("excel") || sub.includes("sheet")) return sub.includes("sheet") ? "xlsx" : "xls";
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
        return { icon: "fa-regular fa-file-pdf", badge: "PDF" };
      case "doc":
      case "docx":
        return { icon: "fa-regular fa-file-word", badge: "DOC" };
      case "xls":
      case "xlsx":
        return { icon: "fa-regular fa-file-excel", badge: "XLS" };
      case "html":
        return { icon: "fa-regular fa-file-code", badge: "HTML" };
      default:
        return { icon: "fa-regular fa-file", badge: ext ? ext.toUpperCase() : "FILE" };
    }
  };

  const TileFrame = ({ children }) => (
    <div className="relative flex justify-center items-center w-24 h-24 border border-gray-300 rounded-md overflow-hidden m-2 bg-white">
      {children}
    </div>
  );

  const RemoveButton = ({ onClick }) => (
    <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white absolute top-0 right-0">
      <Components.IconButton onClick={onClick}>
        <CustomIcons iconName={"fa-solid fa-trash"} css="cursor-pointer text-white h-3 w-3" />
      </Components.IconButton>
    </div>
  );

  const FileBadge = ({ text }) => (
    <span className="absolute bottom-1 left-1 text-[10px] px-1 py-[2px] rounded bg-black/70 text-white">{text}</span>
  );

  const renderFileTile = ({ url, name, ext, removable, onRemove }) => {
    const isImg = isImageExt(ext);

    return (
      <TileFrame key={name}>
        <NavLink target="_blank" to={url} className="w-full h-full flex justify-center items-center">
          {isImg ? (
            <img src={url} alt={name} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center gap-1 px-1 text-center">
              <CustomIcons iconName={iconForExt(ext).icon} css="text-black text-2xl" />
              <div className="text-[10px] leading-tight line-clamp-2 break-all">{name}</div>
            </div>
          )}
        </NavLink>
        <FileBadge text={iconForExt(ext).badge} />
        {removable ? <RemoveButton onClick={onRemove} /> : null}
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
          const newFiles = approved.filter((newFile) => !prev.some((p) => p.name === newFile.name));
          return [
            ...prev,
            ...newFiles.map((file) =>
              Object.assign(file, {
                preview: URL.createObjectURL(file)
              })
            )
          ];
        });
      }
    }
  });

  // Revoke object URLs on unmount or when files change
  useEffect(() => {
    return () => {
      files?.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  // --- Actions ---
  const removeFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const handleRemoveImages = async (id) => {
    if (type === "todo") {
      const response = await deleteImagesById(id);
      if (response?.status === 200) {
        setAlert({ open: true, message: response.message, type: "success" });
        const data = existingImages?.filter((row) => row.imageId !== id);
        setExistingImages(data);
      } else {
        setAlert({ open: true, message: response.message, type: "error" });
      }
    }
  };

  return (
    <div className="py-4">
      <div
        {...getRootProps({
          className:
            "flex justify-center items-center w-full h-20 px-[20px] border-2 border-dashed border-blue-600 rounded-md cursor-pointer"
        })}
      >
        <input {...getInputProps()} />
        <p className="text-black text-center">
          {placeHolder
            ? placeHolder
            : "Drag & drop files here, or click to select (png, jpg, jpeg, pdf, doc, docx, xls, xlsx, html)"}
        </p>
      </div>

      <aside className="flex flex-wrap mt-4">
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
                onRemove: () => handleRemoveImages(item.imageId)
              })}
            </div>
          );
        })}

        {/* Newly added (client) files */}
        {files?.map((file) => {
          const ext = getExt(file.name, file.type);
          const url = file.preview;
          const name = file.name;

          return renderFileTile({
            url,
            name,
            ext,
            removable: true,
            onRemove: () => removeFile(file.name)
          });
        })}

        {/* Previously uploadedFiles (fallback list) */}
        {!files?.length &&
          uploadedFiles?.map((item, idx) => {
            const ext = getExt(item.imageName || item.imageURL || "");
            const url = item.imageURL;
            const name = item.imageName || `file-${idx}.${ext || "bin"}`;
            return renderFileTile({ url, name, ext, removable: false });
          })}
      </aside>
    </div>
  );
}

const mapDispatchToProps = {
  setAlert
};

export default connect(null, mapDispatchToProps)(MultipleFileUpload);




// import React from "react";
// import { useDropzone } from "react-dropzone";

// import { NavLink } from "react-router-dom";
// import { connect } from "react-redux";
// import { setAlert } from "../../redux/commonReducers/commonReducers";
// import CustomIcons from "../common/icons/CustomIcons";
// import { deleteImagesById } from "../../service/todo/todoService";
// import Components from "../muiComponents/components";


// const allowImageFileType = ['image/png', 'image/jpg', 'image/jpeg']

// function MultipleFileUpload({ files, setFiles, setAlert, setValue, existingImages, setExistingImages, type, multiple = true, placeHolder, uploadedFiles, setDeleteLogo }) {

//     const { getRootProps, getInputProps } = useDropzone({
//         accept: "image/*",
//         multiple: multiple,
//         onDrop: (acceptedFiles) => {
//             if (acceptedFiles[0].type.toString().split("/")[0] === "image") {
//                 if (allowImageFileType.includes(acceptedFiles[0].type)) {
//                     setFiles((prevFiles) => {
//                         const newFiles = acceptedFiles.filter(
//                             (newFile) =>
//                                 !prevFiles.some((prevFile) => prevFile.name === newFile.name)
//                         );
//                         return [
//                             ...prevFiles,
//                             ...newFiles.map((file) =>
//                                 Object.assign(file, {
//                                     preview: URL.createObjectURL(file)
//                                 })
//                             )
//                         ];
//                     });
//                 } else {
//                     setAlert({ open: true, message: `.${acceptedFiles[0].type.toString().split("/")[1]} files not allow.Only allow .png, .jpg and .jpeg`, type: "error" })
//                 }
//             }
//         }
//     });

//     const removeFile = (fileName) => {
//         setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
//     };

//     const handleRemoveImages = async (id) => {
//         if (type === "todo") {
//             const response = await deleteImagesById(id);
//             if (response?.status === 200) {
//                 setAlert({ open: true, message: response.message, type: "success" })
//                 const data = existingImages?.filter((row) => row.imageId !== id)
//                 setExistingImages(data)
//             } else {
//                 setAlert({ open: true, message: response.message, type: "error" })
//             }
//         }
//     }
//     return (
//         <div className="p-4">
//             <div
//                 {...getRootProps({
//                     className:
//                         "flex justify-center items-center w-full h-20 px-[20px] border-2 border-dashed border-blue-600 rounded-md cursor-pointer",
//                 })}
//             >
//                 <input {...getInputProps()} />
//                 <p className="text-black text-center">{placeHolder ? placeHolder : 'Drag & drop images or videos  here, or click to select (png , jpg , jpeg, mp4, mkv ,avi)'}</p>
//                 {/* <br/> for images (png , jpg , jpeg) <br/> for videos (mp4, mkv ,avi) */}
//             </div>

//             <aside className="flex flex-wrap mt-4">
//                 {/* Preview existing images */}
//                 {
//                     existingImages?.map((image, idx) => (
//                         <div key={idx} className="relative flex justify-center items-center w-24 h-24 border border-gray-300 rounded-md overflow-hidden m-2">
//                             <NavLink target="_blank" to={image.imageURL} className=' w-full h-full border border-gray-400'>
//                                 {
//                                     <img src={image.imageURL} alt={image.imageName} className="object-cover w-full h-full" />
//                                 }
//                             </NavLink>
//                             <div className='bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white absolute top-0 right-0'>
//                                 <Components.IconButton onClick={() => handleRemoveImages(image.imageId)}>
//                                     <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
//                                 </Components.IconButton>
//                             </div>
//                         </div>
//                     ))
//                 }
//                 {/* Preview newly uploaded images */}
//                 {
//                     files?.length > 0 ?
//                         files?.map((file) => (
//                             <div key={file.name} className="relative flex justify-center items-center w-24 h-24 border border-gray-300 rounded-md overflow-hidden m-2">
//                                 {
//                                     file?.type.toString().split("/")[0] === "image" ? (
//                                         <img src={file.preview} alt={file.name} className="object-cover w-full h-full" />
//                                     ) : (
//                                         <CustomIcons iconName={"fa-solid fa-play"} css={'text-black text-xl'} />
//                                     )
//                                 }
//                                 <div className='bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white absolute top-0 right-0'>
//                                     <Components.IconButton onClick={() => removeFile(file.name)}>
//                                         <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
//                                     </Components.IconButton>
//                                 </div>
//                             </div>
//                         ))
//                         :
//                         uploadedFiles?.length > 0 ?
//                             uploadedFiles?.map((image, idx) => (
//                                 <div key={idx} className="relative flex justify-center items-center w-24 h-24 border border-gray-300 rounded-md overflow-hidden m-2">
//                                     <NavLink target="_blank" to={image.imageURL} className=' w-full h-full border border-gray-400'>
//                                         {
//                                             image.fileType === "image" ? (
//                                                 <img src={image.imageURL} alt={image.imageName} className="object-cover w-full h-full" />
//                                             ) :
//                                                 <div className="flex justify-center items-center h-24">
//                                                     <CustomIcons iconName={"fa-solid fa-play"} css={'text-black text-xl'} />
//                                                 </div>
//                                         }
//                                     </NavLink>
//                                 </div>
//                             )) : null
//                 }
//             </aside>
//         </div>
//     );
// }

// const mapDispatchToProps = {
//     setAlert,
// };

// export default connect(null, mapDispatchToProps)(MultipleFileUpload);
