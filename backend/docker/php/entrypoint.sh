sh

#!/bin/sh
set -e

php artisan config:cache
php artisan route:cache
php artisan migrate --force

chown -R www-data:www-data storage bootstrap/cache


exec "$@"