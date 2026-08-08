import express from "express";
import db from "../config/db.js"; // Đảm bảo đường dẫn đúng tới file cấu hình MySQL của bạn

const router = express.Router();

// 1. API Lấy danh sách bài học theo khóa học
router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const [lessons] = await db.query(
      "SELECT id, course_id, title, video_url, content, position FROM lessons WHERE course_id = ?",
      [courseId],
    );

    return res.status(200).json(lessons);
  } catch (error) {
    console.error("Lỗi truy vấn cơ sở dữ liệu bài học:", error.message);
    return res
      .status(500)
      .json({ message: "Lỗi Server nội bộ", error: error.message });
  }
});

// ==========================================
// BỔ SUNG 2 API CHO PHẦN BÌNH LUẬN (HỎI ĐÁP)
// ==========================================

// 2. API Lấy danh sách bình luận của 1 bài học
router.get("/:id/comments", async (req, res) => {
  try {
    const lessonId = req.params.id;

    const [comments] = await db.query(
      "SELECT id, lesson_id, user_name AS author, avatar, content AS text, created_at AS time FROM comments WHERE lesson_id = ? ORDER BY id DESC",
      [lessonId],
    );

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Lỗi lấy danh sách bình luận:", error.message);
    return res
      .status(500)
      .json({ message: "Lỗi Server nội bộ", error: error.message });
  }
});

// 3. API Thêm bình luận mới vào CSDL
router.post("/:id/comments", async (req, res) => {
  try {
    const lessonId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Nội dung bình luận không được để trống" });
    }

    // Bạn có thể lấy tên user từ session/token đăng nhập nếu có, tạm thời gán mặc định là "Học viên"
    const author = "Học viên";
    const avatar =
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100";
    const time = "Vừa xong";

    const [result] = await db.query(
      "INSERT INTO comments (lesson_id, user_name, avatar, content) VALUES (?, ?, ?, ?)",
      [lessonId, author, avatar, content],
    );

    const newComment = {
      id: result.insertId,
      lesson_id: lessonId,
      author: author,
      avatar: avatar,
      text: content,
      time: time,
    };

    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error.message);
    return res
      .status(500)
      .json({ message: "Lỗi Server nội bộ", error: error.message });
  }
});

export default router;
