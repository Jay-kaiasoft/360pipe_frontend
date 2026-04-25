import { useEffect, useRef, useState } from "react"
import { useDispatch, connect, useSelector } from "react-redux"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  toggleSidebar,
  toggleMobileSidebar,
  setAlert,
  setLoading,
  setSyncCount,
  setSyncingPushStatus,
  setSyncingPullStatus,
  setLoadingMessage,
  setSalesforceUserDetails,
  setSyncStatus,
} from "../../../redux/commonReducers/commonReducers"

import Components from "../../../components/muiComponents/components"
import { syncToQ4Magic } from "../../../service/salesforce/syncToQ4Magic/syncToQ4MagicService"
import { syncFromQ4magic } from "../../../service/salesforce/syncFromQ4magic/syncFromQ4magicService"
import { getAllSyncRecords } from "../../../service/syncRecords/syncRecordsService"
import Button from "../../../components/common/buttons/button"
import { getSalesforceUserDetails, getUserDetails } from "../../../utils/getUserDetails"
import { Tabs } from "../../../components/common/tabs/tabs"
import UserDropdown from "./userDropDown"
import CustomIcons from "../../../components/common/icons/CustomIcons"
import { getUserInfo } from "../../../service/salesforce/connect/salesforceConnectService"
import { saveSyncStatus } from "../../../service/syncStatus/syncStatusService"
import { fetchAndSetSalesforceTokens } from "../../../utils/salesforceTokenHelper"
import { setSalesforceTokens, clearSalesforceTokens } from "../../../redux/commonReducers/commonReducers"


const AppHeader = ({
  setAlert,
  setLoadingMessage,
  setLoading,
  setSyncCount,
  setSyncingPushStatus,
  setSyncingPullStatus,
  syncCount,
  syncingPushStatus,
  salesforceUserDetails,
  setSalesforceUserDetails,
  setSyncStatus,
  syncStatus,
  salesforceAccessToken,
  salesforceInstanceUrl,
  setSalesforceTokens,
  clearSalesforceTokens
}) => {
  const { isMobileOpen } = useSelector((state) => state.common)
  const userDetails = getUserDetails()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const locaiton = useLocation()
  const inputRef = useRef(null)

  const [tabsData, setTabsData] = useState([])
  const [selectedTab, setSelectedTab] = useState(null)
  const [selectedTab2, setSelectedTab2] = useState(null)

  const handleChangeTab = (value) => {
    const selectedPath = tabsData[value]?.path
    if (selectedPath) {
      navigate(selectedPath)
      setSelectedTab(value)
      setSelectedTab2(null)
    }
  }

  const handleToggle = () => {
    if (window.innerWidth >= 1024) dispatch(toggleSidebar())
    else dispatch(toggleMobileSidebar())
  }

  const handleSetNavItems = () => {
    const tabItems = [
      {
        icon: <CustomIcons iconName="fa-solid fa-house" />,
        path: "/dashboard",
      },
      { label: "Pipeline", path: "/dashboard/opportunities" },
      ...(userDetails?.roleName?.toUpperCase() === "SALE MANAGER" || userDetails?.roleName?.toUpperCase() === "SALES MANAGER"
        ? [{ label: "Performance", path: "/dashboard/performance", }]
        : [{ label: "Deal Mgt", path: "/dashboard/deals", }]),
      {
        label: "Contacts",
        path: "/dashboard/contacts",
      },
      {
        label:
          userDetails?.roleName?.toUpperCase() !== "SALES MANAGER" || userDetails?.roleName?.toUpperCase() !== "SALE MANAGER"
            ? "My Actions"
            : "Team Actions",
        path: "/dashboard/todos",
      },
    ];

    setTabsData(tabItems)

    const currentPath = locaiton.pathname
    const currentTabIndex = tabItems?.findIndex((tab) => tab.path === currentPath)
    if (currentTabIndex !== -1) {
      setSelectedTab(currentTabIndex);
    }
    else {
      setSelectedTab(null)
      // const currentTabIndex = tabsData2?.findIndex((tab) => tab.path === currentPath)
      // setSelectedTab2(currentTabIndex)
    }
  }

  const handleGetAllSyncRecords = async () => {
    try {
      const syncRecords = await getAllSyncRecords()
      if (syncRecords?.status === 200) {
        setSyncCount(syncRecords.result?.filter((row) => row.subjectId != null && row.deleted === false)?.length || null)
        setSyncingPullStatus(false)
        setSyncingPushStatus(false)
      }
    } catch (error) {
      setAlert({
        open: true,
        message: error.message || "Error fetching sync records.",
        type: "error",
      })
    }
  }

  const initSalesforce = async () => {
    try {
      let currentToken = salesforceAccessToken;
      let currentUrl = salesforceInstanceUrl;

      if (!currentToken || !currentUrl) {
        const tokens = await fetchAndSetSalesforceTokens(userDetails?.userId);
        if (tokens) {
          setSalesforceTokens(tokens);
          currentToken = tokens.accessToken;
          currentUrl = tokens.instanceUrl;
        } else {
          return; // Stop if no tokens available
        }
      }

      if (currentToken && currentUrl && !salesforceUserDetails) {
        await handleGetSalesForceUserInfo(currentToken, currentUrl);
      }

      // Only call sync records if we have the necessary credentials
      if (currentToken && currentUrl) {
        handleGetAllSyncRecords();
      }
    } catch (error) {
      setAlert({
        open: true,
        message: error.message || "Failed to initialize Salesforce connection.",
        type: "error",
      });
    }
  };


  const handleGetSalesForceUserInfo = async (tokenOverride, urlOverride) => {
    try {
      const token = tokenOverride || salesforceAccessToken;
      const url = urlOverride || salesforceInstanceUrl;

      if (token && url) {
        const userRes = await getUserInfo(token, url);
        const data = userRes?.result?.data || null;
        if (data) {
          setSalesforceUserDetails(data);
          localStorage.setItem("salesforceUserData", JSON.stringify(data));
          setSyncingPushStatus(true);
        } else {
          setSalesforceUserDetails(null)
          localStorage.removeItem("salesforceUserData");
          clearSalesforceTokens(); // Removed to prevent infinite loop on fetch failure
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setAlert({
        open: true,
        message: error.message || "Error fetching Salesforce user info.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    initSalesforce();

    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [salesforceAccessToken, salesforceInstanceUrl, salesforceUserDetails, userDetails?.userId])

  useEffect(() => {
    handleSetNavItems()
  }, [locaiton.pathname])

  // const handleSync = async () => {
  //   try {
  //     const res = await syncToQ4Magic()
  //     if (res?.status === 200) {
  //       setLoading(false)
  //       setLoadingMessage(null)
  //       setAlert({
  //         open: true,
  //         message: res?.message || "Data synced successfully",
  //         type: "success",
  //       })
  //       setSyncingPullStatus(true)
  //       handleGetAllSyncRecords()
  //     } else {
  //       setLoading(false)
  //       setLoadingMessage(null)
  //       setAlert({
  //         open: true,
  //         message: res?.message || "Failed to sync data",
  //         type: "error",
  //       })
  //     }
  //   } catch (err) {
  //     setLoading(false)
  //     setLoadingMessage(null)
  //     setAlert({
  //       open: true,
  //       message: err.message || "Error syncing data.",
  //       type: "error",
  //     })
  //   }
  // }

  // const handlePushData = async () => {
  //   setLoadingMessage("Please wait ! We are syncing your data.....")
  //   setLoading(true)
  //   try {
  //     const res = await syncFromQ4magic()
  //     if (res?.status === 200) {
  //       handleSync()
  //     } else if (res?.status === 401) {
  //       setLoading(false)
  //       setLoadingMessage(null)
  //       localStorage.removeItem("salesforceUserData")
  //       setAlert({
  //         open: true,
  //         message: "Your Salesforce session has expired. Please reconnect your Salesforce account.",
  //         type: "error",
  //       })
  //       navigate("/dashboard/mycrm")
  //     } else {
  //       setLoading(false)
  //       setLoadingMessage(null)
  //       setAlert({
  //         open: true,
  //         message: res?.message || "Failed to sync data",
  //         type: "error",
  //       })
  //     }
  //   } catch (err) {
  //     setLoading(false)
  //     setLoadingMessage(null)
  //     setAlert({
  //       open: true,
  //       message: err.message || "Error syncing accounts to Q4Magic.",
  //       type: "error",
  //     })
  //   }
  // }

  const handleSyncData = async () => {
    const res = await saveSyncStatus()
    if (res.status === 200) {
      setAlert({
        open: true,
        type: "success",
        message: res?.message || "Sync started",
      })
      setSyncStatus(true)
      return
    } else {
      setAlert({
        open: true,
        message: res?.message || "Failed to sync data",
        type: "error",
      })
    }
  }

  useEffect(() => {
    if (syncingPushStatus) handleGetAllSyncRecords()
  }, [syncingPushStatus])

  return (
    <header className="relative w-full bg-white shadow-sm z-50">
      <div className="relative flex justify-between items-center px-6 py-2 w-full">
        {/* 1. Left Section (Logo & Sidebar Toggle) */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg shrink-0"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <CustomIcons iconName={'fa-solid fa-xmark'} css='text-black text-xl' />
            ) : (
              <CustomIcons iconName={'fa-solid fa-bars-staggered'} css='text-black text-xl' />
            )}
          </button>

          <NavLink to={"/dashboard"} className="hidden lg:flex items-center">
            <img src="/images/logo/360Pipe_logo.png" alt="360Pipe Logo" className="h-[40px] my-1" />
          </NavLink>
        </div>

        {/* 2. Center Section (Tabs) */}
        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center z-0 w-auto overflow-x-auto no-scrollbar">
          <Tabs tabsData={tabsData} selectedTab={selectedTab} handleChange={handleChangeTab} type="header" fontSize={"16px"} />
        </div>

        {/* 3. Right Section */}
        <div className="flex justify-end items-center gap-4 z-10 shrink-0">
          {
            !userDetails?.subUser && (
              <div className="flex items-center gap-6">
                {(salesforceUserDetails && (
                  <Components.Badge badgeContent={syncCount !== null ? syncCount : null} color="error">
                    <Button disabled={syncStatus} onClick={() => handleSyncData()} text={syncStatus ? "SYNCING..." : "SYNC"} sx={{ backgroundColor: "#44288E", color: "white", "&:hover .overlay": { backgroundColor: "#44288E", color: "white", boxShadow: 0 }, }} />
                  </Components.Badge>
                ))}
              </div>
            )
          }

          <div className="z-50">
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}

const mapStateToProps = (state) => ({
  loading: state.common.loading,
  syncCount: state.common.syncCount,
  syncingPullStatus: state.common.syncingPullStatus,
  syncingPushStatus: state.common.syncingPushStatus,
  salesforceUserDetails: state.common.salesforceUserDetails,
  syncStatus: state.common.syncStatus,
  salesforceAccessToken: state.common.salesforceAccessToken,
  salesforceInstanceUrl: state.common.salesforceInstanceUrl,
})

const mapDispatchToProps = {
  setLoading,
  setAlert,
  setSyncCount,
  setSyncingPushStatus,
  setSyncingPullStatus,
  setLoadingMessage,
  setSalesforceUserDetails,
  setSyncStatus,
  setSalesforceTokens,
  clearSalesforceTokens
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader)


//  ...(userDetails?.roleName !== "SALES REPRESENTIVE"
//         ? [
//           {
//             label: "Activities",
//             path: "/dashboard/activities",
//           },
//           {
//             label: "Results",
//             path: "/dashboard/results",
//           },
//         ]
//         : [
//           {
//             label: "Contacts",
//             path: "/dashboard/contacts",
//           },
//         ]),