import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getDashboardData } from "../../service/customers/customersService";

const DashboardCard = ({ title, subtitle, value, label, stats, buttonText }) => {
    return (
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center w-full md:w-1/3">
            {/* Title & Subtitle */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>

            {/* Circle Value */}
            <div className="relative flex items-center justify-center mb-4">
                <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-semibold text-gray-800">{value}</p>
                        <p className="text-sm text-gray-500">{label}</p>
                    </div>
                </div>
            </div>

            {/* Stats
            <div className="space-y-2 mb-4">
                {stats.map((stat, index) => (
                    <div key={index} className="flex items-center text-sm">
                        <span
                            className={`w-3 h-3 rounded-full mr-2`}
                            style={{ backgroundColor: stat.color }}
                        ></span>
                        <span className="text-gray-700">{stat.text}</span>
                    </div>
                ))}
            </div> */}

            {/* Button */}
            <NavLink to={`/dashboard/${title.toLowerCase()}`}>
                <button className="border border-gray-400 text-sm px-4 py-2 rounded-full hover:bg-gray-100">
                    {buttonText}
                </button>
            </NavLink>
        </div>
    );
};

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);

    const handleGetDashboardData = async () => {
        const res = await getDashboardData();
        setDashboardData(res.data?.result);
    }

    useEffect(() => {
        document.title = "Dashboard - 360Pipe"
        handleGetDashboardData();
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Close Deals */}
            <DashboardCard
                title="Opportunities"
                subtitle="Opportunities owned by me"
                value={dashboardData?.opportunityCount || "0"}
                label="Opportunities"
                buttonText="View Opportunities"
            />

            {/* Plan My Accounts */}
            <DashboardCard
                title="Accounts"
                subtitle="Accounts owned by me"
                value={dashboardData?.accountCount || "0"}
                label="Accounts"
                buttonText="View Accounts"
            // stats={[
            //     { text: "0 Upcoming Activity", color: "#34D399" },
            //     { text: "0 Past Activity", color: "#60A5FA" },
            //     { text: "0 No Activity", color: "#FCA5A5" },
            // ]}
            />

            {/* Grow Relationships */}
            <DashboardCard
                title="Contacts"
                subtitle="Contacts owned by me"
                value={dashboardData?.contactCount || "0"}   
                label="Contacts"
                buttonText="View Contacts"
            // stats={[
            //     { text: "0 Upcoming Activity", color: "#34D399" },
            //     { text: "0 Past Activity", color: "#60A5FA" },
            //     { text: "5 No Activity", color: "#FCA5A5" },
            // ]}
            />
        </div>
    );
};

export default Dashboard;