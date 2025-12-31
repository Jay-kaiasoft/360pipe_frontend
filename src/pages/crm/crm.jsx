import { connect } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { setAlert, setLoading, setLoadingMessage, setSyncCount, setSyncingPushStatus } from '../../redux/commonReducers/commonReducers';

import SalesForceLogo from '../../assets/svgs/salesforce.svg';
import { connectToSalesforce, exchangeToken, getUserInfo } from '../../service/salesforce/connect/salesforceConnectService';
import AlertDialog from '../../components/common/alertDialog/alertDialog';
import { syncFromQ4magic } from '../../service/salesforce/syncFromQ4magic/syncFromQ4magicService';
import { syncToQ4Magic } from '../../service/salesforce/syncToQ4Magic/syncToQ4MagicService';
import { getAllSyncRecords } from '../../service/syncRecords/syncRecordsService';

const UserInfoSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-sm w-full animate-pulse">
        <div className="w-24 h-24 rounded-full bg-gray-200 -mt-16 mb-4"></div>
        <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded-lg mb-4"></div>
        <div className="mt-6 w-full py-3 bg-gray-200 rounded-full"></div>
    </div>
);

const getInitials = (name = "") => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Crm = ({ setLoadingMessage, setLoading, setAlert, loading, setSyncCount, setSyncingPushStatus, setSyncingPullStatus }) => {
    const exchangingRef = useRef(false);
    const popupRef = useRef(null);
    const intervalRef = useRef(null);

    const [userInfo, setUserInfo] = useState(
        localStorage.getItem("salesforceUserData")
            ? JSON.parse(localStorage.getItem("salesforceUserData"))
            : null
    );

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleOpenDialog = () => {
        setDialog({
            open: true,
            title: 'Log Out',
            message: 'Are you sure! Do you want to log out from salesforce account?',
            actionButtonText: 'yes'
        });
    };

    const handleCloseDialog = () => {
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    };

    const handleGetUserInfo = async () => {
        try {
            const token = localStorage.getItem("accessToken_salesforce");
            const url = localStorage.getItem("instanceUrl_salesforce");

            if (token && url) {
                const userRes = await getUserInfo();
                const data = userRes?.result?.data || null;

                setUserInfo(data);
                localStorage.setItem("salesforceUserData", JSON.stringify(data) || "");
                setSyncingPushStatus(true);
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    const stopPopupWatcher = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const closePopup = () => {
        try {
            if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.close();
            }
        } catch (e) {
            // ignore
        }
        popupRef.current = null;
    };

    const handleGetAllSyncRecords = async () => {
        try {
            const syncRecords = await getAllSyncRecords();
            if (syncRecords?.status === 200) {
                setSyncCount(syncRecords.result?.filter((row) => row.subjectId != null && row.deleted === false)?.length || null);
                setSyncingPullStatus(false);
                setSyncingPushStatus(false);
                setLoadingMessage(null)
            }else{
                setLoadingMessage(null)
            }
        } catch (error) {
            setLoadingMessage(null)
            setAlert({
                open: true,
                message: error.message || "Error fetching sync records.",
                type: "error"
            });
        }
    }

    const handleSync = async () => {
        try {
            const res = await syncToQ4Magic();
            if (res?.status === 200) {
                setLoading(false);
                setAlert({
                    open: true,
                    message: res?.message || "Data synced successfully",
                    type: "success"
                })
                handleGetAllSyncRecords()
                setLoadingMessage(null)
            } else {
                setLoading(false);
                setLoadingMessage(null)
                setAlert({
                    open: true,
                    message: res?.message || "Failed to sync data",
                    type: "error"
                })
            }
        } catch (err) {
            setLoading(false);
            setLoadingMessage(null)
            setAlert({
                open: true,
                message: err.message || "Error syncing data.",
                type: "error"
            })
        }
    }

    const handlePushData = async () => {
        try {
            setLoadingMessage("Please wait ! We are syncing your data.....")
            const res = await syncFromQ4magic();
            if (res?.status === 200) {
                await handleSync();
            } else if (res?.status === 401) {
                setLoading(false);
                localStorage.removeItem("accessToken_salesforce");
                localStorage.removeItem("instanceUrl_salesforce");
                localStorage.removeItem("salesforceUserData");
                setLoadingMessage(null)
                setAlert({
                    open: true,
                    message: "Your Salesforce session has expired. Please reconnect your Salesforce account.",
                    type: "error"
                })
            }
            else {
                setLoading(false);
                setAlert({
                    open: true,
                    message: res?.message || "Failed to sync data",
                    type: "error"
                })
            }
        } catch (err) {
            setLoading(false);
            setAlert({
                open: true,
                message: err.message || "Error syncing accounts to Q4Magic.",
                type: "error"
            })
        }
    }

    const handleLogin = async () => {
        // prevent multiple clicks / multiple popups
        if (loading) return;

        setLoadingMessage("Connecting to Salesforce.......")
        setLoading(true);
        exchangingRef.current = false;

        try {
            const res = await connectToSalesforce();

            if (!res?.result?.url) {
                setAlert({ open: true, type: "error", message: "Failed to get Salesforce login URL." });
                setLoading(false);
                setLoadingMessage(null)
                return;
            }

            const width = 600, height = 700;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            // close any previous popup/interval just in case
            stopPopupWatcher();
            closePopup();

            const popup = window.open(
                res.result.url,
                "Salesforce Login",
                `width=${width},height=${height},left=${left},top=${top}`
            );

            if (!popup) {
                setAlert({ open: true, type: "error", message: "Popup blocked. Please allow popups and try again." });
                setLoading(false);
                setLoadingMessage(null)
                return;
            }

            popupRef.current = popup;

            intervalRef.current = setInterval(async () => {
                try {
                    if (!popupRef.current || popupRef.current.closed) {
                        stopPopupWatcher();
                        setLoading(false);
                        exchangingRef.current = false;
                        return;
                    }

                    // ⚠️ This throws SecurityError while popup is on Salesforce domain.
                    // We catch it and ignore until it comes back to our domain.
                    const popupUrl = popupRef.current.location.href;

                    // handle error from Salesforce redirect
                    if (popupUrl.includes("error=")) {
                        stopPopupWatcher();
                        setAlert({ open: true, type: "error", message: "Salesforce authentication failed." });
                        closePopup();
                        setLoading(false);
                        setLoadingMessage(null)
                        exchangingRef.current = false;
                        return;
                    }

                    // handle success redirect (back to frontend)
                    if (popupUrl.includes("code=")) {
                        if (exchangingRef.current) return; // prevent multiple hits
                        exchangingRef.current = true;

                        stopPopupWatcher(); // stop before awaiting anything

                        const qs = popupUrl.split("?")[1] || "";
                        const params = new URLSearchParams(qs);
                        const code = params.get("code");

                        if (!code) {
                            exchangingRef.current = false;
                            closePopup();
                            setLoading(false);
                            setLoadingMessage(null)
                            return;
                        }

                        const tokenRes = await exchangeToken(code);
                        const token = tokenRes?.result?.data?.access_token;
                        const instanceUrl = tokenRes?.result?.data?.instance_url;

                        if (token && instanceUrl) {
                            localStorage.setItem("accessToken_salesforce", token);
                            localStorage.setItem("instanceUrl_salesforce", instanceUrl);
                            setAlert({
                                open: true,
                                type: "success",
                                message: "Account successfully connected to Salesforce."
                            });

                            closePopup();
                            await handleGetUserInfo();
                            await handlePushData()
                            setLoading(false);
                            setLoadingMessage(null)
                            return;
                        }

                        setAlert({ open: true, type: "error", message: "Token exchange failed." });
                        closePopup();
                        setLoading(false);
                        exchangingRef.current = false;
                    }

                } catch (err) {
                    // ✅ THIS IS THE FIX: ignore cross-origin SecurityError silently
                    if (err?.name === "SecurityError") {
                        return; // do nothing, wait for redirect back to our domain
                    }

                    // other unexpected errors -> stop
                    stopPopupWatcher();
                    closePopup();
                    setLoading(false);
                    exchangingRef.current = false;

                    setAlert({
                        open: true,
                        type: "error",
                        message: "Unexpected error while connecting to Salesforce."
                    });
                }
            }, 500);

        } catch (err) {
            stopPopupWatcher();
            closePopup();
            setAlert({ open: true, type: "error", message: "Error connecting to the server." });
            setLoading(false);
            exchangingRef.current = false;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("salesforceUserData");
        localStorage.removeItem("accessToken_salesforce");
        localStorage.removeItem("instanceUrl_salesforce");
        setUserInfo(null);

        setAlert({
            open: true,
            type: "success",
            message: "Logged out successfully from Salesforce."
        });

        handleCloseDialog();
    };

    useEffect(() => {
        document.title = "My CRM - 360Pipe"
        handleGetUserInfo();

        // cleanup on unmount
        return () => {
            stopPopupWatcher();
            closePopup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='pt-10'>
            {(loading && userInfo === null) ? (
                <UserInfoSkeleton />
            ) : userInfo ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-sm w-full">
                    <div className="w-24 h-24 flex items-center justify-center rounded-full shadow-md -mt-16 mb-4 bg-gray-400 text-white text-2xl font-bold">
                        {getInitials(userInfo?.name)}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">{userInfo?.name}</h2>
                    <p className="text-gray-500 mb-4">{userInfo?.email}</p>

                    <a
                        href={userInfo?.profile}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 text-sm font-medium underline hover:text-blue-700 transition-colors duration-200"
                    >
                        View Salesforce Profile
                    </a>

                    <div className='flex justify-between gap-4 w-full mt-4'>
                        <button
                            onClick={handleOpenDialog}
                            className="flex-1 py-3 bg-red-500 text-white rounded shadow-md hover:bg-red-600 transition-colors duration-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-sm w-full">
                    <div className="mb-6">
                        <img src={SalesForceLogo} alt="Salesforce Logo" className="mb-3 h-14 md:h-20" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Connect to Salesforce</h2>
                    <p className="text-gray-500 text-center mb-6">
                        Log in to your Salesforce account to synchronize your data.
                    </p>

                    <button
                        onClick={handleLogin}
                        type="button"
                        className="relative px-8 py-3 rounded-full group overflow-hidden font-medium text-[#1072E0] border border-[#1072E0]"
                    >
                        <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#1072E0] group-hover:h-full"></span>
                        <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg font-bold">
                            Log in with Salesforce
                        </span>
                    </button>
                </div>
            )}

            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleLogout()}
                handleClose={() => handleCloseDialog()}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    loading: state.common.loading,
});

const mapDispatchToProps = {
    setLoading,
    setAlert,
    setSyncingPushStatus,
    setLoadingMessage,
    setSyncCount
};

export default connect(mapStateToProps, mapDispatchToProps)(Crm);
