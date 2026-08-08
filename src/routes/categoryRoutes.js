import express from "express";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// 1. Lấy danh sách tất cả danh mục (Dùng chung)
router.get("/", getAllCategories);

// 2. Thêm danh mục mới (Chỉ dành cho Admin)
router.post("/", verifyToken, isAdmin, createCategory);

// 3. Xóa danh mục theo ID (Chỉ dành cho Admin)
router.delete("/:id", verifyToken, isAdmin, deleteCategory);

export default router;
