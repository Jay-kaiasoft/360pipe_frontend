export const getUserDetails = () => {
    const data = localStorage.getItem('userInfo');
    return data ? JSON.parse(data) : null;
}