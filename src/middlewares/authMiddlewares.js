import jwt from "jsonwebtoken";

// Middleware xác thực token đăng nhập
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không tìm thấy token xác thực, vui lòng đăng nhập!",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_jwt_secret",
    (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn!",
        });
      }
      req.user = user; // Lưu thông tin user vào request
      next();
    },
  );
};

// Middleware kiểm tra quyền Giảng viên (Teacher) hoặc Admin
export const isTeacher = (req, res, next) => {
  if (req.user && (req.user.role === "teacher" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message:
        "Bạn không có quyền truy cập chức năng này (Yêu cầu tài khoản Giảng viên)!",
    });
  }
};

// Middleware kiểm tra quyền Quản trị viên (Admin)
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message:
        "Bạn không có quyền truy cập chức năng này (Yêu cầu tài khoản Admin)!",
    });
  }
};
