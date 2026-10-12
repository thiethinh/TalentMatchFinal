FROM node:20-alpine

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy mã nguồn
COPY . .

EXPOSE 5173

# Chạy Vite dev server lắng nghe trên tất cả interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
