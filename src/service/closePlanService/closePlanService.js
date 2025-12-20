import { closeplanURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const saveClosePlan = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${closeplanURL}/saveClosePlan`, data);
        return response.data;
    } catch (error) {
        console.error("Error create close plan", error);
        throw error;
    }
};