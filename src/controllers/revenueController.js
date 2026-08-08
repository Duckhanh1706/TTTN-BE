import db from "../config/db.js";

export const getRevenueStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(e.enrolled_at, '%Y-%m') AS month_key,
        SUM(c.price) AS total_revenue,
        COUNT(e.id) AS total_orders
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      GROUP BY month_key
      ORDER BY month_key DESC
      LIMIT 6
    `;

    const [rows] = await db.execute(query);

    const totalRevenue = rows.reduce(
      (acc, curr) => acc + Number(curr.total_revenue || 0),
      0,
    );
    const totalOrders = rows.reduce(
      (acc, curr) => acc + Number(curr.total_orders || 0),
      0,
    );
    const averageMonthly = rows.length > 0 ? totalRevenue / rows.length : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders,
        averageMonthly,
      },
      revenueData: rows.reverse(),
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê doanh thu thực tế:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Lỗi server khi lấy dữ liệu doanh thu",
      });
  }
};
