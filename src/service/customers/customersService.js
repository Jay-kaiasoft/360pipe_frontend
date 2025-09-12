import { customersURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const userLogin = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/login`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const addCustomer = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateCustomer = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${customersURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getCustomer = async (id) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const verifyEmail = async (email) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/verifyEmail?email=${email}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const verifyUsername = async (username) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/verifyUsername?username=${username}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const forgotPassword = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/forgotpassword`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const resetPassword = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/resetpassword`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const checkValidToken = async (token) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/validateToken?token=${token}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getDashboardData = async () => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/get/dashboard`)
        return response

    } catch (error) {
        console.log(error)
    }
}