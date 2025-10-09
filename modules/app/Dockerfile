# ---------- base ----------
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev ----------
FROM base AS dev
RUN apk add --no-cache bash
# install all deps (includes dev deps)
RUN npm install
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
# Set the entrypoint command
ENTRYPOINT ["sh", "/app/start.sh"]
EXPOSE 5000
CMD ["./start.sh"]

# ---------- build (compile TS) ----------
FROM base AS build
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build    # must emit dist/** (dist/index.js, dist/conf/db.js, etc.)

# ---------- prod (runtime) ----------
FROM node:18-alpine AS prod
WORKDIR /app
COPY package*.json ./
# runtime deps only for smaller image
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
# Set the entrypoint command
ENTRYPOINT ["sh", "/app/start.sh"]
EXPOSE 5000
CMD ["./start.sh"]
