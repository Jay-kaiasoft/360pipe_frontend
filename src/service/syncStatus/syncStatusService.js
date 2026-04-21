import { syncStatusURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getSyncStatus = async () => {
    try {
        const response = await axiosInterceptor().get(`${syncStatusURL}/get`);
        return response.data;
    } catch (error) {
        throw error;
    }
};