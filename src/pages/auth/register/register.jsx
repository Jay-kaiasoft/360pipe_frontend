import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { Controller, useForm } from "react-hook-form";

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

import { getCurrentLocation } from "../../../service/common/radarService";
import { addUser, updateUser, getUser } from "../../../service/auth/authIdAccountService";
import { addCustomer } from "../../../service/customers/customersService";
import { getAllRoles } from "../../../service/roles/rolesService";
import Select from "../../../components/common/select/select";

const Register = ({ setAlert, setLoading }) => {
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showPasswordRequirement, setShowPasswordRequirement] = useState(false)
    const [finalUrl, setFinalUrl] = useState(null);
    const [authOperationData, setAuthOperationData] = useState(null);
    const [roles, setRoles] = useState([]);

    const [steps,] = useState([
        "Employee Info",
        "Face Registration",
    ]);

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
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            userName: "",
            emailAddress: "",
            phone: "",
            password: "",
            documentType: "",
            authId: "",
            firstName: "",
            lastName: "",
            billState: "",
            dob: "",
            roleId: 1,
        },
    });

    const handleGetAllRoles = async () => {
        const response = await getAllRoles();
        console.log("All Roles:", response);
        const data = response?.data?.result?.map(role => ({ id: role.id, title: role.role })) || [];
        setRoles(data);
    }

    // Handle AuthID verification success
    const handleAuthSuccess = async (event) => {
        setLoading(true);
        if (event.data.success && authOperationData) {
            console.log("handleAuthSuccess authOperationData.userData", authOperationData.userData)
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

    // Handle AuthID verification failure
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
                emailAddress: watch("emailAddress"),
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

    const onSubmit = async (data) => {
        if (activeStep === 0) {
            setActiveStep((prev) => prev + 1);
        } else if (activeStep === 1) {
            handleAuthenticator();
        } else {
            setLoading(true);
            console.log("data", data);
            const resetData = {
                ...data,
                authId: watch("authId"),
            }
            const res = await addCustomer(resetData);
            if (res.data.status === 201) {
                setLoading(false);
                setAlert({
                    type: "success",
                    message: "Customer added successfully",
                    open: true
                });
            } else {
                setLoading(false);
                setAlert({
                    type: "error",
                    message: "An error occurred. Please try again.",
                    open: true
                });
            }
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
        handleGetAllRoles();
    }, [])

    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="fixed z-50 w-full px-5 lg:px-20 border-b border-gray-200 shadow-sm bg-white">
                    <Header />
                </div>

                <div className="flex items-center justify-center px-5 lg:px-20 py-20">
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
                                                    name="userName"
                                                    control={control}
                                                    rules={{
                                                        required: "Username is required",
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Username"
                                                            type={`text`}
                                                            error={errors?.userName}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
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
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <Controller
                                                    name="phone"
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
                                                            error={errors?.phone}
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
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Password"
                                                            type={`password`}
                                                            error={errors?.password}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\s/g, ''); // removes all whitespace
                                                                field.onChange(value);
                                                                validatePassword(value);
                                                            }}
                                                            onFocus={(e) => {
                                                                setShowPasswordRequirement(true)
                                                            }}
                                                            onBlur={(e) => {
                                                                setShowPasswordRequirement(false)
                                                            }}
                                                            endIcon={
                                                                <span
                                                                    onClick={togglePasswordVisibility}
                                                                    style={{ cursor: 'pointer', color: 'black' }}
                                                                >
                                                                    {isPasswordVisible ? (
                                                                        <CustomIcons iconName={'fa-solid fa-eye'} css='cursor-pointer text-black' />
                                                                    ) : (
                                                                        <CustomIcons iconName={'fa-solid fa-eye-slash'} css='cursor-pointer text-black' />
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
                                            <div className="w-full flex md:block justify-center">
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

                        <div className="mt-6 flex justify-end items-center gap-3 cap">
                            <div>
                                <Button type="button" onClick={() => handleBack()} text={"Back"} />
                            </div>

                            <div>
                                <Button type="submit" text={activeStep === 0 ? "Next" : "PROCEED FOR BIOMETRIC AUTHENTICATION"} />
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
                            className="absolute top-5 right-5 w-10 h-10 text-lg font-bold border border-black rounded-full z-50"
                        >
                            x
                        </button>
                    </div>
                ) : null}

                <div className="fixed bottom-0 z-30 w-full px-5 lg:px-20 border-b border-gray-200 shadow-sm bg-white">
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

