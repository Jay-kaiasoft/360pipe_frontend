import { syncFromQ4magicURL } from "../../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"

export const syncFromQ4magic = async () => {
    const accessToken = localStorage.getItem("accessToken_salesforce");
    const instanceUrl = localStorage.getItem("instanceUrl_salesforce");
    try {
        const response = await axiosInterceptor().get(`${syncFromQ4magicURL}?access_token=${accessToken}&instance_url=${instanceUrl}`);
        return response.data;
    } catch (error) {
        console.error("Error syncing from Q4Magic:", error);
        throw error;
    }
};