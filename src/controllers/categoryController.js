import db from "../config/db.js";

// Lấy danh sách tất cả danh mục kèm số lượng khóa học thực tế đếm từ bảng courses
export const getAllCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        cat.id, 
        cat.name, 
        cat.slug, 
        COUNT(c.id) AS totalCourses
      FROM categories cat
      LEFT JOIN courses c ON cat.id = c.category_id
      GROUP BY cat.id, cat.name, cat.slug
      ORDER BY cat.id DESC
    `;
    const [rows] = await db.execute(query);

    return res.status(200).json({ success: true, categories: rows });
  } catch (error) {
    console.error("Lỗi lấy danh sách danh mục:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy danh mục" });
  }
};

// Tạo danh mục mới
export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập đầy đủ tên và slug!" });
    }

    const query = `INSERT INTO categories (name, slug) VALUES (?, ?)`;
    const [result] = await db.execute(query, [name, slug]);

    return res.status(201).json({
      success: true,
      message: "Thêm danh mục thành công!",
      categoryId: result.insertId,
    });
  } catch (error) {
    console.error("Lỗi tạo danh mục:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi thêm danh mục" });
  }
};

// Xóa danh mục
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM categories WHERE id = ?`;
    await db.execute(query, [id]);
    return res
      .status(200)
      .json({ success: true, message: "Xóa danh mục thành công!" });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xóa danh mục" });
  }
};
