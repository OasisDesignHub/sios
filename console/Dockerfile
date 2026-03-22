# ── Stage 1: Build the Vite app ──
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve with nginx ──
FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our template (uses ${PORT} and ${API_URL} placeholders)
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Railway provides PORT; default to 8080
ENV PORT=8080
ENV API_URL=https://sios-production.up.railway.app

EXPOSE 8080

# Substitute ONLY our vars (not nginx's $host, $uri, etc.), then start nginx
CMD ["/bin/sh", "-c", "envsubst '$PORT $API_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
