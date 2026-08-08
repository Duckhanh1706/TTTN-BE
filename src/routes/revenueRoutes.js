import express from "express";
import { getRevenueStats } from "../controllers/revenueController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Lấy báo cáo thống kê doanh thu (Chỉ dành cho Admin)
router.get("/", verifyToken, isAdmin, getRevenueStats);

export default router;
