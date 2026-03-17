FROM node:20-alpine AS base

WORKDIR /app

# Faster + smaller installs; disable audit/fund in images/CI
ENV npm_config_fund=false \
    npm_config_audit=false

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm","run","dev","--","-H","0.0.0.0","-p","3000"]

FROM base AS prod
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start","--","-H","0.0.0.0","-p","3000"]

