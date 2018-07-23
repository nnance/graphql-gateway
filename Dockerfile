FROM node:8

WORKDIR /app

COPY . .

RUN npm i
RUN npm run bootstrap
RUN npm run compile
