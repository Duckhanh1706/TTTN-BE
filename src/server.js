import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js"; // <-- 1. Import route bài học
import userRouter from "./routes/userRoutes.js"; // <-- 1. Import route user
import categoryRoutes from "./routes/categoryRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js"; // <-- 1. Import route doanh thu
import promotionRoutes from "./routes/promotionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"; // <-- 1. Import route thanh toán
import certificateRoutes from "./routes/certificateRoutes.js"; // <-- 1. Import route chứng chỉ
import examRoutes from "./routes/examRoutes.js"; // <-- 1. Import route đề thi
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Sử dụng Routes API
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/lessons", lessonRoutes); // <-- 2. Đăng ký đường dẫn API cho bài học tại đây
app.use("/api/admin/users", userRouter);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/revenue", revenueRoutes); // <-- 2. Đăng ký đường dẫn API cho doanh thu tại đây
app.use("/api/admin/promotions", promotionRoutes); // <-- 2. Đăng ký đường dẫn API cho khuyến mãi tại đây
app.use("/api/admin/payments", paymentRoutes); // <-- 2. Đăng ký đường dẫn API cho thanh toán tại đây
app.use("/api/admin/certificates", certificateRoutes); // <-- 2. Đăng ký đường dẫn API cho chứng chỉ tại đây
app.use("/api", examRoutes); // <-- 2. Đăng ký đường dẫn API cho đề thi tại đây

// Route kiểm tra hệ thống
app.get("/", (req, res) => {
  res.json({ message: "API E-Learning Backend đang hoạt động tốt!" });
});

app.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại: http://localhost:${PORT}`);
});
