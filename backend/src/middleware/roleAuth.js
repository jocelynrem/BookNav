const jwt = require('jsonwebtoken');
const User = require('../models/User');

const roleAuth = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(req.user.id);

        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};

module.exports = roleAuth;