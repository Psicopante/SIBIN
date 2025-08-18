# Etapa de dependencias
FROM node:18-alpine AS deps

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias sin las de desarrollo (para producción)
RUN pnpm install --frozen-lockfile --prod

# Etapa final
FROM node:18-alpine

# Seguridad: crea usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser
WORKDIR /app

# Copiamos dependencias desde deps
COPY --chown=appuser:appgroup --from=deps /app/node_modules ./node_modules

# Copiamos el resto del proyecto
COPY --chown=appuser:appgroup . .

# Generar Prisma Client
RUN npx prisma generate

# Puerto de la app
EXPOSE 3400

# Comando por defecto
CMD ["node", "src/app.js"]