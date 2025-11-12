import React, { useRef } from 'react';
import CustomIcons from '../common/icons/CustomIcons';
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';

function FileInputBox({ setAlert, onFileSelect, value, onRemove, text, size = "160x160" }) {

    const fileInputRef = useRef(null);

    const [width, height] = size.split("x").map(Number);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        img.onload = () => {
            // Check image dimensions
            if (img.width === width && img.height === height) {
                onFileSelect && onFileSelect(file);
            } else {
                setAlert({
                    open: true,
                    type: "warning",
                    message: `Only images with dimensions ${width}x${height}px are allowed.`
                })
                fileInputRef.current.value = null; // Reset file input
            }
        };
        img.src = URL.createObjectURL(file);
    };

    return (
        <div className="w-24 h-24">
            {value ? (
                <div className="relative w-full h-full border border-dashed border-gray-400 rounded-full overflow-hidden">
                    <img
                        src={value}
                        alt="Uploaded preview"
                        className="w-full h-full object-contain"
                    />
                    <div className='absolute z-50 top-2 right-2.5 h-6 w-6 flex justify-center items-center rounded-full border border-red-500 bg-red-500'>
                        <button type='button' onClick={onRemove}>
                            <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white' />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="w-full h-full border border-dashed border-gray-400 rounded-full bg-white p-10 cursor-pointer hover:border-blue-400 transition"
                    onClick={handleClick}
                >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <CustomIcons iconName="fa-solid fa-image" css="w-5 h-5" />
                        {/* <p className="text-center text-sm">
                            {text ? text : 'Click in this area to upload a file'}
                        </p> */}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/JPG, image/PNG, image/JPEG"
                        onChange={handleFileChange}
                    />
                </div>
            )}
        </div>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(FileInputBox)
