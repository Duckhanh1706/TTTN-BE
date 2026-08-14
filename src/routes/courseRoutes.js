import express from "express";
import upload from "../middlewares/upload.js";
import {
  getAllCourses,
  getTeacherCourses,
  getCourseById,
  createCourse,
  updateCourse,
  getAdminAllCourses,
  approveCourse,
  rejectCourse,
} from "../controllers/courseController.js";
import { getTeacherAnalytics } from "../controllers/analyticsController.js";
import {
  verifyToken,
  isTeacher,
  isAdmin,
} from "../middlewares/authMiddlewares.js";

const router = express.Router();

// 1. Quản trị Admin
router.get("/admin/all", verifyToken, isAdmin, getAdminAllCourses);
router.put("/admin/:id/approve", verifyToken, isAdmin, approveCourse);
router.put("/admin/:id/reject", verifyToken, isAdmin, rejectCourse);

// 2. Thống kê và danh sách Giảng viên
router.get("/teacher/analytics", verifyToken, isTeacher, getTeacherAnalytics);
router.get("/teacher/my-courses", verifyToken, isTeacher, getTeacherCourses);

// 3. Cơ bản chung & Cập nhật
router.get("/", getAllCourses);
router.post("/", verifyToken, createCourse);

// Đã gắn thêm middleware upload.single để xử lý FormData và file thumbnail
router.put("/:id", verifyToken, upload.single("thumbnail"), updateCourse);

// 4. Route động theo ID
router.get("/:id", getCourseById);

export default router;
