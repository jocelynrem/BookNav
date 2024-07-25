let apiUrl;

if (process.env.NODE_ENV === 'production') {
    apiUrl = process.env.REACT_APP_API_URL || 'https://librarynav-b0a201a9ab3a.herokuapp.com/api';
} else if (process.env.NODE_ENV === 'staging') {
    apiUrl = process.env.REACT_APP_STAGING_API_URL || 'https://booknav-backend-d849f051372e.herokuapp.com/api';
} else {
    apiUrl = process.env.REACT_APP_DEV_API_URL || 'http://localhost:3000/api';
}

if (!apiUrl) {
    throw new Error('API URL is not defined. Please check your environment configuration.');
}

export default apiUrl;
