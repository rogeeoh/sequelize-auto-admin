FROM node:16-alpine3.15 as node
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
