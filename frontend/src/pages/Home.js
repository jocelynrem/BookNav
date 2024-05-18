import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

const Home = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('http://localhost:3000/api/test')
            .then(response => response.text())
            .then(data => setMessage(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <Header />
            <p>Welcome to BookNav!</p>
            <p>{message}</p>
        </div>
    );
};

export default Home;
