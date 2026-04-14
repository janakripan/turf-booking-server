const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
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

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
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
