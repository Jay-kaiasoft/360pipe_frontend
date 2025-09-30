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

                <span className="block mr-1 text-sm font-bold text-start min-w-28">
                    {userdata?.username ? userdata?.username : userdata?.name}<br />
                    <span className="capitalize">
                        {userdata?.rolename ? userdata?.rolename?.toLowerCase() : ""}
                    </span>
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
                        {/* {
                            !userdata?.subUser && (
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
                            )
                        } */}
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