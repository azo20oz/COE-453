# Use the official Node.js image
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the container image.
COPY . .

# Start the server by default, this can be overwritten when running the container.
CMD [ "node", "server.js" ]

# Expose the port the app runs on
EXPOSE 4000
