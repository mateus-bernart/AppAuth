# render-build.sh
#!/usr/bin/env bash
set -o errexit

composer install --no-dev --optimize-autoloader
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan key:generate
php artisan migrate --force