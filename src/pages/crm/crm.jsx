import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
import { setAlert, setLoading } from '../../redux/commonReducers/commonReducers';

import SalesForceLogo from '../../assets/svgs/salesforce.svg';
import { connectToSalesforce, getUserInfo } from '../../service/salesforce/connect/salesforceConnectService';
import AlertDialog from '../../components/common/alertDialog/alertDialog';

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

const Crm = ({ setLoading, setAlert, loading }) => {
    const [userInfo, setUserInfo] = useState(localStorage.getItem("salesforceUserData") ? JSON.parse(localStorage.getItem("salesforceUserData")) : null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleOpenDialog = () => {
        setDialog({ open: true, title: 'Log Out', message: 'Are you sure! Do you want to log out from salesforce account?', actionButtonText: 'yes' });
    }

    const handleCloseDialog = () => {
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await connectToSalesforce();
            if (res?.result?.url) {
                const width = 600;
                const height = 700;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;
                const popup = window.open(
                    res?.result?.url,
                    "Salesforce Login",
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                // Poll the popup until it redirects back
                const popupInterval = setInterval(() => {
                    try {
                        if (!popup || popup.closed) {
                            clearInterval(popupInterval);
                            setLoading(false);
                            return;
                        }
                        // Check if the popup URL contains access_token
                        const popupUrl = popup.location.href;
                        if (popupUrl.includes("access_token=")) {
                            const params = new URLSearchParams(
                                popupUrl.split("#")[1] || popupUrl.split("?")[1]
                            );
                            const token = params.get("access_token");
                            const url = params.get("instance_url");

                            if (token && url) {
                                localStorage.setItem("accessToken_salesforce", token);
                                localStorage.setItem("instanceUrl_salesforce", url);
                                setAlert({
                                    open: true,
                                    type: "success",
                                    message: "Account successfully connected to Salesforce."
                                });
                                handleGetUserInfo();
                                popup.close();
                                clearInterval(popupInterval);
                                setLoading(false);
                            }
                        }
                        if (popupUrl.includes("error=")) {
                            setAlert({
                                open: true,
                                type: "error",
                                message: "Salesforce authentication failed."
                            })
                            popup.close();
                            clearInterval(popupInterval);
                            setLoading(false);
                        }
                    } catch (err) {
                        // Ignore cross-origin until redirect back
                    }
                }, 500);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: "Failed to get Salesforce login URL."
                })
                setLoading(false);
            }
        } catch (err) {
            setAlert({
                open: true,
                type: "error",
                message: "Error connecting to the server."
            });
            setLoading(false);
        }
    };

    const handleGetUserInfo = async () => {
        try {
            if (localStorage.getItem("accessToken_salesforce") !== null && localStorage.getItem("accessToken_salesforce") !== undefined) {
                const userInfo = await getUserInfo();
                setUserInfo(userInfo?.result?.data || null);
                localStorage.setItem("salesforceUserData", JSON.stringify(userInfo?.result?.data) || "");
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
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
        handleGetUserInfo();
    }, []);

    return (
        <div className='pt-10'>
            {
                (loading && userInfo === null) ? (<UserInfoSkeleton />) :
                    userInfo ? (
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
                                <img
                                    src={SalesForceLogo}
                                    alt="Salesforce Logo"
                                    className="mb-3 h-14 md:h-20"
                                />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Connect to Salesforce</h2>
                            <p className="text-gray-500 text-center mb-6">
                                Log in to your Salesforce account to synchronize your data.
                            </p>
                            <button
                                onClick={handleLogin}
                                type="button"
                                className="relative px-8 py-3 rounded-full group overflow-hidden font-medium bg-[#FFD600] text-[#222] shadow-md"
                            >
                                <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-blue-600 group-hover:h-full"></span>

                                <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg font-bold">
                                    Log in with Salesforce
                                </span>
                            </button>
                        </div>
                    )
            }
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleLogout()}
                handleClose={() => handleCloseDialog()}
            />
        </div>
    )
}

const mapStateToProps = (state) => ({
    loading: state.common.loading,
});

const mapDispatchToProps = {
    setLoading,
    setAlert
}

export default connect(mapStateToProps, mapDispatchToProps)(Crm)