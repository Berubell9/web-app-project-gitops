# ใช้ Nginx เป็นฐานในการสร้างภาพ
FROM nginx:alpine

# คัดลอกไฟล์ index.html ไปที่ Nginx root directory
COPY index.html /usr/share/nginx/html/index.html

# เปิดพอร์ต 80 สำหรับให้บริการ
EXPOSE 80

# เริ่ม Nginx เมื่อ container เริ่มทำงาน
CMD ["nginx", "-g", "daemon off;"]