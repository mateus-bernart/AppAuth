FROM php:8.2-cli

# Instala dependências e extensões necessárias do PHP
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Instala as dependências do Laravel
RUN composer install --no-dev --optimize-autoloader

# Garante que a pasta storage tem permissões corretas
RUN chmod -R 775 storage bootstrap/cache

# Gera chave da aplicação
RUN php artisan key:generate || true

# Expondo a porta correta (Render usa $PORT)
EXPOSE 8000

# Comando de start
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
