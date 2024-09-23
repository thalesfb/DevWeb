#!/bin/sh

sleep 30

verify_access() {
    url=$1
    echo "Verificando URL: $url"
    curl -k -f --max-time 10 $url || { echo "Falha ao acessar $url"; exit 1; }
}

if verify_access "https://0.0.0.0/" ; then
    echo "Healthcheck passed"
    exit 0
else
    echo "Healthcheck failed"
    exit 1
fi