FROM node:lts-alpine3.20 AS builder
WORKDIR '/app'
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:lts-alpine3.20
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY .env .env
CMD ["node", "dist/index.js"]