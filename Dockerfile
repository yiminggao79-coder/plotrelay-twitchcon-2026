FROM node:24-alpine
WORKDIR /app
COPY . .
ENV HOST=0.0.0.0 PORT=4312
EXPOSE 4312
USER node
CMD ["node","server.mjs"]
