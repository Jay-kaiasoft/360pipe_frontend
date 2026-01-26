import { useEffect, useMemo, useRef, useState } from "react"
import { useSelector, useDispatch, connect } from "react-redux"
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
  setFilterStartDate,
  setFilterEndDate,
} from "../../../redux/commonReducers/commonReducers"

import UserDropdown from "./userDropDown"

import Components from "../../../components/muiComponents/components"
import { syncToQ4Magic } from "../../../service/salesforce/syncToQ4Magic/syncToQ4MagicService"
import { syncFromQ4magic } from "../../../service/salesforce/syncFromQ4magic/syncFromQ4magicService"
import { getAllSyncRecords } from "../../../service/syncRecords/syncRecordsService"
import Button from "../../../components/common/buttons/button"
import { getSalesforceUserDetails, getUserDetails } from "../../../utils/getUserDetails"
import { Tabs } from "../../../components/common/tabs/tabs"
import { useTheme } from "@mui/material"
import CustomIcons from "../../../components/common/icons/CustomIcons"
import DatePickerComponent from "../../../components/common/datePickerComponent/datePickerComponent"
import { useForm } from "react-hook-form"
import dayjs from "dayjs"

const RANGE_TYPES = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "ytd", label: "Year to Date" },
  { id: "custom", label: "Custom Date Range" },
]

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

/** ---------------- Date helpers (no libs) ---------------- */
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const startOfYear = (d) => new Date(d.getFullYear(), 0, 1)
const startOfQuarter = (year, quarterIndex0Based) => new Date(year, quarterIndex0Based * 3, 1)
const endOfQuarter = (year, quarterIndex0Based) => new Date(year, quarterIndex0Based * 3 + 3, 0)

/**
 * ALWAYS previous work week (Mon–Fri) relative to today.
 */
function getPreviousWorkWeekMonFri(today = new Date()) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const day = d.getDay() // 0=Sun..6=Sat

  // Monday of current week
  const currentWeekMonday = new Date(d)
  if (day === 0) currentWeekMonday.setDate(d.getDate() - 6) // Sunday
  else currentWeekMonday.setDate(d.getDate() - (day - 1))

  // Previous week Monday
  const prevMonday = new Date(currentWeekMonday)
  prevMonday.setDate(currentWeekMonday.getDate() - 7)

  // Previous week Friday
  const prevFriday = new Date(prevMonday)
  prevFriday.setDate(prevMonday.getDate() + 4)

  return { start: prevMonday, end: prevFriday }
}

const AppHeader = ({
  setAlert,
  setLoadingMessage,
  setLoading,
  setSyncCount,
  setSyncingPushStatus,
  setSyncingPullStatus,
  syncCount,
  syncingPushStatus,
  setFilterStartDate,
  setFilterEndDate,
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
  const [selectedTab, setSelectedTab] = useState(null)

  // Date range dropdown state
  const [rangeType, setRangeType] = useState("week") // default Week
  const [quarter, setQuarter] = useState("Q1")
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)
  const triggerRef = useRef(null)

  const { control, watch, setValue } = useForm({
    defaultValues: {
      startDate: null,
      endDate: null,
    },
  })

  const startDate = watch("startDate")
  const endDate = watch("endDate")

  const rangeLabel = useMemo(() => {
    if (rangeType === "quarter") return quarter
    return RANGE_TYPES.find((r) => r.id === rangeType)?.label || "Week"
  }, [rangeType, quarter])

  const applyPresetRange = (type, q = quarter) => {
    const today = new Date()

    if (type === "week") {
      const { start, end } = getPreviousWorkWeekMonFri(today)
      setValue("startDate", start)
      setValue("endDate", end)
      return
    }

    if (type === "month") {
      setValue("startDate", startOfMonth(today))
      setValue("endDate", today)
      return
    }

    if (type === "ytd") {
      setValue("startDate", startOfYear(today))
      setValue("endDate", today)
      return
    }

    if (type === "quarter") {
      const qi = Math.max(0, QUARTERS.indexOf(q))
      setValue("startDate", startOfQuarter(today.getFullYear(), qi))
      setValue("endDate", endOfQuarter(today.getFullYear(), qi))
      return
    }

    if (type === "custom") {
      // Reset for user selection
      setValue("startDate", new Date())
      setValue("endDate", new Date())
    }
  }

  // set default quarter based on today's date + apply default Week range on mount
  useEffect(() => {
    const m = new Date().getMonth() // 0-11
    const qIndex = Math.floor(m / 3) // 0..3
    setQuarter(QUARTERS[qIndex] || "Q1")
    applyPresetRange("week")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // apply whenever option changes
  useEffect(() => {
    applyPresetRange(rangeType, quarter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeType, quarter])

  // Close popover on outside click + Esc
  // Close popover on outside click + Esc
  useEffect(() => {
    if (!isOpen) return;

    const isClickInsideDatePickerPortal = (target) => {
      // MUI date picker renders calendar in a portal with these common roots/classes
      const el = target instanceof Element ? target : null;
      if (!el) return false;

      // Check if click happened inside MUI Popper / Dialog / Paper used by DatePicker
      return Boolean(
        el.closest(".MuiPickersPopper-root") ||
        el.closest(".MuiPopover-root") ||
        el.closest(".MuiDialog-root") ||
        el.closest(".MuiModal-root") ||
        el.closest(".MuiPaper-root")
      );
    };

    const onDocClickCapture = (e) => {
      const pop = popoverRef.current;
      const trg = triggerRef.current;

      // If click is in the calendar popup (portal), don't close
      if (isClickInsideDatePickerPortal(e.target)) return;

      // If click is inside popover or trigger, don't close
      if (pop?.contains(e.target)) return;
      if (trg?.contains(e.target)) return;

      setIsOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus?.();
      }
    };

    // Use click (not mousedown) so date picker can process selection first
    document.addEventListener("click", onDocClickCapture, true);
    document.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("click", onDocClickCapture, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [isOpen]);


  const handleChangeTab = (value) => {
    const selectedPath = tabsData[value]?.path
    if (selectedPath) {
      navigate(selectedPath)
      setSelectedTab(value)
    }
  }

  const handleSetNavItems = () => {
    const tabItems = [
      {
        label: "Dashboard",
        path: "/dashboard",
      },
      {
        label: "Opportunities",
        path: "/dashboard/opportunities",
      },
      ...(userDetails?.roleName !== "SALES REPRESENTIVE"
        ? [
          {
            label: "Activities",
            path: "/dashboard/activities",
          },
          {
            label: "Results",
            path: "/dashboard/results",
          },
        ]
        : [
          {
            label: "Contacts",
            path: "/dashboard/contacts",
          },
        ]),
      {
        label: "To-Do",
        path: "/dashboard/todos",
      },
      ...((userDetails?.roleName === "SALES REPRESENTIVE" && !userDetails?.subUser)
        ? [
          {
            label: "My CRM",
            path: "/dashboard/mycrm",
          },
        ]
        : []),
    ]

    setTabsData(tabItems)

    const currentPath = locaiton.pathname
    const currentTabIndex = tabItems?.findIndex((tab) => tab.path === currentPath)
    if (currentTabIndex !== -1) setSelectedTab(currentTabIndex)
    else setSelectedTab(null)
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

  const handleSelectRangeType = (id) => {
    setRangeType(id)
  }

  const handleQuarterChange = (q) => {
    setQuarter(q)
    setRangeType("quarter")
  }

  const handleApplyCustom = () => {
    if (!startDate || !endDate) {
      setAlert({
        open: true,
        message: "Please select both Start Date and End Date.",
        type: "error",
      })
      return
    }
    if (startDate > endDate) {
      setAlert({
        open: true,
        message: "Start Date cannot be after End Date.",
        type: "error",
      })
      return
    }
    setIsOpen(false)
  }

  useEffect(() => {
    if (startDate && endDate) {
      setFilterStartDate(dayjs(startDate).format("MM/DD/YYYY"))
      setFilterEndDate(dayjs(endDate).format("MM/DD/YYYY"))
    }
  }, [startDate, endDate])

  return (
    <header className="w-full bg-white border-b-2 shadow-sm z-50" style={{ borderColor: theme.palette.secondary.main }}>
      <div className="flex justify-start items-center gap-4 lg:px-6">
        <div className="flex justify items-center gap-8 grow">
          <div className="hidden xl:block">
            <div className="w-40 flex items-center h-12">
              <NavLink to={"/dashboard"}>
                <img src="/images/logo/360Pipe_logo.png" alt="360Pipe Logo" className="mt-3" />
              </NavLink>
            </div>
          </div>

          <div className="hidden xl:block">
            <Tabs tabsData={tabsData} selectedTab={selectedTab} handleChange={handleChangeTab} type="header" />
          </div>
        </div>

        <div className="w-full flex items-center justify-between gap-2 px-3 py-3 border-b border-gray-200 sm:gap-4 lg:justify-end lg:border-b-0 lg:px-0 lg:py-4">
          <div className="grow xl:hidden">
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

          {/* Date Range Dropdown (new UI) */}
          <div className="relative w-60">
            <button
              ref={triggerRef}
              type="button"
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white flex items-center justify-between text-sm hover:bg-gray-50 focus:outline-none"
              aria-haspopup="menu"
              aria-expanded={isOpen ? "true" : "false"}
              onClick={() => setIsOpen((s) => !s)}
            >
              <span className="text-gray-800">{rangeLabel}</span>
              <span className="text-gray-500">
                <CustomIcons iconName={"fa-solid fa-chevron-down"} css={"text-xs"} />
              </span>
            </button>

            {isOpen && (
              <div
                ref={popoverRef}
                className="absolute right-0 mt-2 z-30 w-[360px] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden"
                role="menu"
                aria-label="Date range menu"
              >
                {/* Header */}
                <div className="flex items-center justify-end px-3 py-2 border-b bg-white">
                  {/* <div className="text-sm font-medium text-gray-700">Date Range</div> */}
                  <button
                    type="button"
                    className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                    onClick={() => setIsOpen(false)}
                    title="Close"
                    aria-label="Close date range menu"
                  >
                    <CustomIcons iconName={"fa-solid fa-xmark"} css={"text-gray-700 text-lg"} />
                  </button>
                </div>

                {/* Options */}
                <div className="py-1">
                  {RANGE_TYPES.map((o) => {
                    const selected = rangeType === o.id
                    return (
                      <button
                        key={o.id}
                        type="button"
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${selected ? "bg-blue-50" : "bg-white"
                          }`}
                        role="menuitemradio"
                        aria-checked={selected ? "true" : "false"}
                        onClick={() => handleSelectRangeType(o.id)}
                      >
                        <span className={`${selected ? "text-blue-700 font-medium" : "text-gray-700"}`}>{o.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Quarter selector */}
                {rangeType === "quarter" && (
                  <div className="px-4 py-3 border-t bg-white">
                    <label className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-700">Quarter</span>
                      <select
                        className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none"
                        value={quarter}
                        onChange={(e) => handleQuarterChange(e.target.value)}
                      >
                        {QUARTERS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                {/* Dates (shown for ALL options) */}
                <div className="px-4 py-3 border-t bg-white">
                  <div className="grid grid-cols-2 gap-3">
                    <DatePickerComponent setValue={setValue} control={control} name="startDate" label="Start Date" />
                    <DatePickerComponent
                      setValue={setValue}
                      control={control}
                      name="endDate"
                      label="End Date"
                      minDate={watch("startDate")}
                    />
                  </div>

                  {/* {rangeType === "custom" && (
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button
                        type="button"
                        className="h-9 px-3 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none"
                        onClick={handleApplyCustom}
                      >
                        Apply
                      </button>
                    </div>
                  )} */}
                </div>
              </div>
            )}
          </div>

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

            <div className="z-50">
              <UserDropdown />
            </div>
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
})

const mapDispatchToProps = {
  setLoading,
  setAlert,
  setSyncCount,
  setSyncingPushStatus,
  setSyncingPullStatus,
  setLoadingMessage,
  setFilterStartDate,
  setFilterEndDate,
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader)