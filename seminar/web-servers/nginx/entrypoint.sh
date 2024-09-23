#!/bin/sh

NGINX_CONF="/nginx/nginx.conf"
NGINX_DEFAULT_CONF_PATH="/etc/nginx/conf.d/default.conf"
CHALLENGE_DIR="/var/lib/letsencrypt/.well-known/acme-challenge"
NGINX_PID_FILE="/var/run/nginx.pid"
NGINX_WITHOUT_SSL_CONF_PATH="/nginx/erp.conf"
NGINX_SSL_CONF_PATH="/nginx/erp_ssl.conf"
NGINX_CONF_PATH="/etc/nginx/conf.d/erp.conf"

verify_challenge_dir() {
    if [ ! -d $CHALLENGE_DIR ]; then
        mkdir -p $CHALLENGE_DIR
    fi
}

remove_old_conf() {
    if [ -f $NGINX_DEFAULT_CONF_PATH ]; then
        rm $NGINX_DEFAULT_CONF_PATH
        cp $NGINX_CONF "/etc/nginx/nginx.conf"
    fi
}

start_nginx_without_ssl() {
    echo "Starting Nginx without SSL..."
    cp $NGINX_WITHOUT_SSL_CONF_PATH $NGINX_CONF_PATH
    nginx -g 'daemon off;' &
    NGINX_PID=$!
    echo $NGINX_PID > $NGINX_PID_FILE
}

check_certificates() {
    if [ -f /etc/letsencrypt/live/erp.cpel.ind.br/fullchain.pem ] && [ -f /etc/letsencrypt/live/erp.cpel.ind.br/privkey.pem ]; then
        return 0
    else
        return 1
    fi
}

start_nginx_with_ssl() {
    echo "Starting Nginx with SSL..."
    cp $NGINX_SSL_CONF_PATH $NGINX_CONF_PATH
    nginx -s reload
}

verify_challenge_dir
remove_old_conf
start_nginx_without_ssl

while ! check_certificates; do
    echo "Waiting for certificates..."
    sleep 60
done

if [ -f $NGINX_PID_FILE ]; then
    NGINX_PID=$(cat $NGINX_PID_FILE)
    if ps -p $NGINX_PID > /dev/null; then
        kill -QUIT $NGINX_PID
    else
        echo "Process Nginx without SSL already found"
    fi
fi

start_nginx_with_ssl

nginx -g 'daemon off;'

tail -f /var/log/nginx/erp.cpel.ind.br.access.log

exec "$@"