import db from "../config/db.js";

// 1. Lấy danh sách tất cả khóa học (Dùng cho trang chủ/danh sách chung)
export const getAllCourses = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*, 
        COUNT(DISTINCT l.id) AS lessons_count,
        COUNT(DISTINCT e.id) AS students_count
      FROM courses c 
      LEFT JOIN lessons l ON c.id = l.course_id 
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
    `;
    const [rows] = await db.execute(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách khóa học:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách khóa học",
    });
  }
};

// 1.1. Lấy danh sách khóa học CHỈ THUỘC VỀ giảng viên đang đăng nhập
export const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user ? req.user.id : null;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực thông tin giảng viên!",
      });
    }

    const query = `
      SELECT 
        c.*, 
        COUNT(DISTINCT l.id) AS lessons_count,
        COUNT(DISTINCT e.id) AS students_count
      FROM courses c 
      LEFT JOIN lessons l ON c.id = l.course_id 
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.teacher_id = ?
      GROUP BY c.id
    `;
    const [rows] = await db.execute(query, [teacherId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách khóa học của giảng viên:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách khóa học",
    });
  }
};

// 2. Lấy chi tiết một khóa học theo ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        c.*, 
        COUNT(l.id) AS lessons_count 
      FROM courses c 
      LEFT JOIN lessons l ON c.id = l.course_id 
      WHERE c.id = ?
      GROUP BY c.id
    `;
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khóa học" });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Lỗi lấy chi tiết khóa học:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy chi tiết khóa học",
    });
  }
};

// 3. Tạo khóa học mới
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      thumbnail,
      category,
      level,
      commitment,
    } = req.body;

    const teacher_id = req.user ? req.user.id : null;

    if (!teacher_id) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực thông tin giảng viên!",
      });
    }

    const insertQuery = `
      INSERT INTO courses (title, description, price, thumbnail, teacher_id, category, level, commitment) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(insertQuery, [
      title,
      description,
      price || 0,
      thumbnail || null,
      teacher_id,
      category || "General",
      level || "Cơ bản",
      commitment || "Cam kết chất lượng",
    ]);

    return res.status(201).json({
      success: true,
      message: "Tạo khóa học thành công!",
      courseId: result.insertId,
    });
  } catch (error) {
    console.error("Lỗi khi tạo khóa học:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ khi tạo khóa học" });
  }
};

// 4. Lấy tất cả khóa học kèm tên giảng viên (Dành cho Admin duyệt)
export const getAdminAllCourses = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*, 
        u.name AS instructor_name
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id
      ORDER BY c.id DESC
    `;
    const [rows] = await db.execute(query);
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error("Lỗi admin lấy danh sách khóa học:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách khóa học",
    });
  }
};

// 5. Phê duyệt khóa học (Admin)
export const approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `UPDATE courses SET status = 'Đã duyệt' WHERE id = ?`;
    await db.execute(query, [id]);
    return res
      .status(200)
      .json({ success: true, message: "Phê duyệt khóa học thành công!" });
  } catch (error) {
    console.error("Lỗi phê duyệt khóa học:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ khi phê duyệt" });
  }
};

// 6. Từ chối và Xóa vĩnh viễn khóa học khỏi CSDL (Admin)
export const rejectCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM courses WHERE id = ?`;
    await db.execute(query, [id]);
    return res
      .status(200)
      .json({
        success: true,
        message: "Đã từ chối và xóa khóa học khỏi CSDL!",
      });
  } catch (error) {
    console.error("Lỗi từ chối/xóa khóa học:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ khi từ chối khóa học" });
  }
};
