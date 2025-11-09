FROM node:20-alpine
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

COPY . .

# Compile TypeScript -> JavaScript
RUN npm run build

RUN npx prisma generate || true

# Optional: shrink image
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start"]
