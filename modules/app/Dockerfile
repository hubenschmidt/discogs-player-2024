# ---------- base ----------
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev (for docker-compose dev) ----------
FROM base AS dev
RUN npm install
COPY src ./src
EXPOSE 5000
CMD ["sh","-c","npx sequelize-cli db:migrate --config src/conf/db.js --migrations-path src/migrations && npm run dev"]

# ---------- prod (runtime) ----------
FROM node:18-alpine AS prod
WORKDIR /app
RUN apk add --no-cache ca-certificates && update-ca-certificates
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src

EXPOSE 8080

CMD ["sh","-c","npx sequelize-cli db:migrate --config src/conf/db.js --migrations-path src/migrations && node src/index.js"]
