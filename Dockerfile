FROM lipanski/docker-static-website:latest

COPY httpd.conf .
COPY 404.html .
COPY index.html .
COPY my-book-recommendations.html .
COPY css ./css
COPY rss ./rss
COPY posts ./posts