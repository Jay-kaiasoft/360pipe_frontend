import { customersURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

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