#!/usr/bin/env bash
set -o errexit

# Instala o Composer manualmente (se não estiver disponível)
EXPECTED_CHECKSUM="$(php -r 'copy("https://composer.github.io/installer.sig", "php://stdout");')"
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === '$EXPECTED_CHECKSUM') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); exit(1); }"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
rm composer-setup.php

composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan config:cache
php artisan migrate --force