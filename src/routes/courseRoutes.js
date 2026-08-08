import express from "express";
import {
  getAllCourses,
  getTeacherCourses,
  getCourseById,
  createCourse,
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

// 1. Các route quản trị khóa học của Admin (Đặt trên cùng để tránh trùng khớp /:id)
router.get("/admin/all", verifyToken, isAdmin, getAdminAllCourses);
router.put("/admin/:id/approve", verifyToken, isAdmin, approveCourse);
router.put("/admin/:id/reject", verifyToken, isAdmin, rejectCourse);

// 2. Các route thống kê và lấy danh sách riêng của giảng viên
router.get("/teacher/analytics", verifyToken, isTeacher, getTeacherAnalytics);
router.get("/teacher/my-courses", verifyToken, isTeacher, getTeacherCourses);

// 3. Các route cơ bản chung
router.get("/", getAllCourses);
router.post("/", verifyToken, createCourse);

// 4. Route động theo ID (Đặt ở cuối)
router.get("/:id", getCourseById);

export default router;
