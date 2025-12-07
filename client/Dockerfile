FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Host flag is required to expose the port outside the container
CMD ["npm", "run", "dev", "--", "--host"]
