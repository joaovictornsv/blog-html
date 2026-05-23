FROM lipanski/docker-static-website:latest

COPY httpd.conf .
COPY e404.html .
COPY ./index.html .
COPY my-book-recommendations.html .
COPY css ./css
COPY rss ./rss

CMD ["/busybox-httpd", "-f", "-v", "-p", "3000", "-c", "httpd.conf"]
