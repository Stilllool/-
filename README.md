# STILLOOL后台管理系统

一个简洁高效的文件上传与管理平台，支持网页端和命令行上传。

## 功能特性

- 📁 文件上传（支持拖拽和点击选择）
- 📋 文件列表实时展示
- ⬇️ 文件下载
- 🗑️ 文件删除（带确认对话框）
- 📊 上传进度显示
- 🔄 自动刷新（每30秒）
- 📱 响应式设计，支持移动端
- 🖥️ 命令行上传脚本

## 技术栈

- 后端: Node.js + Express + Multer
- 前端: HTML5 + CSS3 + JavaScript (原生)
- 文件存储: 本地文件系统

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
npm start
```

服务器将在 http://localhost:3000 启动

### 3. 访问管理界面

打开浏览器访问: http://localhost:3000

## API接口

### 获取文件列表
```
GET /api/files
```

### 上传文件
```
POST /api/upload
Content-Type: multipart/form-data

参数:
  - file: 文件内容
```

### 下载文件
```
GET /api/download/:filename
```

### 删除文件
```
DELETE /api/files/:filename
```

### 获取服务器信息
```
GET /api/info
```

## 命令行上传

使用提供的bash脚本上传文件:

```bash
# 添加执行权限
chmod +x upload.sh

# 上传文件
./upload.sh /path/to/your/file.txt

# 指定服务器地址
./upload.sh /path/to/your/file.txt https://your-server.com
```

## 部署

### 部署到支持Node.js的平台

1. **Glitch**: 导入项目，自动部署
2. **Replit**: 导入GitHub仓库运行
3. **Heroku**: 使用Git部署
4. **Railway**: 一键部署
5. **VPS**: 使用PM2运行

### 使用PM2部署到VPS

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name stillool

# 保存配置
pm2 save
pm2 startup
```

## 配置

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3000 |

### 修改上传限制

编辑 `server.js` 中的 `limits` 配置:

```javascript
limits: {
  fileSize: 100 * 1024 * 1024 // 100MB
}
```

## 文件结构

```
stillool-server/
├── server.js          # 主服务器文件
├── package.json       # 项目配置
├── upload.sh          # Bash上传脚本
├── README.md          # 说明文档
├── uploads/           # 上传文件存储目录
└── public/            # 前端文件
    └── index.html     # 管理界面
```

## 注意事项

1. 上传的文件存储在 `uploads/` 目录
2. 默认文件大小限制为100MB
3. 生产环境建议添加身份验证
4. 定期备份 `uploads/` 目录

## 许可证

MIT License
