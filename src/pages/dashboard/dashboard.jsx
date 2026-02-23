import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom"; // added for portal
import { getDashboardData } from "../../service/customers/customersService";
import { connect } from "react-redux";

const StatCard = ({ title, children }) => {
    return (
        <div className={`flex flex-col items-center justify-center group ${title === "Pipeline" || title === "Meetings" ? "cursor-pointer" : ""}`}>
            <p className="mb-2 text-2xl font-semibold text-gray-900">{title}</p>

            <div className="h-36 w-[250px] rounded-2xl border border-gray-400 px-4 py-2 shadow-sm flex items-center justify-center">
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
    const [hoveredPipelineRow, setHoveredPipelineRow] = useState(null);
    const [hoveredPipelinePos, setHoveredPipelinePos] = useState(null);

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
        if (filterStartDate && filterEndDate) {
            handleGetDashboardData();
        }
    }, [filterStartDate, filterEndDate]);

    const ui = useMemo(() => {
        const totalContacts = parseInt(dashboardData?.totalContacts || 0);
        const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
        const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);

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
        const meetingData = dashboardData?.meetingData || [];

        return {
            totalContacts,
            totalMeetings,
            netNew,
            existing,
            totalPipeLine,
            totalClosedDealAmount,
            totalDealAmount,
            percentClosedDealAmount,
            pipeLineData,
            meetingData
        };
    }, [dashboardData]);

    // Handlers for pipeline row hover
    const handlePipelineRowMouseEnter = (row, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setHoveredPipelineRow(row);
        setHoveredPipelinePos({
            top: rect.top + window.scrollY,          // adjust for page scroll
            left: rect.left + rect.width + 10,       // show to the right of the row
        });
    };

    const handlePipelineRowMouseLeave = () => {
        setHoveredPipelineRow(null);
        setHoveredPipelinePos(null);
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center justify-center gap-10 py-10">
                <StatCard title="Net New Contacts">
                    <div className="text-5xl font-extrabold text-gray-900">{ui.totalContacts}</div>
                </StatCard>

                <StatCard title="Meetings">
                    <div className="flex w-full items-center justify-between">
                        <div className="text-5xl font-extrabold text-gray-900">{ui.totalMeetings}</div>

                        <div className="text-right text-sm font-semibold leading-5 text-gray-700">
                            <div className="text-[#0478DC]">
                                Net New: <span className="font-extrabold">{ui.netNew}</span>
                            </div>
                            <div>
                                Existing: <span className="font-extrabold">{ui.existing}</span>
                            </div>
                        </div>
                    </div>
                    {ui?.meetingData?.length > 0 && (
                        <div className="hidden group-hover:block h-40 w-96 overflow-y-auto absolute top-80 left-[450px] shadow-lg">
                            <div className="bg-[#2753AF] text-white w-full py-2 text-center font-bold">
                                <p>Accounts</p>
                            </div>
                            <div className="w-full bg-white p-3">
                                <div className="text-sm text-black">
                                    {ui.meetingData.map((item, index) => (
                                        <div key={index} className="truncate cursor-pointer py-1">
                                            {item.account_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </StatCard>

                <StatCard title="Pipeline">
                    <div className="text-5xl font-extrabold text-gray-900">
                        {ui.totalPipeLine ? `${moneyLabel(ui.totalPipeLine)}` : "$0"}
                    </div>
                    {ui?.pipeLineData?.length > 0 && (
                        <div className="hidden group-hover:block h-80 w-[33%] overflow-y-auto absolute top-80 left-[560px]">
                            <table className="border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#2753AF] text-white">
                                        <th className="px-4 py-1 text-left font-bold">Rep</th>
                                        <th className="px-4 py-1 text-left font-bold">Account</th>
                                        <th className="px-4 py-1 text-left font-bold w-40">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ui.pipeLineData.map((row, i) => (
                                        <tr
                                            key={row.contactId ?? i}
                                            className="odd:bg-white even:bg-gray-200 cursor-pointer relative"
                                            onMouseEnter={(e) => handlePipelineRowMouseEnter(row, e)}
                                            onMouseLeave={handlePipelineRowMouseLeave}
                                        >
                                            <td className="px-4 py-1">{row.created_by || '—'}</td>
                                            <td className="px-4 py-1">{row.account || '—'}</td>
                                            <td className="px-4 py-1">{moneyLabel(row.totalDealAmount) || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </StatCard>

                <StatCard title="Attainment">
                    <div className="flex flex-col items-center justify-center leading-tight">
                        <div className="text-5xl font-extrabold text-gray-900">
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

            {/* Portal for pipeline row opportunities popup */}
            {hoveredPipelineRow &&
                hoveredPipelinePos &&
                ReactDOM.createPortal(
                    <div
                        className="fixed bg-white shadow-lg rounded-lg border border-gray-200 z-50"
                        style={{
                            top: hoveredPipelinePos.top,
                            left: hoveredPipelinePos.left,
                            minWidth: '300px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                        }}
                    >                       
                        {hoveredPipelineRow?.opps?.length > 0 ? (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#2753AF] text-white">
                                        <th className="px-4 py-1 text-left w-80">Opportunity</th>
                                        <th className="px-4 py-1 text-left">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hoveredPipelineRow.opps.map((opp, idx) => (
                                        <tr key={idx} className="odd:bg-white even:bg-gray-200">
                                            <td className="px-4 py-1">{opp.name || '—'}</td>
                                            <td className="px-4 py-1">{moneyLabel(opp.dealAmount) || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-4 text-gray-500">No opportunities</div>
                        )}
                    </div>,
                    document.body
                )}
        </div>
    );
};

const mapStateToProps = (state) => ({
    filterStartDate: state.common.filterStartDate,
    filterEndDate: state.common.filterEndDate,
});

export default connect(mapStateToProps, null)(Dashboard);