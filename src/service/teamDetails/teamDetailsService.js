import { teamDetailsURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllTeams = async () => {
    try {
        const response = await axiosInterceptor().get(`${teamDetailsURL}/get/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTeamDetailsId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${teamDetailsURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTeam = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${teamDetailsURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTeam = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${teamDetailsURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteTeam = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${teamDetailsURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};