import db from "../config/db.js";

// Lấy danh sách chứng chỉ thực tế từ CSDL kết hợp thông tin học viên và khóa học
export const getAllCertificates = async (req, res) => {
  try {
    const query = `
      SELECT 
        cert.id,
        cert.certificate_code AS code,
        u.name AS student,
        c.title AS course,
        DATE_FORMAT(cert.issue_date, '%d/%m/%Y') AS issueDate,
        cert.status
      FROM certificates cert
      LEFT JOIN users u ON cert.user_id = u.id
      LEFT JOIN courses c ON cert.course_id = c.id
      ORDER BY cert.id DESC
    `;
    const [rows] = await db.execute(query);
    return res.status(200).json({ success: true, certificates: rows });
  } catch (error) {
    console.error("Lỗi lấy danh sách chứng chỉ:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy chứng chỉ" });
  }
};

// Thu hồi / Xóa chứng chỉ
export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM certificates WHERE id = ?`;
    await db.execute(query, [id]);
    return res
      .status(200)
      .json({ success: true, message: "Thu hồi chứng chỉ thành công!" });
  } catch (error) {
    console.error("Lỗi thu hồi chứng chỉ:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi thu hồi" });
  }
};
