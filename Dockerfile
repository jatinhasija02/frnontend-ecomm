# Use official Node image
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Expose port 80 for serve
EXPOSE 5173

# Serve the build folder
CMD ["npm","run","dev"]
