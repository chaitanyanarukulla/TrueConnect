FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=development /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
