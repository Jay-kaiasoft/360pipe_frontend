import { salesforceBaseURL } from "../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"

export const connectToSalesforce = async () => {
    try {
        const response = await axiosInterceptor().get(`${salesforceBaseURL}/connectToSalesforce`)
        return response.data;
    } catch (error) {
        throw new Error(`Error connecting to Salesforce: ${error.message}`);
    }
}
