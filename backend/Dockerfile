FROM node:20-alpine

RUN apk add --no-cache netcat-openbsd
RUN npm install -g nodemon

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "echo 'Waiting for PostgreSQL...' && while ! nc -z postgres 5432; do sleep 1; done && echo 'PostgreSQL is ready!' && echo 'Setting up database schema...' && npm run db:push && echo 'Starting application...' && npm run dev"]