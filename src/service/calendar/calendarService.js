import { calendarURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const saveEvents = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${calendarURL}/saveEvent`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching actions:", error);
        throw error;
    }
};