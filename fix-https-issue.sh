#!/bin/bash

# 快速修復 HTTPS 混合內容問題
echo "修復 HTTPS 混合內容問題..."

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo "錯誤：請在專案根目錄執行此腳本"
    exit 1
fi

# 創建前端生產環境變數文件
echo "1. 創建前端 HTTPS 環境變數..."
cat > cms-frontend/.env.production << EOF
# 生產環境 API 配置 - HTTPS
REACT_APP_API_URL=https://mytec-api.sth-tech.com

# 環境配置
REACT_APP_ENV=production
EOF

echo "✅ 前端環境變數已設置為 HTTPS"

# 檢查後端 CORS 配置
echo ""
echo "2. 檢查後端 CORS 配置..."
if grep -q "mytec-cms.sth-tech.com" app.js; then
    echo "✅ 後端 CORS 已包含 CMS 域名"
else
    echo "❌ 後端 CORS 缺少 CMS 域名"
fi

if grep -q "mytec-api.sth-tech.com" app.js; then
    echo "✅ 後端 CORS 已包含 API 域名"
else
    echo "❌ 後端 CORS 缺少 API 域名"
fi

# 建置前端
echo ""
echo "3. 重新建置前端..."
cd cms-frontend
npm run build
cd ..

echo ""
echo "4. 檢查建置結果..."
if [ -f "cms-frontend/build/static/js/main.*.js" ]; then
    echo "✅ 前端建置成功"
    
    # 檢查建置文件中的 API URL
    echo "檢查建置文件中的 API URL..."
    if grep -q "https://mytec-api.sth-tech.com" cms-frontend/build/static/js/main.*.js; then
        echo "✅ 建置文件包含 HTTPS API URL"
    else
        echo "❌ 建置文件可能仍包含 HTTP API URL"
    fi
else
    echo "❌ 前端建置失敗"
fi

echo ""
echo "修復完成！"
echo ""
echo "下一步："
echo "1. 上傳新的建置文件到伺服器"
echo "2. 清除瀏覽器快取"
echo "3. 重新載入頁面"
echo ""
echo "如果問題仍然存在，請檢查："
echo "- 瀏覽器開發者工具中的網路請求"
echo "- 伺服器上的 .htaccess 文件"
echo "- Cloudflare 的快取設置"

