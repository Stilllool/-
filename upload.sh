#!/bin/bash

# STILLOOL文件上传脚本
# 用法: ./upload.sh <文件路径> [服务器URL]

# 默认服务器地址
# 请先部署后端服务器，然后将地址填入此处
# 示例: "https://stillool-api.glitch.me"
# 本地测试: "http://localhost:3000"
DEFAULT_SERVER="http://localhost:3000"

# 获取参数
FILE_PATH="$1"
SERVER_URL="${2:-$DEFAULT_SERVER}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印帮助信息
print_help() {
    echo -e "${BLUE}STILLOOL文件上传脚本${NC}"
    echo ""
    echo "用法:"
    echo "  ./upload.sh <文件路径> [服务器URL]"
    echo ""
    echo "参数:"
    echo "  文件路径    要上传的文件的完整路径"
    echo "  服务器URL   可选，服务器地址（默认: $DEFAULT_SERVER）"
    echo ""
    echo "示例:"
    echo "  ./upload.sh /path/to/file.txt"
    echo "  ./upload.sh /path/to/file.txt https://your-server.com"
    echo ""
}

# 检查参数
if [ -z "$FILE_PATH" ]; then
    echo -e "${RED}错误: 请指定要上传的文件路径${NC}"
    print_help
    exit 1
fi

# 检查文件是否存在
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}错误: 文件不存在: $FILE_PATH${NC}"
    exit 1
fi

# 获取文件名
FILE_NAME=$(basename "$FILE_PATH")

# 获取文件大小
FILE_SIZE=$(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH" 2>/dev/null)

# 格式化文件大小
format_size() {
    local size=$1
    if [ $size -lt 1024 ]; then
        echo "${size} B"
    elif [ $size -lt 1048576 ]; then
        echo "$(echo "scale=2; $size/1024" | bc) KB"
    elif [ $size -lt 1073741824 ]; then
        echo "$(echo "scale=2; $size/1048576" | bc) MB"
    else
        echo "$(echo "scale=2; $size/1073741824" | bc) GB"
    fi
}

# 检查curl是否安装
if ! command -v curl &> /dev/null; then
    echo -e "${RED}错误: 请先安装 curl${NC}"
    exit 1
fi

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}STILLOOL文件上传${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo -e "${YELLOW}文件信息:${NC}"
echo "  路径: $FILE_PATH"
echo "  名称: $FILE_NAME"
echo "  大小: $(format_size $FILE_SIZE)"
echo ""
echo -e "${YELLOW}服务器:${NC} $SERVER_URL"
echo ""

# 检查文件大小（100MB = 104857600字节）
MAX_SIZE=104857600
if [ $FILE_SIZE -gt $MAX_SIZE ]; then
    echo -e "${RED}错误: 文件大小超过100MB限制${NC}"
    exit 1
fi

echo -e "${BLUE}正在上传...${NC}"
echo ""

# 上传文件
# 使用curl的--progress-bar显示进度
RESPONSE=$(curl -s -w "\n%{http_code}" --progress-bar \
    -X POST \
    -F "file=@$FILE_PATH" \
    "$SERVER_URL/api/upload")

# 获取HTTP状态码和响应内容
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""

# 检查响应
if [ "$HTTP_CODE" == "200" ]; then
    # 解析JSON响应（简单处理）
    if echo "$BODY" | grep -q '"success":true'; then
        echo -e "${GREEN}=================================${NC}"
        echo -e "${GREEN}上传成功!${NC}"
        echo -e "${GREEN}=================================${NC}"
        echo ""
        echo "服务器响应:"
        echo "$BODY" | grep -o '"originalName":"[^"]*"' | cut -d'"' -f4
        echo ""
        echo -e "${BLUE}文件已保存到服务器${NC}"
    else
        echo -e "${RED}上传失败: $BODY${NC}"
        exit 1
    fi
else
    echo -e "${RED}上传失败 (HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}响应: $BODY${NC}"
    exit 1
fi

exit 0
