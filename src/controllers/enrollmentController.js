import db from "../config/db.js";

// Đăng ký khóa học cho học viên đang đăng nhập
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực người dùng!",
      });
    }

    const courseId = req.body.courseId || req.body.course_id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã khóa học!",
      });
    }

    // Kiểm tra xem đã đăng ký khóa học này trước đó chưa
    const [existing] = await db.execute(
      "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, courseId],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đăng ký khóa học này rồi!",
      });
    }

    // Ghi nhận đăng ký vào CSDL
    await db.execute(
      "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, courseId],
    );

    return res.status(201).json({
      success: true,
      message: "Đăng ký khóa học thành công!",
    });
  } catch (error) {
    console.error("Lỗi đăng ký khóa học:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi đăng ký khóa học: " + error.message,
    });
  }
};

// Lấy danh sách khóa học thực tế mà học viên đã đăng ký
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT c.*, e.enrolled_at 
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách khóa học của tôi:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
    });
  }
};
