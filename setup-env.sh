#!/bin/bash

# 環境變數配置腳本
echo "配置環境變數..."

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo "錯誤：請在專案根目錄執行此腳本"
    exit 1
fi

# 創建前端生產環境變數文件
echo "創建前端生產環境變數文件..."
cat > cms-frontend/.env.production << EOF
# 生產環境 API 配置
REACT_APP_API_URL=https://mytec-api.sth-tech.com

# 環境配置
REACT_APP_ENV=production
EOF

echo "✅ 前端環境變數文件已創建：cms-frontend/.env.production"

# 創建後端環境變數範例
if [ ! -f ".env" ]; then
    echo "創建後端環境變數範例..."
    cat > .env.example << EOF
# 資料庫配置
MONGODB_URI=mongodb://localhost:27017/mytec_cms

# JWT 密鑰
JWT_SECRET=your_jwt_secret_key_here

# Stripe 配置
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# 環境配置
NODE_ENV=production
PORT=3000

# 允許的域名（用逗號分隔）
ALLOWED_ORIGINS=https://mytec-cms.sth-tech.com,https://mytec-api.sth-tech.com

# 上傳文件配置
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
EOF
    echo "✅ 後端環境變數範例已創建：.env.example"
    echo "⚠️  請複製 .env.example 為 .env 並填入實際值"
else
    echo "✅ 後端環境變數文件已存在"
fi

echo ""
echo "環境變數配置完成！"
echo ""
echo "下一步："
echo "1. 檢查 cms-frontend/.env.production 中的 API URL"
echo "2. 確保後端 .env 文件配置正確"
echo "3. 重新建置前端：cd cms-frontend && npm run build"

