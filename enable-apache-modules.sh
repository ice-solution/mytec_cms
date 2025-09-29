#!/bin/bash

# 啟用 Apache 模組腳本
echo "啟用 Apache 模組..."

# 啟用必要的 Apache 模組
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
sudo a2enmod ssl

# 重新載入 Apache 配置
sudo systemctl reload apache2

echo "Apache 模組啟用完成！"
echo ""
echo "已啟用的模組："
echo "- mod_rewrite (URL 重寫)"
echo "- mod_headers (HTTP 標頭)"
echo "- mod_expires (快取控制)"
echo "- mod_deflate (壓縮)"
echo "- mod_ssl (SSL 支援)"

