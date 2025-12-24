import { salesforceBaseURL } from "../../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"

export const connectToSalesforce = async () => {
    try {
        const response = await axiosInterceptor().get(`${salesforceBaseURL}/connectToSalesforce`)
        return response.data;
    } catch (error) {
        throw new Error(`Error connecting to Salesforce: ${error.message}`);
    }
}

export const exchangeToken = async (code) => {
    try {
        const response = await axiosInterceptor().get(`${salesforceBaseURL}/exchangeToken?code=${encodeURIComponent(code)}`)
        return response.data;
    } catch (error) {
        throw new Error(`Error exchanging token: ${error.message}`);
    }
}

export const getUserInfo = async () => {
    const accessToken = localStorage.getItem("accessToken_salesforce");
    const instanceUrl = localStorage.getItem("instanceUrl_salesforce");
    try {
        const response = await axiosInterceptor().get(`${salesforceBaseURL}/userInfo?accessToken=${accessToken}&instanceUrl=${instanceUrl}`)
        return response.data;
    } catch (error) {
        throw new Error(`Error getting user data: ${error.message}`);
    }
}
