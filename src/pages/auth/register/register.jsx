import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import Cookies from 'js-cookie';

import '@authid/web-component'
import AuthIDComponent from '@authid/react-component';

import { setAlert, setLoading } from "../../../redux/commonReducers/commonReducers";

import AuthIdLogo from "../../../assets/svgs/authid-logo.svg"
import AuthIdSignUpSvg from '../../../assets/svgs/authid-signup.svg';

import Button from "../../../components/common/buttons/button";
import CopyRight from "../../landingPage/copyRight";
import Header from "../../landingPage/header";
import Stapper from "../../../components/common/stapper/stapper";
import CustomIcons from "../../../components/common/icons/CustomIcons";
import Input from "../../../components/common/input/input";

import AuthidAthenticator from "../../../assets/svgs/authid-authenticator.svg";
import PasswordAuthenticator from "../../../assets/svgs/password-authenticator.svg";

import Select from "../../../components/common/select/select";
import FileInputBox from "../../../components/fileInputBox/fileInputBox";
import Checkbox from "../../../components/common/checkBox/checkbox";
import { getCurrentLocation } from "../../../service/common/radarService";
import { addUser, updateUser } from "../../../service/auth/authIdAccountService";
import { addCustomer, verifyEmail, verifyUsername } from "../../../service/customers/customersService";
import { getAllRoles } from "../../../service/roles/rolesService";
import { securityQuestions, uploadFiles } from "../../../service/common/commonService";
import { getAllCountry } from "../../../service/country/countryService";
import { getAllStateByCountry } from "../../../service/state/stateService";
import { addBusinessInfo, deleteBrandLogo, uploadBrandLogo } from "../../../service/businessInfo/businessInfoService";

const steps = ["", "", "", "", "", ""];

const Register = ({ setAlert, setLoading }) => {
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);
    const [formDataFile, setFormDataFile] = useState(null);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showPasswordRequirement, setShowPasswordRequirement] = useState(false);
    const [finalUrl, setFinalUrl] = useState(null);
    const [authOperationData, setAuthOperationData] = useState(null);
    const [roles, setRoles] = useState([]);
    const [countrys, setCountrys] = useState([]);
    const [states, setStates] = useState([]);
    const [billingStates, setBillingStates] = useState([]);

    const [validUsername, setValidUsername] = useState(null);
    const [validEmail, setValidEmail] = useState(null);

    const [passwordError, setPasswordError] = useState([
        {
            condition: (value) => value.length >= 8,
            message: 'Minimum 8 characters long',
            showError: true,
        },
        {
            condition: (value) => /[a-z]/.test(value),
            message: 'At least one lowercase character',
            showError: true,
        },
        {
            condition: (value) => /[A-Z]/.test(value),
            message: 'At least one uppercase character',
            showError: true,
        },
        {
            condition: (value) => /[\d@$!%*?&]/.test(value),
            message: 'At least one number or special character',
            showError: true,
        },
    ]);

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            subscribeToNewsletter: true,
            billingAddressSameAsPrimary: true,
            loginPreference: "",
            documentType: "",
            authId: "",
            id: "",
            username: "",
            password: "",
            accountOwner: "",
            managerId: "",
            name: "",
            title: "",
            roleId: "",
            emailAddress: "",
            cellPhone: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
            quota: "",
            evalPeriod: "",
            calendarYearType: "",
            question1: "",
            question2: "",
            question3: "",
            answer1: "",
            answer2: "",
            answer3: "",
            billingAddress1: "",
            billingAddress2: "",
            billingCity: "",
            billingState: "",
            billingCountry: "",
            billingZipcode: "",
            billingPhone: "",
            dateRegistered: "",

            brandId: "",
            cusId: "",
            businessName: "",
            brandName: "",
            brandLogo: "",
            websiteUrl: "",
        },
    });

    const getFilteredQuestions = (current) => {
        const selected = [watch("question1"), watch("question2"), watch("question3")].filter(
            (q) => q && q !== current
        );
        return securityQuestions.filter((q) => !selected.includes(q.id));
    };

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

    const handleGetAllCountrys = async () => {
        if (activeStep === 3) {
            const res = await getAllCountry()
            const data = res?.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.cntName
                }
            })
            setCountrys(data)
        }
    }

    const handleGetAllStatesByCountryId = async (id) => {
        if (activeStep === 3) {
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
    }

    const handleGetAllBillingStatesByCountryId = async (id) => {
        if (activeStep === 3) {
            const res = await getAllStateByCountry(id)
            const data = res?.data?.result?.map((item) => {
                return {
                    ...item,
                    id: item.id,
                    title: item.stateLong
                }
            })
            setBillingStates(data)

            if (watch("billingState")) {
                const selectedState = data?.filter((row) => row?.title === watch("billingState"))?.[0] || null
                setValue("billingState", selectedState?.title)
            }
        }
    }

    const handleGetAllRoles = async () => {
        const response = await getAllRoles();
        const data = response?.data?.result?.map(role => ({ id: role.id, title: role.role })) || [];
        setRoles(data);
    }

    const handleAuthSuccess = async (event) => {
        setLoading(true);
        if (event.data.success && authOperationData) {
            const updateJsonData = {
                authOperationId: authOperationData.operationId,
                authSelfieOperationId: '',
                id: authOperationData.userData?.id
            };
            setValue("authId", authOperationData.userData?.id);
            try {
                const updateResponse = await updateUser(updateJsonData);
                if (updateResponse.data?.status === 200) {
                    setLoading(false);
                    handleCloseAuthModel();
                    setAlert({
                        open: true,
                        type: "success",
                        message: "Verification process is completed. Let's continue with registration process.",
                    });
                    setActiveStep((prevStep) => prevStep + 1);
                } else {
                    handleCloseAuthModel();
                    setAlert({
                        open: true,
                        type: "error",
                        message: "An error occurred. Please try again.",
                    });
                }
            } catch (error) {
                handleCloseAuthModel();
                setAlert({
                    open: true,
                    type: "error",
                    message: "An error occurred. Please try again.",
                });
            }
        }
    };

    const handleAuthFailure = (event) => {
        switch (event.data.pageName) {
            case "documentFailedPage":
            case "documentFailedNonMobilePage":
            case "networkErrorPage":
            case "livenessErrorPage":
            case "docScanWasmTimeoutPage":
            case "requestTimeoutPage":
                // We don't want to stop the process for these pages
                return;
            case "verifiedMatchFailPage":
            case "verifyDeclinedPage":
            case "docScanResolutionTooLowPage":
            case "videoDeviceNotFoundPage":
            case "standardErrorPage":
            case "defaultFailedPage":
                handleCloseAuthModel();
                setAlert({
                    open: true,
                    type: "error",
                    message: "Verification failed. Please try again.",
                });
                break;
            default:
                handleCloseAuthModel();
                break;
        }
    };

    const handleAuthenticator = async () => {
        try {
            const locationResponse = await getCurrentLocation();
            if (locationResponse?.address?.country === "United States") {
                setValue("documentType", "2");
            } else if (locationResponse?.address?.country === "India") {
                setValue("documentType", "21");
            }

            let addUserRequestData = {
                email: watch("emailAddress"),
                documentType: watch("documentType")
            };
            setLoading(true);

            let response = await addUser(addUserRequestData);
            if (response.data.status === 201) {
                if (response.data.result?.error === "") {
                    const userData = response.data.result?.userData;
                    const i = response.data.result?.operationId || "";
                    const s = response.data.result?.oneTimeSecret || "";
                    const finalUrl = "https://id.authid.ai/?i=" + i + "&s=" + s;
                    setAuthOperationData({
                        operationId: response.data.result?.operationId,
                        oneTimeSecret: response.data.result?.oneTimeSecret,
                        userData: userData
                    });
                    setFinalUrl(finalUrl);
                    setLoading(false);
                } else {
                    setLoading(false);
                    setAlert({
                        type: "error",
                        message: "An error occurred. Please try again.",
                        open: true
                    });
                }
            } else {
                setLoading(false);
                setAlert({
                    type: "error",
                    message: "An error occurred. Please try again.",
                    open: true
                });
            }
        } catch (error) {
            setLoading(false);
            setAlert({
                type: "error",
                message: "An error occurred. Please try again.",
                open: true
            });
        }
    };

    const handleCloseAuthModel = () => {
        setLoading(false);
        setFinalUrl(null);
        setAuthOperationData(null);
    };

    const validatePassword = (value) => {
        const updatedErrors = passwordError.map((error) => ({
            ...error,
            showError: !error.condition(value),
        }));
        setPasswordError(updatedErrors);
        return updatedErrors.every((error) => !error.showError) || 'Password does not meet all requirements.';
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    const handleBack = () => {
        if (activeStep !== 0) {
            setActiveStep((prev) => prev - 1);
        } else {
            navigate("/pricing")
        }
    };

    const handleImageChange = (event) => {
        if (event) {
            setFormDataFile(event)
            setValue("brandLogo", URL.createObjectURL(event));
        }
    }

    const handleUploadImage = (brandId) => {
        if (!formDataFile) {
            setLoading(false);
            setActiveStep((prev) => prev + 1);
            // navigate("/pricing")
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
                            setLoading(false);
                            // navigate("/pricing");
                            setActiveStep((prev) => prev + 1);
                        }
                    })
                } else {
                    setAlert({ open: true, message: res?.data?.message, type: "error" })
                    setLoading(false);
                }
            });
        }
    }

    const handleDeleteImage = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (watch("brandId") && formDataFile === null) {
            const response = await deleteBrandLogo(watch("brandId"));
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

    const onSubmit = async (data) => {
        if (activeStep === 0) {
            if (validEmail && validUsername && passwordError.every((error) => !error.showError)) {
                setActiveStep((prev) => prev + 1);
            }
        } else if (activeStep === 1) {
            handleAuthenticator();
        } else if (activeStep === 2) {
            if (watch("loginPreference") === null || watch("loginPreference") === "") {
                setAlert({
                    open: true,
                    message: "Please select a login preference.",
                    type: "error"
                });
                return;
            }
            setActiveStep((prev) => prev + 1);
        } else if (activeStep === 3) {
            setLoading(true);
            const resetData = {
                ...data,
                authId: watch("authId"),
                question1: securityQuestions.find(q => q.id === parseInt(data.question1))?.title || "",
                question2: securityQuestions.find(q => q.id === parseInt(data.question2))?.title || "",
                question3: securityQuestions.find(q => q.id === parseInt(data.question3))?.title || "",
                ...(
                    watch("billingAddressSameAsPrimary") && {
                        billingAddress1: data.address1,
                        billingAddress2: data.address2,
                        billingCity: data.city,
                        billingState: data.state,
                        billingCountry: data.country,
                        billingZipcode: data.zipCode,
                        billingPhone: data.cellPhone,
                    }
                )
            }
            const res = await addCustomer(resetData);
            if (res.data.status === 201) {
                setValue("cusId", res?.data?.result?.id)
                setLoading(false);
                setAlert({
                    type: "success",
                    message: "Customer added successfully",
                    open: true
                });
                setActiveStep((prev) => prev + 1);
            } else {
                setLoading(false);
                setAlert({
                    type: "error",
                    message: "An error occurred. Please try again.",
                    open: true
                });
            }
        }
        else if (activeStep === 4) {
            setLoading(true);
            const newData = {
                id: watch("brandId"),
                cusId: watch("cusId"),
                businessName: watch("businessName"),
                brandName: watch("brandName"),
                brandLogo: watch("brandLogo"),
                websiteUrl: watch("websiteUrl"),
            }
            const res = await addBusinessInfo(newData);
            if (res.data.status === 201) {
                setValue("brandId", res?.data?.result?.id)
                handleUploadImage(res?.data?.result?.id);
            } else {
                setLoading(false);
                setAlert({ open: true, message: res.data.message, type: "error" })
            }
        } else if (activeStep === 5) {
            navigate("/dashboard")
        }
        else {
            setActiveStep((prev) => prev + 1);
        }
    };

    useEffect(() => {
        const handleMessage = (event) => {
            const data = event.data;

            if (typeof data !== "object" || data === null) {
                return;
            }

            if ("success" in data) {
                if (data.success === true) {
                    handleAuthSuccess(event);
                } else {
                    handleAuthFailure(event);
                }
            } else if ("pageName" in data) {
                handleAuthFailure(event);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [authOperationData]);

    useEffect(() => {
        if (Cookies.get('authToken')) {
            navigate("/dashboard");
        }
        handleGetAllRoles();
    }, [])

    useEffect(() => {
        handleGetAllCountrys();
    }, [activeStep])

    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="fixed z-50 w-full px-2 md:px-5 lg:px-20 border-b border-gray-200 shadow-sm bg-white">
                    <Header />
                </div>

                <div className="flex items-center justify-center px-2 md:px-5 py-28 lg:px-20 md:py-20">
                    <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <p className="text-center text-2xl font-semibold text-black">Registration</p>
                        </div>

                        <div className="my-6 flex justify-center">
                            <Stapper steps={steps} activeStep={activeStep} orientation="horizontal" width={700} />
                        </div>

                        {
                            activeStep === 0 && (
                                <div className="flex justify-center">
                                    <div className="min-w-80">
                                        <div className="grid grid-cols-1 gap-4">
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

                                            <div className="relative">
                                                <Controller
                                                    name="password"
                                                    control={control}
                                                    rules={{
                                                        required: "Password is required",
                                                        validate: {
                                                            minLength: (value) =>
                                                                value.length >= 8 || "Minimum 8 characters long",
                                                            hasLowercase: (value) =>
                                                                /[a-z]/.test(value) || "At least one lowercase character",
                                                            hasUppercase: (value) =>
                                                                /[A-Z]/.test(value) || "At least one uppercase character",
                                                            hasNumberOrSpecial: (value) =>
                                                                /[\d@$!%*?&]/.test(value) || "At least one number or special character",
                                                        },
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Password"
                                                            type={isPasswordVisible ? "text" : "password"}
                                                            error={errors?.password?.message}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\s/g, "");
                                                                field.onChange(value);
                                                                validatePassword(value);
                                                            }}
                                                            onFocus={() => setShowPasswordRequirement(true)}
                                                            onBlur={() => setShowPasswordRequirement(false)}
                                                            endIcon={
                                                                <span
                                                                    onClick={togglePasswordVisibility}
                                                                    style={{ cursor: "pointer", color: "black" }}
                                                                >
                                                                    {isPasswordVisible ? (
                                                                        <CustomIcons iconName="fa-solid fa-eye" css="cursor-pointer text-black" />
                                                                    ) : (
                                                                        <CustomIcons iconName="fa-solid fa-eye-slash" css="cursor-pointer text-black" />
                                                                    )}
                                                                </span>
                                                            }
                                                        />
                                                    )}
                                                />

                                                {
                                                    showPasswordRequirement && (
                                                        <div
                                                            className={`absolute -top-44 border-2 bg-white shadow z-50 md:w-96 rounded-md p-2 transform ${showPasswordRequirement ? 'translate-y-12 opacity-100' : 'translate-y-0 opacity-0'}`}
                                                        >
                                                            {passwordError.map((error, index) => (
                                                                <div key={index} className="flex items-center">
                                                                    <p className="grow text-black text-sm">{error.message}</p>
                                                                    <p>
                                                                        {error.showError ? (
                                                                            <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-red-600' />
                                                                        ) : (
                                                                            <CustomIcons iconName={'fa-solid fa-check'} css='cursor-pointer text-green-600' />
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 1 && (
                                <div className="flex justify-center">
                                    <div className="max-w-3xl px-10">
                                        <div>
                                            <p className="text-center md:text-2xl font-semibold text-black my-6">Identity Verification Required - Biometric Check</p>
                                        </div>

                                        <div className="md:flex justify-center items-start gap-5">
                                            <div className="md:pr-5 flex md:block justify-center">
                                                <img src={AuthIdSignUpSvg} alt="Authid Signup" style={{ width: '170px' }} />
                                            </div>
                                            <div className="w-full">
                                                <p className="text-left my-3 md:my-0">To ensure the security of both your account and our platform, we need to confirm your identity due to the advanced capabilities of our tools. SalesAndMarketing.ai uses the industry-leading biometric solution <NavLink to="https://www.authid.ai/" target="_blank" rel="noreferrer" className="text-blue-600">AuthID</NavLink> for verification. You'll need a valid <strong>Driver's License</strong> and your <strong>cell phone</strong> to complete the process.</p>
                                                <p className="text-left">You can choose a one-time biometric verification or continue using a traditional password for future logins - though we recommend going passwordless for a faster and more secure experience.</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold mt-3 text-black text-center">
                                                Powered by
                                            </p>
                                            <div className="flex justify-center items-center gap-3 my-2">
                                                <NavLink to={'https://authid.ai/'} target="_blank" rel="noreferrer">
                                                    <img src={AuthIdLogo} alt="AuthID Logo" className="h-[70px]" />
                                                </NavLink>
                                                <NavLink to={'https://kaiasoft.com/'} target="_blank" rel="noreferrer">
                                                    <img src="/images/logo/kaiasoft-logo.png" alt="Kaiasoft Logo" className="h-[70px]" />
                                                </NavLink>
                                            </div>
                                            <p className="text-sm text-center mb-3">
                                                Would you like to enable passwordless Authentication for your SaaS contact   <NavLink className={'text-blue-600'} to={'https://kaiasoft.com/'} target="_blank" rel="noreferrer">Kaiasoft.com</NavLink>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 2 && (
                                <div className="flex justify-center items-center">
                                    <div className="max-w-3xl w-full px-6">
                                        <div>
                                            <p className="text-center text-lg md:text-xl text-black my-5 font-semibold">
                                                Choose Your Login Preference
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">

                                            {/* Biometric Authenticator */}
                                            <div
                                                className={`border-2 ${watch("loginPreference") === "authId"
                                                    ? "border-blue-600 shadow-md"
                                                    : "border-gray-200"
                                                    } rounded-xl p-3 cursor-pointer transition-all hover:shadow-md`}
                                                onClick={() => setValue("loginPreference", "authId")}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={AuthidAthenticator}
                                                        alt="Biometric Authenticator"
                                                        className="mb-3 h-14 md:h-20"
                                                    />
                                                    <p className="text-black font-medium capitalize">
                                                        Biometric Authenticator
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div
                                                className={`border-2 ${watch("loginPreference") === "password"
                                                    ? "border-blue-600 shadow-md"
                                                    : "border-gray-200"
                                                    } rounded-xl p-3 cursor-pointer transition-all hover:shadow-md`}
                                                onClick={() => setValue("loginPreference", "password")}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={PasswordAuthenticator}
                                                        alt="Password"
                                                        className="mb-3 h-14 md:h-20"
                                                    />
                                                    <p className="text-black font-medium capitalize">Password</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Question 1 */}
                                        <div className="my-6 flex justify-center items-center">
                                            <div className="max-w-96 w-full">
                                                <div className="flex gap-3">
                                                    <p className="text-lg text-black">1</p>
                                                    <div className="w-full">
                                                        <div className="mb-3">
                                                            <Controller
                                                                name="question1"
                                                                control={control}
                                                                rules={{ required: "Question 1 is required" }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={getFilteredQuestions(field.value)}
                                                                        label="Security Question One"
                                                                        placeholder="Select question"
                                                                        value={parseInt(watch("question1")) || null}
                                                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                                        error={errors?.question1}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Controller
                                                                name="answer1"
                                                                control={control}
                                                                rules={{ required: "Answer 1 is required" }}
                                                                render={({ field }) => (
                                                                    <Input {...field} label="Question One Answer" type="text" error={errors?.answer1} />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Question 2 */}
                                        <div className="my-6 flex justify-center items-center">
                                            <div className="max-w-96 w-full">
                                                <div className="flex gap-3">
                                                    <p className="text-lg text-black">2</p>
                                                    <div className="w-full">
                                                        <div className="mb-3">
                                                            <Controller
                                                                name="question2"
                                                                control={control}
                                                                rules={{ required: "Question 2 is required" }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={getFilteredQuestions(field.value)}
                                                                        label="Security Question Two"
                                                                        placeholder="Select question"
                                                                        value={parseInt(watch("question2")) || null}
                                                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                                        error={errors?.question2}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Controller
                                                                name="answer2"
                                                                control={control}
                                                                rules={{ required: "Answer 2 is required" }}
                                                                render={({ field }) => (
                                                                    <Input {...field} label="Question Two Answer" type="text" error={errors?.answer2} />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Question 3 */}
                                        <div className="my-6 flex justify-center items-center">
                                            <div className="max-w-96 w-full">
                                                <div className="flex gap-3">
                                                    <p className="text-lg text-black">3</p>
                                                    <div className="w-full">
                                                        <div className="mb-3">
                                                            <Controller
                                                                name="question3"
                                                                control={control}
                                                                rules={{ required: "Question 3 is required" }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={getFilteredQuestions(field.value)}
                                                                        label="Security Question Three"
                                                                        placeholder="Select question"
                                                                        value={parseInt(watch("question3")) || null}
                                                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                                        error={errors?.question3}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Controller
                                                                name="answer3"
                                                                control={control}
                                                                rules={{ required: "Answer 3 is required" }}
                                                                render={({ field }) => (
                                                                    <Input {...field} label="Question Three Answer" type="text" error={errors?.answer3} />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 3 && (
                                <div className="flex justify-center items-center">
                                    <div className="max-w-96 w-full px-6 flex flex-col gap-4">
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
                                                name="roleId"
                                                control={control}
                                                rules={{
                                                    required: "Role is required"
                                                }}
                                                render={({ field }) => (
                                                    <Select
                                                        options={roles}
                                                        label={"Role"}
                                                        placeholder="Select role"
                                                        value={parseInt(watch("roleId")) || null}
                                                        onChange={(_, newValue) => {
                                                            if (newValue?.id) {
                                                                field.onChange(newValue.id);
                                                            } else {
                                                                setValue("roleId", 1);
                                                            }
                                                        }}
                                                        error={errors?.roleId}
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

                                        <div>
                                            <Controller
                                                name="billingAddressSameAsPrimary"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        text="My Billing Address Is Same As My Address"
                                                        checked={watch("billingAddressSameAsPrimary")}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {
                                            !watch("billingAddressSameAsPrimary") && (
                                                <>
                                                    <div>
                                                        <Controller
                                                            name="billingAddress1"
                                                            control={control}
                                                            rules={{
                                                                required: "Address is required"
                                                            }}
                                                            render={({ field }) => (
                                                                <Input {...field} label="Address 1" type="text" error={errors?.billingAddress1}
                                                                    onChange={(e) => {
                                                                        field.onChange(e.target.value);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Controller
                                                            name="billingAddress2"
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
                                                            name="billingCity"
                                                            control={control}
                                                            rules={{
                                                                required: "City is required"
                                                            }}
                                                            render={({ field }) => (
                                                                <Input {...field} label="City" type="text" error={errors?.billingCity}
                                                                    onChange={(e) => {
                                                                        field.onChange(e.target.value);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Controller
                                                            name="billingZipcode"
                                                            control={control}
                                                            rules={{
                                                                required: "Zip Code is required"
                                                            }}
                                                            render={({ field }) => (
                                                                <Input {...field} label="Post Code" type="text" error={errors?.billingZipcode}
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
                                                            name="billingCountry"
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
                                                                    value={countrys?.filter((row) => row.title === watch("billingCountry"))?.[0]?.id || null}
                                                                    onChange={(_, newValue) => {
                                                                        if (newValue?.id) {
                                                                            field.onChange(newValue.title);
                                                                            handleGetAllBillingStatesByCountryId(newValue.id);
                                                                        } else {
                                                                            setValue("billingCountry", null);
                                                                            setStates([]);
                                                                        }
                                                                    }}
                                                                    error={errors?.billingCountry}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Controller
                                                            name="billingState"
                                                            control={control}
                                                            rules={{
                                                                required: "State is required"
                                                            }}
                                                            render={({ field }) => (
                                                                <Select
                                                                    disabled={billingStates?.length === 0}
                                                                    options={billingStates}
                                                                    label={"State"}
                                                                    placeholder="Select state"
                                                                    value={billingStates?.filter((row) => row.title === watch("billingState"))?.[0]?.id || null}
                                                                    onChange={(_, newValue) => {
                                                                        if (newValue?.id) {
                                                                            field.onChange(newValue.title);
                                                                        } else {
                                                                            setValue("billingState", null);
                                                                        }
                                                                    }}
                                                                    error={errors?.billingState}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Controller
                                                            name="billingPhone"
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
                                                                    error={errors?.billingPhone}
                                                                    onChange={(e) => {
                                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                        field.onChange(numericValue);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 4 && (
                                <>
                                    <div>
                                        <p className="text-center text-lg md:text-xl text-black my-5 font-semibold">
                                            What is your business name, brand name and brand website?
                                        </p>
                                    </div>

                                    <div className="flex justify-center items-center">
                                        <div className="max-w-96 w-full px-6 flex flex-col gap-4">
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
                                                        <Input {...field} label="Website URL" type="text"
                                                            onChange={(e) => {
                                                                field.onChange(e.target.value);
                                                            }}
                                                            error={errors?.websiteUrl}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <FileInputBox
                                            onFileSelect={handleImageChange}
                                            onRemove={handleDeleteImage}
                                            value={watch("brandLogo")}
                                            text="Click in this area to upload brand logo"
                                        />
                                    </div>
                                </>
                            )
                        }
                        {
                            activeStep === 5 && (
                                <>
                                    <div>
                                        <p className="text-center text-lg md:text-xl text-black my-5 font-semibold capitalize">
                                            {watch("username")}, your account is ready!
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <div className="md:max-w-96 w-full md:px-6 flex flex-col gap-4">
                                            <div>
                                                <Controller
                                                    name="subscribeToNewsletter"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            text="Subscribe to 360Pipe Skills and Update"
                                                            checked={watch("subscribeToNewsletter")}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        }
                        <div className="mt-6 flex justify-end items-center gap-3 cap">
                            <div>
                                <Button type="button" onClick={() => handleBack()} text={"Back"} />
                            </div>

                            <div>
                                <Button type="submit" text={activeStep === 1 ? "PROCEED FOR BIOMETRIC AUTHENTICATION" : activeStep === 5 ? "Let's Go" : "next"} />
                            </div>
                        </div>
                    </form>
                </div>

                {finalUrl != null ? (
                    <div className="fixed inset-0 z-50 bg-white h-screen w-screen">
                        <div>
                            <AuthIDComponent
                                url={finalUrl}
                                webauth={true}
                            />
                        </div>
                        <button
                            onClick={() => { handleCloseAuthModel() }}
                            className="absolute top-5 right-5 w-10 h-10 text-xl font-bold z-50 text-black border-2 border-black rounded-full"
                        >
                            <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black text-xl" />
                        </button>
                    </div>
                ) : null}

                <div className="fixed bottom-0 z-30 w-full border-b border-gray-200 shadow-sm bg-white">
                    <CopyRight />
                </div>
            </div>
        </>
    );
};

const mapDispatchToProps = {
    setAlert,
    setLoading
};

export default connect(null, mapDispatchToProps)(Register);