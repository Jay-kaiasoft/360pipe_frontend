import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { getUserDetails } from '../../../utils/getUserDetails';

import { getCustomer } from '../../../service/customers/customersService';
import FileInputBox from '../../../components/fileInputBox/fileInputBox';
import Input from '../../../components/common/input/input';
import { uploadFiles } from '../../../service/common/commonService';
import { deleteBrandLogo, updateBusinessInfo, uploadBrandLogo } from '../../../service/businessInfo/businessInfoService';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import Button from '../../../components/common/buttons/button';

const Brand = ({ setAlert }) => {
    const data = getUserDetails();
    const [formDataFile, setFormDataFile] = useState(null);

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: "",
            cusId: "",
            businessName: "",
            brandName: "",
            brandLogo: "",
            websiteUrl: "",
        },
    });
    const handleImageChange = (event) => {
        if (event) {
            setFormDataFile(event)
            setValue("brandLogo", URL.createObjectURL(event));
        }
    }

    const handleUploadImage = (brandId) => {
        if (!formDataFile) {
            return;
        } else {
            const formData = new FormData();
            formData.append("files", formDataFile);
            formData.append("folderName", "brandLogo");
            formData.append("userId", brandId);

            uploadFiles(formData).then((res) => {
                if (res.data.status === 200) {
                    const { imageURL } = res?.data?.result[0];
                    uploadBrandLogo({ brandLogo: imageURL, brandId: brandId }).then((res) => {
                        if (res.data.status !== 200) {
                            setAlert({ open: true, message: res?.data?.message, type: "error" })
                        } else {
                            setFormDataFile(null)
                        }
                    })
                } else {
                    setAlert({ open: true, message: res?.data?.message, type: "error" })
                }
            });
        }
    }

    const handleDeleteImage = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (watch("id") && formDataFile === null) {
            const response = await deleteBrandLogo(watch("id"));
            if (response.data.status === 200) {
                setValue("brandLogo", "");
                setFormDataFile(null);
            } else {
                setAlert({ open: true, message: response.data.message, type: "error" })
            }
        } else {
            setValue("brandLogo", "");
            setFormDataFile(null);
        }
    }

    const handleGetUserDetails = async () => {
        const res = await getCustomer(data?.userId);
        if (res?.data?.status === 200) {
            if (res?.data?.result?.businessInfo) {                
                reset(res?.data?.result?.businessInfo);
            }
        }
    }

    useEffect(() => {
        handleGetUserDetails();
    }, []);

    const submit = async (newData) => {
        console.log("Data", newData);
        handleUploadImage(watch("id"));
        const res = await updateBusinessInfo(watch("id"), newData);
        if (res?.data?.status === 200) {
            setAlert({ open: true, message: res?.data?.message, type: "success" })
        } else {
            setAlert({ open: true, message: res?.data?.message, type: "error" })
        }
    }
    
    return (
        <>
            <div className="flex justify-center items-center">
                <form onSubmit={handleSubmit(submit)} className="max-w-96 w-full px-6 flex flex-col gap-4">
                    <div>
                        <Controller
                            name="businessName"
                            control={control}
                            rules={{
                                required: "Business Name is required"
                            }}
                            render={({ field }) => (
                                <Input {...field} label="Business Name" type="text"
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                    }}
                                    error={errors?.businessName}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <Controller
                            name="brandName"
                            rules={{
                                required: "Brand Name is required"
                            }}
                            control={control}
                            render={({ field }) => (
                                <Input {...field} label="Brand Name" type="text"
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                    }}
                                    error={errors?.brandName}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <Controller
                            name="websiteUrl"
                            rules={{
                                required: "Website URL is required"
                            }}
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Website URL"
                                    type="text"
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                    }}
                                    error={errors?.websiteUrl}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <FileInputBox
                            onFileSelect={handleImageChange}
                            onRemove={handleDeleteImage}
                            value={watch("brandLogo")}
                            text="Click in this area to upload brand logo"
                        />
                    </div>
                    
                    <div className="mt-6 flex justify-end items-center gap-3 cap">
                        <div>
                            <Button type="submit" text={"Update"} />
                        </div>
                    </div>
                </form>
            </div>

        </>
    )
}

const mapDispatchToProps = {
    setAlert
};

export default connect(null, mapDispatchToProps)(Brand);