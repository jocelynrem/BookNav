let apiUrl;

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('STAGING_API_URL:', process.env.REACT_APP_STAGING_API_URL);

if (process.env.NODE_ENV === 'production') {
    apiUrl = process.env.REACT_APP_PROD_API_URL;
} else if (process.env.NODE_ENV === 'staging') {
    apiUrl = process.env.REACT_APP_STAGING_API_URL;
} else {
    apiUrl = process.env.REACT_APP_DEV_API_URL;
}

if (!apiUrl) {
    throw new Error('API URL is not defined. Please check your environment configuration.');
}

export default apiUrl;
