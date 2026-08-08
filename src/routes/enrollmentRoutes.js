import express from "express";
import {
  enrollCourse,
  getMyEnrolledCourses,
} from "../controllers/enrollmentController.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/", verifyToken, enrollCourse); // Đăng ký khóa học mới
router.get("/my-courses", verifyToken, getMyEnrolledCourses); // Lấy khóa học đã mua

export default router;
