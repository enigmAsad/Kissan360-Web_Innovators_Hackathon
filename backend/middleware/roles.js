export const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
};

export const requireFarmer = (req, res, next) => {
    if (req.userRole !== 'farmer') {
        return res.status(403).json({ message: 'Farmer only' });
    }
    next();
};

