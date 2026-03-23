# 部署

## 1. 部署数据库

``` bash
docker run -d \
  --name BGC_db \
  -e POSTGRES_USER=${username} \
  -e POSTGRES_PASSWORD=${password} \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -v ${db_datapath}:/var/lib/postgresql/data \
  -p 5435:5432 \
  postgres:15
```

``` sql 
CREATE USER readonly_bgdao WITH PASSWORD 'your_password';
GRANT pg_read_all_data TO readonly_bgdao;
```


``` sql
CREATE USER readonly_aitk WITH PASSWORD '';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_aitk;


REVOKE SELECT ON TABLE public.config FROM readonly_aitk;

```

## 2. 部署应用

``` bash
cd <project-path>

git checkout tags/<tag-name> -b <branch-name>

npm run install

npm run build

cp ./scripts/startup.sh ../startup.sh

cd ..

./../startup.sh
```

启动 nginx
``` bash
$ sudo systemctl start nginx
```

## 3.升级

### 3.1 数据库升级

检查未执行过的 migration 然后执行

``` bash 
npx prisma migrate deploy
```

### 3.2 应用升级

## 4. https 证书
``` bash
root@iZ6wef01ts10rfgvcyd479Z:~/projects# certbot
Saving debug log to /var/log/letsencrypt/letsencrypt.log

Which names would you like to activate HTTPS for?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: dapp.ai
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate numbers separated by commas and/or spaces, or leave input
blank to select all options shown (Enter 'c' to cancel): 1
Certificate not yet due for renewal

You have an existing certificate that has exactly the same domains or certificate name you requested and isn't close to expiry.
(ref: /etc/letsencrypt/renewal/dapp.ai.conf)

What would you like to do?
```

## 5. db backup
### alicloud 镜像备份
### db 文件夹备份
### pg_dump pg_restore

## 6. usdt 闪兑销毁

由usdt闪兑token的交易不立即销毁，而是将待销毁的token转入销毁账户，手动提现统一销毁。销毁账户必须在BGC平台注册

## ng config
``` bash
server {
    listen 80;
    server_name twinx.life www.twinx.life;  # Support both domains

    # Logging configuration
    access_log /var/log/nginx/twinx.access.log;
    error_log /var/log/nginx/twinx.error.log;

    # Proxy headers
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Main location block
    location / {
        proxy_pass http://localhost:3000;  # Forward to your Next.js app running on port 3002
    }
}
```
``` bash
sudo ln -s /etc/nginx/sites-available/twinx.life /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

```






