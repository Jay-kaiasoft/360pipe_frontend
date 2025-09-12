import { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toggleSidebar, toggleMobileSidebar } from "../../../redux/commonReducers/commonReducers"
import UserDropdown from "./userDropDown"

const AppHeader = () => {
  const { isMobileOpen } = useSelector((state) => state.common)
  const dispatch = useDispatch()

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      dispatch(toggleSidebar())
    } else {
      dispatch(toggleMobileSidebar())
    }
  }

  const inputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        {/* Left Section */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <div className="grow">
            <button
              className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg lg:h-11 lg:w-11"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? (
                // Cross Icon
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.22 7.28a.75.75 0 0 1 1.06-1.06L12 10.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L13.06 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L10.94 12 6.22 7.28Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                // Hamburger Icon
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
          <div>
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
