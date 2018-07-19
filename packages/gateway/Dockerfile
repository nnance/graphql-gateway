FROM node:8

COPY . /app
# COPY package.json /app
# COPY node_modules/ /app/node_modules
COPY ./node_modules/core /app/node_modules/core

VOLUME [ "./blog/dist:/app/dist" ]

EXPOSE 3000

# ENTRYPOINT [ "node ./app/dist/index.js" ]
