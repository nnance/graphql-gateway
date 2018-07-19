FROM node:8

COPY . /app
# COPY ./node_modules/ /app/node_modules/
COPY ../core /app/node_modules/core
COPY ../schema /app/node_modules/schema

VOLUME [ "./blog/dist:/app/dist" ]

EXPOSE 3010

# ENTRYPOINT [ "node ./app/dist/index.js" ]
