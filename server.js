const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();
require("dotenv").config();

const userRouter = require("./src/routes/authenticationRouter");
const superAdminRouter = require("./src/routes/superAdminRouter");
const adminRouter = require("./src/routes/adminRouter");
const turfUserRouter = require("./src/routes/userRouter");
const bookingRouter = require("./src/routes/bookingRouter");
const reviewRouter = require("./src/routes/reviewRouter");
const managerRouter = require("./src/routes/managerRouter");
const paymentRouter = require("./src/routes/paymentRouter");
const {
  getUserMiddleware,
} = require("./src/middlewares/authenticationMiddleware");

const port = process.env.PORT;
const dbConnectionLink = process.env.DB_CONNECTION_LINK;

mongoose.connect(dbConnectionLink).then((res) => {
  console.log("db connected");
});

app.set('trust proxy', 1);

// Security Headers with Stripe CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://js.stripe.com", "https://m.stripe.network", "blob:"],
      "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      "connect-src": ["'self'", "https://api.stripe.com", "https://m.stripe.network", "http://localhost:3000"],
    },
  },
}));

// Rate Limiting Configuration
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit for auth/payment
  message: { message: "Too many attempts from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Apply limiters
app.use("/api/", globalLimiter);
app.use("/api/user/login", strictLimiter);
app.use("/api/user/register", strictLimiter);
app.use("/api/payment", strictLimiter);

app.use(getUserMiddleware);

app.get("/", (req, res) => {
  res.send("<h1>gym id working</h1>");
});

app.use("/api/user", userRouter);
app.use("/api/superAdmin", superAdminRouter);
app.use("/api/admin", adminRouter);
app.use("/api/turf", turfUserRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/review", reviewRouter);
app.use("/api/manager", managerRouter);
app.use("/api/payment", paymentRouter);

app.listen(port, () => {
  console.log(`server running ON PORT ${port}...`);
});
