import { googleCalendarUrl } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const googleCalendarOauth = (data) => {
    return axiosInterceptor().get(googleCalendarUrl + `/oauth${data}`).then(res => res)
}