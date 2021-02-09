# docker-compose down && docker-compose build --no-cache && docker-compose up
FROM node

ARG VERSION=latest
ARG TYPE=basic

ENV NODE_ENV production
# this will enable polling, hot-reload will work on docker or network volumes
ENV CHOKIDAR_USEPOLLING true 

# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app
# RUN mkdir -p /app/kafkaCoronaMicroservices
WORKDIR /app/kafkaCoronaMicroservices
# Add a /app volume
VOLUME ["/app/kafkaCoronaMicroservices"]


COPY package*.json ./
COPY server.js /usr/src/app

# COPY . /app/project_lufthansa
# COPY package.json /app/project_lufthansa/
# RUN npm install

# RUN npm install express-gateway && \
#     ./node_modules/.bin/eg gateway create -n gateway -d . -t $TYPE && \
#     npm cache clean --force

EXPOSE 4200
CMD  npm install && node server-kafka-microservices.js