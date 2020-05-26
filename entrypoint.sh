#!/bin/sh
echo "Asia/Shanghai" > /etc/timezone 
ln -sf /usr/share/zoneinfo/ /etc/localtime
[ "$DOMAIN" ] || DOMAIN="kingfisher.com"
sed -i "s/http\:\/\/kingfisher.com.cn/http\:\/\/$DOMAIN/g" /var/www/html/
nginx -g "daemon off;"
