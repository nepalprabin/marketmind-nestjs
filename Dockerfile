# # Dockerfile
# FROM node:23.7.0 As development

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# FROM node:23.7.0 As production

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install --only=production

# COPY --from=development /usr/src/app/dist ./dist

# CMD ["node", "dist/main"]


FROM --platform=linux/amd64 node:23.7.0-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .
RUN npm run build

# Cloud Run will set PORT environment variable
# Your app must listen on this port
ENV PORT=8080

# The container must listen on the port defined by the PORT environment variable
CMD ["node", "dist/main"]
