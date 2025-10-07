#!/bin/bash

# MyTEC CMS 分支環境配置腳本
# 用於為不同分支設置對應的環境配置

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 MyTEC CMS 分支環境配置工具${NC}"
echo "=================================="

# 檢查當前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}當前分支: ${CURRENT_BRANCH}${NC}"

# 函數：設置環境配置
setup_env() {
    local branch_type=$1
    local template_file="env-templates/.env.${branch_type}"
    
    if [ ! -f "$template_file" ]; then
        echo -e "${RED}❌ 找不到模板文件: $template_file${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}📋 設置 ${branch_type} 版本環境配置...${NC}"
    
    # 備份現有 .env 文件
    if [ -f ".env" ]; then
        cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ 已備份現有 .env 文件${NC}"
    fi
    
    # 複製模板到 .env
    cp "$template_file" .env
    echo -e "${GREEN}✅ 已設置 ${branch_type} 版本環境配置${NC}"
    
    # 設置前端環境配置
    if [ -d "cms-frontend" ]; then
        local frontend_template="env-templates/cms-frontend/.env.${branch_type}"
        if [ -f "$frontend_template" ]; then
            cp "$frontend_template" "cms-frontend/.env.production"
            echo -e "${GREEN}✅ 已設置前端 ${branch_type} 版本環境配置${NC}"
        fi
    fi
}

# 根據分支名稱自動判斷版本類型
case "$CURRENT_BRANCH" in
    "main"|"master"|"stable")
        setup_env "stable"
        ;;
    "feature/sport-version"|"sport"|*"sport"*)
        setup_env "sport"
        ;;
    "develop"|"dev")
        setup_env "example"
        ;;
    *)
        echo -e "${YELLOW}⚠️  未識別的分支類型，請手動選擇:${NC}"
        echo "1) stable - 穩定版本"
        echo "2) sport - 運動版本"
        echo "3) example - 開發範例"
        read -p "請選擇 (1-3): " choice
        
        case $choice in
            1) setup_env "stable" ;;
            2) setup_env "sport" ;;
            3) setup_env "example" ;;
            *) echo -e "${RED}❌ 無效選擇${NC}"; exit 1 ;;
        esac
        ;;
esac

echo ""
echo -e "${GREEN}🎉 環境配置完成！${NC}"
echo -e "${BLUE}📝 請檢查並修改 .env 文件中的實際配置值${NC}"
echo -e "${BLUE}💡 提示: 可以使用 'git checkout <branch>' 切換分支後重新運行此腳本${NC}"

