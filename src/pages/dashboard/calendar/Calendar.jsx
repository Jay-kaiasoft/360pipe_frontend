import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { Tooltip } from '@mui/material';
import CustomIcons from '../../../components/common/icons/CustomIcons';

import { handleConnectGoogle } from '../../../service/googleCalendar/googleCalendarService';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const Calendar = () => {
    const [date, setDate] = useState(dayjs());
    const location = useLocation();

    // Optional: check if google=connected is present in URL
    const searchParams = new URLSearchParams(location.search);
    const isGoogleConnected = searchParams.get('google') === 'connected';

    // Dummy static events for now
    const events = [
        {
            title: 'Meeting',
            start: new Date(2025, 11, 9, 10, 0), // Dec 9, 2025
            end: new Date(2025, 11, 9, 11, 0),
        },
    ];

    const dateForBigCalendar = date.toDate();

    const handleMuiDateChange = (newValue) => {
        if (!newValue) return;
        setDate(newValue);
    };

    const handleMuiMonthChange = (newMonth) => {
        if (!newMonth) return;
        setDate(newMonth.startOf('month'));
    };

    const handleMuiYearChange = (newYear) => {
        if (!newYear) return;
        setDate(newYear.startOf('month'));
    };

    const handleBigCalendarNavigate = (newDate) => {
        setDate(dayjs(newDate));
    };

    const handleConnectWithGoogleCalendar = async () => {
        try {
            const res = await handleConnectGoogle(); // should call /google-calendar/auth-url
            if (res?.url) {
                window.location.href = res.url; // redirect to Google consent
            }
        } catch (e) {
            console.error('Failed to connect Google Calendar', e);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 px-8">
                    <div>
                        <p className="text-2xl font-bold">My Calendar</p>
                        {isGoogleConnected && (
                            <p className="text-sm text-green-600">
                                Google Calendar connected successfully.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-lg">
                        <Tooltip title="Connect Google Calendar" arrow>
                            <div
                                onClick={handleConnectWithGoogleCalendar}
                                className="group w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-600 transition-all cursor-pointer"
                            >
                                <CustomIcons
                                    iconName="fa-solid fa-plus"
                                    css="w-4 h-4 group-hover:text-white"
                                />
                            </div>
                        </Tooltip>

                        <Tooltip title="Appointment Link" arrow>
                            <div className="group w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600 transition-all cursor-pointer">
                                <CustomIcons
                                    iconName="fa-solid fa-link"
                                    css="w-4 h-4 group-hover:text-white"
                                />
                            </div>
                        </Tooltip>

                        <Tooltip title="My Calendar Setting" arrow>
                            <div className="group w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-600 transition-all cursor-pointer">
                                <CustomIcons
                                    iconName="fa-solid fa-gear"
                                    css="w-4 h-4 group-hover:text-white"
                                />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 h-full">
                {/* LEFT SIDEBAR */}
                <div className="w-full lg:w-1/4 flex flex-col gap-6">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                            value={date}
                            onChange={handleMuiDateChange}
                            onMonthChange={handleMuiMonthChange}
                            onYearChange={handleMuiYearChange}
                            views={['year', 'day']}
                            showDaysOutsideCurrentMonth
                            sx={{
                                '& .MuiDayCalendar-weekDayLabel': {
                                    color: '#000000',
                                    fontWeight: 500,
                                },
                                '& .Mui-selected': {
                                    backgroundColor: '#3b82f6 !important',
                                    color: 'white !important',
                                },
                                '& .MuiPickersYear-yearButton.Mui-selected': {
                                    backgroundColor: '#3b82f6 !important',
                                    color: 'white !important',
                                },
                                '& .MuiPickersDay-root:not(.Mui-selected):hover': {
                                    backgroundColor: '#93c5fd',
                                },
                                '& .MuiPickersYear-yearButton:not(.Mui-selected):hover': {
                                    backgroundColor: '#93c5fd',
                                },
                                '& .MuiPickersDay-today': {
                                    border: '1px solid #3b82f6 !important',
                                },
                            }}
                        />
                    </LocalizationProvider>
                </div>

                {/* MAIN CALENDAR */}
                <div className="w-full lg:w-3/4 h-[800px]">
                    <BigCalendar
                        localizer={localizer}
                        selectable
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        date={dateForBigCalendar}
                        onNavigate={handleBigCalendarNavigate}
                        style={{ height: 700 }}
                        components={{
                            toolbar: (toolbarProps) => (
                                <CustomToolbar
                                    {...toolbarProps}
                                    currentDate={dateForBigCalendar}
                                />
                            ),
                        }}
                        views={['month', 'week', 'day']}
                    />
                </div>
            </div>
        </>
    );
};

const CustomToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    const label = () => {
        const date = toolbar.date || new Date();
        return (
            <span className="text-xl font-semibold text-gray-700">
                {format(date, 'MMMM yyyy')}
            </span>
        );
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex rounded-md shadow-sm" role="group">
                <button
                    onClick={goToCurrent}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50"
                >
                    Today
                </button>
                <button
                    onClick={goToBack}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={goToNext}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50"
                >
                    Next
                </button>
            </div>

            <div className="text-center">{label()}</div>

            <div className="flex rounded-md shadow-sm" role="group">
                <button
                    onClick={() => toolbar.onView('month')}
                    className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-lg ${
                        toolbar.view === 'month'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Month
                </button>
                <button
                    onClick={() => toolbar.onView('week')}
                    className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-300 ${
                        toolbar.view === 'week'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Week
                </button>
                <button
                    onClick={() => toolbar.onView('day')}
                    className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-lg ${
                        toolbar.view === 'day'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Day
                </button>
            </div>
        </div>
    );
};

export default Calendar;
// :contentReference[oaicite:0]{index=0}

// ---

// ### Summary of what you should change

// 1. **application.properties**
//    - Use `google.calendar.redirectUri=${serverurl}google-calendar/oauth2/callback`
//    - Keep `siteUrl=http://localhost:3000/`

// 2. **Controller**
//    - Inject `@Value("${siteUrl}")` and redirect to `siteUrl + "dashboard/calendar?google=connected"`.

// 3. **ServiceImpl**
//    - Initialize `RestTemplate` (`private RestTemplate restTemplate = new RestTemplate();`).

// 4. **Calendar.jsx**
//    - Remove `useParams` and the manual OAuth callback.
//    - Just call `/auth-url` to start OAuth and read `?google=connected` from URL.

// If you paste your `googleCalendarService` (frontend) file next, I can also double-check that the URLs and response shapes match exactly.
