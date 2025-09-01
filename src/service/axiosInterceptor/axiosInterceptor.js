import axios from "axios";
import store from "../../redux/store";
import { setLoading } from "../../redux/commonReducers/commonReducers";

const baseURL = process.env.REACT_APP_MAIN_BASE_URL;

const axiosInterceptor = (signal) => {
    let headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
    };
    
    if (sessionStorage.getItem("authToken")) {
        headers.Authorization = "Bearer " + sessionStorage.getItem("authToken");
    }
    
    const axiosInstance = axios.create({
        baseURL: baseURL,
        headers,
        validateStatus: function (status) {
            return status <= 500;
        },
    });

    // Request Interceptor
    axiosInstance.interceptors.request.use(
        (config) => {
            store.dispatch(setLoading(true)); // Update loading state

            // Attach the AbortSignal if provided
            if (signal) {
                config.signal = signal;
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response Interceptor
    axiosInstance.interceptors.response.use(
        (response) => {
            if (typeof response.data.result !== "undefined") {
                if (response.data.result.token) {
                    sessionStorage.setItem("authToken", response.data.result.token);
                }
            }
            store.dispatch(setLoading(false)); // Set loading to false
            return response; // Return the whole response object for further handling
        },
        (error) => {
            store.dispatch(setLoading(false)); // Set loading to false on error

            // Handle request cancellation error
            if (axios.isCancel(error)) {
                console.log("Request canceled:", error.message);
            } else {
                console.error("API Error:", error);
            }

            return Promise.reject(error);
        }
    );

    return axiosInstance;
};

export default axiosInterceptor;
