# Build Stage
FROM node:16-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Production Stage
FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
CMD ["npm", "start"]