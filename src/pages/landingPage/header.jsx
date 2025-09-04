import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import CustomIcons from "../../components/common/icons/CustomIcons";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [navItems, setNavItems] = useState([]);

    // Track scroll
    useEffect(() => {
        if (location.pathname !== "/register") {
            setNavItems([
                {
                    title: "Home",
                    route: "/",
                    children: [
                        "SEO Agency",
                        "IT Services",
                        "Cyber Security",
                        "Help Desk SaaS",
                        "Data Analytics",
                        "Cloud and Devops",
                    ],
                },
                { title: "Company", children: ["About Us", "Careers", "Partners"] },
                { title: "Services", children: ["Web Development", "App Development"] },
                { title: "Casestudy", children: ["Case 1", "Case 2"] },
                { title: "Blog", children: ["Latest Posts", "Categories"] },
                { title: "Pricing", route: "/pricing" },
                { title: "Contact", route: "" },
            ])
        } else {
            setNavItems([])
        }

        const handleScroll = () => {
            if (window.scrollY > 150) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`w-full top-0 left-0 z-50 transition-all duration-700 ${isScrolled
                ? "fixed bg-white shadow-md transition-all duration-700 "
                : "absolute bg-transparent transition-all duration-700 "
                }
                ${location.pathname !== "/register" ? "" : "py-2 bg-white shadow"}
                `}
        >
            <div className="flex items-center justify-between 4k:justify-center 4k:gap-32 px-5 lg:px-20 py-4">
                <div className="text-2xl font-bold text-blue-600">
                    <NavLink to={'/'}>
                        360Pipe
                    </NavLink>
                </div>

                <nav className="hidden xl:flex space-x-6 text-gray-800 font-medium ">
                    {navItems?.map((item, idx) => (
                        <div key={idx} className="relative group">
                            <NavLink
                                to={item.route}
                                className={`px-3 py-1 rounded-full transition-all duration-300 ${item.title === "Home" && !isScrolled
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : isScrolled
                                        ? "hover:text-blue-600"
                                        : "text-black hover:text-blue-700 hover:bg-white hover:shadow-sm"
                                    }`}
                            >
                                {item.title}
                                {item.children && <span className="ml-1">+</span>}
                            </NavLink>

                            {/* Dropdown for desktop
                            {item.children && (
                                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                                    <div className="py-1">
                                        {item.children.map((child, cidx) => (
                                            <NavLink
                                                key={cidx}
                                                to="#"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                {child}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        </div>
                    ))}
                </nav>

                {/* Desktop Buttons */}
                {
                    location.pathname !== "/register" && (
                        <div className="hidden xl:flex space-x-3">
                            <button onClick={() => navigate("/pricing")} className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition">
                                Sign Up
                            </button>
                            <button onClick={() => navigate("/login")} className='px-5 py-2 rounded-md font-semibold transition bg-yellow-400 text-gray-900 hover:bg-yellow-500'>
                                Sign In
                            </button>
                        </div>
                    )
                }

                {/* Mobile Toggle */}
                {
                    location.pathname !== "/register" && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="xl:hidden transition-transform duration-300"
                        >
                            <CustomIcons
                                iconName={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
                                css={`cursor-pointer text-2xl transform transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"
                                    } ${isScrolled ? "text-gray-800" : "text-black"}`}
                            />
                        </button>
                    )
                }
            </div>

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 p-5 overflow-y-auto transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <div className="text-2xl font-bold text-blue-600">360Pipe</div>
                    <button onClick={() => setIsOpen(false)}>
                        <CustomIcons
                            iconName={"fa-solid fa-xmark"}
                            css="cursor-pointer text-2xl text-gray-800"
                        />
                    </button>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item, idx) => (
                        <div key={idx}>
                            <NavLink
                                to={item.route}
                                className="flex justify-between items-center w-full px-2 py-2 text-left text-gray-800 font-semibold hover:bg-gray-100 rounded-md"
                                onClick={() =>
                                    setOpenMenu(openMenu === idx ? null : idx)
                                }
                            >
                                {item.title}
                                {item.children && (
                                    <CustomIcons
                                        iconName={
                                            openMenu === idx
                                                ? "fa-solid fa-chevron-up"
                                                : "fa-solid fa-chevron-down"
                                        }
                                        css="text-sm transition-transform duration-300"
                                    />
                                )}
                            </NavLink>
                            {openMenu === idx && item.children && (
                                <div className="ml-4 space-y-1 animate-fadeIn">
                                    {item.children.map((child, cidx) => (
                                        <NavLink
                                            key={cidx}
                                            to={child.route}
                                            className="block px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md text-sm"
                                        >
                                            {child}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;