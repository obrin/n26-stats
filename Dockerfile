FROM node:8.4.0

ENV APP_PATH /usr/src/app

RUN mkdir -p $APP_PATH

WORKDIR $APP_PATH

COPY package.json $APP_PATH

RUN npm install

COPY . $APP_PATH

EXPOSE 8000

CMD ["npm", "start"]