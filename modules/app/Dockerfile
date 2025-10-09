# ---------- base ----------
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev (for docker-compose dev) ----------
FROM base AS dev
RUN npm install
COPY tsconfig.json ./
COPY src ./src
EXPOSE 5000
# Dev runs TS directly (no dist). No migrations here by default.
CMD ["sh","-c","npx sequelize-cli db:migrate --config src/conf/db.js --migrations-path src/migrations && npm run dev"]

# ---------- build (compile TS) ----------
FROM base AS build
RUN npm install
COPY tsconfig.json ./
COPY src ./src
 # must produce dist/** including conf/migrations (see step 1)
RUN npm run build  

# ---------- prod (runtime) ----------
FROM node:18-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist

# IMPORTANT: server code must bind 0.0.0.0 and use process.env.PORT
EXPOSE 8080

# One-liner: run migrations then start the app
# (uses /bin/sh -c; no bash needed)
CMD ["sh","-c","npx sequelize-cli db:migrate --config dist/conf/db.js --migrations-path dist/migrations && node dist/index.js"]
