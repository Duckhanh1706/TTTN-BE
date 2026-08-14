import db from "../config/db.js";

// 1. Lấy danh sách tất cả khóa học
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

// 1.1. Lấy danh sách khóa học của giảng viên đang đăng nhập
export const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user ? req.user.id : null;
    if (!teacherId) {
      return res
        .status(401)
        .json({
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
    return res
      .status(500)
      .json({
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
    return res
      .status(500)
      .json({
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
      return res
        .status(401)
        .json({
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

// 3.1. Cập nhật thông tin khóa học (Khắc phục lỗi 404)
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      oldPrice,
      thumbnail,
      category,
      level,
      duration,
      shortDescription,
    } = req.body;

    const [existing] = await db.execute("SELECT * FROM courses WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khóa học!" });
    }

    const updateQuery = `
      UPDATE courses 
      SET title = ?, description = ?, price = ?, old_price = ?, thumbnail = ?, category = ?, level = ?, duration = ?, short_description = ?
      WHERE id = ?
    `;

    await db.execute(updateQuery, [
      title,
      description,
      price || 0,
      oldPrice || null,
      thumbnail || null,
      category || "General",
      level || "Cơ bản",
      duration || "3 tháng",
      shortDescription || null,
      id,
    ]);

    return res
      .status(200)
      .json({ success: true, message: "Cập nhật khóa học thành công!" });
  } catch (error) {
    console.error("Lỗi khi cập nhật khóa học:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ khi cập nhật khóa học" });
  }
};

// 4. Lấy tất cả khóa học cho Admin
export const getAdminAllCourses = async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.name AS instructor_name
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id
      ORDER BY c.id DESC
    `;
    const [rows] = await db.execute(query);
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error("Lỗi admin lấy danh sách khóa học:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Lỗi máy chủ khi lấy danh sách khóa học",
      });
  }
};

// 5. Phê duyệt khóa học (Admin)
export const approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(`UPDATE courses SET status = 'Đã duyệt' WHERE id = ?`, [
      id,
    ]);
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

// 6. Xóa khóa học (Admin)
export const rejectCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(`DELETE FROM courses WHERE id = ?`, [id]);
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
