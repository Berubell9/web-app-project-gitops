# ✅ ใช้ Python stable (เลิกใช้ alpha/alpine)
FROM python:3.12-slim

# ตั้งค่าพื้นฐานให้ container
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

# ตั้ง working directory
WORKDIR /app

# คัดลอก requirements.txt ก่อน เพื่อใช้ layer cache
COPY requirements.txt .

# ติดตั้ง dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && pip install --upgrade pip \
 && pip install -r requirements.txt \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# คัดลอกโค้ดทั้งหมดเข้า container
COPY . .

# เปิด port 5000
EXPOSE 5000

# ✅ ใช้ host=0.0.0.0 เพื่อให้ Flask เข้าถึงจากภายนอกได้
CMD ["python", "app.py"]