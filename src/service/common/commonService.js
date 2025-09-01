import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

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
