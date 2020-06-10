#!/bin/sh
[ "$DOMAIN" ] || DOMAIN="kingfisher.com"
[ "$TIME_ZONE" ] || TIME_ZONE="Asia/Shanghai"
[ "$ALPINE_REPO" ] || ALPINE_REPO="mirrors.aliyun.com"

ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime

sed -i "s/kingfisher.com.cn/$DOMAIN/g" `grep "kingfisher.com.cn" -rl /var/www/html/`
nginx -g "daemon off;"
