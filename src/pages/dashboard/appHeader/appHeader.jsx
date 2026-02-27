import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch, connect } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import {
  toggleSidebar,
  toggleMobileSidebar,
  setAlert,
  setLoading,
  setSyncCount,
  setSyncingPushStatus,
  setSyncingPullStatus,
  setLoadingMessage,
  setOppSelectedTabIndex,
  setPerformanceSelectedTabIndex,
} from "../../../redux/commonReducers/commonReducers"

import Components from "../../../components/muiComponents/components"
import { syncToQ4Magic } from "../../../service/salesforce/syncToQ4Magic/syncToQ4MagicService"
import { syncFromQ4magic } from "../../../service/salesforce/syncFromQ4magic/syncFromQ4magicService"
import { getAllSyncRecords } from "../../../service/syncRecords/syncRecordsService"
import Button from "../../../components/common/buttons/button"
import { getSalesforceUserDetails, getUserDetails } from "../../../utils/getUserDetails"
import { Tabs } from "../../../components/common/tabs/tabs"
import { useTheme } from "@mui/material"

const oppTableData = [{ label: "Opp360" }, { label: "Notes" }, { label: "Deal Docs" }];
const performanceTableData = [{ label: "Activity" }, { label: "Results" }];

const AppHeader = ({
  setAlert,
  setLoadingMessage,
  setLoading,
  setSyncCount,
  setSyncingPushStatus,
  setSyncingPullStatus,
  syncCount,
  syncingPushStatus,
  oppSelectedTabIndex,
  setOppSelectedTabIndex,
  performanceSelectedTabIndex,
  setPerformanceSelectedTabIndex
}) => {
  const theme = useTheme()

  const { isMobileOpen } = useSelector((state) => state.common)
  const userDetails = getUserDetails()
  const salesforceUserDetails = getSalesforceUserDetails()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const locaiton = useLocation()
  const inputRef = useRef(null)

  const [tabsData, setTabsData] = useState([])
  const [tabsData2, setTabsData2] = useState([{
    label: "Dashboard",
    path: "/dashboard",
  }])
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

  const handleChangeTab2 = (value) => {
    const selectedPath = tabsData2[value]?.path
    if (selectedPath) {
      navigate(selectedPath)
      setSelectedTab(null)
      setSelectedTab2(value)
    }
  }
  const handleSetNavItems = () => {
    const tabItems = [
      {
        label: "Pipeline",
        path: "/dashboard/opportunities",
      },
      {
        label: "Performance",
        path: "/dashboard/performance",
      },
      // {
      //   label: "Activities",
      //   path: "/dashboard/activities",
      // },
      // {
      //   label: "Results",
      //   path: "/dashboard/results",
      // },
      {
        label: "Contacts",
        path: "/dashboard/contacts",
      },
      {
        label: userDetails?.roleName?.toUpperCase() === "SALES REPRESENTIVE" ? "My Actions" : "Team Actions",
        path: "/dashboard/todos",
      },

      // ...(((userDetails?.roleName === "SALES REPRESENTIVE" || userDetails?.roleName === "SALE MANAGER") && !userDetails?.subUser)
      //   ? [
      //     {
      //       label: "My CRM",
      //       path: "/dashboard/mycrm",
      //     },
      //   ]
      //   : []),
    ]

    setTabsData(tabItems)

    const currentPath = locaiton.pathname
    const currentTabIndex = tabItems?.findIndex((tab) => tab.path === currentPath)
    if (currentTabIndex !== -1) {
      setSelectedTab(currentTabIndex);
    }
    else {
      setSelectedTab(null)
      const currentTabIndex = tabsData2?.findIndex((tab) => tab.path === currentPath)
      setSelectedTab2(currentTabIndex)
    }
  }

  const handleToggle = () => {
    if (window.innerWidth >= 1024) dispatch(toggleSidebar())
    else dispatch(toggleMobileSidebar())
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

  useEffect(() => {
    handleGetAllSyncRecords()
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    handleSetNavItems()
  }, [locaiton.pathname])

  const handleSync = async () => {
    try {
      const res = await syncToQ4Magic()
      if (res?.status === 200) {
        setLoading(false)
        setLoadingMessage(null)
        setAlert({
          open: true,
          message: res?.message || "Data synced successfully",
          type: "success",
        })
        setSyncingPullStatus(true)
        handleGetAllSyncRecords()
      } else {
        setLoading(false)
        setLoadingMessage(null)
        setAlert({
          open: true,
          message: res?.message || "Failed to sync data",
          type: "error",
        })
      }
    } catch (err) {
      setLoading(false)
      setLoadingMessage(null)
      setAlert({
        open: true,
        message: err.message || "Error syncing data.",
        type: "error",
      })
    }
  }

  const handlePushData = async () => {
    setLoadingMessage("Please wait ! We are syncing your data.....")
    setLoading(true)
    try {
      const res = await syncFromQ4magic()
      if (res?.status === 200) {
        handleSync()
      } else if (res?.status === 401) {
        setLoading(false)
        setLoadingMessage(null)
        localStorage.removeItem("accessToken_salesforce")
        localStorage.removeItem("instanceUrl_salesforce")
        localStorage.removeItem("salesforceUserData")
        setAlert({
          open: true,
          message: "Your Salesforce session has expired. Please reconnect your Salesforce account.",
          type: "error",
        })
        navigate("/dashboard/mycrm")
      } else {
        setLoading(false)
        setLoadingMessage(null)
        setAlert({
          open: true,
          message: res?.message || "Failed to sync data",
          type: "error",
        })
      }
    } catch (err) {
      setLoading(false)
      setLoadingMessage(null)
      setAlert({
        open: true,
        message: err.message || "Error syncing accounts to Q4Magic.",
        type: "error",
      })
    }
  }

  useEffect(() => {
    if (syncingPushStatus) handleGetAllSyncRecords()
  }, [syncingPushStatus])

  return (
    <header className="w-full bg-white shadow-sm z-50">
      <div className="lg:px-6">
        <div className="hidden lg:flex justify-between py-2">
          <div>
            <Tabs tabsData={tabsData} selectedTab={selectedTab} handleChange={handleChangeTab} type="header" />
          </div>
          {
            locaiton?.pathname.includes("opportunity-view") && (
              <div className="w-full ml-32">
                <Tabs tabsData={oppTableData} selectedTab={oppSelectedTabIndex} handleChange={setOppSelectedTabIndex} type="header" />
              </div>
            )
          }
          {
            locaiton?.pathname.includes("performance") && (
              <div className="w-full ml-32">
                <Tabs tabsData={performanceTableData} selectedTab={performanceSelectedTabIndex} handleChange={setPerformanceSelectedTabIndex} type="header" />
              </div>
            )
          }
          <div className="flex items-center gap-4">
            <Tabs tabsData={tabsData2} selectedTab={selectedTab2} handleChange={handleChangeTab2} type="header" />
            {
              !userDetails?.subUser && (
                <div className="flex items-center justify-end gap-6">
                  {(userDetails?.userId === salesforceUserDetails?.userId &&
                    localStorage.getItem("accessToken_salesforce") &&
                    localStorage.getItem("instanceUrl_salesforce")) && (
                      <>
                        <div>
                          <Components.Badge badgeContent={syncCount !== null ? syncCount : null} color="error">
                            <Button onClick={() => handlePushData()} text={"SYNC"} useFor="success" />
                          </Components.Badge>
                        </div>
                      </>
                    )}
                </div>
              )
            }
          </div>
        </div>

        <div className="px-3 py-3 border-b border-gray-200 sm:gap-4 lg:border-b-0 lg:px-0 lg:py-4 lg:hidden">
          <div>
            <button
              className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg lg:h-11 lg:w-11"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? (
                // Cross Icon
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.22 7.28a.75.75 0 0 1 1.06-1.06L12 10.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L13.06 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L10.94 12 6.22 7.28Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                // Hamburger Icon
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1 1h14a.75.75 0 0 1 0 1.5H1A.75.75 0 0 1 1 1ZM1 5.25h7a.75.75 0 0 1 0 1.5H1a.75.75 0 0 1 0-1.5ZM1 10.25h14a.75.75 0 0 1 0 1.5H1a.75.75 0 0 1 0-1.5Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
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
  oppSelectedTabIndex: state.common.oppSelectedTabIndex,
  performanceSelectedTabIndex: state.common.performanceSelectedTabIndex,
})

const mapDispatchToProps = {
  setLoading,
  setAlert,
  setSyncCount,
  setSyncingPushStatus,
  setSyncingPullStatus,
  setLoadingMessage,
  setOppSelectedTabIndex,
  setPerformanceSelectedTabIndex
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