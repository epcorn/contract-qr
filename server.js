require("dotenv").config();
require("express-async-errors");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const uploadImage = require("express-fileupload");
const contractRouter = require("./routes/contract");
const serviceRouter = require("./routes/service");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const feedbackRouter = require("./routes/feedbackRoute");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
const { authenticateUser } = require("./middleware/auth");
const path = require("path");
const express = require("express");
const { allValues } = require("./controllers/adminController");

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(cors());
// app.use(express.static("./public"));
app.use(express.json());
app.use(uploadImage({ useTempFiles: true }));
const port = process.env.PORT || 6000;

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(port, console.log(`server is listing on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};
start();

app.use("/api", authRouter);
app.use("/api/contracts", authenticateUser, contractRouter);
app.use("/api/service", authenticateUser, serviceRouter);
app.use("/api/user", authenticateUser, userRouter);
app.use("/api/admin", authenticateUser, adminRouter);
app.use("/api/feedback", feedbackRouter);

(function fn() {
  if (process.env.NODE_ENV === "production") {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "/client/dist")));
    app.get("*", (req, res) =>
      res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
    );
  } else {
    app.get("/", (req, res) => {
      res.send(`API is running....`);
    });
  }
})();

app.use(errorHandler);
app.use(notFound);
