import { contactURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllContacts = async (params) => {
    try {
        const response = await axiosInterceptor().get(`${contactURL}/get/all?${params ? `?${params}` : ''}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
    }
};

export const getContactDetails = async (contactId) => {
    try {
        const response = await axiosInterceptor().get(`${contactURL}/get/${contactId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching contact details:", error);
        throw error;
    }
};

export const createContact = async (contactData) => {
    try {
        const response = await axiosInterceptor().post(`${contactURL}/create`, contactData);
        return response.data;
    } catch (error) {
        console.error("Error creating contact:", error);
        throw error;
    }
};

export const updateContact = async (contactId, contactData) => {
    try {
        const response = await axiosInterceptor().patch(`${contactURL}/update/${contactId}`, contactData);
        return response.data;
    } catch (error) {
        console.error("Error updating contact:", error);
        throw error;
    }
};

export const deleteContact = async (contactId) => {
    try {
        const response = await axiosInterceptor().delete(`${contactURL}/delete/${contactId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
    }
};

export const createAllContact = async (contactData) => {
    try {
        const response = await axiosInterceptor().post(`${contactURL}/create/all`, contactData);
        return response.data;
    } catch (error) {
        console.error("Error creating contact:", error);
        throw error;
    }
};