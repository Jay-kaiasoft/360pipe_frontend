import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { getDashboardData } from "../../service/customers/customersService";
import Components from "../../components/muiComponents/components";
import Select from "../../components/common/select/select";
import { userTimeZone } from "../../service/common/commonService";

const formatMoneyK = (num) => {
    const n = Number(num || 0);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return `${n}`;
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const SemiGauge = ({ value = 0, target = 1 }) => {
    const pct = target > 0 ? (value / target) * 100 : 0;
    const pctClamped = clamp(pct, 0, 200); // allow overachievement a bit
    const angle = (pctClamped / 100) * 180;

    // SVG arc math
    const R = 90;
    const cx = 110;
    const cy = 110;
    const startX = cx - R;
    const startY = cy;
    const endX = cx + R * Math.cos((Math.PI * (180 - angle)) / 180);
    const endY = cy - R * Math.sin((Math.PI * (180 - angle)) / 180);
    const largeArcFlag = angle > 180 ? 1 : 0;

    return (
        <div className="flex flex-col items-center justify-center">
            <svg width="220" height="130" viewBox="0 0 220 130">
                {/* track */}
                <path
                    d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="18"
                    strokeLinecap="round"
                />
                {/* progress */}
                <path
                    d={`M ${startX} ${startY} A ${R} ${R} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="18"
                    strokeLinecap="round"
                />
                {/* needle */}
                <line
                    x1={cx}
                    y1={cy}
                    x2={cx + (R - 10) * Math.cos((Math.PI * (180 - angle)) / 180)}
                    y2={cy - (R - 10) * Math.sin((Math.PI * (180 - angle)) / 180)}
                    stroke="#111827"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <circle cx={cx} cy={cy} r="6" fill="#111827" />
            </svg>

            <div className="-mt-2 text-center">
                <Components.Typography variant="body2" className="text-gray-600">
                    {formatMoneyK(value)} / <span className="text-red-500">{formatMoneyK(target)}</span>
                </Components.Typography>
                <Components.Typography variant="subtitle2" className="font-semibold text-gray-800">
                    {Math.round(pct)}% Achieved
                </Components.Typography>
            </div>
        </div>
    );
};

const StackedBar = ({ items = [], maxValue = 1 }) => {
    const total = items.reduce((s, x) => s + Number(x.value || 0), 0);
    const base = maxValue > 0 ? maxValue : total || 1;

    return (
        <div className="w-full">
            <div className="h-10 w-full rounded-md overflow-hidden bg-gray-100 flex">
                {items.map((it, idx) => {
                    const w = (Number(it.value || 0) / base) * 100;
                    return (
                        <div
                            key={idx}
                            className={it.className || "bg-blue-500"}
                            style={{ width: `${clamp(w, 0, 100)}%` }}
                            title={`${it.label}: ${formatMoneyK(it.value)}`}
                        />
                    );
                })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                {items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded ${it.className || "bg-blue-500"}`} />
                        <span className="truncate">
                            {it.label}: <b className="text-gray-800">{formatMoneyK(it.value)}</b>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Countdown = ({ endDate }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const endMs = useMemo(() => {
        if (!endDate) return null;

        // if endDate is already a Date, keep it
        const d = endDate instanceof Date ? endDate : new Date(endDate);
        const ms = d.getTime();
        return Number.isNaN(ms) ? null : ms;
    }, [endDate]);

    if (!endMs) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-xl font-semibold text-gray-400">-- : -- : -- : --</div>
                <div className="mt-2 text-gray-500 text-sm flex gap-8">
                    <p>Days</p><p>Hrs</p><p>Min</p><p>Sec</p>
                </div>
            </div>
        );
    }

    const diff = Math.max(0, endMs - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const pad = (n) => String(n).padStart(2, "0");

    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex items-start">
                <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-semibold tracking-wider text-gray-800">
                        {pad(days)}
                    </span>
                    <span className="mt-1 text-sm text-gray-500">Days</span>
                </div>

                <span className="mx-3 md:mx-5 text-3xl md:text-4xl font-semibold text-gray-800">
                    :
                </span>

                <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-semibold tracking-wider text-gray-800">
                        {pad(hrs)}
                    </span>
                    <span className="mt-1 text-sm text-gray-500">Hrs</span>
                </div>

                <span className="mx-3 md:mx-5 text-3xl md:text-4xl font-semibold text-gray-800">
                    :
                </span>

                <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-semibold tracking-wider text-gray-800">
                        {pad(mins)}
                    </span>
                    <span className="mt-1 text-sm text-gray-500">Min</span>
                </div>

                <span className="mx-3 md:mx-5 text-3xl md:text-4xl font-semibold text-gray-800">
                    :
                </span>

                <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-semibold tracking-wider text-gray-800">
                        {pad(secs)}
                    </span>
                    <span className="mt-1 text-sm text-gray-500">Sec</span>
                </div>
            </div>
        </div>
    );


};

const yearOptions = [
    {
        id: new Date().getFullYear() - 3,
        title: new Date().getFullYear() - 3?.toString()
    },
    {
        id: new Date().getFullYear() - 2,
        title: new Date().getFullYear() - 2?.toString()
    },
    {
        id: new Date().getFullYear() - 1,
        title: new Date().getFullYear() - 1?.toString()
    },
    {
        id: new Date().getFullYear(),
        title: new Date().getFullYear()?.toString()
    }
]

const periodTypes = [
    {
        id: 1,
        title: "Year"
    },
    {
        id: 2,
        title: "Quarter"
    },
    {
        id: 3,
        title: "Semi-Quarter"
    },
]

const QuarterCard = ({ title, items = [], commit = 0, upside = 0 }) => {
    return (
        <Components.Card className="shadow-sm rounded-xl overflow-hidden">
            <div className="bg-slate-700 px-4 py-2">
                <Components.Typography className="text-white font-semibold text-sm">{title}</Components.Typography>
            </div>
            <div className="h-[2px] bg-red-500" />
            <div className="p-3">
                <div className="h-52 overflow-auto pr-1">
                    {items.length === 0 ? (
                        <Components.Typography className="text-gray-400 text-sm">No opportunities</Components.Typography>
                    ) : (
                        <ul className="space-y-2">
                            {items.map((x) => (
                                <li key={x.id} className="text-sm">
                                    {/* you can route to opportunity details */}
                                    <NavLink to={`/dashboard/opportunity-view/${x.id}`} className="text-blue-700 cursor-pointer">
                                        {x.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <Components.Divider />

                <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                    <p>
                        Commit <b className="text-gray-800">${formatMoneyK(commit)}</b>
                    </p>
                    <p>
                        Upside <b className="text-gray-800">${formatMoneyK(upside)}</b>
                    </p>
                </div>
            </div>
        </Components.Card>
    );
};

const parseQuarterEnd = (str) => {
    // Backend: "03/31/2026, 12:00:00 AM"
    if (!str || typeof str !== "string") return null;

    const datePart = str.split(",")[0]?.trim(); // "03/31/2026"
    const parts = datePart.split("/").map((x) => Number(x.trim()));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;

    const [mm, dd, yyyy] = parts;
    const d = new Date(yyyy, mm - 1, dd, 23, 59, 59); // local end-of-day
    return Number.isNaN(d.getTime()) ? null : d;
};


const getQuarterFooter = (dashboardData, quarterKey) => {
    const list = Array.isArray(dashboardData?.[quarterKey]) ? dashboardData[quarterKey] : [];
    return list.find((x) => x?._type === "footer") || {};
};

const getPipelineTotalFromFooters = (dashboardData) => {
    const quarters = ["quarter1", "quarter2", "quarter3", "quarter4"];
    return quarters.reduce((sum, q) => {
        const footer = getQuarterFooter(dashboardData, q);
        return sum + Number(footer?.pipeline || 0);
    }, 0);
};
/* ---------------------------
   Dashboard
---------------------------- */

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [periodType, setPeriodType] = useState("YEAR");
    const [periodTypeId, setPeriodTypeId] = useState(1);

    const handleGetDashboardData = async (y = year, p = periodType) => {
        try {
            const res = await getDashboardData({ year: y, periodType: p, timeZone: userTimeZone, });
            setDashboardData(res?.data?.result || null);
        } catch (e) {
            console.log("Error", e)
        }
    };

    useEffect(() => {
        document.title = "Dashboard - 360Pipe";
        handleGetDashboardData(new Date().getFullYear(), "YEAR");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ui = useMemo(() => {
        const closedWon = Number(dashboardData?.closedDealsAmount || 0);

        // Target: you used totalDealsAmount as target now (ok)
        const closedTarget = Number(dashboardData?.totalDealsAmount || 0);

        // ✅ Pipeline totals are coming in QUARTER footers, not as dashboardData.pipeline/commit/upside
        const pipelineTotal = getPipelineTotalFromFooters(dashboardData);

        const pipelineItems = [
            { label: "Commit", value: Number(dashboardData?.commit || 0), className: "bg-green-500" },
            { label: "Pipeline", value: pipelineTotal, className: "bg-blue-500" },
            { label: "Upside", value: Number(dashboardData?.upside || 0), className: "bg-orange-400" },
        ];

        const pipelineMax = pipelineItems.reduce((s, x) => s + Number(x.value || 0), 0) || 1;

        const quarterEndDate =
            parseQuarterEnd(dashboardData?.quarterEndDate) ||
            new Date(new Date().getFullYear(), 2, 31, 23, 59, 59);

        const pickQuarter = (key) => {
            const list = Array.isArray(dashboardData?.[key]) ? dashboardData[key] : [];
            const footer = list.find((x) => x?._type === "footer") || {};

            const items = list
                .filter((x) => x && x._type !== "footer")
                .map((x) => ({
                    id: x.id,
                    name: x.name,
                    salesStage: x.salesStage,
                    status: x.status,
                    dealAmount: x.dealAmount,
                    closeDate: x.closeDate,
                }));

            return {
                items,
                commit: Number(footer.commit || 0),
                pipeline: Number(footer.pipeline || 0),
                upside: Number(footer.upside || 0),
            };
        };

        return {
            closedWon,
            closedTarget,
            pipelineItems,
            pipelineMax,
            quarterEndDate,
            q1: pickQuarter("quarter1"),
            q2: pickQuarter("quarter2"),
            q3: pickQuarter("quarter3"),
            q4: pickQuarter("quarter4"),
        };
    }, [dashboardData]);


    return (
        <div className="w-full p-3">
            {/* Top header row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-60">
                        <Select
                            options={yearOptions}
                            label="FY"
                            value={year}
                            onChange={(_, e) => {
                                if (e) {
                                    const y = Number(e.id);
                                    setYear(y);
                                    handleGetDashboardData(y, periodType);
                                }
                            }}
                        >
                        </Select>
                    </div>

                    <div className="w-60">
                        <Select
                            options={periodTypes}
                            label="Period"
                            value={periodTypeId}
                            onChange={(_, e) => {
                                if (e) {
                                    const p = e.title;
                                    setPeriodType(p);
                                    setPeriodTypeId(e.id)
                                    handleGetDashboardData(year, p);
                                }
                            }}
                        >
                        </Select>
                    </div>
                </div>
            </div>

            {/* Top 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Components.Card className="shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-slate-700 px-4 py-2 flex items-center justify-between">
                        <Components.Typography className="text-white font-semibold text-sm">CLOSED DEALS</Components.Typography>
                        <span className="text-xs bg-white/10 text-white px-2 py-1 rounded"> {periodType} </span>
                    </div>
                    <div className="h-[2px] bg-red-500" />
                    <Components.CardContent className="p-4">
                        <SemiGauge value={ui.closedWon} target={ui.closedTarget} />
                    </Components.CardContent>
                </Components.Card>

                {/* <Components.Card className="shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-slate-700 px-4 py-2">
                        <Components.Typography className="text-white font-semibold text-sm">PIPELINE</Components.Typography>
                    </div>
                    <div className="h-[2px] bg-red-500" />
                    <Components.CardContent className="p-4">
                        <StackedBar items={ui.pipelineItems} maxValue={ui.pipelineMax} />
                    </Components.CardContent>
                </Components.Card> */}

                <Components.Card className="shadow-sm rounded-xl overflow-hidden">
                    <div className="bg-slate-700 px-4 py-2">
                        <Components.Typography className="text-white font-semibold text-sm">
                            REMAINING DAYS - (FY {year})
                        </Components.Typography>
                    </div>
                    <div className="h-[2px] bg-red-500" />
                    <Components.CardContent className="p-4 h-[210px]">
                        <Countdown endDate={ui.quarterEndDate} />
                    </Components.CardContent>
                </Components.Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5">
                <QuarterCard title={`Q1 (${year})`} items={ui.q1.items} commit={ui.q1.commit} upside={ui.q1.upside} />
                <QuarterCard title={`Q2 (${year})`} items={ui.q2.items} commit={ui.q2.commit} upside={ui.q2.upside} />
                <QuarterCard title={`Q3 (${year})`} items={ui.q3.items} commit={ui.q3.commit} upside={ui.q3.commit ? ui.q3.upside : ui.q3.upside} />
                <QuarterCard title={`Q4 (${year})`} items={ui.q4.items} commit={ui.q4.commit} upside={ui.q4.upside} />
            </div>
        </div>
    );
};

export default Dashboard;

// import React, { useEffect, useState } from "react";
// import { NavLink } from "react-router-dom";
// import { getDashboardData } from "../../service/customers/customersService";

// const DashboardCard = ({ title, subtitle, value, label, stats, buttonText }) => {
//     return (
//         <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center w-full md:w-1/3">
//             {/* Title & Subtitle */}
//             <div className="text-center mb-4">
//                 <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
//                 <p className="text-sm text-gray-500">{subtitle}</p>
//             </div>

//             {/* Circle Value */}
//             <div className="relative flex items-center justify-center mb-4">
//                 <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
//                     <div className="text-center">
//                         <p className="text-2xl font-semibold text-gray-800">{value}</p>
//                         <p className="text-sm text-gray-500">{label}</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Stats
//             <div className="space-y-2 mb-4">
//                 {stats.map((stat, index) => (
//                     <div key={index} className="flex items-center text-sm">
//                         <span
//                             className={`w-3 h-3 rounded-full mr-2`}
//                             style={{ backgroundColor: stat.color }}
//                         ></span>
//                         <span className="text-gray-700">{stat.text}</span>
//                     </div>
//                 ))}
//             </div> */}

//             {/* Button */}
//             <NavLink to={`/dashboard/${title.toLowerCase()}`}>
//                 <button className="border border-gray-400 text-sm px-4 py-2 rounded-full hover:bg-gray-100">
//                     {buttonText}
//                 </button>
//             </NavLink>
//         </div>
//     );
// };

// const Dashboard = () => {
//     const [dashboardData, setDashboardData] = useState(null);

//     const handleGetDashboardData = async () => {
//         const res = await getDashboardData({
//             "year": 2025,
//             "periodType": "YEAR"
//         }
//         );
//         // setDashboardData(res.data?.result);
//     }

//     useEffect(() => {
//         document.title = "Dashboard - 360Pipe"
//         handleGetDashboardData();
//     }, []);

//     return (
//         <div className="flex flex-col md:flex-row gap-6 w-full">
//             {/* Close Deals */}
//             <DashboardCard
//                 title="Opportunities"
//                 subtitle="Opportunities owned by me"
//                 value={dashboardData?.opportunityCount || "0"}
//                 label="Opportunities"
//                 buttonText="View Opportunities"
//             />

//             {/* Plan My Accounts */}
//             <DashboardCard
//                 title="Accounts"
//                 subtitle="Accounts owned by me"
//                 value={dashboardData?.accountCount || "0"}
//                 label="Accounts"
//                 buttonText="View Accounts"
//             // stats={[
//             //     { text: "0 Upcoming Activity", color: "#34D399" },
//             //     { text: "0 Past Activity", color: "#60A5FA" },
//             //     { text: "0 No Activity", color: "#FCA5A5" },
//             // ]}
//             />

//             {/* Grow Relationships */}
//             <DashboardCard
//                 title="Contacts"
//                 subtitle="Contacts owned by me"
//                 value={dashboardData?.contactCount || "0"}
//                 label="Contacts"
//                 buttonText="View Contacts"
//             // stats={[
//             //     { text: "0 Upcoming Activity", color: "#34D399" },
//             //     { text: "0 Past Activity", color: "#60A5FA" },
//             //     { text: "5 No Activity", color: "#FCA5A5" },
//             // ]}
//             />
//         </div>
//     );
// };

// export default Dashboard;