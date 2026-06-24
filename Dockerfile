FROM lipanski/docker-static-website:latest

COPY httpd.conf .
COPY favicon.ico .
COPY og-image.png .
COPY e404.html .
COPY ./index.html .
COPY my-book-recommendations.html .
COPY sitemap.xml .
COPY robots.txt .
COPY css ./css
COPY rss ./rss
COPY posts ./posts
COPY devlog ./devlog

CMD ["/busybox-httpd", "-f", "-v", "-p", "3000", "-c", "httpd.conf"]
