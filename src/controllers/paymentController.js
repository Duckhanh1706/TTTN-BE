import db from "../config/db.js";

export const getAllPayments = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        u.name AS student,
        c.title AS course,
        p.amount,
        DATE_FORMAT(p.created_at, '%d/%m/%Y') AS date,
        p.status
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN courses c ON p.course_id = c.id
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query);
    return res.status(200).json({ success: true, payments: rows });
  } catch (error) {
    console.error("Lỗi lấy danh sách thanh toán:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Lỗi server khi lấy lịch sử giao dịch",
      });
  }
};
