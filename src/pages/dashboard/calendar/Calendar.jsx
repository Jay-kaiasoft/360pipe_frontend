import { useEffect, useRef, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { ClickAwayListener, Menu, MenuItem, MenuList, Tooltip } from '@mui/material';
import CustomIcons from '../../../components/common/icons/CustomIcons';

import {
  getCalendarAuthentication,
  getGoogleCalendarEvents,
  handleConnectGoogle,
} from '../../../service/googleCalendar/googleCalendarService';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

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

const Calendar = ({ setAlert }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);


  const [date, setDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [thirdPartyCalendar, setThirdPartyCalendar] = useState(null)

  const dateForBigCalendar = date.toDate();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

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
    // newDate is a JS Date -> convert to dayjs and set
    setDate(dayjs(newDate));
  };

  const handleConnectWithGoogleCalendar = async () => {
    try {
      const res = await handleConnectGoogle();
      if (res?.status === 200) {
        window.location.href = res?.result?.url;
      } else {
        setAlert({
          open: true,
          message: res.message || 'Failed to connect Google Calendar',
          type: 'error',
        });
      }
    } catch (e) {
      console.error('Failed to connect Google Calendar', e);
      setAlert({
        open: true,
        message: 'Failed to connect Google Calendar',
        type: 'error',
      });
    }
  };

  const loadGoogleEvents = async (baseDate) => {
    try {
      if (thirdPartyCalendar) {
        const d = baseDate || date;
        const firstDayIso = d.startOf('month').toDate().toISOString();
        const lastDayIso = d.endOf('month').toDate().toISOString();

        const response = await getGoogleCalendarEvents(firstDayIso, lastDayIso);

        if (response?.status === 200 && Array.isArray(response?.result)) {
          const formatted = response.result.map((event) => ({
            id: event.id,
            title: event.summary,
            // backend gives epoch seconds -> convert to JS Date (ms)
            start: new Date(event.start * 1000),
            end: new Date(event.end * 1000),
            description: event.description,
            allDay: false,
          }));

          setEvents(formatted);
        } else {
          setAlert({
            open: true,
            message: 'Failed to fetch events',
            type: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Error loading Google Calendar events:', error);
      setAlert({
        open: true,
        message: 'Error loading Google Calendar events',
        type: 'error',
      });
    }
  };

  const displayGetCalendarAuthentication = () => {
    getCalendarAuthentication().then(res => {
      if (res.status === 200) {
        setThirdPartyCalendar(res.result);
      }
    })
  }

  useEffect(() => {
    displayGetCalendarAuthentication();
  }, []);

  useEffect(() => {
    loadGoogleEvents(date);
  }, [thirdPartyCalendar, date]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 px-8 grow">
          <div>
            <p className="text-2xl font-bold">My Calendar</p>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <Tooltip title="Add" arrow>
              <div
                ref={anchorRef}                           // ✅ attach ref here
                onClick={handleToggle}
                className="group w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-600 transition-all cursor-pointer"
              >
                <CustomIcons
                  iconName="fa-solid fa-plus"
                  css="w-4 h-4 group-hover:text-white"
                />
              </div>
            </Tooltip>

            <ClickAwayListener onClickAway={handleClose}>
              <Menu
                id="basic-menu"
                anchorEl={anchorRef.current}
                open={open}
                onClose={handleClose}
              >
                {thirdPartyCalendar !== null && !thirdPartyCalendar?.googleCalendar && (
                  <MenuItem
                    onClick={(event) => {
                      handleConnectWithGoogleCalendar();
                      handleClose(event);
                    }}
                  >
                    <img
                      src={"/images/googlecalendar.png"}
                      alt="Google Calendar"
                      style={{ width: "20px" }}
                      className="mr-2"
                    />
                    Connect Google Calendar
                  </MenuItem>
                )}

                {thirdPartyCalendar !== null && !thirdPartyCalendar?.outlookCalendar && (
                  <MenuItem>
                    <img
                      src={"/images/outlookcalendar.png"}
                      alt="Outlook Calendar"
                      style={{ width: "20px" }}
                      className="mr-2"
                    />
                    Connect Outlook Calendar
                  </MenuItem>
                )}
              </Menu>
            </ClickAwayListener>

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
        <div>
          {
            (thirdPartyCalendar !== null && (thirdPartyCalendar?.googleCalendar || thirdPartyCalendar.outlookCalendar)) &&
            <div className='flex justify-start items-center gap-3'>
              <span>Connected To :</span>
              <Tooltip title={thirdPartyCalendar?.googleCalendarEmail} arrow>
                {thirdPartyCalendar?.googleCalendar && <img src={"/images/googlecalendar.png"} alt="Google Calendar" style={{ width: "30px" }} className="mx-2 cursor-pointer" />}
              </Tooltip>
              <Tooltip title={thirdPartyCalendar?.outlookCalendarEmail} arrow>
                {thirdPartyCalendar?.outlookCalendar && <img src={"/images/outlookcalendar.png"} alt="Outlook Calendar" style={{ width: "30px" }} className="cursor-pointer" />}
              </Tooltip>

            </div>
          }
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
          className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-lg ${toolbar.view === 'month'
            ? 'bg-gray-200 text-gray-900'
            : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
        >
          Month
        </button>
        <button
          onClick={() => toolbar.onView('week')}
          className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-300 ${toolbar.view === 'week'
            ? 'bg-gray-200 text-gray-900'
            : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
        >
          Week
        </button>
        <button
          onClick={() => toolbar.onView('day')}
          className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-lg ${toolbar.view === 'day'
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

const mapDispatchToProps = {
  setAlert,
};

export default connect(null, mapDispatchToProps)(Calendar);
