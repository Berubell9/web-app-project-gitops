module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*", // เชื่อมต่อทุกคำขอที่มี /api ไปยัง backend
        destination: "http://localhost:5000/api/:path*", // ไปที่ backend (Express.js)
      },
    ];
  },
};