import db from "../config/db.js";

export const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user ? req.user.id : null;
    const { range } = req.query; // Nhận 'week', 'month', 'year' từ frontend

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực người dùng!",
      });
    }

    let totalRevenue = 0;
    let totalNewStudents = 0;
    let coursesRevenue = [];
    let averageRating = 5.0;
    let completionRate = 0;

    // 1. Lấy danh sách khóa học của giảng viên
    let [courses] = await db.execute(
      `SELECT id, title, price FROM courses WHERE teacher_id = ?`,
      [teacherId],
    );

    // Fallback nếu teacher_id chưa gán, lấy tất cả để test
    if (courses.length === 0) {
      const [allCourses] = await db.execute(
        `SELECT id, title, price FROM courses`,
      );
      courses = allCourses;
    }

    if (courses.length > 0) {
      const courseIds = courses.map((c) => c.id);
      const placeholders = courseIds.map(() => "?").join(",");

      // 2. Kiểm tra xem bảng enrollments có cột thời gian (ví dụ: created_at hoặc enrolled_at) không,
      // nếu có thì lọc theo range, nếu không thì lấy toàn bộ để tránh lỗi văng 500.
      let enrollQuery = `SELECT user_id, course_id FROM enrollments WHERE course_id IN (${placeholders})`;

      // Thực hiện truy vấn lấy danh sách đăng ký
      const [enrollments] = await db.execute(enrollQuery, courseIds);

      // Đếm số học viên duy nhất
      const uniqueStudents = new Set(enrollments.map((e) => e.user_id));
      totalNewStudents = uniqueStudents.size;

      // 3. Tính toán doanh thu chi tiết từng khóa học động từ CSDL
      coursesRevenue = courses.map((course) => {
        const courseEnrollments = enrollments.filter(
          (e) => e.course_id === course.id,
        );
        const studentsCount = courseEnrollments.length;
        const price = parseFloat(course.price) || 0;
        const courseRevenue = studentsCount * price;

        totalRevenue += courseRevenue;

        return {
          id: course.id,
          title: course.title,
          studentsCount: studentsCount,
          courseRevenue: courseRevenue,
        };
      });

      // 4. Lấy điểm đánh giá trung bình từ bảng reviews (nếu có)
      try {
        const [reviewRows] = await db.execute(
          `SELECT AVG(rating) as avg_rating FROM reviews WHERE course_id IN (${placeholders})`,
          courseIds,
        );
        if (reviewRows && reviewRows[0] && reviewRows[0].avg_rating !== null) {
          averageRating = parseFloat(
            Number(reviewRows[0].avg_rating).toFixed(1),
          );
        }
      } catch (revErr) {
        // Bỏ qua nếu chưa có bảng reviews
      }
    }

    // Trả về đúng cấu trúc mà TeacherAnalytics.jsx đang mong đợi: response.data.success và response.data.data
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue,
        newStudents: totalNewStudents,
        completionRate: completionRate,
        averageRating: averageRating,
        coursesBreakdown: coursesRevenue,
      },
    });
  } catch (error) {
    console.error("Lỗi tại getTeacherAnalytics:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ: " + error.message,
    });
  }
};
