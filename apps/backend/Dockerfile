FROM node:18-alpine

RUN npm install -g pnpm
RUN npm install -g node-gyp

ENV PORT 3003
ENV NODE_CONFIG_DIR /app/config/

USER root
WORKDIR /app

RUN apk -U --no-cache add python3 \
    protobuf \
    protobuf-dev \
    git \
    gcc \
    g++ \
    make

COPY . /app

RUN pnpm install \
    && pnpm build:backend

EXPOSE 3003
CMD ["node", "dist/src/main.js"]