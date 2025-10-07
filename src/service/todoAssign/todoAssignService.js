import { todoAssignURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllTodosAssign = async () => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/get/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodoAssignByTodoId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/getByTodo/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodoAssign = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTodoAssign = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${todoAssignURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTodoAssign = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${todoAssignURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteTodoAssign = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${todoAssignURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}