import { useEffect, useMemo, useState } from "react";
import { getDashboardData } from "../../service/customers/customersService";
import { connect } from "react-redux";

const StatCard = ({ title, children }) => {
    return (
        <div className={`flex flex-col items-center justify-center group ${title === "Pipeline" ? "cursor-pointer" : ""}`}>
            <p className="mb-2 text-xl font-semibold text-gray-900">{title}</p>

            <div className="h-36 w-[250px] rounded-2xl border border-gray-400    px-4 py-2 shadow-sm flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

const formatMoneyK = (num) => {
    const n = parseInt(num || 0);
    if (n >= 1_000_000) return `${parseInt(n / 1_000_000)}M`;
    if (n >= 1_000) return `${parseInt(Math.round(n / 1_000))}K`;
    return `${n}`;
};

const moneyLabel = (v) => `$${formatMoneyK(v)}`;

const Dashboard = ({ filterStartDate, filterEndDate }) => {
    const [dashboardData, setDashboardData] = useState(null);

    const handleGetDashboardData = async () => {
        try {
            const res = await getDashboardData({ startDate: filterStartDate, endDate: filterEndDate });
            setDashboardData(res?.data?.result || null);
        } catch (e) {
            console.log("Error", e);
        }
    };

    useEffect(() => {
        document.title = "Dashboard - 360Pipe";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (filterStartDate && filterEndDate) {
            handleGetDashboardData();
        }
    }, [filterStartDate, filterEndDate])

    const ui = useMemo(() => {
        const totalContacts = parseInt(dashboardData?.totalContacts || 0);
        const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
        const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);

        // If later you add these fields from backend, this UI will automatically show them:
        const netNew = parseInt(dashboardData?.totalNewMeetings || 0);
        const existing = parseInt(dashboardData?.totalOldMeetings || 0);

        const totalClosedDealAmount =
            dashboardData?.totalClosedDealAmount != null ? parseInt(dashboardData.totalClosedDealAmount) : null;

        const totalDealAmount =
            dashboardData?.totalDealAmount != null ? parseInt(dashboardData.totalDealAmount) : null;

        const percentClosedDealAmount =
            totalDealAmount > 0 && totalClosedDealAmount != null
                ? parseInt(((totalClosedDealAmount / totalDealAmount) * 100))
                : null;

        const pipeLineData = dashboardData?.pipeLineData || [];
        return {
            totalContacts,
            totalMeetings,
            netNew,
            existing,
            totalPipeLine,
            totalClosedDealAmount,
            totalDealAmount,
            percentClosedDealAmount,
            pipeLineData
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
                    {
                        ui?.pipeLineData?.length > 0 && (
                            <div className="hidden group-hover:block h-80 w-[33%] overflow-y-auto absolute top-72 left-[480px]">
                                <table className="border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-[#0478DC] text-white">
                                            <th className="px-4 py-1 text-left text-sm font-semibold">Rep</th>
                                            <th className="px-4 py-1 text-left text-sm font-semibold">Account</th>
                                            <th className="px-4 py-1 text-left text-sm font-semibold w-40">Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {ui.pipeLineData?.map((row, i) => (
                                            <tr key={row.contactId ?? i} className="odd:bg-white even:bg-gray-200">
                                                <td className="px-4 py-1 text-sm">
                                                    {row.created_by || '—'}
                                                </td>
                                                <td className="px-4 py-1 text-sm">
                                                    {row.name || '—'}
                                                </td>
                                                <td className="px-4 py-1 text-sm">
                                                    {moneyLabel(row.dealAmount) || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
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

const mapStateToProps = (state) => ({
    filterStartDate: state.common.filterStartDate,
    filterEndDate: state.common.filterEndDate,
})

export default connect(mapStateToProps, null)(Dashboard)