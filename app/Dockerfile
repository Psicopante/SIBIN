# Etapa 1: Construcción
FROM node:18-alpine AS build

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ARG VITE_BACKEND_LOGIN
ENV VITE_BACKEND_LOGIN=$VITE_BACKEND_LOGIN
# Crear usuario sin privilegios (opcional, mejora seguridad)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Establecer directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar archivos necesarios primero para aprovechar la cache
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Ejecutar el build
RUN pnpm run build

# Etapa 2: Imagen final liviana con NGINX
FROM nginx:stable-alpine

# Copiar los archivos generados del build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de NGINX
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Seguridad: cambiar dueño (opcional, requiere que los archivos lo soporten)
# RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
