import express from "express";
import {
  getExamsByCourse,
  createExam,
  deleteExam,
  assignExam,
  getExamDetails,
} from "../controllers/examController.js";

const router = express.Router();

// Định nghĩa các tuyến đường (routes)
router.get("/courses/:courseId/exams", getExamsByCourse);
router.post("/courses/:courseId/exams", createExam);
router.delete("/exams/:id", deleteExam);
router.post("/exams/:id/assign", assignExam);
router.get("/exams/:id", getExamDetails);

export default router;
