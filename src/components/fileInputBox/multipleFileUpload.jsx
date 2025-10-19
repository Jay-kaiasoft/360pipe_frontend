import React from "react";
import { useDropzone } from "react-dropzone";

import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../redux/commonReducers/commonReducers";
import CustomIcons from "../common/icons/CustomIcons";
import { deleteImagesById } from "../../service/todo/todoService";
import Components from "../muiComponents/components";


const allowImageFileType = ['image/png', 'image/jpg', 'image/jpeg']

function MultipleFileUpload({ files, setFiles, setAlert, setValue, existingImages, setExistingImages, type, multiple = true, placeHolder, uploadedFiles, setDeleteLogo }) {

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        multiple: multiple,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles[0].type.toString().split("/")[0] === "image") {
                if (allowImageFileType.includes(acceptedFiles[0].type)) {
                    setFiles((prevFiles) => {
                        const newFiles = acceptedFiles.filter(
                            (newFile) =>
                                !prevFiles.some((prevFile) => prevFile.name === newFile.name)
                        );
                        return [
                            ...prevFiles,
                            ...newFiles.map((file) =>
                                Object.assign(file, {
                                    preview: URL.createObjectURL(file)
                                })
                            )
                        ];
                    });
                } else {
                    setAlert({ open: true, message: `.${acceptedFiles[0].type.toString().split("/")[1]} files not allow.Only allow .png, .jpg and .jpeg`, type: "error" })
                }
            }
        }
    });

    const removeFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };

    const handleRemoveImages = async (id) => {
        if (type === "todo") {
            const response = await deleteImagesById(id);
            if (response?.status === 200) {
                setAlert({ open: true, message: response.message, type: "success" })
                const data = existingImages?.filter((row) => row.imageId !== id)
                setExistingImages(data)
            } else {
                setAlert({ open: true, message: response.message, type: "error" })
            }
        }
    }
    return (
        <div className="p-4">
            <div
                {...getRootProps({
                    className:
                        "flex justify-center items-center w-full h-20 px-[20px] border-2 border-dashed border-blue-600 rounded-md cursor-pointer",
                })}
            >
                <input {...getInputProps()} />
                <p className="text-black text-center">{placeHolder ? placeHolder : 'Drag & drop images or videos  here, or click to select (png , jpg , jpeg, mp4, mkv ,avi)'}</p>
                {/* <br/> for images (png , jpg , jpeg) <br/> for videos (mp4, mkv ,avi) */}
            </div>

            <aside className="flex flex-wrap mt-4">
                {/* Preview existing images */}
                {
                    existingImages?.map((image, idx) => (
                        <div key={idx} className="relative flex justify-center items-center w-24 h-24 border border-gray-300 rounded-md overflow-hidden m-2">
                            <NavLink target="_blank" to={image.imageURL} className=' w-full h-full border border-gray-400'>
                                {
                                    <img src={image.imageURL} alt={image.imageName} className="object-cover w-full h-full" />
                                }
                            </NavLink>
                            <div className='bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white absolute top-0 right-0'>
                                <Components.IconButton onClick={() => handleRemoveImages(image.imageId)}>
                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                </Components.IconButton>
                            </div>
                        </div>
                    ))
                }
                {/* Preview newly uploaded images */}
                {
                    files?.length > 0 ?
                        files?.map((file) => (
                            <div key={file.name} className="relative flex justify-center items-center w-24 h-24 border border-gray-300 rounded-md overflow-hidden m-2">
                                {
                                    file?.type.toString().split("/")[0] === "image" ? (
                                        <img src={file.preview} alt={file.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <CustomIcons iconName={"fa-solid fa-play"} css={'text-black text-xl'} />
                                    )
                                }
                                <div className='bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white absolute top-0 right-0'>
                                    <Components.IconButton onClick={() => removeFile(file.name)}>
                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                    </Components.IconButton>
                                </div>
                            </div>
                        ))
                        :
                        uploadedFiles?.length > 0 ?
                            uploadedFiles?.map((image, idx) => (
                                <div key={idx} className="relative flex justify-center items-center w-24 h-24 border border-gray-300 rounded-md overflow-hidden m-2">
                                    <NavLink target="_blank" to={image.imageURL} className=' w-full h-full border border-gray-400'>
                                        {
                                            image.fileType === "image" ? (
                                                <img src={image.imageURL} alt={image.imageName} className="object-cover w-full h-full" />
                                            ) :
                                                <div className="flex justify-center items-center h-24">
                                                    <CustomIcons iconName={"fa-solid fa-play"} css={'text-black text-xl'} />
                                                </div>
                                        }
                                    </NavLink>
                                </div>
                            )) : null
                }
            </aside>
        </div>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(MultipleFileUpload);
