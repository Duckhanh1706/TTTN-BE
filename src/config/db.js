import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "elearning_db",
  port: process.env.DB_PORT || 3306,
  // Thêm đoạn này để kết nối bảo mật SSL với Aiven trên cloud
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
