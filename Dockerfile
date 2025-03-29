FROM --platform=linux/amd64 node:23.7.0-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Install the Nest CLI globally (or you can move it to dependencies)
RUN npm install -g @nestjs/cli

COPY . .
RUN npm run build

ENV PORT=8080

CMD ["node", "dist/main"]
