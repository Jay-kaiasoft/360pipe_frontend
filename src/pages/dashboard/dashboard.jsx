import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { getDashboardData } from "../../service/customers/customersService";
import { connect } from "react-redux";
import CustomIcons from "../../components/common/icons/CustomIcons";

const StatCard = ({ title, icon, children, gradient }) => (
    <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] p-6 w-full min-h-[200px] max-w-[300px] flex flex-col group relative transition-all duration-300 hover:-translate-y-1 ${title === "Pipeline" || title === "Meetings" ? "cursor-pointer" : ""}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
                <div className="text-white text-xl">
                    <CustomIcons iconName={icon} />
                </div>
            </div>
            <h3 className="text-base font-semibold text-slate-600 tracking-tight">{title}</h3>
        </div>
        <div className="flex flex-col flex-1 w-full">
            {children}
        </div>
    </div>
);

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

    const handlePipelineRowMouseEnter = (row, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setHoveredPipelineRow(row);
        setHoveredPipelinePos({
            top: rect.top + window.scrollY,
            left: rect.left + rect.width + 10,
        });
    };

    const handlePipelineRowMouseLeave = () => {
        setHoveredPipelineRow(null);
        setHoveredPipelinePos(null);
    };

    return (
        <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-stretch justify-center gap-6">

                    <StatCard title="New Contacts" icon="fa-solid fa-user-plus" gradient="bg-gradient-to-br from-emerald-500 to-emerald-600">
                        <div className="mt-2">
                            <span className="text-6xl font-bold text-slate-800 tracking-tight">{ui.totalContacts}</span>
                        </div>
                    </StatCard>

                    <StatCard title="Meetings" icon="fa-solid fa-users-rectangle" gradient="bg-gradient-to-br from-blue-500 to-blue-600">
                        <div className="mt-2">
                            <div className="text-6xl font-bold text-slate-800 mb-4 tracking-tight">{ui.totalMeetings}</div>
                            <div className="space-y-2 w-full">
                                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                                        <span className="text-sm font-medium text-slate-600">Net New</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">{ui.netNew}</span>
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                        <span className="text-sm font-medium text-slate-600">Existing</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">{ui.existing}</span>
                                </div>
                            </div>
                        </div>

                        {ui?.meetingData?.length > 0 && (
                            <div className="hidden group-hover:block w-96 max-h-96 overflow-hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 shadow-2xl z-50 bg-white rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
                                    <p className="font-semibold">Accounts</p>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {ui.meetingData.map((item, index) => (
                                        <div key={index} className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0">
                                            {item.account_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </StatCard>

                    <StatCard title="Pipeline" icon="fa-solid fa-dollar-sign" gradient="bg-gradient-to-br from-cyan-500 to-cyan-600">
                        <div className="mt-2">
                            <span className="text-6xl font-bold text-slate-800 tracking-tight">
                                {ui.totalPipeLine ? moneyLabel(ui.totalPipeLine) : "$0"}
                            </span>
                        </div>

                        {ui?.pipeLineData?.length > 0 && (
                            <div className="hidden group-hover:block w-[450px] max-h-96 overflow-hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 shadow-2xl rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="overflow-hidden rounded-xl">
                                    <table className="w-full bg-white">
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Rep</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Account</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="max-h-80 overflow-y-auto">
                                            {ui.pipeLineData.map((row, i) => (
                                                <tr
                                                    key={row.contactId ?? i}
                                                    className="border-b border-slate-100 hover:bg-cyan-50/50 cursor-pointer transition-colors"
                                                    onMouseEnter={(e) => handlePipelineRowMouseEnter(row, e)}
                                                    onMouseLeave={handlePipelineRowMouseLeave}
                                                >
                                                    <td className="px-4 py-3 text-sm text-slate-700">{row.created_by || '—'}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{row.account || '—'}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{moneyLabel(row.totalDealAmount) || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </StatCard>

                    <StatCard title="Attainment" icon="fa-solid fa-bullseye" gradient="bg-gradient-to-br from-orange-500 to-orange-600">
                        <div className="mt-2 w-full">
                            <span className="text-6xl font-bold text-slate-800 tracking-tight">
                                {ui.percentClosedDealAmount == null ? "0%" : `${ui.percentClosedDealAmount}%`}
                            </span>
                            <div className="mt-4 w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-600">Progress</span>
                                    <span className="text-sm font-semibold text-slate-700">
                                        {ui.totalClosedDealAmount != null && ui.totalDealAmount != null
                                            ? `${moneyLabel(ui.totalClosedDealAmount)} / ${moneyLabel(ui.totalDealAmount)}`
                                            : "No Goal Set"}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                                        style={{ width: `${ui.percentClosedDealAmount || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </StatCard>
                </div>
            </div>

            {hoveredPipelineRow &&
                hoveredPipelinePos &&
                ReactDOM.createPortal(
                    <div
                        className="fixed bg-white shadow-2xl rounded-xl border border-slate-200 z-[60] animate-in fade-in slide-in-from-left-2 duration-200"
                        style={{
                            top: hoveredPipelinePos.top,
                            left: hoveredPipelinePos.left,
                            minWidth: '350px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                        }}
                    >
                        {hoveredPipelineRow?.opps?.length > 0 ? (
                            <div className="overflow-hidden rounded-xl">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0">
                                        <tr className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                                            <th className="px-4 py-3 text-left font-semibold text-sm">Opportunity</th>
                                            <th className="px-4 py-3 text-left font-semibold text-sm">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hoveredPipelineRow.opps.map((opp, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-cyan-50/50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-slate-700">{opp.name || '—'}</td>
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-800">{moneyLabel(opp.dealAmount) || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 text-slate-500 text-sm text-center">No opportunities available</div>
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