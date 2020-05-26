FROM node:10.16.0-alpine as builder 
ARG NAME="king-frontend"
ARG GIT_URL="https://github.com/open-kingfisher/$NAME.git"
RUN set -xe \
    && sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk --no-cache add git nodejs \
    && git clone $GIT_URL /$NAME && cd /$NAME && npm install && npm run build

FROM nginx
ARG NAME="king-frontend"
ENV TZ "Asia/Shanghai"

COPY --from=builder /$NAME/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /$NAME/dist/ /var/www/html/

RUN set -xe \
    && echo "${TZ}" > /etc/timezone \
    && ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime

CMD nginx -g "daemon off;"
