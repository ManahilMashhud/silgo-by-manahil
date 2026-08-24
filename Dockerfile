
# Node.js official image use karenge taaki backend chal sake
FROM node:18-alpine

# App ke liye working directory banayein
WORKDIR /app

# Package files copy karke dependencies install karein
COPY package*.json ./
RUN npm install

# Baaki saari files (server.js, aur website ki files) copy karein
COPY . .

# Port open karein jo server.js use kar raha hai
EXPOSE 80

# Server start karne ki command
CMD ["node", "server.js"]