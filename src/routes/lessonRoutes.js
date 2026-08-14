import express from "express";
import upload from "../middlewares/upload.js";
import {
  getLessonsByCourse,
  createLesson,
  getCommentsByLesson,
  createComment,
} from "../controllers/lessonController.js";

const router = express.Router();

router.get("/course/:courseId", getLessonsByCourse);
router.post("/", upload.single("video"), createLesson);
router.get("/:id/comments", getCommentsByLesson);
router.post("/:id/comments", createComment);

export default router;
