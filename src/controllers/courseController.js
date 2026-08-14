import db from "../config/db.js";

export const getAllCourses = async (req, res) => {
  try {
    const query = `
      SELECT c.*, COUNT(DISTINCT l.id) AS lessons_count, COUNT(DISTINCT e.id) AS students_count
      FROM courses c 
      LEFT JOIN lessons l ON c.id = l.course_id 
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
    `;
    const [rows] = await db.execute(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách khóa học:", error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user ? req.user.id : null;
    if (!teacherId)
      return res
        .status(401)
        .json({ success: false, message: "Chưa xác thực!" });

    const query = `
      SELECT c.*, COUNT(DISTINCT l.id) AS lessons_count, COUNT(DISTINCT e.id) AS students_count
      FROM courses c 
      LEFT JOIN lessons l ON c.id = l.course_id 
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.teacher_id = ?
      GROUP BY c.id
    `;
    const [rows] = await db.execute(query, [teacherId]);
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT c.*, COUNT(l.id) AS lessons_count FROM courses c LEFT JOIN lessons l ON c.id = l.course_id WHERE c.id = ? GROUP BY c.id`;
    const [rows] = await db.execute(query, [id]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khóa học" });
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

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
    const teacher_id = req.user?.id;
    if (!teacher_id)
      return res
        .status(401)
        .json({ success: false, message: "Chưa xác thực!" });

    const [result] = await db.execute(
      `INSERT INTO courses (title, description, price, thumbnail, teacher_id, category, level, commitment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        price || 0,
        thumbnail || null,
        teacher_id,
        category || "General",
        level || "Cơ bản",
        commitment || "Cam kết chất lượng",
      ],
    );
    return res.status(201).json({ success: true, courseId: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      oldPrice,
      category,
      level,
      duration,
      shortDescription,
      commitment,
    } = req.body;

    // 1. Kiểm tra khóa học có tồn tại hay không
    const [existing] = await db.execute("SELECT * FROM courses WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy!" });

    const currentCourse = existing[0];

    // 2. Xử lý thumbnail: Nếu có file mới gửi lên qua multer thì dùng đường dẫn mới, ngược lại giữ nguyên ảnh cũ trong DB
    const thumbnail = req.file
      ? `/uploads/${req.file.filename}`
      : currentCourse.thumbnail;

    // 3. Sử dụng giá trị mới từ request body, nếu không truyền (undefined/null) thì giữ lại giá trị cũ trong DB để tránh mất dữ liệu
    const updateQuery = `
      UPDATE courses 
      SET title = ?, description = ?, price = ?, old_price = ?, thumbnail = ?, category = ?, level = ?, duration = ?, short_description = ?, commitment = ?
      WHERE id = ?
    `;

    await db.execute(updateQuery, [
      title !== undefined ? title : currentCourse.title,
      description !== undefined ? description : currentCourse.description,
      price !== undefined ? price : currentCourse.price,
      oldPrice !== undefined ? oldPrice : currentCourse.old_price,
      thumbnail,
      category !== undefined ? category : currentCourse.category,
      level !== undefined ? level : currentCourse.level,
      duration !== undefined ? duration : currentCourse.duration,
      shortDescription !== undefined
        ? shortDescription
        : currentCourse.short_description,
      commitment !== undefined ? commitment : currentCourse.commitment,
      id,
    ]);

    return res
      .status(200)
      .json({ success: true, message: "Cập nhật thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminAllCourses = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*, u.name AS instructor_name FROM courses c LEFT JOIN users u ON c.teacher_id = u.id ORDER BY c.id DESC`,
    );
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export const approveCourse = async (req, res) => {
  try {
    await db.execute(`UPDATE courses SET status = 'Đã duyệt' WHERE id = ?`, [
      req.params.id,
    ]);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const rejectCourse = async (req, res) => {
  try {
    await db.execute(`DELETE FROM courses WHERE id = ?`, [req.params.id]);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};
