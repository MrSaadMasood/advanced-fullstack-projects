FROM node:20-alpine3.19

WORKDIR /app

COPY package* .
COPY tsconfig* .

RUN npm ci

COPY . .

CMD [ "npm", "run", "dev" ]