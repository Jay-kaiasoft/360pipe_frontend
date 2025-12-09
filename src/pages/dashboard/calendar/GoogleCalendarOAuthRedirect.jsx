// src/pages/googleCalendar/GoogleCalendarOAuthRedirect.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { oauth2CallbackGoogleCalendar } from "../../../service/googleCalendar/googleCalendarService";

const GoogleCalendarOAuthRedirect = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
            navigate("/dashboard/calendar?google=error");
            return;
        }

        const run = async () => {
            try {
                await oauth2CallbackGoogleCalendar(code, state);
                navigate("/dashboard/calendar?google=connected");
            } catch (e) {
                console.error("Failed to complete Google OAuth", e);
                navigate("/dashboard/calendar?google=error");
            }
        };

        run();
    }, [location, navigate]);

    return <p>Connecting your Google Calendar...</p>;
};

export default GoogleCalendarOAuthRedirect;
