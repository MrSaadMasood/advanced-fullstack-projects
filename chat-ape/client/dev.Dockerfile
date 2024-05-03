FROM node:20-alpine3.19

WORKDIR /app

COPY . .

RUN npm ci

CMD [ "npm", "run", "dev", "--", "--host" ]