export const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

export const requireFarmer = (req, res, next) => {
    if (req.userRole !== 'farmer') {
        return res.status(403).json({ message: 'Farmer only' });
    }
    next();
};

