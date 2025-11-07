import React, { useRef } from 'react';
import CustomIcons from '../common/icons/CustomIcons';

export default function FileInputBox({ onFileSelect, value, onRemove, text }) {

    const fileInputRef = useRef(null);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (onFileSelect && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };
    return (
        <div className="w-40 h-40">
            {value ? (
                <div className="relative w-full h-full border border-dashed border-gray-400 rounded-full overflow-hidden">
                    <img
                        src={value}
                        alt="Uploaded preview"
                        className="w-full h-full object-contain"
                    />
                    <div className='absolute z-50 top-4 right-6 h-6 w-6 flex justify-center items-center rounded-full border border-red-500 bg-red-500'>
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
                        <CustomIcons iconName="fa-solid fa-image" css="w-8 h-8 mb-3" />
                        <p className="text-center text-sm">
                            {text ? text : 'Click in this area to upload a file'}
                        </p>
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
