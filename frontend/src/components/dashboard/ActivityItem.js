import React, { useState } from 'react';

const ActivityItem = ({ activity }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getBadgeClasses = (action) => {
        const baseClasses = "inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium min-w-[90px] justify-center";
        return `${baseClasses} text-gray-900 ring-1 ring-inset ring-gray-200`;
    };

    return (
        <li className="py-3">
            <div className="flex justify-between items-center">
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3">
                        <span
                            className={getBadgeClasses(activity.action)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <svg viewBox="0 0 6 6" aria-hidden="true" className={`h-1.5 w-1.5 ${activity.action === 'Checkout' ? 'fill-pink-500' : 'fill-green-500'}`}>
                                <circle r={3} cx={3} cy={3} />
                            </svg>
                            {activity.action === 'Checkout' ? 'Checked Out' : 'Returned'}
                        </span>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                </div>
            </div>
        </li>
    );
};

export default ActivityItem;
