import React, { useEffect, useState } from 'react';
import { getAllActivities } from '../../../service/results/results';
import CustomIcons from '../../../components/common/icons/CustomIcons';

const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0][0] || "").toUpperCase();
};

const getAvatarColor = (name) => {
    const colors = [
        'bg-[#B48BED]',
        'bg-[#93C5FD]',
        'bg-[#A5B4FC]',
        'bg-[#4B5563]',
        'bg-[#FCA5A5]',
        'bg-[#FCD34D]',
        'bg-[#86EFAC]',
        'bg-[#F472B6]',
    ];
    let sum = 0;
    for (let i = 0; i < (name || "").length; i++) {
        sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
};

const ActivityCard = ({ title, icon, value, percentage, progressPercent, fillColor, railColor, leftLabel, rightLabel, leftSubLabel, rightSubLabel, leftLabelColor = "text-[#6B7280]", rightLabelColor = "text-[#6B7280]" }) => (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_8px_20px_rgba(0,0,0,0.05)] p-5 flex-1 w-full max-w-[350px]">
        <div className="flex justify-center items-center gap-2 mb-3">
            <div className="text-[#6B7280]">
                {icon}
            </div>
            <h3 className="text-[#4B5563] font-medium text-lg">{title}</h3>
        </div>
        <div className="flex flex-col items-center mb-4">
            <span className="text-4xl font-bold text-[#1F2937] leading-none mb-1">{value}</span>
            <span className="text-[#6B7280] text-sm font-medium">({percentage})</span>
        </div>
        <div className={`w-full h-1.5 rounded-full mb-2 overflow-hidden flex ${railColor}`}>
            <div className={`h-full ${fillColor}`} style={{ width: progressPercent }}></div>
        </div>
        <div className="flex justify-between w-full text-sm font-medium">
            <span className={leftLabelColor}>{leftLabel} <span className="text-[#6B7280] font-normal">{leftSubLabel}</span></span>
            <span className={rightLabelColor}>{rightLabel} <span className="text-[#6B7280] font-normal">{rightSubLabel}</span></span>
        </div>
    </div>
);

const Activities = () => {
    const [activities, setActivities] = useState([]);

    const handleGetActivities = async () => {
        const res = await getAllActivities();
        if (res?.data?.status === 200) {
            const data = res?.data?.result?.map((item, index) => ({
                ...item,
                rowId: index + 1,
            }));
            setActivities(data || []);
        }
    };

    useEffect(() => {
        document.title = "Activities - 360Pipe";
        handleGetActivities();
    }, []);

    return (
        <div className="py-6 bg-[#F8FAFF]">
            {/* STAT CARDS */}
            <div className="flex gap-6 mb-8 justify-center flex-wrap">
                <ActivityCard
                    title="Meetings"
                    icon={<CustomIcons iconName="fa-solid fa-bolt" css="h-5 w-5" />}
                    value="25"
                    percentage="50%"
                    progressPercent="50%"
                    fillColor="bg-[#6D28D9]"
                    railColor="bg-[#DDD6FE]"
                    leftLabel="50" leftSubLabel="Actual" leftLabelColor="text-[#6B7280]"
                    rightLabel="50" rightSubLabel="Goal" rightLabelColor="text-[#6B7280]"
                />

                <ActivityCard
                    title="Onsite Intensity"
                    icon={<CustomIcons iconName="fa-solid fa-map-location-dot" css="h-5 w-5" />}
                    value="8"
                    percentage="32%"
                    progressPercent="32%"
                    fillColor="bg-[#65B79F]"
                    railColor="bg-[#DDD6FE]"
                    leftLabel="8" leftSubLabel="Onsite" leftLabelColor="text-[#65B79F]"
                    rightLabel="17" rightSubLabel="Virtual" rightLabelColor="text-[#6B7280]"
                />

                <ActivityCard
                    title="Hunter / Farmer"
                    icon={<CustomIcons iconName="fa-solid fa-handshake" css="h-5 w-5" />}
                    value="10"
                    percentage="40%"
                    progressPercent="40%"
                    fillColor="bg-[#65B79F]"
                    railColor="bg-[#6D28D9]"
                    leftLabel="10" leftSubLabel="Hunter" leftLabelColor="text-[#65B79F]"
                    rightLabel="15" rightSubLabel="Farmer" rightLabelColor="text-[#6B7280]"
                />
            </div>

            <div
                className="w-full lg:w-full overflow-x-auto"
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
                }}
            >
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: '#EDE9FE' }}>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase" style={{ color: '#5B21B6' }}>
                                REP
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>
                                NET NEW
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>
                                EXISTING
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>
                                (ONSITE)
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>
                                TOTAL
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((row, index) => {
                            const isLastRow = index === activities.length - 1;
                            return (
                                <tr
                                    key={row.rowId || index}
                                    style={{ borderBottom: isLastRow ? 'none' : '1px solid #F1F5F9' }}
                                >
                                    <td className="py-4 px-6 flex items-center gap-4 text-[#6B7280]">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(row.rep_name)}`}
                                        >
                                            {getInitials(row.rep_name)}
                                        </div>
                                        <span className="text-base text-[#111827]">{row.rep_name || '—'}</span>
                                    </td>
                                    <td className="py-4 px-6 text-[#111827] font-semibold text-lg text-center">
                                        {row.newMeetingCount || 0}
                                    </td>
                                    <td className="py-4 px-6 text-[#111827] font-semibold text-lg text-center">
                                        {row.oldMeetingCount || 0}
                                    </td>
                                    <td className="py-4 px-6 text-[#6B7280] font-medium text-lg text-center">
                                        ({row.onsite || 0})
                                    </td>
                                    <td className="py-4 px-6 font-bold text-lg text-center" style={{ backgroundColor: '#F5F3FF', color: '#111827' }}>
                                        {(row.newMeetingCount || 0) + (row.oldMeetingCount || 0)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Activities;




// import { useEffect, useMemo, useState } from 'react';
// import { connect } from 'react-redux';
// import { getAllActivities } from '../../../service/results/results';
// import { getDashboardData } from '../../../service/customers/customersService';
// import CustomIcons from '../../../components/common/icons/CustomIcons';
// import DataTable from '../../../components/common/table/table';

// const StatCard = ({ title, icon, children }) => (
//     <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-full max-w-[400px] group ${title === "Pipeline" || "Meetings" ? "cursor-pointer" : ""}`}>
//         <div className="flex justify-center items-center gap-3 mb-2">
//             <div className="text-[#44288E]">
//                 <CustomIcons iconName={icon} css="h-6 w-6" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-700">{title}</h3>
//         </div>
//         {/* <hr className="mb-4 border-gray-100" /> */}
//         <div className="flex items-center justify-between px-2">
//             {children}
//         </div>
//     </div>
// );

// const Activities = ({ filterStartDate, filterEndDate }) => {
//     const [activities, setActivities] = useState([]);
//     const [dashboardData, setDashboardData] = useState(null);

//     // Data fetching remains the same
//     const handleGetDashboardData = async () => {
//         try {
//             const res = await getDashboardData({ startDate: filterStartDate, endDate: filterEndDate });
//             setDashboardData(res?.data?.result || null);
//         } catch (e) { console.log("Error", e); }
//     };

//     const handleGetActivites = async () => {
//         const res = await getAllActivities();
//         if (res?.data?.status === 200) {
//             const data = res?.data?.result?.map((item, index) => ({
//                 ...item,
//                 rowId: index + 1,
//             }))
//             setActivities(data)
//         }
//     };

//     useEffect(() => { handleGetActivites(); }, []);
//     useEffect(() => {
//         document.title = "Activites - 360Pipe";

//         if (filterStartDate && filterEndDate) { handleGetDashboardData(); }
//     }, [filterStartDate, filterEndDate]);

//     const ui = useMemo(() => {
//         const totalContacts = parseInt(dashboardData?.totalContacts || 0);
//         const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
//         const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);

//         // If later you add these fields from backend, this UI will automatically show them:
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

//     const columns = [
//         {
//             field: 'rowId',
//             headerName: '#',
//             headerClassName: 'uppercase',
//             flex: 1,
//             maxWidth: 50,
//             sortable: false,
//         },
//         {
//             field: 'rep_name',
//             headerName: 'Rep',
//             headerClassName: 'uppercase',
//             flex: 1,
//             minWidth: 100,
//             sortable: false,
//         },
//         {
//             field: 'contacts',
//             headerName: 'New Contacts',
//             headerClassName: 'uppercase',
//             flex: 1,
//             minWidth: 150,
//         },
//         {
//             field: 'new_meetings',
//             headerName: 'New Meetings',
//             headerClassName: 'uppercase',
//             flex: 1,
//             minWidth: 150,
//             renderCell: (params) => {
//                 return (
//                     <span>{params.value ? `${params.value}` : 0}</span>
//                 )
//             }
//         },
//         {
//             field: 'old_meetings',
//             headerName: 'Existing Meetings',
//             headerClassName: 'uppercase',
//             flex: 1,
//             minWidth: 150,
//             renderCell: (params) => {
//                 return (
//                     <span>{params.value ? `${params.value}` : 0}</span>
//                 )
//             }
//         },
//         {
//             field: 'total_meetings',
//             headerName: 'Total Meetings',
//             headerClassName: 'uppercase',
//             flex: 1,
//             minWidth: 150,
//             renderCell: (params) => {
//                 const total = parseInt(params.row.new_meetings || 0) + parseInt(params.row.old_meetings || 0);
//                 return (
//                     <span>{total}</span>
//                 )
//             }
//         },
//     ];

//     const getRowId = (row) => {
//         return row.rowId;
//     }

//     return (
//         <div className="py-6 bg-[#F8FAFF]">
//             {/* STAT CARDS */}
//             <div className="flex gap-6 mb-8 justify-center">
//                 <StatCard title="New Contacts" icon="fa-solid fa-user-plus">
//                     <div className="flex flex-col items-center flex-1">
//                         <span className="text-5xl font-extrabold text-slate-800">{ui.totalContacts}</span>
//                     </div>
//                 </StatCard>

//                 <StatCard title="Meetings" icon="fa-solid fa-users-rectangle">
//                     <div className="text-5xl font-extrabold text-slate-800 flex-1 text-center">{ui.totalMeetings}</div>
//                     <div className="h-12 w-[1px] bg-gray-200 mx-4"></div>
//                     <div className="flex flex-col gap-1 flex-1">
//                         <div className="text-sm font-semibold flex justify-between items-center text-gray-500">
//                             <span className="flex items-center gap-2">
//                                 <span className="w-2 h-2 rounded-full bg-blue-400"></span> Net New:
//                             </span>
//                             <span className="text-blue-600 font-bold ml-4">{ui.netNew}</span>
//                         </div>
//                         <div className="text-sm font-semibold flex justify-between items-center text-gray-500">
//                             <span className="flex items-center gap-2">
//                                 <span className="w-2 h-2 rounded-full bg-slate-400"></span> Existing:
//                             </span>
//                             <span className="text-slate-800 font-bold ml-4">{ui.existing}</span>
//                         </div>
//                     </div>
//                     {
//                         ui?.meetingData?.length > 0 && (
//                             <div className="hidden group-hover:block h-40 w-96 overflow-y-auto absolute top-72 left-[800px] shadow-lg z-50">
//                                 {/* Header */}
//                                 <div className="bg-[#44288E] text-white w-full py-2 text-center font-bold">
//                                     <p>
//                                         Accounts
//                                     </p>
//                                 </div>

//                                 {/* Content */}
//                                 <div className="w-full bg-white p-3">
//                                     <div className="text-sm text-black">
//                                         {ui.meetingData.map((item, index) => (
//                                             <div
//                                                 key={index}
//                                                 className="truncate cursor-pointer py-1"
//                                             >
//                                                 {item.account_name}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>
//                         )
//                     }

//                 </StatCard>
//             </div>

//             <div className='border rounded-lg bg-white w-full lg:w-full'>
//                 <DataTable columns={columns} rows={activities} getRowId={getRowId} height={480} hideFooter={true} />
//             </div>
//         </div>
//     );
// };

// const mapStateToProps = (state) => ({
//     filterStartDate: state.common.filterStartDate,
//     filterEndDate: state.common.filterEndDate,
// });

// export default connect(mapStateToProps, null)(Activities);