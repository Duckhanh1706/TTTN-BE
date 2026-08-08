import express from "express";
import {
  register,
  login,
  adminLogin, // <-- Thêm hàm adminLogin vào đây
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Định nghĩa endpoint Đăng ký và Đăng nhập
router.post("/register", register);
router.post("/login", login); // (Nếu thiếu route login thường thì bạn bổ sung luôn dòng này)
router.post("/admin-login", adminLogin);

// Định nghĩa endpoint Quản lý hồ sơ (Yêu cầu xác thực token)
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

export default router;
