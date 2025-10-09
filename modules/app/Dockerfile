# ---------- base ----------
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev ----------
FROM base AS dev
ENV NODE_ENV=development
RUN apk add --no-cache bash
RUN npm ci
RUN npm i -g sequelize-cli
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
# don’t copy source here — mount it in compose
EXPOSE 5000
CMD ["./start.sh"]

# ---------- build ----------
FROM base AS build
ENV NODE_ENV=production
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- prod ----------
FROM node:18-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm i -g sequelize-cli
COPY --from=build /app/dist ./dist
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
EXPOSE 5000
CMD ["./start.sh"]
