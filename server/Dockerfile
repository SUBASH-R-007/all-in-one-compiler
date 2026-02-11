# FROM ubuntu:20.04

# ENV DEBIAN_FRONTEND=noninteractive

# RUN apt-get update && apt-get install -y \
#     gcc \
#     g++ \
#     openjdk-11-jdk-headless \
#     python3 \
#     && rm -rf /var/lib/apt/lists/*

# WORKDIR /code

FROM node:18-alpine

WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

RUN npm install --production

# Copy the rest of the app
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
