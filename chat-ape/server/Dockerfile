FROM node:20-alpine3.19 as build

WORKDIR /app

COPY package* .
COPY tsconfig* .

RUN npm ci

COPY . .

RUN npm run tsc

CMD [ "npm", "run", "start" ]