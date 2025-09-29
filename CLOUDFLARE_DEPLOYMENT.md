# Cloudflare + Apache2 部署指南

## 概述
本指南說明如何在 Cloudflare 代理環境下部署 MyTec CMS。

## 架構
```
用戶 → Cloudflare (HTTPS) → 你的伺服器 (HTTP/HTTPS)
```

## 部署步驟

### 1. Cloudflare 配置

#### DNS 設置
1. 登入 Cloudflare 控制台
2. 添加域名：`mytec-cms.sth-tech.com`
3. 設置 A 記錄指向你的伺服器 IP
4. 確保代理狀態為「已代理」（橙色雲朵）

#### SSL/TLS 設置
1. 加密模式：**完全（嚴格）**
2. 最低 TLS 版本：TLS 1.2
3. 啟用 HSTS（可選）

#### 頁面規則
- 創建規則：`mytec-cms.sth-tech.com/*`
- 設置：**始終使用 HTTPS**

### 2. 伺服器配置

#### 安裝 Apache 模組
```bash
./enable-apache-modules-cloudflare.sh
```

#### 配置虛擬主機f
```bash
# 複製配置
sudo cp apache-config-example.conf /etc/apache2/sites-available/mytec-cms.conf

# 啟用站點
sudo a2ensite mytec-cms

# 重新載入 Apache
sudo systemctl reload apache2
```

#### 建置和部署
```bash
# 建置前端
./deploy.sh

# 複製 .htaccess 到建置目錄
cp cms-frontend/.htaccess cms-frontend/build/

# 設置權限
sudo chown -R www-data:www-data /var/www/mytec_cms/
sudo chmod -R 755 /var/www/mytec_cms/
```

### 3. 後端 API 配置

#### 環境變數
```bash
# .env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

#### 啟動後端服務
```bash
# 使用 PM2
npm install -g pm2
pm2 start app.js --name "mytec-api"

# 或使用 systemd
sudo systemctl enable mytec-api
sudo systemctl start mytec-api
```

### 4. 前端環境變數

#### 生產環境配置
```bash
# cms-frontend/.env.production
REACT_APP_API_URL=https://mytec-api.sth-tech.com
REACT_APP_ENV=production
```

## 配置檢查

### 運行檢查腳本
```bash
./check-cloudflare-config.sh
```

### 手動檢查項目
1. **DNS 解析**：`nslookup mytec-cms.sth-tech.com`
2. **SSL 憑證**：`curl -I https://mytec-cms.sth-tech.com`
3. **代理狀態**：檢查 HTTP 標頭中的 `CF-Ray`
4. **路由測試**：訪問 `/events` 等子路由

## 故障排除

### 常見問題

#### 1. 404 錯誤（路由刷新）
- 檢查 `.htaccess` 是否在正確位置
- 確認 `mod_rewrite` 已啟用
- 檢查目錄權限

#### 2. 混合內容錯誤
- 確保所有資源使用 HTTPS
- 檢查 API URL 配置
- 更新前端環境變數

#### 3. CORS 錯誤
- 檢查後端 CORS 配置
- 確認允許的域名包含 Cloudflare 域名
- 檢查憑證設置

#### 4. 快取問題
- 清除 Cloudflare 快取
- 檢查 Apache 快取設置
- 更新文件版本號

### 日誌檢查
```bash
# Apache 錯誤日誌
sudo tail -f /var/log/apache2/mytec-cms-error.log

# Apache 訪問日誌
sudo tail -f /var/log/apache2/mytec-cms-access.log

# 後端日誌
pm2 logs mytec-api
```

## 安全建議

1. **防火牆配置**
   - 只開放必要端口（80, 443, 3000）
   - 限制 SSH 訪問

2. **SSL 配置**
   - 使用 Cloudflare 的 SSL 憑證
   - 啟用 HSTS
   - 設置安全標頭

3. **備份策略**
   - 定期備份資料庫
   - 備份上傳文件
   - 備份配置文件

## 性能優化

1. **Cloudflare 設置**
   - 啟用 Auto Minify
   - 啟用 Brotli 壓縮
   - 設置快取規則

2. **Apache 優化**
   - 啟用 Gzip 壓縮
   - 設置靜態資源快取
   - 優化 Keep-Alive

3. **前端優化**
   - 代碼分割
   - 圖片優化
   - 懶加載

