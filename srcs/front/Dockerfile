FROM node:19.8.1-alpine3.17 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf *

COPY --from=builder /app/build .

COPY --from=builder /app/default.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
