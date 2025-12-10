import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { oauth2CallbackGoogleCalendar } from "../../../service/googleCalendar/googleCalendarService";
import { connect } from "react-redux";
import { setAlert } from "../../../redux/commonReducers/commonReducers";

const GoogleCalendarOAuthRedirect = ({ setAlert }) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
            navigate("/dashboard/calendar", { replace: true });
            return;
        }

        // prevent double-call in dev
        if (window.__googleCalendarOAuthHandled) {
            navigate("/dashboard/calendar", { replace: true });
            return;
        }
        window.__googleCalendarOAuthHandled = true;

        const run = async () => {
            try {
                const res = await oauth2CallbackGoogleCalendar(code, state);
                if (res.status === 200) {
                    navigate("/dashboard/calendar", { replace: true });
                } else {
                    setAlert({
                        open: true,
                        message: "Failed to complete Google OAuth",
                        type: "error"
                    })
                    navigate("/dashboard/calendar", { replace: true });
                }
            } catch (e) {
                console.error("Failed to complete Google OAuth", e);
                setAlert({
                    open: true,
                    message: "Failed to complete Google OAuth",
                    type: "error"
                })
            }
        };

        run();
    }, [location.search, navigate]);

    return <p>Connecting your Google Calendar...</p>;
};

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(GoogleCalendarOAuthRedirect)
