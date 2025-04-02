FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install && npm cache clean --force
COPY . .

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app /app/

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]