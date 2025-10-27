import React from 'react'
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';

import { googleCalendarUrl } from '../../config/config';
import { googleCalendarOauth } from '../../service/calendar/calendar';
import { userTimeZone } from '../../service/common/commonService';
import Button from '../../components/common/buttons/button';

const MyCalendar = ({ setAlert }) => {

    console.log("userTimeZone", userTimeZone)
    const handleClickGoogleCalendar = async () => {
        let x = window.innerWidth / 2 - 600 / 2;
        let y = window.innerHeight / 2 - 700 / 2;
        window.open(googleCalendarUrl + '/googleCalendarSignIn', "GoogleCalendarWindow", "width=600,height=700,left=" + x + ",top=" + y);
        window.gcSuccess = function (data) {
            googleCalendarOauth(data).then(res => {
                if (res.status === 200) {
                    // displayGetCalendarAuthentication();
                    let tz = userTimeZone();
                    // getSync(tz).then(response => {
                    //     if (response.status === 200) {
                    //         // getEventListOnRangeChange(currentRange)

                    //     }
                    // })
                } else {
                    setAlert({
                        open: true,
                        type: "Error",
                        text: res.message,
                    });
                }
            });
        }
        window.gcError = function () {
            setAlert({
                open: true,
                type: "Error",
                text: "Something went wrong!!!",
            });
        }
    }

    return (
        <div className='flex justify-center items-center'>
            <div className='w-96'>
                <Button onClick={() => handleClickGoogleCalendar()} text={"Connect to google calendar"} />
            </div>
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(MyCalendar)