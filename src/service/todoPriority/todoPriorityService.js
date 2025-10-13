import { todoPriorityURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllTodosPriority = async () => {
    try {
        const response = await axiosInterceptor().get(`${todoPriorityURL}/getByUser`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const changeTodoPriority = async (newPriority) => {
    try {
        const response = await axiosInterceptor().post(`${todoPriorityURL}/change`, newPriority);
        return response.data;
    } catch (error) {
        throw error;
    }
};