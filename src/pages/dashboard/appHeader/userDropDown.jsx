import { useState, useRef, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { getUserDetails } from "../../../utils/getUserDetails";
import Cookies from 'js-cookie';

import UserIcon from "../../../assets/svgs/user-alt.svg"
import CustomIcons from "../../../components/common/icons/CustomIcons"
import AlertDialog from "../../../components/common/alertDialog/alertDialog";

export default function UserDropdown() {
    const userdata = getUserDetails();
    const navigate = useNavigate();

    const [logOutDialog, setLogOutDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    function toggleDropdown() {
        setIsOpen(!isOpen)
    }

    function closeDropdown() {
        setIsOpen(false)
    }

    const handleLogOut = () => {
        closeDropdown();
        Cookies.remove('authToken');
        navigate('/login');
        localStorage.removeItem("userInfo");
    }
    const handleOpenLogOutDialog = () => {
        setLogOutDialog({ open: true, title: 'Log Out', message: 'Are you sure! Do you want to log out?', actionButtonText: 'yes' });
    }

    const handleCloseLogOutDialog = () => {
        setLogOutDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center text-gray-700 dropdown-toggle"
            >
                <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
                    <img src={UserIcon} alt="User" />
                </span>

                <span className="block mr-1 text-sm font-medium text-start min-w-10">
                    {userdata?.username ? userdata?.username : userdata?.name}<br />
                </span>
                <svg
                    className={`stroke-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                    width="18"
                    height="20"
                    viewBox="0 0 18 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-4 flex w-64 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
                    {/* User Info */}
                    <div className="pb-3 border-b border-gray-200">
                        <span className="block text-sm font-medium text-gray-700">
                            {userdata?.username ? userdata?.username : userdata?.name}
                        </span>
                        <span className="block mt-1 text-xs text-gray-500">
                            {userdata?.email ? userdata?.email : ""}
                        </span>
                    </div>

                    {/* Menu Items */}
                    <ul className="flex flex-col gap-1 py-3 border-b border-gray-200">
                        <li>
                            <NavLink
                                to="/dashboard/profile"
                                onClick={closeDropdown}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
                            >
                                <CustomIcons iconName="fa-solid fa-circle-user" css={"text-lg text-gray-500 group-hover:text-gray-700"} />
                                Edit profile
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/dashboard/manageusers"
                                onClick={closeDropdown}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
                            >
                                <CustomIcons iconName="fa-solid fa-user" css={"text-lg text-gray-500 group-hover:text-gray-700"} />
                                Manage Users
                            </NavLink>
                        </li>
                        {/* <li>
                            <NavLink
                                to="/account-settings"
                                onClick={closeDropdown}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
                            >
                                <CustomIcons iconName="fa-solid fa-gear" css={"text-lg text-gray-500 group-hover:text-gray-700"} />
                                Account settings
                            </NavLink>
                        </li> */}
                        {/* <li>
                            <NavLink
                                to="/support"
                                onClick={closeDropdown}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
                            >
                                <svg
                                    className="text-gray-500 group-hover:text-gray-700"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11.0991 7.52507C11.0991 8.02213 11.5021 8.42507 11.9991 8.42507H12.0001C12.4972 8.42507 12.9001 8.02213 12.9001 7.52507C12.9001 7.02802 12.4972 6.62507 12.0001 6.62507H11.9991C11.5021 6.62507 11.0991 7.02802 11.0991 7.52507ZM12.0001 17.3714C11.5859 17.3714 11.2501 17.0356 11.2501 16.6214V10.9449C11.2501 10.5307 11.5859 10.1949 12.0001 10.1949C12.4143 10.1949 12.7501 10.5307 12.7501 10.9449V16.6214C12.7501 17.0356 12.4143 17.3714 12.0001 17.3714Z"
                                    />
                                </svg>
                                Support
                            </NavLink>
                        </li> */}
                    </ul>

                    {/* Sign Out Button */}
                    <div
                        onClick={handleOpenLogOutDialog}
                        className="cursor-pointer flex items-center gap-3 px-3 py-2 mt-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
                    >
                        <CustomIcons iconName="fa-solid fa-arrow-right-from-bracket" css={"text-lg text-gray-500 group-hover:text-gray-700"} />
                        Sign out
                    </div>
                </div>
            )}
            <AlertDialog
                open={logOutDialog.open}
                title={logOutDialog.title}
                message={logOutDialog.message}
                actionButtonText={logOutDialog.actionButtonText}
                handleAction={() => handleLogOut()}
                handleClose={() => handleCloseLogOutDialog()}
            />
        </div>
    )
}