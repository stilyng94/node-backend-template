# --BASE
FROM node:lts-bullseye-slim@sha256:d93fb5c25db163dc795d40eabf66251a2daf6a2c6a2d21cc29930e754aef4c2c as base

RUN apt-get update -y && apt-get install --no-install-recommends -y openssl \
&& apt-get install --no-install-recommends -y curl && apt-get install --no-install-recommends -y dumb-init \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

WORKDIR /usr/app

RUN npm config set unsafe-perm true && npm install -g pnpm

# -- BUILDER
FROM base as builder

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

RUN npm pkg delete scripts.prepare && pnpm install --frozen-lockfile && pnpm generate

COPY . .

RUN pnpm build

#----- Final
FROM base

ENV NODE_ENV production

COPY --from=builder /usr/app/package.json ./
COPY --from=builder /usr/app/pnpm-lock.yaml ./
COPY ./prisma ./prisma

RUN npm pkg delete scripts.prepare && pnpm install --prod --frozen-lockfile && pnpm store prune && pnpm generate

COPY --from=builder /usr/app/dist ./dist
COPY ./views ./views
COPY start.sh ./

RUN chmod +x ./start.sh && chown node:node /usr/app

EXPOSE ${PORT}

USER node

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/bin/bash", "-c", "./start.sh"]
