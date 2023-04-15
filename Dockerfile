FROM node:18-alpine

WORKDIR /app

COPY . .

COPY package.json yarn.lock ./

RUN yarn

RUN yarn tsc

CMD ["node", "bin/www"]

EXPOSE 3000