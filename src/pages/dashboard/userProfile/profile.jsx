import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Input from '../../../components/common/input/input';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';
import Button from '../../../components/common/buttons/button';

import { getCustomer, updateCustomer, verifyEmail, verifyUsername } from '../../../service/customers/customersService';
import { getAllStateByCountry } from '../../../service/state/stateService';
import { getAllCountry } from '../../../service/country/countryService';
import { getUserDetails } from '../../../utils/getUserDetails';

const Profile = ({ setAlert }) => {
    const data = getUserDetails();

    const [validUsername, setValidUsername] = useState(null);
    const [validEmail, setValidEmail] = useState(null);
    const [countrys, setCountrys] = useState([]);
    const [states, setStates] = useState([]);

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
            username: "",
            emailAddress: "",
            name: "",
            title: "",
            cellPhone: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
        },
    });


    const handleGetAllCountrys = async () => {
        const res = await getAllCountry()
        const data = res?.data?.result?.map((item) => {
            return {
                id: item.id,
                title: item.cntName
            }
        })
        setCountrys(data)
    }

    const handleGetAllStatesByCountryId = async (id) => {
        const res = await getAllStateByCountry(id)
        const data = res?.data?.result?.map((item) => {
            return {
                ...item,
                id: item.id,
                title: item.stateLong
            }
        })
        setStates(data)

        if (watch("state")) {
            const selectedState = data?.filter((row) => row?.title === watch("state"))?.[0] || null
            setValue("state", selectedState?.title)
        }
    }

    const handleVerifyEmail = async () => {
        const email = watch("emailAddress");
        if (email) {
            const response = await verifyEmail(email);
            if (response?.data?.status === 200) {
                setValidEmail(true);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
                setValidEmail(false);
            }
        }
    };

    const handleVerifyUsername = async () => {
        const username = watch("username");
        if (username) {
            const response = await verifyUsername(username);
            if (response?.data?.status === 200) {
                setValidUsername(true);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
                setValidUsername(false);
            }
        }
    };

    const handleGetUserDetails = async () => {
        const res = await getCustomer(data?.userId);
        if (res?.data?.status === 200) {
            reset(res?.data?.result); 
            handleGetAllStatesByCountryId(102);
        }
    }

    const onSubmit = async (newData) => {
        const res = await updateCustomer(data?.userId, newData);
        if (res?.data?.status === 200) {
            setAlert({
                open: true,
                type: "success",
                message: res?.data?.message || "Profile updated successfully.",
            });         
        } else {
            setAlert({
                open: true,
                type: "error",
                message: res?.data?.message || "An error occurred. Please try again.",
            });
        }
    }

    useEffect(() => {
        handleGetAllCountrys();
        handleGetUserDetails();
    }, [])

    return (
        <div className='4k:flex justify-center items-center w-full'>
            <form className="md:py-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <Controller
                                name="username"
                                control={control}
                                rules={{
                                    required: "Username is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Username"
                                        type={`text`}
                                        error={errors?.username}
                                        onChange={(e) => {
                                            field.onChange(e);
                                        }}
                                        onBlur={() => {
                                            handleVerifyUsername();
                                        }}
                                        endIcon={
                                            validUsername === true ? (
                                                <CustomIcons iconName={'fa-solid fa-check'} css={`text-green-500`} />
                                            ) : validUsername === false ? (
                                                <CustomIcons iconName={'fa-solid fa-xmark'} css={`text-red-500`} />
                                            ) : null
                                        }
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="emailAddress"
                                control={control}
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Email"
                                        type={`text`}
                                        error={errors?.emailAddress}
                                        onChange={(e) => {
                                            field.onChange(e);
                                        }}
                                        onBlur={() => {
                                            handleVerifyEmail();
                                        }}
                                        endIcon={
                                            validEmail === true ? (
                                                <CustomIcons iconName={'fa-solid fa-check'} css={`text-green-500`} />
                                            ) : validEmail === false ? (
                                                <CustomIcons iconName={'fa-solid fa-xmark'} css={`text-red-500`} />
                                            ) : null
                                        }
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} label="Name" type="text"
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} label="Title" type="text"
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="address1"
                                control={control}
                                rules={{
                                    required: "Address is required"
                                }}
                                render={({ field }) => (
                                    <Input {...field} label="Address 1" type="text" error={errors?.address1}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="address2"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} label="Address 2" type="text"
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="city"
                                control={control}
                                rules={{
                                    required: "City is required"
                                }}
                                render={({ field }) => (
                                    <Input {...field} label="City" type="text" error={errors?.city}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="zipCode"
                                control={control}
                                rules={{
                                    required: "Zip Code is required"
                                }}
                                render={({ field }) => (
                                    <Input {...field} label="Post Code" type="text" error={errors?.zipCode}
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                            field.onChange(numericValue);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="country"
                                control={control}
                                rules={{
                                    required: "Country is required"
                                }}
                                render={({ field }) => (
                                    <Select
                                        disabled={countrys?.length === 0}
                                        options={countrys}
                                        label={"Country"}
                                        placeholder="Select country"
                                        value={countrys?.filter((row) => row.title === watch("country"))?.[0]?.id || null}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) {
                                                field.onChange(newValue.title);
                                                handleGetAllStatesByCountryId(newValue.id);
                                            } else {
                                                setValue("country", null);
                                                setStates([]);
                                            }
                                        }}
                                        error={errors?.country}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="state"
                                control={control}
                                rules={{
                                    required: "State is required"
                                }}
                                render={({ field }) => (
                                    <Select
                                        disabled={states?.length === 0}
                                        options={states}
                                        label={"State"}
                                        placeholder="Select state"
                                        value={states?.filter((row) => row.title === watch("state"))?.[0]?.id || null}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) {
                                                field.onChange(newValue.title);
                                            } else {
                                                setValue("state", null);
                                            }
                                        }}
                                        error={errors?.state}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="cellPhone"
                                control={control}
                                rules={{
                                    required: "Phone is required",
                                    maxLength: {
                                        value: 10,
                                        message: 'Enter valid phone number',
                                    },
                                    minLength: {
                                        value: 10,
                                        message: 'Enter valid phone number',
                                    },
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Phone"
                                        type={`text`}
                                        error={errors?.cellPhone}
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                            field.onChange(numericValue);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end items-center gap-3 cap">
                    <div>
                        <Button type="submit" text={"Update"} />
                    </div>
                </div>
            </form>
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(Profile);