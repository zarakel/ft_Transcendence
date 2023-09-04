FROM node:alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD [ "node", "dist/main.js" ]
#ENTRYPOINT ["npm", "run", "start:dev"]