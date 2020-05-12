FROM nginx
MAINTAINER  yueyongyue for sina as <yueyongyue@sina.cn>
ENV TZ "Asia/Shanghai"

ADD nginx.conf /etc/nginx/nginx.conf
ADD dist/ /var/www/html/

RUN set -xe \
    && echo "${TZ}" > /etc/timezone \
    && ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime

CMD nginx -g "daemon off;"
