import { useEffect, useState } from 'react';
import { getAllActivities } from '../../../service/results/results';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import DataTable from '../../../components/common/table/table';

const StatCard = ({ title, icon, children }) => (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-full max-w-[400px] group ${title === "Pipeline" || "Meetings" ? "cursor-pointer" : ""}`}>
        <div className="flex justify-center items-center gap-3 mb-2">
            <div className="text-[#2753AF]">
                <CustomIcons iconName={icon} css="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">{title}</h3>
        </div>
        <div className="flex items-center justify-between px-2">
            {children}
        </div>
    </div>
);

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [newContactsTotal, setNewContactsTotal] = useState(0);
    const [netNewMeetingsTotal, setNetNewMeetingsTotal] = useState(0);
    const [existingMeetingsTotal, setExistingMeetingsTotal] = useState(0);
    const [totalMeetings, setTotalMeetings] = useState(0);

    const handleGetActivities = async () => {
        const res = await getAllActivities();
        if (res?.data?.status === 200) {
            const data = res?.data?.result?.map((item, index) => ({
                ...item,
                rowId: index + 1,
            }));
            setActivities(data);
        }
    };

    useEffect(() => {
        document.title = "Activities - 360Pipe";
        handleGetActivities();
    }, []);

    // Recalculate totals whenever activities change
    useEffect(() => {
        if (activities.length > 0) {
            const contacts = activities.reduce((acc, item) => acc + (item.contacts || 0), 0);
            const newMeetings = activities.reduce((acc, item) => acc + (item.newMeetingCount || 0), 0);
            const oldMeetings = activities.reduce((acc, item) => acc + (item.oldMeetingCount || 0), 0);
            setNewContactsTotal(contacts);
            setNetNewMeetingsTotal(newMeetings);
            setExistingMeetingsTotal(oldMeetings);
            setTotalMeetings(newMeetings + oldMeetings);
        } else {
            setNewContactsTotal(0);
            setNetNewMeetingsTotal(0);
            setExistingMeetingsTotal(0);
            setTotalMeetings(0);
        }
    }, [activities]);

    const columns = [
        {
            field: 'rowId',
            headerName: '#',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 50,
            sortable: false,
        },
        {
            field: 'rep_name',
            headerName: 'Rep',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100,
            sortable: false,
        },
        {
            field: 'contacts',
            headerName: 'New Contacts',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'newMeetingCount',      // changed from 'new_meetings'
            headerName: 'New Meetings',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <span>{params.value ?? 0}</span>
            )
        },
        {
            field: 'oldMeetingCount',      // changed from 'old_meetings'
            headerName: 'Existing Meetings',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <span>{params.value ?? 0}</span>
            )
        },
        {
            field: 'total_meetings',
            headerName: 'Total Meetings',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                const total = (params.row.newMeetingCount || 0) + (params.row.oldMeetingCount || 0);
                return <span>{total}</span>;
            }
        },
    ];

    const getRowId = (row) => row.rowId;

    return (
        <div className="py-6 bg-[#F8FAFF]">
            {/* STAT CARDS */}
            <div className="flex gap-6 mb-8 justify-center">
                <StatCard title="New Contacts" icon="fa-solid fa-user-plus">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-5xl font-extrabold text-slate-800">{newContactsTotal}</span>
                    </div>
                </StatCard>

                <StatCard title="Meetings" icon="fa-solid fa-users-rectangle">
                    <div className="text-5xl font-extrabold text-slate-800 flex-1 text-center">{totalMeetings}</div>
                    <div className="h-12 w-[1px] bg-gray-200 mx-4"></div>
                    <div className="flex flex-col gap-1 flex-1">
                        <div className="text-sm font-semibold flex justify-between items-center text-gray-500">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Net New:
                            </span>
                            <span className="text-blue-600 font-bold ml-4">{netNewMeetingsTotal}</span>
                        </div>
                        <div className="text-sm font-semibold flex justify-between items-center text-gray-500">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Existing:
                            </span>
                            <span className="text-slate-800 font-bold ml-4">{existingMeetingsTotal}</span>
                        </div>
                    </div>
                </StatCard>
            </div>

            <div className='border rounded-lg bg-white w-full lg:w-full'>
                <DataTable columns={columns} rows={activities} getRowId={getRowId} height={480} hideFooter={true} />
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
//             <div className="text-[#2753AF]">
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
//                                 <div className="bg-[#2753AF] text-white w-full py-2 text-center font-bold">
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