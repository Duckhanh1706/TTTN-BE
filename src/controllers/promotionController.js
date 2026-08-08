import db from "../config/db.js";

// Lấy danh sách mã giảm giá
export const getAllPromotions = async (req, res) => {
  try {
    const query = `SELECT id, code, discount, expiry, status FROM promotions ORDER BY id DESC`;
    const [rows] = await db.execute(query);
    return res.status(200).json({ success: true, promotions: rows });
  } catch (error) {
    console.error("Lỗi lấy danh sách mã giảm giá:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Tạo mã giảm giá mới
export const createPromotion = async (req, res) => {
  try {
    const { code, discount, expiry, status } = req.body;
    if (!code || !discount || !expiry) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    const query = `INSERT INTO promotions (code, discount, expiry, status) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(query, [
      code,
      discount,
      expiry,
      status || "Đang hoạt động",
    ]);

    return res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công!",
      promotionId: result.insertId,
    });
  } catch (error) {
    console.error("Lỗi tạo mã giảm giá:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server hoặc mã code đã tồn tại" });
  }
};

// Cập nhật trạng thái mã giảm giá (Đang hoạt động <-> Tạm ngưng)
export const updatePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const query = `UPDATE promotions SET status = ? WHERE id = ?`;
    await db.execute(query, [status, id]);

    return res
      .status(200)
      .json({ success: true, message: "Cập nhật trạng thái thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái mã giảm giá:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật trạng thái" });
  }
};

// Xóa mã giảm giá
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM promotions WHERE id = ?`;
    await db.execute(query, [id]);
    return res
      .status(200)
      .json({ success: true, message: "Xóa mã giảm giá thành công!" });
  } catch (error) {
    console.error("Lỗi xóa mã giảm giá:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xóa" });
  }
};
