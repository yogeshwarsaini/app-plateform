# Stage 1: React build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY public/ ./public/
COPY src/ ./src/

# Build args — environment specific API URL
ARG REACT_APP_API_URL=http://localhost:8000
ARG REACT_APP_ENV=production

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ENV=$REACT_APP_ENV

RUN npm run build

# Stage 2: Nginx serve karo
FROM nginx:alpine AS runner

# Custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# React build copy karo
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
