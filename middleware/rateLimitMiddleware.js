import { rateLimit } from "express-rate-limit";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again after 15 minutes",
  },
});

export { authRateLimiter };
