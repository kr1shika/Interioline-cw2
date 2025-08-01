const requestBuckets = new Map();

const createRateLimiter = ({ windowMs, max }) => {
    return (req, res, next) => {
        const key = req.ip + req.originalUrl;
        const now = Date.now();
        const bucket = requestBuckets.get(key) || { count: 0, firstRequest: now };

        if (now - bucket.firstRequest > windowMs) {
            requestBuckets.set(key, { count: 1, firstRequest: now });
            return next();
        }

        if (bucket.count >= max) {
            return res.status(429).json({ error: "Too many requests. Please try again later." });
        }

        bucket.count++;
        requestBuckets.set(key, bucket);
        next();
    };
};

module.exports = createRateLimiter;
