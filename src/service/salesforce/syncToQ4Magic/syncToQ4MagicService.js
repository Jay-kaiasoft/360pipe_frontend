import { q4magicSyncURL } from "../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"


export const syncToQ4Magic = async () => {
    const accessToken = sessionStorage.getItem("accessToken_salesforce");
    const instanceUrl = sessionStorage.getItem("instanceUrl_salesforce");
    try {
        const response = await axiosInterceptor().get(`${q4magicSyncURL}?access_token=${accessToken}&instance_url=${instanceUrl}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error syncing to Q4Magic: ${error.message}`);
    }
};
