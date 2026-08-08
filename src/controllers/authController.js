import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 1. Đăng ký tài khoản
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const [existing] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email này đã được đăng ký!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "student"],
    );

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ khi đăng ký" });
  }
};

// 2. Đăng nhập hệ thống thông thường (Dành cho Student / Teacher)
export const login = async (req, res) => {
  try {
    const emailInput = req.body.email || req.body.username;
    const password = req.body.password;

    if (!emailInput || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin đăng nhập!",
      });
    }

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ? OR name = ?",
      [emailInput, emailInput],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản không tồn tại trong hệ thống!",
      });
    }

    const user = rows[0];

    // Chặn nếu tài khoản là admin nhưng lại cố đăng nhập ở cổng user thường
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Tài khoản quản trị vui lòng đăng nhập qua cổng quản trị riêng biệt!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu không chính xác!",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ hệ thống",
    });
  }
};

// 3. Đăng nhập riêng biệt dành cho Admin (Bảo mật tuyệt đối)
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin quản trị!",
      });
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản quản trị không tồn tại!",
      });
    }

    const user = rows[0];

    // Kiểm tra bắt buộc phải là quyền admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Truy cập bị từ chối: Tài khoản này không có quyền quản trị viên!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu quản trị không chính xác!",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      message: "Đăng nhập Admin thành công!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập admin:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ hệ thống",
    });
  }
};

// 4. Lấy thông tin chi tiết hồ sơ cá nhân
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực người dùng!",
      });
    }

    const [rows] = await db.execute(
      `SELECT id, name, email, phone, title, bio, avatar, role FROM users WHERE id = ?`,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin profile:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

// 5. Cập nhật thông tin hồ sơ cá nhân
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { name, phone, title, bio, avatar } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực người dùng!",
      });
    }

    const query = `
      UPDATE users 
      SET name = ?, phone = ?, title = ?, bio = ?, avatar = ? 
      WHERE id = ?
    `;

    await db.execute(query, [
      name,
      phone || "",
      title || "",
      bio || "",
      avatar || null,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ thành công!",
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};
