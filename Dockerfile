FROM node:lts-bullseye-slim@sha256:d93fb5c25db163dc795d40eabf66251a2daf6a2c6a2d21cc29930e754aef4c2c as builder

WORKDIR /usr/app


COPY package.json ./
COPY yarn.lock ./

COPY tsconfig.json ./
COPY . .

RUN npm set-script prepare ""

RUN yarn install
RUN yarn build

#----- Staging
FROM node:lts-bullseye-slim@sha256:d93fb5c25db163dc795d40eabf66251a2daf6a2c6a2d21cc29930e754aef4c2c as stager

WORKDIR /usr/app

COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/yarn.lock ./

RUN yarn install --prod

#----- Production
FROM node:lts-bullseye-slim@sha256:d93fb5c25db163dc795d40eabf66251a2daf6a2c6a2d21cc29930e754aef4c2c as prod
RUN apt-get update && apt-get install -y curl

WORKDIR /usr/app

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

COPY --from=stager /usr/app/package.json ./
COPY --from=stager /usr/app/yarn.lock ./
COPY --from=builder /usr/app/dist ./dist
COPY --from=stager /usr/app/node_modules ./node_modules
COPY ecosystem.config.js ./


RUN yarn global add pm2

RUN chown -R node /usr/app

EXPOSE 80

USER node

CMD ["yarn", "start"]
