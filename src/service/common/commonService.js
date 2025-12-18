import { fileUploadURL, dnsMxURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata" ? "Asia/Calcutta" : Intl.DateTimeFormat().resolvedOptions().timeZone;

export const partnerRoles = [
    { id: 1, title: "System Integrator" },
    { id: 2, title: "Agency" },
    { id: 3, title: "Advertiser" },
    { id: 4, title: "VAR/Reseller" },
    { id: 5, title: "Distributor" },
    { id: 6, title: "Developer" },
    { id: 7, title: "Broker" },
    { id: 8, title: "Lender" },
    { id: 9, title: "Supplier" },
    { id: 10, title: "Institution" },
    { id: 11, title: "Contractor" },
    { id: 12, title: "Dealer" },
    { id: 13, title: "Consultant" },
    { id: 14, title: "Vendor" },
    { id: 15, title: "Client" },
];

export const opportunityStages = [
    { id: 1, title: "Prospecting" },
    { id: 2, title: "Qualification" },
    { id: 3, title: "Needs Analysis" },
    { id: 4, title: "Value Proposition" },
    { id: 5, title: "Id. Decision Makers" },
    { id: 6, title: "Perception Analysis" },
    { id: 7, title: "Proposal/Price Quote" },
    { id: 8, title: "Negotiation/Review" },
    { id: 9, title: "Closed Won" },
    { id: 10, title: "Closed Lost" },
]

export const securityQuestions = [
    { id: 1, title: "What is your father’s middle name?" },
    { id: 2, title: "What high school did you attend?" },
    { id: 3, title: "Who was your childhood hero?" },
    { id: 4, title: "What is your favorite hobby?" },
    { id: 5, title: "What is the name of your favorite pet?" },
    { id: 6, title: "In what city were you born?" },
    { id: 7, title: "What is your mother's maiden name?" },
    { id: 8, title: "What was the name of your elementary school?" },
    { id: 9, title: "What was the make of your first car?" },
    { id: 10, title: "What was your favorite food as a child?" },
    { id: 11, title: "Where did you meet your spouse?" },
    { id: 12, title: "What year was your father (or mother) born?" }
];

export const opportunityContactRoles = [
    { id: 1, title: "Business User" },
    { id: 2, title: "Decision Maker" },
    { id: 3, title: "Economic Buyer" },
    { id: 4, title: "Economic Decision Maker" },
    { id: 5, title: "Evaluator" },
    { id: 6, title: "Executive Sponsor" },
    { id: 7, title: "Influencer" },
    { id: 8, title: "Technical Buyer" },
];

export const opportunityStatus = [
    { id: 1, title: "Commit" },
    { id: 2, title: "Upside" },
    { id: 3, title: "Pipeline" },
    { id: 4, title: "Won" },
    { id: 5, title: "Lost" },
];

export const statusColors = {
    "Pipeline": "#a09f9f",
    "Upside": "#FFC857",
    "Commit": "#4CAF50",
    "Lost": "#E53935",
    "Won": "#2E7D32",
};

export const stageColors = {
    "Prospecting": "#9e9e9e",
    "Qualification": "#f4c542",
    "Needs Analysis": "#4CAF50",
    "Value Proposition": "#42A5F5",
    "Id. Decision Makers": "#F57C00",
    "Perception Analysis": "#9C27B0",
    "Proposal/Price Quote": "#1E88E5",
    "Negotiation/Review": "#9e9e9e",
    "Closed Won": "#2e7d32",
    "Closed Lost": "#d32f2f",
};


export const uploadFiles = async (data) => {
    try {
        const response = axiosInterceptor().post(`${fileUploadURL}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const handleConvertUTCDateToLocalDate = (utcDateString) => {

    if (!utcDateString) return null;

    try {
        // Parse the UTC date string
        const [datePart, timePart] = utcDateString.split(', ');
        const [month, day, year] = datePart.split('/');
        const [time, period] = timePart.split(' ');
        const [hours, minutes, seconds] = time.split(':');

        // Convert to 24-hour format
        let hours24 = parseInt(hours, 10);
        if (period === 'PM' && hours24 !== 12) hours24 += 12;
        if (period === 'AM' && hours24 === 12) hours24 = 0;

        // Create a Date object in UTC and convert to local time
        return new Date(Date.UTC(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            hours24,
            parseInt(minutes, 10),
            parseInt(seconds, 10)
        ));
    } catch (error) {
        console.error("Conversion error:", error);
        return null;
    }
};

export function handleFormateUTCDateToLocalDate(utcDateString) {
    const date = new Date(utcDateString);

    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const weekday = date.toLocaleString('en-US', { weekday: 'short' });

    return `${month} ${day}, ${weekday}`;
}

export const fetchAllTimeZones = async () => {
    try {
        // const response = axiosInterceptor().get(`${timeZoneURL}`)
        // const timeZones = response?.data?.result;

        const response = await fetch(`https://timeapi.io/api/timezone/availabletimezones`)
        const timeZones = await response.json();
        const formattedTimeZones = timeZones?.map((zone, index) => {
            const now = new Date();

            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: zone,
                timeZoneName: "longOffset",
            });

            const parts = formatter.formatToParts(now);
            let offsetString = parts.find((part) => part.type === "timeZoneName")?.value || "";
            offsetString = offsetString.replace("GMT", "UTC");

            return { id: index + 1, title: `(${offsetString}) ${zone}`, zone: `${zone}` };
        });
        return formattedTimeZones;
        // return response;
    } catch (error) {
        console.error("Error fetching time zones:", error);
        return []; // Return an empty array on failure
    }
}

export const getAllCountryList = async () => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/all`, {
            method: 'GET',
        })
        const data = await response.json();
        const simplifiedData = data?.map((country, index) => ({
            id: index + 1,
            title: country.name?.common || '',
            flag: country.flags?.png || '',
        }));
        return simplifiedData;
    } catch (error) {
        console.log(error)
    }
}

export const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatUtcToLocal = (utcTime, format = "hh:mm A") => {
    if (!utcTime) return "";
    return dayjs.utc(utcTime).tz(userTimeZone).format(format);
};

export const getStaticRoles = () => {
    return [
        {
            id: 1,
            title: 'Sales Representative',
        },
        {
            id: 2,
            title: 'Sales Consultant',
        },
        {
            id: 3,
            title: 'Sales Manager',
        },
        {
            id: 4,
            title: 'Sales Director',
        },
        {
            id: 5,
            title: 'Decision Maker',
        },
        {
            id: 6,
            title: 'Influencer-Advocate',
        },
        {
            id: 7,
            title: 'Economic Buyer',
        },
        {
            id: 8,
            title: 'Influencer-Challenger',
        },
        {
            id: 9,
            title: 'SME',
        },
        {
            id: 10,
            title: 'Technical Expert',
        },
    ];
}

export const getStaticRolesWithPermissions = () => {
    return getStaticRoles()?.map((item) => {
        const isSalesRep = item.title === 'Sales Representative';
        const isSalesManager = item.title === "Sales Manager"
        return {
            name: item.title,
            rolesActions: {
                "functionalities": [
                    {
                        "functionalityId": 2,
                        "functionalityName": "Account",
                        "modules": [
                            {
                                "moduleId": 2,
                                "moduleName": "Account",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": (isSalesRep || isSalesManager) ? [1, 2, 3, 4] : [4] // Full for Sales Rep, Read-only for others
                            },
                        ]
                    },
                    {
                        "functionalityId": 3,
                        "functionalityName": "Opportunities",
                        "modules": [
                            {
                                "moduleId": 3,
                                "moduleName": "Opportunities",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": (isSalesRep || isSalesManager) ? [1, 2, 3, 4] : [4] // Full for Sales Rep, Read-only for others
                            },
                        ]
                    },
                    {
                        "functionalityId": 4,
                        "functionalityName": "Contacts",
                        "modules": [
                            {
                                "moduleId": 4,
                                "moduleName": "Contacts",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": [1, 2, 3, 4]
                            },
                        ]
                    },
                    {
                        "functionalityId": 5,
                        "functionalityName": "My Team",
                        "modules": [
                            {
                                "moduleId": 5,
                                "moduleName": "My Team",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": (isSalesRep || isSalesManager) ? [1, 2, 3, 4] : [4]
                            },
                        ]
                    },
                    {
                        "functionalityId": 6,
                        "functionalityName": "Members",
                        "modules": [
                            {
                                "moduleId": 6,
                                "moduleName": "Members",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": (isSalesRep || isSalesManager) ? [1, 2, 3, 4] : [4] // Full for Sales Rep, Read-only for others
                            },
                        ]
                    },
                    {
                        "functionalityId": 7,
                        "functionalityName": "Todo",
                        "modules": [
                            {
                                "moduleId": 7,
                                "moduleName": "Todo",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": (isSalesRep || isSalesManager) ? [1, 2, 3, 4] : [4] // Full for Sales Rep, Read-only for others
                            },
                            {
                                "moduleId": 8,
                                "moduleName": "Assign Todo",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": (isSalesRep || isSalesManager) ? [1, 2, 3, 4] : [4] // Full for Sales Rep, Read-only for others
                            },
                        ]
                    },
                    {
                        "functionalityId": 9,
                        "functionalityName": "Sync History",
                        "modules": [
                            {
                                "moduleId": 9,
                                "moduleName": "Sync History",
                                "moduleAssignedActions": [4],
                                "roleAssignedActions": [4] // Full for Sales Rep, Read-only for others
                            },
                        ]
                    },
                    {
                        "functionalityId": 10,
                        "functionalityName": "E-Mail Scraper",
                        "modules": [
                            {
                                "moduleId": 10,
                                "moduleName": "E-Mail Scraper",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": (isSalesRep || isSalesManager) ? [1, 2, 3, 4] : [4] // Full for Sales Rep, Read-only for others
                            },
                        ]
                    },
                    {
                        "functionalityId": 11,
                        "functionalityName": "Products & Service",
                        "modules": [
                            {
                                "moduleId": 11,
                                "moduleName": "Products & Service",
                                "moduleAssignedActions": [1, 2, 3, 4],
                                "roleAssignedActions": (isSalesRep || isSalesManager) ? [1, 2, 3, 4] : [4] // Full for Sales Rep, Read-only for others
                            },
                        ]
                    },
                ]
            }
        }
    })
}

export const fetchDNSMXRecords = async (domain) => {
    try {
        const response = await axiosInterceptor().get(`${dnsMxURL}?domain=${domain}`);
        return response;
    } catch (error) {
        console.error("Error fetching DNS MX records:", error);
        throw error;
    }
}

export const handleGetRepeatEveryList = () => {
    const repeatEveryList = [];
    for (let i = 1; i < 100; i++) {
        repeatEveryList.push({
            id: i,
            title: i,
            value: i
        });
    }
    return repeatEveryList
}

export const dateTimeFormatDB = (value) => {
    if (!value) return null;
    return dayjs(value).format('MM/DD/YYYY HH:mm:ss');
}