import { useEffect, useMemo, useState } from "react";
import { getDashboardData } from "../../service/customers/customersService";

const StatCard = ({ title, children }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <p className="mb-2 text-xl font-semibold text-gray-900">{title}</p>

            <div className="h-36 w-[250px] rounded-2xl border border-gray-400    px-4 py-2 shadow-sm flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

const formatMoneyK = (num) => {
    const n = Number(num || 0);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return `${n}`;
};

const moneyLabel = (v) => `$${formatMoneyK(v)}`;

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);

    const handleGetDashboardData = async () => {
        try {
            const res = await getDashboardData();
            setDashboardData(res?.data?.result || null);
        } catch (e) {
            console.log("Error", e);
        }
    };

    useEffect(() => {
        document.title = "Dashboard - 360Pipe";
        handleGetDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ui = useMemo(() => {
        const totalContacts = Number(dashboardData?.totalContacts || 0);
        const totalMeetings = Number(dashboardData?.totalMeetings || 0);
        const totalPipeLine = Number(dashboardData?.totalPipeLine || 0);

        // If later you add these fields from backend, this UI will automatically show them:
        const netNew = Number(dashboardData?.netNewMeetings || 0);
        const existing = Number(dashboardData?.existingMeetings || 0);

        const totalClosedDealAmount =
            dashboardData?.totalClosedDealAmount != null ? Number(dashboardData.totalClosedDealAmount) : null;

        const totalDealAmount =
            dashboardData?.totalDealAmount != null ? Number(dashboardData.totalDealAmount) : null;

        const percentClosedDealAmount =
            totalDealAmount > 0 && totalClosedDealAmount != null
                ? ((totalClosedDealAmount / totalDealAmount) * 100).toFixed(2)
                : null;

        return {
            totalContacts,
            totalMeetings,
            netNew,
            existing,
            totalPipeLine,
            totalClosedDealAmount,
            totalDealAmount,
            percentClosedDealAmount
        };
    }, [dashboardData]);

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center justify-center gap-10 py-6">
                <StatCard title="Net New Contacts">
                    <div className="text-3xl font-extrabold text-gray-900">{ui.totalContacts}</div>
                </StatCard>

                <StatCard title="Meetings">
                    <div className="flex w-full items-center justify-between">
                        <div className="text-3xl font-extrabold text-gray-900">{ui.totalMeetings}</div>

                        <div className="text-right text-sm font-semibold leading-5 text-gray-700">
                            <div>
                                Net New: <span className="font-extrabold">{ui.netNew}</span>
                            </div>
                            <div>
                                Existing: <span className="font-extrabold">{ui.existing}</span>
                            </div>
                        </div>
                    </div>
                </StatCard>

                <StatCard title="Pipeline">
                    <div className="text-3xl font-extrabold text-gray-900">{ui.totalPipeLine ? `${moneyLabel(ui.totalPipeLine)}` : "$0"}</div>
                </StatCard>

                <StatCard title="Attainment">
                    <div className="flex flex-col items-center justify-center leading-tight">
                        <div className="text-3xl font-extrabold text-gray-900">
                            {ui.percentClosedDealAmount == null ? "0%" : `${ui.percentClosedDealAmount}%`}
                        </div>
                        <div className="text-md font-semibold text-gray-700">
                            {ui.totalClosedDealAmount != null && ui.totalDealAmount != null
                                ? `${moneyLabel(ui.totalClosedDealAmount)} / ${moneyLabel(ui.totalDealAmount)}`
                                : "No Data Available"}
                        </div>
                    </div>
                </StatCard>
            </div>
        </div>
    );
};

export default Dashboard;