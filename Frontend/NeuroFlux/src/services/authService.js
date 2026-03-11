import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const login=async (email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
        return response.data;
    }catch (error) {
        throw error.response?.data || { message: "Login failed" };
    }
};

const register=async (username, email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, { username, email, password });
        return response.data;
    }catch (error) {
        throw error.response?.data || { message: "Registration failed" };
    }
};

const getProfile=async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data;
    }catch (error) {
        throw error.response?.data || { message: "Failed to retrieve profile" };
    }
};

const updateProfile=async (userData) => {
    try {
        const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
        return response.data;
    }catch (error) {
        throw error.response?.data || { message: "Failed to update profile" };
    }
};

const changePassword=async (currentPassword, newPassword) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
        return response.data;
    }catch (error) {
        throw error.response?.data || { message: "Failed to change password" };
    }
};

const forgotPassword=async (email) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
        return response.data;
    }catch (error) {
        throw error.response?.data || { message: "Failed to send reset email" };
    }
};

const authService = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
};

export default authService;