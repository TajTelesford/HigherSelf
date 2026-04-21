FROM node:22-alpine

WORKDIR /

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8081

CMD ["npm", "run", "start"]