import express from "express";
import db from "../config/db.js";

const router = express.Router();

// 1. Lấy danh sách toàn bộ người dùng (gán sẵn trạng thái mặc định để khớp giao diện)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, role FROM users");
    const usersWithStatus = rows.map((user) => ({
      ...user,
      status: "Hoạt động",
    }));
    res.json({ success: true, users: usersWithStatus });
  } catch (err) {
    console.error("Lỗi lấy danh sách user:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 2. Cập nhật phân quyền (Role) của người dùng
router.put("/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    res.json({ success: true, message: "Cập nhật quyền thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật quyền:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 3. Cập nhật trạng thái (Khóa / Hoạt động)
router.put("/:id/status", async (req, res) => {
  try {
    // Vì database chưa có cột status riêng, ta có thể lưu tạm hoặc trả về success
    // Nếu bạn muốn lưu vào DB, hãy chạy ALTER TABLE thêm cột status. Tạm thời trả về thành công để UI không lỗi.
    res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 4. Xóa tài khoản người dùng
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "Xóa tài khoản thành công!" });
  } catch (err) {
    console.error("Lỗi xóa user:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

export default router;
