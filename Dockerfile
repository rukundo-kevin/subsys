FROM node:lts-bullseye-slim 

WORKDIR /app

COPY package.json package-lock.json ./

COPY prisma ./prisma

RUN npm install

RUN npm run db:generate

COPY . .

RUN npm run build

EXPOSE 4501

CMD ["yarn", "start"]
