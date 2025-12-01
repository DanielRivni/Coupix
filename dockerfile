FROM node:18-alpine

WORKDIR /app

COPY package.json bun.lockb ./

RUN npm install -g bun \
    && bun install

COPY . .

RUN bun run build

EXPOSE 5000

CMD ["bun", "run", "start"]
