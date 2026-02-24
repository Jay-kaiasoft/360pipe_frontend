// My code
// import { useEffect, useMemo, useState } from "react";
// import ReactDOM from "react-dom";
// import { getDashboardData } from "../../service/customers/customersService";
// import { connect } from "react-redux";
// import CustomIcons from "../../components/common/icons/CustomIcons";

// // 1. Updated StatCard for the soft border, shadow, and centered flex layout
// const StatCard = ({ title, icon, children }) => (
//     <div className={`bg-white rounded-[14px] border border-blue-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-5 w-full min-h-[180px] max-w-[280px] flex flex-col group relative ${title === "Pipeline" || title === "Meetings" ? "cursor-pointer" : ""}`}>
//         <div className="flex justify-center items-center gap-2 mb-3">
//             <div className="text-[#3b66d4]">
//                 <CustomIcons iconName={icon} />
//             </div>
//             <h3 className="text-lg font-bold text-slate-700 text-center">{title}</h3>
//         </div>
//         <div className="flex flex-col items-center justify-center flex-1 w-full">
//             {children}
//         </div>
//     </div>
// );

// const formatMoneyK = (num) => {
//     const n = parseInt(num || 0);
//     if (n >= 1_000_000) return `${parseInt(n / 1_000_000)}M`;
//     if (n >= 1_000) return `${parseInt(Math.round(n / 1_000))}K`;
//     return `${n}`;
// };

// const moneyLabel = (v) => `$${formatMoneyK(v)}`;

// const Dashboard = ({ filterStartDate, filterEndDate }) => {
//     const [dashboardData, setDashboardData] = useState(null);
//     const [hoveredPipelineRow, setHoveredPipelineRow] = useState(null);
//     const [hoveredPipelinePos, setHoveredPipelinePos] = useState(null);

//     const handleGetDashboardData = async () => {
//         try {
//             const res = await getDashboardData({ startDate: filterStartDate, endDate: filterEndDate });
//             setDashboardData(res?.data?.result || null);
//         } catch (e) {
//             console.log("Error", e);
//         }
//     };

//     useEffect(() => {
//         document.title = "Dashboard - 360Pipe";
//         if (filterStartDate && filterEndDate) {
//             handleGetDashboardData();
//         }
//     }, [filterStartDate, filterEndDate]);

//     const ui = useMemo(() => {
//         const totalContacts = parseInt(dashboardData?.totalContacts || 0);
//         const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
//         const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);

//         const netNew = parseInt(dashboardData?.totalNewMeetings || 0);
//         const existing = parseInt(dashboardData?.totalOldMeetings || 0);

//         const totalClosedDealAmount =
//             dashboardData?.totalClosedDealAmount != null ? parseInt(dashboardData.totalClosedDealAmount) : null;

//         const totalDealAmount =
//             dashboardData?.totalDealAmount != null ? parseInt(dashboardData.totalDealAmount) : null;

//         const percentClosedDealAmount =
//             totalDealAmount > 0 && totalClosedDealAmount != null
//                 ? parseInt(((totalClosedDealAmount / totalDealAmount) * 100))
//                 : null;

//         const pipeLineData = dashboardData?.pipeLineData || [];
//         const meetingData = dashboardData?.meetingData || [];

//         return {
//             totalContacts,
//             totalMeetings,
//             netNew,
//             existing,
//             totalPipeLine,
//             totalClosedDealAmount,
//             totalDealAmount,
//             percentClosedDealAmount,
//             pipeLineData,
//             meetingData
//         };
//     }, [dashboardData]);

//     const handlePipelineRowMouseEnter = (row, event) => {
//         const rect = event.currentTarget.getBoundingClientRect();
//         setHoveredPipelineRow(row);
//         setHoveredPipelinePos({
//             top: rect.top + window.scrollY,
//             left: rect.left + rect.width + 10,
//         });
//     };

//     const handlePipelineRowMouseLeave = () => {
//         setHoveredPipelineRow(null);
//         setHoveredPipelinePos(null);
//     };

//     return (
//         <div className="w-full bg-[#f8faff]">
//             <div className="flex items-center justify-center gap-6 py-10 flex-wrap">
                
//                 {/* --- New Contacts --- */}
//                 <StatCard title="New Contacts" icon="fa-solid fa-user-plus">
//                     <span className="text-5xl font-bold text-[#2b354e]">{ui.totalContacts}</span>
//                 </StatCard>

//                 {/* --- Meetings --- */}
//                 <StatCard title="Meetings" icon="fa-solid fa-users-rectangle">
//                     <div className="text-5xl font-bold text-[#2b354e] mb-2">{ui.totalMeetings}</div>
//                     <div className="flex flex-col gap-1 w-full max-w-[120px]">
//                         <div className="text-sm font-semibold flex items-center text-slate-500">
//                             <span className="w-2 h-2 rounded-full bg-[#9bb2f3] mr-2"></span> Net New: {ui.netNew}
//                         </div>
//                         <div className="text-sm font-semibold flex items-center text-slate-500">
//                             <span className="w-2 h-2 rounded-full bg-[#7a95ec] mr-2"></span> Existing: {ui.existing}
//                         </div>
//                     </div>

//                     {ui?.meetingData?.length > 0 && (
//                         <div className="hidden group-hover:block h-40 w-96 overflow-y-auto absolute top-40 left-0 shadow-lg z-50 bg-white rounded-md border border-gray-100">
//                             <div className="bg-[#2753AF] text-white w-full py-2 text-center font-bold">
//                                 <p>Accounts</p>
//                             </div>
//                             <div className="w-full p-3 text-sm text-black">
//                                 {ui.meetingData.map((item, index) => (
//                                     <div key={index} className="truncate cursor-pointer py-1 hover:bg-gray-50">
//                                         {item.account_name}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </StatCard>

//                 {/* --- Pipeline --- */}
//                 <StatCard title="Pipeline" icon="fa-solid fa-dollar-sign">
//                     <span className="text-5xl font-bold text-[#2b354e] mb-1">
//                         {ui.totalPipeLine ? `${moneyLabel(ui.totalPipeLine)}` : "$0"}
//                     </span>

//                     {ui?.pipeLineData?.length > 0 && (
//                         <div className="hidden group-hover:block h-80 w-[400px] overflow-y-auto absolute top-40 left-0 z-50 shadow-lg border border-gray-100 rounded-md">
//                             <table className="border-collapse w-full bg-white">
//                                 <thead className="sticky top-0 z-10">
//                                     <tr className="bg-[#2753AF] text-white">
//                                         <th className="px-4 py-2 text-left font-bold">Rep</th>
//                                         <th className="px-4 py-2 text-left font-bold">Account</th>
//                                         <th className="px-4 py-2 text-left font-bold">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {ui.pipeLineData.map((row, i) => (
//                                         <tr
//                                             key={row.contactId ?? i}
//                                             className="odd:bg-white even:bg-gray-200 cursor-pointer hover:bg-slate-200"
//                                             onMouseEnter={(e) => handlePipelineRowMouseEnter(row, e)}
//                                             onMouseLeave={handlePipelineRowMouseLeave}
//                                         >
//                                             <td className="px-4 py-2 text-sm text-slate-600">{row.created_by || '—'}</td>
//                                             <td className="px-4 py-2 text-sm text-slate-600">{row.account || '—'}</td>
//                                             <td className="px-4 py-2 text-sm text-slate-600">{moneyLabel(row.totalDealAmount) || '—'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </StatCard>

//                 {/* --- Attainment --- */}
//                 <StatCard title="Attainment" icon="fa-solid fa-bullseye">
//                     <span className="text-5xl font-bold text-[#2b354e] mb-1">
//                         {ui.percentClosedDealAmount == null ? "0%" : `${ui.percentClosedDealAmount}%`}
//                     </span>
//                     <span className="text-lg font-medium text-slate-500 mb-2">
//                         {ui.totalClosedDealAmount != null && ui.totalDealAmount != null
//                             ? `${moneyLabel(ui.totalClosedDealAmount)} of ${moneyLabel(ui.totalDealAmount)} Goal`
//                             : "No Data Available"}
//                     </span>
//                     {/* Progress Bar */}
//                     <div className="w-[85%] bg-[#dce4f8] rounded-full h-[6px] mt-1">
//                         <div
//                             className="bg-[#3b66d4] h-[6px] rounded-full"
//                             style={{ width: `${ui.percentClosedDealAmount || 0}%` }}
//                         ></div>
//                     </div>
//                 </StatCard>
//             </div>

//             {/* Portal for pipeline row opportunities popup */}
//             {hoveredPipelineRow &&
//                 hoveredPipelinePos &&
//                 ReactDOM.createPortal(
//                     <div
//                         className="fixed bg-white shadow-xl rounded-lg border border-gray-200 z-[60]"
//                         style={{
//                             top: hoveredPipelinePos.top,
//                             left: hoveredPipelinePos.left,
//                             minWidth: '300px',
//                             maxHeight: '400px',
//                             overflowY: 'auto',
//                         }}
//                     >
//                         {hoveredPipelineRow?.opps?.length > 0 ? (
//                             <table className="w-full border-collapse">
//                                 <thead>
//                                     <tr className="bg-[#2753AF] text-white">
//                                         <th className="px-4 py-2 text-left w-80">Opportunity</th>
//                                         <th className="px-4 py-2 text-left">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {hoveredPipelineRow.opps.map((opp, idx) => (
//                                         <tr key={idx} className="odd:bg-white even:bg-gray-200 text-sm">
//                                             <td className="px-4 py-2 text-slate-700">{opp.name || '—'}</td>
//                                             <td className="px-4 py-2 text-slate-700">{moneyLabel(opp.dealAmount) || '—'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         ) : (
//                             <div className="p-4 text-gray-500 text-sm">No opportunities</div>
//                         )}
//                     </div>,
//                     document.body
//                 )}
//         </div>
//     );
// };

// const mapStateToProps = (state) => ({
//     filterStartDate: state.common.filterStartDate,
//     filterEndDate: state.common.filterEndDate,
// });

// export default connect(mapStateToProps, null)(Dashboard);


// Gemini code
// import { useEffect, useMemo, useState } from "react";
// import ReactDOM from "react-dom";
// import { getDashboardData } from "../../service/customers/customersService";
// import { connect } from "react-redux";
// import CustomIcons from "../../components/common/icons/CustomIcons";

// // Updated StatCard: More whitespace, subtle borders, and smooth transitions
// const StatCard = ({ title, icon, children, className = "", onClick }) => (
//     <div 
//         onClick={onClick}
//         className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 p-6 flex flex-col group relative overflow-hidden ${className}`}
//     >
//         <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//                 <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
//                     <CustomIcons iconName={icon} />
//                 </div>
//                 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
//             </div>
//         </div>
//         <div className="flex-1 flex flex-col">
//             {children}
//         </div>
//     </div>
// );

// const formatMoneyK = (num) => {
//     const n = parseInt(num || 0);
//     if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
//     if (n >= 1_000) return `${parseInt(Math.round(n / 1_000))}K`;
//     return `${n}`;
// };

// const moneyLabel = (v) => `$${formatMoneyK(v)}`;

// const Dashboard = ({ filterStartDate, filterEndDate }) => {
//     const [dashboardData, setDashboardData] = useState(null);
//     const [hoveredPipelineRow, setHoveredPipelineRow] = useState(null);
//     const [hoveredPipelinePos, setHoveredPipelinePos] = useState(null);

//     const handleGetDashboardData = async () => {
//         try {
//             const res = await getDashboardData({ startDate: filterStartDate, endDate: filterEndDate });
//             setDashboardData(res?.data?.result || null);
//         } catch (e) {
//             console.log("Error", e);
//         }
//     };

//     useEffect(() => {
//         document.title = "Insights - 360Pipe";
//         if (filterStartDate && filterEndDate) {
//             handleGetDashboardData();
//         }
//     }, [filterStartDate, filterEndDate]);

//     const ui = useMemo(() => {
//         // ... (Logic remains the same for data processing)
//         const totalContacts = parseInt(dashboardData?.totalContacts || 0);
//         const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
//         const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);
//         const netNew = parseInt(dashboardData?.totalNewMeetings || 0);
//         const existing = parseInt(dashboardData?.totalOldMeetings || 0);
//         const totalClosedDealAmount = dashboardData?.totalClosedDealAmount != null ? parseInt(dashboardData.totalClosedDealAmount) : null;
//         const totalDealAmount = dashboardData?.totalDealAmount != null ? parseInt(dashboardData.totalDealAmount) : null;
//         const percentClosedDealAmount = totalDealAmount > 0 && totalClosedDealAmount != null ? parseInt(((totalClosedDealAmount / totalDealAmount) * 100)) : null;
        
//         return {
//             totalContacts, totalMeetings, netNew, existing, totalPipeLine,
//             totalClosedDealAmount, totalDealAmount, percentClosedDealAmount,
//             pipeLineData: dashboardData?.pipeLineData || [],
//             meetingData: dashboardData?.meetingData || []
//         };
//     }, [dashboardData]);

//     return (
//         <div className="w-full min-h-screen bg-[#fcfdff] p-8">
//             <header className="mb-8 max-w-7xl mx-auto">
//                 <h1 className="text-2xl font-bold text-slate-800">Performance Overview</h1>
//                 <p className="text-slate-500 text-sm">Real-time data for the selected period</p>
//             </header>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                
//                 {/* --- New Contacts --- */}
//                 <StatCard title="New Contacts" icon="fa-solid fa-user-plus">
//                     <div className="mt-auto">
//                         <span className="text-4xl font-bold text-slate-900 leading-none">{ui.totalContacts}</span>
//                         <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
//                             ↑ Growth phase
//                         </p>
//                     </div>
//                 </StatCard>

//                 {/* --- Meetings --- */}
//                 <StatCard title="Meetings" icon="fa-solid fa-users-rectangle">
//                     <div className="flex items-end justify-between mt-auto">
//                         <span className="text-4xl font-bold text-slate-900 leading-none">{ui.totalMeetings}</span>
//                         <div className="flex flex-col text-[11px] font-bold text-slate-400 space-y-1">
//                             <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> NEW {ui.netNew}</span>
//                             <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> EXT {ui.existing}</span>
//                         </div>
//                     </div>
//                 </StatCard>

//                 {/* --- Pipeline (Hero Style) --- */}
//                 <StatCard title="Pipeline" icon="fa-solid fa-dollar-sign" className="lg:col-span-1 bg-gradient-to-br from-white to-indigo-50/30">
//                     <div className="mt-auto">
//                         <span className="text-4xl font-bold text-slate-900 leading-none">
//                             {ui.totalPipeLine ? moneyLabel(ui.totalPipeLine) : "$0"}
//                         </span>
//                         <div className="mt-4 flex items-center gap-2">
//                              <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
//                                 <div className="h-full bg-indigo-500 w-2/3 rounded-full" />
//                              </div>
//                              <span className="text-[10px] text-slate-400 font-bold uppercase">Weighted</span>
//                         </div>
//                     </div>
//                 </StatCard>

//                 {/* --- Attainment --- */}
//                 <StatCard title="Attainment" icon="fa-solid fa-bullseye">
//                     <div className="mt-auto">
//                         <div className="flex justify-between items-end mb-2">
//                             <span className="text-4xl font-bold text-slate-900 leading-none">
//                                 {ui.percentClosedDealAmount ?? 0}%
//                             </span>
//                             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
//                                 Goal: {moneyLabel(ui.totalDealAmount)}
//                             </span>
//                         </div>
//                         <div className="w-full bg-slate-100 rounded-full h-2">
//                             <div
//                                 className="bg-indigo-600 h-2 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)] transition-all duration-1000"
//                                 style={{ width: `${ui.percentClosedDealAmount || 0}%` }}
//                             />
//                         </div>
//                     </div>
//                 </StatCard>
//             </div>

//             {/* Hint: Modern layouts often put the drill-down tables in a separate section below the cards or in a Modal */}
//             <div className="mt-12 max-w-7xl mx-auto">
//                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//                     <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
//                         <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Recent Pipeline Activity</h2>
//                         <button className="text-indigo-600 text-xs font-bold hover:underline">View All Leads</button>
//                     </div>
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
//                                 <th className="px-6 py-4">Rep</th>
//                                 <th className="px-6 py-4">Account</th>
//                                 <th className="px-6 py-4 text-right">Amount</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-50">
//                             {ui.pipeLineData.slice(0, 5).map((row, i) => (
//                                 <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
//                                     <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.created_by || '—'}</td>
//                                     <td className="px-6 py-4 text-sm text-slate-500">{row.account || '—'}</td>
//                                     <td className="px-6 py-4 text-sm font-bold text-slate-700 text-right">{moneyLabel(row.totalDealAmount)}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const mapStateToProps = (state) => ({
//     filterStartDate: state.common.filterStartDate,
//     filterEndDate: state.common.filterEndDate,
// });

// export default connect(mapStateToProps, null)(Dashboard);





// Black-Box code

// import { useEffect, useMemo, useState } from "react";
// import ReactDOM from "react-dom";
// import { getDashboardData } from "../../service/customers/customersService";
// import { connect } from "react-redux";
// import CustomIcons from "../../components/common/icons/CustomIcons";

// // Modern StatCard with glassmorphism, animations, and enhanced UI
// const StatCard = ({ title, icon, children, delay = 0, iconBgColor = "bg-gradient-to-br from-blue-500 to-indigo-600" }) => (
//     <div 
//         className="group relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.08)] p-6 w-full min-h-[200px] max-w-[300px] flex flex-col overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1"
//         style={{ animationDelay: `${delay}ms` }}
//     >
//         {/* Decorative gradient orb */}
//         <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        
//         {/* Header with icon */}
//         <div className="flex items-center gap-3 mb-4 relative z-10">
//             <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center shadow-lg`}>
//                 <CustomIcons iconName={icon} css="text-white text-lg" />
//             </div>
//             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
//         </div>
        
//         {/* Content */}
//         <div className="flex flex-col items-start justify-center flex-1 w-full relative z-10">
//             {children}
//         </div>
        
//         {/* Bottom accent line */}
//         <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//     </div>
// );

// const formatMoneyK = (num) => {
//     const n = parseInt(num || 0);
//     if (n >= 1_000_000) return `${parseInt(n / 1_000_000)}M`;
//     if (n >= 1_000) return `${parseInt(Math.round(n / 1_000))}K`;
//     return `${n}`;
// };

// const moneyLabel = (v) => `$${formatMoneyK(v)}`;

// // Animated counter component
// const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
//     const [displayValue, setDisplayValue] = useState(0);
    
//     useEffect(() => {
//         const duration = 1500;
//         const steps = 60;
//         const increment = parseInt(value) / steps;
//         let current = 0;
        
//         const timer = setInterval(() => {
//             current += increment;
//             if (current >= parseInt(value)) {
//                 setDisplayValue(parseInt(value));
//                 clearInterval(timer);
//             } else {
//                 setDisplayValue(Math.floor(current));
//             }
//         }, duration / steps);
        
//         return () => clearInterval(timer);
//     }, [value]);
    
//     return (
//         <span className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
//             {prefix}{formatMoneyK(displayValue)}{suffix}
//         </span>
//     );
// };

// // Modern Progress Bar with gradient and animation
// const ModernProgressBar = ({ percentage, showLabel = true }) => {
//     const clampedPercent = Math.min(Math.max(percentage || 0, 0), 100);
    
//     return (
//         <div className="w-full">
//             {showLabel && (
//                 <div className="flex justify-between items-center mb-2">
//                     <span className="text-sm font-medium text-slate-500">Progress</span>
//                     <span className="text-sm font-bold text-indigo-600">{clampedPercent}%</span>
//                 </div>
//             )}
//             <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
//                 <div 
//                     className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
//                     style={{ width: `${clampedPercent}%` }}
//                 >
//                     <div className="absolute top-0 right-0 w-full h-full bg-white/30 animate-pulse"></div>
//                 </div>
//                 {/* Shine effect */}
//                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
//             </div>
//         </div>
//     );
// };

// const Dashboard = ({ filterStartDate, filterEndDate }) => {
//     const [dashboardData, setDashboardData] = useState(null);
//     const [hoveredPipelineRow, setHoveredPipelineRow] = useState(null);
//     const [hoveredPipelinePos, setHoveredPipelinePos] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const handleGetDashboardData = async () => {
//         try {
//             const res = await getDashboardData({ startDate: filterStartDate, endDate: filterEndDate });
//             setDashboardData(res?.data?.result || null);
//             setTimeout(() => setIsLoading(false), 500);
//         } catch (e) {
//             console.log("Error", e);
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         document.title = "Dashboard - 360Pipe";
//         if (filterStartDate && filterEndDate) {
//             handleGetDashboardData();
//         }
//     }, [filterStartDate, filterEndDate]);

//     const ui = useMemo(() => {
//         const totalContacts = parseInt(dashboardData?.totalContacts || 0);
//         const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
//         const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);

//         const netNew = parseInt(dashboardData?.totalNewMeetings || 0);
//         const existing = parseInt(dashboardData?.totalOldMeetings || 0);

//         const totalClosedDealAmount =
//             dashboardData?.totalClosedDealAmount != null ? parseInt(dashboardData.totalClosedDealAmount) : null;

//         const totalDealAmount =
//             dashboardData?.totalDealAmount != null ? parseInt(dashboardData.totalDealAmount) : null;

//         const percentClosedDealAmount =
//             totalDealAmount > 0 && totalClosedDealAmount != null
//                 ? parseInt(((totalClosedDealAmount / totalDealAmount) * 100))
//                 : null;

//         const pipeLineData = dashboardData?.pipeLineData || [];
//         const meetingData = dashboardData?.meetingData || [];

//         return {
//             totalContacts,
//             totalMeetings,
//             netNew,
//             existing,
//             totalPipeLine,
//             totalClosedDealAmount,
//             totalDealAmount,
//             percentClosedDealAmount,
//             pipeLineData,
//             meetingData
//         };
//     }, [dashboardData]);

//     const handlePipelineRowMouseEnter = (row, event) => {
//         const rect = event.currentTarget.getBoundingClientRect();
//         setHoveredPipelineRow(row);
//         setHoveredPipelinePos({
//             top: rect.top + window.scrollY,
//             left: rect.left + rect.width + 10,
//         });
//     };

//     const handlePipelineRowMouseLeave = () => {
//         setHoveredPipelineRow(null);
//         setHoveredPipelinePos(null);
//     };

//     // Loading skeleton
//     if (isLoading) {
//         return (
//             <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
//                 <div className="flex items-center justify-center gap-6 py-16 flex-wrap px-8">
//                     {[1, 2, 3, 4].map((i) => (
//                         <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 w-full min-h-[200px] max-w-[300px] animate-pulse">
//                             <div className="flex items-center gap-3 mb-4">
//                                 <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
//                                 <div className="h-4 w-24 bg-slate-200 rounded"></div>
//                             </div>
//                             <div className="h-12 w-32 bg-slate-200 rounded mb-3"></div>
//                             <div className="h-4 w-40 bg-slate-200 rounded"></div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 min-h-screen">
//             {/* Background pattern */}
//             <div className="fixed inset-0 opacity-30 pointer-events-none">
//                 <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
//                 <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
//             </div>
            
//             <div className="relative z-10">
//                 {/* Header */}
//                 <div className="text-center py-10 px-4">
//                     <h1 className="text-4xl font-bold text-slate-800 mb-2">
//                         Welcome Back
//                     </h1>
//                     <p className="text-slate-500 text-lg">Here's what's happening with your pipeline</p>
//                 </div>

//                 <div className="flex items-center justify-center gap-6 pb-16 flex-wrap px-8">
                    
//                     {/* --- New Contacts --- */}
//                     <StatCard 
//                         title="New Contacts" 
//                         icon="fa-solid fa-user-plus" 
//                         delay={0}
//                         iconBgColor="bg-gradient-to-br from-emerald-400 to-teal-500"
//                     >
//                         <AnimatedCounter value={ui.totalContacts} />
//                         <div className="flex items-center gap-2 mt-2">
//                             <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
//                             <span className="text-sm text-slate-500">Total contacts</span>
//                         </div>
//                     </StatCard>

//                     {/* --- Meetings --- */}
//                     <StatCard 
//                         title="Meetings" 
//                         icon="fa-solid fa-users-rectangle" 
//                         delay={100}
//                         iconBgColor="bg-gradient-to-br from-amber-400 to-orange-500"
//                     >
//                         <div className="flex items-baseline gap-2">
//                             <AnimatedCounter value={ui.totalMeetings} />
//                         </div>
                        
//                         {/* Meeting breakdown */}
//                         <div className="flex flex-col gap-2 w-full mt-3">
//                             <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50">
//                                 <div className="flex items-center gap-2">
//                                     <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
//                                     <span className="text-sm font-medium text-slate-600">Net New</span>
//                                 </div>
//                                 <span className="text-sm font-bold text-emerald-600">{ui.netNew}</span>
//                             </div>
//                             <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50">
//                                 <div className="flex items-center gap-2">
//                                     <span className="w-3 h-3 rounded-full bg-blue-400"></span>
//                                     <span className="text-sm font-medium text-slate-600">Existing</span>
//                                 </div>
//                                 <span className="text-sm font-bold text-blue-600">{ui.existing}</span>
//                             </div>
//                         </div>

//                         {ui?.meetingData?.length > 0 && (
//                             <div className="hidden group-hover:block w-80 absolute top-full left-0 mt-2 shadow-2xl z-50 bg-white/95 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
//                                 <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white w-full py-3 px-4">
//                                     <p className="font-bold">Accounts</p>
//                                 </div>
//                                 <div className="w-full max-h-48 overflow-y-auto">
//                                     {ui.meetingData.map((item, index) => (
//                                         <div key={index} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-2">
//                                             <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
//                                             {item.account_name}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </StatCard>

//                     {/* --- Pipeline --- */}
//                     <StatCard 
//                         title="Pipeline" 
//                         icon="fa-solid fa-dollar-sign" 
//                         delay={200}
//                         iconBgColor="bg-gradient-to-br from-violet-400 to-purple-500"
//                     >
//                         <AnimatedCounter value={ui.totalPipeLine} prefix="$" />
//                         <div className="flex items-center gap-2 mt-2">
//                             <span className="px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-600 rounded-full">
//                                 {ui?.pipeLineData?.length || 0} deals
//                             </span>
//                         </div>

//                         {ui?.pipeLineData?.length > 0 && (
//                             <div className="hidden group-hover:block w-[420px] absolute top-full left-0 mt-2 z-50 shadow-2xl border border-white/20 rounded-xl overflow-hidden bg-white/95 backdrop-blur-xl">
//                                 <table className="border-collapse w-full">
//                                     <thead className="sticky top-0 z-10 bg-gradient-to-r from-violet-500 to-purple-500 text-white">
//                                         <tr>
//                                             <th className="px-4 py-3 text-left font-bold text-sm">Rep</th>
//                                             <th className="px-4 py-3 text-left font-bold text-sm">Account</th>
//                                             <th className="px-4 py-3 text-left font-bold text-sm">Amount</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {ui.pipeLineData.map((row, i) => (
//                                             <tr
//                                                 key={row.contactId ?? i}
//                                                 className="odd:bg-white even:bg-violet-50/30 cursor-pointer hover:bg-violet-100 transition-colors"
//                                                 onMouseEnter={(e) => handlePipelineRowMouseEnter(row, e)}
//                                                 onMouseLeave={handlePipelineRowMouseLeave}
//                                             >
//                                                 <td className="px-4 py-2.5 text-sm text-slate-600 font-medium">{row.created_by || '—'}</td>
//                                                 <td className="px-4 py-2.5 text-sm text-slate-600">{row.account || '—'}</td>
//                                                 <td className="px-4 py-2.5 text-sm font-semibold text-violet-600">{moneyLabel(row.totalDealAmount) || '—'}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </StatCard>

//                     {/* --- Attainment --- */}
//                     <StatCard 
//                         title="Attainment" 
//                         icon="fa-solid fa-bullseye" 
//                         delay={300}
//                         iconBgColor="bg-gradient-to-br from-rose-400 to-pink-500"
//                     >
//                         <div className="w-full">
//                             <div className="flex items-baseline gap-1">
//                                 <span className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
//                                     {ui.percentClosedDealAmount == null ? "0" : ui.percentClosedDealAmount}
//                                 </span>
//                                 <span className="text-3xl font-bold text-slate-400">%</span>
//                             </div>
                            
//                             {ui.totalClosedDealAmount != null && ui.totalDealAmount != null ? (
//                                 <div className="mt-3 space-y-2">
//                                     <p className="text-sm text-slate-500">
//                                         <span className="font-semibold text-rose-500">{moneyLabel(ui.totalClosedDealAmount)}</span>
//                                         <span className="mx-1">of</span>
//                                         <span className="font-semibold text-slate-600">{moneyLabel(ui.totalDealAmount)}</span>
//                                     </p>
//                                     <ModernProgressBar percentage={ui.percentClosedDealAmount} showLabel={false} />
//                                 </div>
//                             ) : (
//                                 <p className="text-sm text-slate-400 mt-3 italic">No data available</p>
//                             )}
//                         </div>
//                     </StatCard>
//                 </div>
//             </div>

//             {/* Portal for pipeline row opportunities popup */}
//             {hoveredPipelineRow &&
//                 hoveredPipelinePos &&
//                 ReactDOM.createPortal(
//                     <div
//                         className="fixed bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl border border-white/20 z-[60] overflow-hidden"
//                         style={{
//                             top: hoveredPipelinePos.top,
//                             left: hoveredPipelinePos.left,
//                             minWidth: '320px',
//                             maxHeight: '420px',
//                             overflowY: 'auto',
//                         }}
//                     >
//                         <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-3 sticky top-0">
//                             <p className="font-bold">Opportunities</p>
//                         </div>
//                         {hoveredPipelineRow?.opps?.length > 0 ? (
//                             <table className="w-full border-collapse">
//                                 <tbody>
//                                     {hoveredPipelineRow.opps.map((opp, idx) => (
//                                         <tr key={idx} className="odd:bg-white even:bg-violet-50/30 hover:bg-violet-100 transition-colors">
//                                             <td className="px-4 py-3 text-sm text-slate-700 font-medium">{opp.name || '—'}</td>
//                                             <td className="px-4 py-3 text-sm text-purple-600 font-semibold text-right">{moneyLabel(opp.dealAmount) || '—'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         ) : (
//                             <div className="p-6 text-slate-400 text-sm text-center">
//                                 <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
//                                     <CustomIcons iconName="fa-solid fa-inbox" css="text-slate-400" />
//                                 </div>
//                                 No opportunities
//                             </div>
//                         )}
//                     </div>,
//                     document.body
//                 )}
//         </div>
//     );
// };

// const mapStateToProps = (state) => ({
//     filterStartDate: state.common.filterStartDate,
//     filterEndDate: state.common.filterEndDate,
// });

// export default connect(mapStateToProps, null)(Dashboard);





// bolt.ai code
// import { useEffect, useMemo, useState } from "react";
// import ReactDOM from "react-dom";
// import { getDashboardData } from "../../service/customers/customersService";
// import { connect } from "react-redux";
// import CustomIcons from "../../components/common/icons/CustomIcons";

// const StatCard = ({ title, icon, children, gradient }) => (
//     <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] p-6 w-full min-h-[200px] max-w-[300px] flex flex-col group relative transition-all duration-300 hover:-translate-y-1 ${title === "Pipeline" || title === "Meetings" ? "cursor-pointer" : ""}`}>
//         <div className="flex items-center gap-3 mb-4">
//             <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
//                 <div className="text-white text-xl">
//                     <CustomIcons iconName={icon} />
//                 </div>
//             </div>
//             <h3 className="text-base font-semibold text-slate-600 tracking-tight">{title}</h3>
//         </div>
//         <div className="flex flex-col flex-1 w-full">
//             {children}
//         </div>
//     </div>
// );

// const formatMoneyK = (num) => {
//     const n = parseInt(num || 0);
//     if (n >= 1_000_000) return `${parseInt(n / 1_000_000)}M`;
//     if (n >= 1_000) return `${parseInt(Math.round(n / 1_000))}K`;
//     return `${n}`;
// };

// const moneyLabel = (v) => `$${formatMoneyK(v)}`;

// const Dashboard = ({ filterStartDate, filterEndDate }) => {
//     const [dashboardData, setDashboardData] = useState(null);
//     const [hoveredPipelineRow, setHoveredPipelineRow] = useState(null);
//     const [hoveredPipelinePos, setHoveredPipelinePos] = useState(null);

//     const handleGetDashboardData = async () => {
//         try {
//             const res = await getDashboardData({ startDate: filterStartDate, endDate: filterEndDate });
//             setDashboardData(res?.data?.result || null);
//         } catch (e) {
//             console.log("Error", e);
//         }
//     };

//     useEffect(() => {
//         document.title = "Dashboard - 360Pipe";
//         if (filterStartDate && filterEndDate) {
//             handleGetDashboardData();
//         }
//     }, [filterStartDate, filterEndDate]);

//     const ui = useMemo(() => {
//         const totalContacts = parseInt(dashboardData?.totalContacts || 0);
//         const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
//         const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);

//         const netNew = parseInt(dashboardData?.totalNewMeetings || 0);
//         const existing = parseInt(dashboardData?.totalOldMeetings || 0);

//         const totalClosedDealAmount =
//             dashboardData?.totalClosedDealAmount != null ? parseInt(dashboardData.totalClosedDealAmount) : null;

//         const totalDealAmount =
//             dashboardData?.totalDealAmount != null ? parseInt(dashboardData.totalDealAmount) : null;

//         const percentClosedDealAmount =
//             totalDealAmount > 0 && totalClosedDealAmount != null
//                 ? parseInt(((totalClosedDealAmount / totalDealAmount) * 100))
//                 : null;

//         const pipeLineData = dashboardData?.pipeLineData || [];
//         const meetingData = dashboardData?.meetingData || [];

//         return {
//             totalContacts,
//             totalMeetings,
//             netNew,
//             existing,
//             totalPipeLine,
//             totalClosedDealAmount,
//             totalDealAmount,
//             percentClosedDealAmount,
//             pipeLineData,
//             meetingData
//         };
//     }, [dashboardData]);

//     const handlePipelineRowMouseEnter = (row, event) => {
//         const rect = event.currentTarget.getBoundingClientRect();
//         setHoveredPipelineRow(row);
//         setHoveredPipelinePos({
//             top: rect.top + window.scrollY,
//             left: rect.left + rect.width + 10,
//         });
//     };

//     const handlePipelineRowMouseLeave = () => {
//         setHoveredPipelineRow(null);
//         setHoveredPipelinePos(null);
//     };

//     return (
//         <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
//             <div className="max-w-7xl mx-auto px-4 py-12">           
//                 <div className="flex items-stretch justify-center gap-6">

//                     <StatCard title="New Contacts" icon="fa-solid fa-user-plus" gradient="bg-gradient-to-br from-emerald-500 to-emerald-600">
//                         <div className="mt-2">
//                             <span className="text-6xl font-bold text-slate-800 tracking-tight">{ui.totalContacts}</span>
//                             <p className="text-sm text-slate-500 mt-3">contacts added</p>
//                         </div>
//                     </StatCard>

//                     <StatCard title="Meetings" icon="fa-solid fa-users-rectangle" gradient="bg-gradient-to-br from-blue-500 to-blue-600">
//                         <div className="mt-2">
//                             <div className="text-6xl font-bold text-slate-800 mb-4 tracking-tight">{ui.totalMeetings}</div>
//                             <div className="space-y-2 w-full">
//                                 <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
//                                     <div className="flex items-center gap-2">
//                                         <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
//                                         <span className="text-sm font-medium text-slate-600">Net New</span>
//                                     </div>
//                                     <span className="text-sm font-bold text-slate-800">{ui.netNew}</span>
//                                 </div>
//                                 <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
//                                     <div className="flex items-center gap-2">
//                                         <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
//                                         <span className="text-sm font-medium text-slate-600">Existing</span>
//                                     </div>
//                                     <span className="text-sm font-bold text-slate-800">{ui.existing}</span>
//                                 </div>
//                             </div>
//                         </div>

//                         {ui?.meetingData?.length > 0 && (
//                             <div className="hidden group-hover:block w-96 max-h-96 overflow-hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 shadow-2xl z-50 bg-white rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
//                                 <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
//                                     <p className="font-semibold">Accounts</p>
//                                 </div>
//                                 <div className="max-h-80 overflow-y-auto">
//                                     {ui.meetingData.map((item, index) => (
//                                         <div key={index} className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0">
//                                             {item.account_name}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </StatCard>

//                     <StatCard title="Pipeline" icon="fa-solid fa-dollar-sign" gradient="bg-gradient-to-br from-cyan-500 to-cyan-600">
//                         <div className="mt-2">
//                             <span className="text-6xl font-bold text-slate-800 tracking-tight">
//                                 {ui.totalPipeLine ? moneyLabel(ui.totalPipeLine) : "$0"}
//                             </span>
//                         </div>

//                         {ui?.pipeLineData?.length > 0 && (
//                             <div className="hidden group-hover:block w-[450px] max-h-96 overflow-hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 shadow-2xl rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
//                                 <div className="overflow-hidden rounded-xl">
//                                     <table className="w-full bg-white">
//                                         <thead className="sticky top-0 z-10">
//                                             <tr className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
//                                                 <th className="px-4 py-3 text-left text-sm font-semibold">Rep</th>
//                                                 <th className="px-4 py-3 text-left text-sm font-semibold">Account</th>
//                                                 <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="max-h-80 overflow-y-auto">
//                                             {ui.pipeLineData.map((row, i) => (
//                                                 <tr
//                                                     key={row.contactId ?? i}
//                                                     className="border-b border-slate-100 hover:bg-cyan-50/50 cursor-pointer transition-colors"
//                                                     onMouseEnter={(e) => handlePipelineRowMouseEnter(row, e)}
//                                                     onMouseLeave={handlePipelineRowMouseLeave}
//                                                 >
//                                                     <td className="px-4 py-3 text-sm text-slate-700">{row.created_by || '—'}</td>
//                                                     <td className="px-4 py-3 text-sm text-slate-700">{row.account || '—'}</td>
//                                                     <td className="px-4 py-3 text-sm font-semibold text-slate-800">{moneyLabel(row.totalDealAmount) || '—'}</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         )}
//                     </StatCard>

//                     <StatCard title="Attainment" icon="fa-solid fa-bullseye" gradient="bg-gradient-to-br from-orange-500 to-orange-600">
//                         <div className="mt-2 w-full">
//                             <span className="text-6xl font-bold text-slate-800 tracking-tight">
//                                 {ui.percentClosedDealAmount == null ? "0%" : `${ui.percentClosedDealAmount}%`}
//                             </span>
//                             <div className="mt-4 w-full">
//                                 <div className="flex items-center justify-between mb-2">
//                                     <span className="text-sm font-medium text-slate-600">Progress</span>
//                                     <span className="text-sm font-semibold text-slate-700">
//                                         {ui.totalClosedDealAmount != null && ui.totalDealAmount != null
//                                             ? `${moneyLabel(ui.totalClosedDealAmount)} / ${moneyLabel(ui.totalDealAmount)}`
//                                             : "No Goal Set"}
//                                     </span>
//                                 </div>
//                                 <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
//                                     <div
//                                         className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
//                                         style={{ width: `${ui.percentClosedDealAmount || 0}%` }}
//                                     ></div>
//                                 </div>
//                             </div>
//                         </div>
//                     </StatCard>
//                 </div>
//             </div>

//             {hoveredPipelineRow &&
//                 hoveredPipelinePos &&
//                 ReactDOM.createPortal(
//                     <div
//                         className="fixed bg-white shadow-2xl rounded-xl border border-slate-200 z-[60] animate-in fade-in slide-in-from-left-2 duration-200"
//                         style={{
//                             top: hoveredPipelinePos.top,
//                             left: hoveredPipelinePos.left,
//                             minWidth: '350px',
//                             maxHeight: '400px',
//                             overflowY: 'auto',
//                         }}
//                     >
//                         {hoveredPipelineRow?.opps?.length > 0 ? (
//                             <div className="overflow-hidden rounded-xl">
//                                 <table className="w-full border-collapse">
//                                     <thead className="sticky top-0">
//                                         <tr className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
//                                             <th className="px-4 py-3 text-left font-semibold text-sm">Opportunity</th>
//                                             <th className="px-4 py-3 text-left font-semibold text-sm">Amount</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {hoveredPipelineRow.opps.map((opp, idx) => (
//                                             <tr key={idx} className="border-b border-slate-100 hover:bg-cyan-50/50 transition-colors">
//                                                 <td className="px-4 py-3 text-sm text-slate-700">{opp.name || '—'}</td>
//                                                 <td className="px-4 py-3 text-sm font-semibold text-slate-800">{moneyLabel(opp.dealAmount) || '—'}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         ) : (
//                             <div className="p-6 text-slate-500 text-sm text-center">No opportunities available</div>
//                         )}
//                     </div>,
//                     document.body
//                 )}
//         </div>
//     );
// };

// const mapStateToProps = (state) => ({
//     filterStartDate: state.common.filterStartDate,
//     filterEndDate: state.common.filterEndDate,
// });

// export default connect(mapStateToProps, null)(Dashboard);