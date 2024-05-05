FROM node:20-alpine3.19 as build-stage

WORKDIR /app

COPY package* .
COPY tsconfig* .

RUN npm ci

COPY . .

ARG backend_url
ARG google_client_id

ENV VITE_REACT_APP_SITE_URL=${backend_url}
ENV VITE_REACT_GOOGLE_CLIENT_ID=${google_client_id}

RUN npm run build

FROM nginx:1.25.5-alpine3.19

COPY --from=build-stage /app/dist /usr/share/nginx/html

# RUN npm prune --production

# FROM node:20-alpine3.19

# WORKDIR /node

# COPY --from=build-stage /app/dist .

# CMD [ "npm", "run", "preview" ]