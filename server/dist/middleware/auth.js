import jwt from 'jsonwebtoken';
export function requireAdmin(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or malformed Authorization header' });
        return;
    }
    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
