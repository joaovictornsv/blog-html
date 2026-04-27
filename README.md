# blog-html

Static files for the main blog and devlog apps.

## Local Preview

### Blog

Run the static server from the repository root:

```sh
python3 -m http.server 8000
```

Open the main blog at:

```text
http://localhost:8000/
```

### Devlog

Run the static server from the repository root:

```sh
python3 -m http.server 8001
```

Open the devlog at:

```text
http://localhost:8001/devlog.html
```

## RSS

Generate the main blog RSS feed:

```sh
node generate-rss.js
```

Generate the devlog RSS feed:

```sh
node generate-devlog-rss.js
```
