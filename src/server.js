import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import userRouter from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import examRoutes from "./routes/examRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/admin/users", userRouter);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/revenue", revenueRoutes);
app.use("/api/admin/promotions", promotionRoutes);
app.use("/api/admin/payments", paymentRoutes);
app.use("/api/admin/certificates", certificateRoutes);
app.use("/api", examRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API E-Learning Backend đang hoạt động tốt!" });
});

app.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại cổng ${PORT}`);
});
