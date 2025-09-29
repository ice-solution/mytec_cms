#!/bin/bash

# 部署腳本
echo "開始部署 MyTec CMS..."

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo "錯誤：請在專案根目錄執行此腳本"
    exit 1
fi

# 建置 React 前端
echo "建置 React 前端..."
cd cms-frontend

# 安裝依賴
echo "安裝前端依賴..."
npm install

# 確保生產環境變數存在
if [ ! -f ".env.production" ]; then
    echo "創建生產環境變數文件..."
    cat > .env.production << EOF
# 生產環境 API 配置
REACT_APP_API_URL=https://mytec-api.sth-tech.com
REACT_APP_ENV=production
EOF
fi

# 建置生產版本
echo "建置生產版本..."
npm run build

# 檢查建置是否成功
if [ ! -d "build" ]; then
    echo "錯誤：建置失敗，build 目錄不存在"
    exit 1
fi

echo "前端建置完成！"

# 回到根目錄
cd ..

# 安裝後端依賴
echo "安裝後端依賴..."
npm install

# 檢查環境變數文件
if [ ! -f ".env" ]; then
    echo "警告：.env 文件不存在，請創建並配置環境變數"
    echo "範例："
    echo "NODE_ENV=production"
    echo "PORT=3000"
    echo "MONGODB_URI=your_mongodb_uri"
    echo "JWT_SECRET=your_jwt_secret"
fi

echo "部署準備完成！"
echo ""
echo "下一步："
echo "1. 將整個專案上傳到伺服器"
echo "2. 配置 Apache 虛擬主機"
echo "3. 啟動 Node.js 後端服務"
echo "4. 確保 .htaccess 文件在 cms-frontend/build/ 目錄中"
