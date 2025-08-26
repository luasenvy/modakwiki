FROM node:lts-alpine AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
# Check https://github.com/nodejs/docker-node/pull/2066 to understand why use gcompat instead of libc6-compat be needed.
RUN apk add --no-cache gcompat

# Timezone Settings
RUN apk add --no-cache tzdata

RUN cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime
RUN echo "Asia/Seoul" > /etc/timezone

ENV TZ=Asia/Seoul
ENV LANG=ko_KR.UTF-8
ENV LANGUAGE=ko_KR.UTF-8
ENV LC_ALL=ko_KR.UTF-8

# Application Environments
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --chown=node:node ecosystem.config.js ./ecosystem.config.js

# Read more at: https://nextjs.org/docs/messages/sharp-missing-in-production
FROM base AS depends

RUN npm i -dd sharp

FROM base AS runner

RUN npm i -g pm2

COPY --chown=node:node .next/standalone ./
COPY --chown=node:node .next/static ./.next/static
COPY --chown=node:node public ./public
COPY --from=depends --chown=node:node /app/node_modules ./node_modules

# Volume Settings
RUN mkdir /mnt/modakwiki && chown node:node /mnt/modakwiki

VOLUME /mnt/modakwiki

EXPOSE 3000

USER node

ENTRYPOINT ["pm2-runtime", "ecosystem.config.js"]
