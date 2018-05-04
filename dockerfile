FROM node:8-alpine AS build

# Create the app directory
WORKDIR /app

# Copy package json
COPY package*.json ./

# COPY yarn.lock
COPY yarn.lock ./

# Install dependencies
RUN yarn install

COPY . .

FROM build as publish
RUN yarn build

FROM node:8-alpine AS runtime
WORKDIR /app

COPY --from=publish /app/package*.json ./
COPY --from=publish /app/yarn.lock .
COPY --from=publish /app/dist ./dist

# Set the node environment
ENV NODE_ENV=production

RUN yarn install --only=production

# Expose the default port
EXPOSE 3000

# set the user
USER node

CMD [ "node" , "dist/index.js" ]
