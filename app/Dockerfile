# Use a lightweight Node.js image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Copy start.sh to the Docker container
COPY start.sh ./start.sh

# Give execution permissions to the start.sh script
RUN chmod +x ./start.sh

# Set the entrypoint command
ENTRYPOINT ["sh", "/app/start.sh"]

# Expose the application's default port (adjust as necessary)
EXPOSE 6001

# Use the start.sh script to start the application
CMD ["./start.sh"]
