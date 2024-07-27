import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReadingTrends = ({ data }) => {
    return (
        <div>
            <h2 className="text-lg font-medium text-teal-800 mb-4">Reading Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#4FD1C5" />
                    <YAxis stroke="#4FD1C5" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="checkouts" fill="#F687B3" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ReadingTrends;