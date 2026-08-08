import db from "../config/db.js";

// Lấy danh sách đề kiểm tra theo khóa học
export const getExamsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const [rows] = await db.query("SELECT * FROM exams WHERE course_id = ?", [
      courseId,
    ]);
    res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy danh sách đề thi:", err);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// Tạo đề kiểm tra mới dựa trên lựa chọn của giảng viên
export const createExam = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, type, duration, questionsCount, status } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ message: "Tiêu đề đề thi không được để trống!" });
    }

    const [result] = await db.query(
      `INSERT INTO exams (course_id, title, type, duration, questions_count, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [courseId, title, type, duration, questionsCount, status || "Đang mở"],
    );

    res.status(201).json({
      message: "Tạo đề thi thành công!",
      exam: {
        id: result.insertId,
        course_id: courseId,
        title,
        type,
        duration,
        questionsCount,
        status: status || "Đang mở",
      },
    });
  } catch (err) {
    console.error("Lỗi khi tạo đề thi:", err);
    res.status(500).json({ message: "Lỗi server khi tạo đề thi" });
  }
};

// Xóa đề kiểm tra
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM exams WHERE id = ?", [id]);
    res.json({ message: "Đã xóa đề thi thành công!" });
  } catch (err) {
    console.error("Lỗi khi xóa đề thi:", err);
    res.status(500).json({ message: "Lỗi server khi xóa" });
  }
};

// Giao bài thi
export const assignExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query("UPDATE exams SET status = ? WHERE id = ?", [
      status || "Đã giao",
      id,
    ]);
    res.json({ message: "Đã giao bài thi và cập nhật trạng thái thành công!" });
  } catch (err) {
    console.error("Lỗi khi giao bài thi:", err);
    res.status(500).json({ message: "Lỗi server khi giao bài thi" });
  }
};

// Lấy chi tiết đề thi cho học viên làm bài
export const getExamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [examRows] = await db.query("SELECT * FROM exams WHERE id = ?", [id]);
    if (examRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra!" });
    }

    const [questionRows] = await db.query(
      "SELECT id, question_text, option_a, option_b, option_c, option_d, points FROM questions WHERE exam_id = ?",
      [id],
    );

    res.json({
      exam: examRows[0],
      questions: questionRows,
    });
  } catch (err) {
    console.error("Lỗi API lấy đề thi:", err);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};
