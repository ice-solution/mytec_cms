#!/bin/bash

# 啟用 Apache 模組腳本 - Cloudflare 版本
echo "啟用 Apache 模組（Cloudflare 版本）..."

# 啟用必要的 Apache 模組
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
sudo a2enmod ssl
sudo a2enmod remoteip

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
echo "- mod_remoteip (Cloudflare 代理支援)"
echo ""
echo "注意："
echo "- 80 端口由 Cloudflare 代理"
echo "- 443 端口可選（用於直接訪問）"
echo "- 已配置 Cloudflare IP 範圍信任"

