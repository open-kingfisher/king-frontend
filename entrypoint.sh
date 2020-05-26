#!/bin/sh
echo "Asia/Shanghai" > /etc/timezone 
ln -sf /usr/share/zoneinfo/ /etc/localtime
[ "$DOMAIN" ] || DOMAIN="kingfisher.com"
sed -i "s/kingfisher.com.cn/$DOMAIN/g" /var/www/html/
nginx -g "daemon off;"
