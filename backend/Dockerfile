
# Etapa 1 php base + extenciones

FROM php:8.4-fpm-alpine AS php-base

RUN for ext in pdo_mysql mbstring openssl tokenizer xml ctype json; do \
        php -m | grep -qix "$ext" || {echo "Falta la extension $ext"; exit 1; }; \
    done

COPY docker/php/opcache.ini "$PHP_INI_DIR/conf.d/zz-opcache.ini"
WORKDIR /var/www/html

# Etapa 2 -vendor: dependencias de composer 
FROM php-base AS vendor

RUN apk addd --no-cache git unzip
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_CACHE_DIR=/tmp/composer-cache

WORKDIR /app

COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    composer install --no-dev --no-scripts --no-autoloader \
                    --prefer-dist --no-interaction --no-progress

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts

# Etapa 3 - api
FROM php-base AS api

COPY --chown=www-data:www-data . .

COPY --from=vendor --chown=www-data:www:data /app/vendor ./vendor

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/framework/cache/data storage/framework/sessions \
                storage/framework/views storage/logs bootstrap/cache \
    && php artisan package:discover --asni \
    && chowm -R www-data:www-data storage bootstrap/cache
    
EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]

# Etapa 4 - nginx
FROM nginx:stable-alpine AS nginx

COPY socker/nginx/default.conf /etx/nginx/conf.d/default.conf
COPY --from=api /var/www/html/public /var/www/html/public

EXPOSE 80