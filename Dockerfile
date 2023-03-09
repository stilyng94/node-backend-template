# --BASE
FROM node:lts-bullseye-slim@sha256:d93fb5c25db163dc795d40eabf66251a2daf6a2c6a2d21cc29930e754aef4c2c as base

RUN apt-get update -y && apt-get install --no-install-recommends --no-install-suggests -y openssl \
&& apt-get install --no-install-recommends --no-install-suggests -y curl && apt-get install --no-install-recommends --no-install-suggests -y dumb-init \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app

RUN npm config set unsafe-perm true && npm install -g pnpm

# -- BUILDER
FROM base as builder

COPY package.json pnpm-lock.yaml tsconfig.json ./

RUN npm pkg delete scripts.prepare && pnpm install --frozen-lockfile

COPY . .

RUN pnpm generate && pnpm build

#----- Final
FROM base

ENV NODE_ENV=production

COPY --from=builder /usr/app/package.json /usr/app/pnpm-lock.yaml ./
COPY ./prisma ./prisma

RUN pnpm install --prod --frozen-lockfile && pnpm store prune && pnpm generate

COPY ./start.sh ./
COPY ./views ./views
COPY --from=builder /usr/app/dist ./dist

RUN chmod +x ./start.sh && chown node:node /usr/app

EXPOSE ${PORT}

USER node

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/bin/bash", "-c", "./start.sh"]
