# STILLOOL后台管理系统 - 部署指南

## 前端已部署

前端管理界面已部署至: **https://admy6fvwmgpb4.ok.kimi.link**

## 后端部署选项

你需要部署后端API服务器才能使用完整功能。以下是几种免费的部署方案：

---

## 方案一: Glitch (推荐 - 最简单)

Glitch 提供免费的Node.js托管服务。

### 步骤:

1. **注册/登录 Glitch**
   - 访问 https://glitch.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择 "Import from GitHub"
   - 或者直接将代码文件上传到Glitch

3. **上传文件到Glitch**
   将以下文件上传到Glitch项目:
   - `server.js`
   - `glitch-package.json` (重命名为 `package.json`)
   - `public/index.html`
   - `.glitch-assets`
   - `watch.json`

4. **自动部署**
   - Glitch会自动安装依赖并启动服务
   - 点击 "Show" 查看应用URL
   - 你的API地址将是: `https://你的项目名.glitch.me`

5. **更新前端配置**
   - 打开前端页面: https://admy6fvwmgpb4.ok.kimi.link
   - 在"服务器设置"中输入你的Glitch地址
   - 点击保存

---

## 方案二: Railway

Railway 提供免费的容器托管服务。

### 步骤:

1. **注册/登录 Railway**
   - 访问 https://railway.app
   - 使用GitHub账号登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"

3. **部署**
   - 连接你的GitHub仓库
   - Railway会自动检测并部署

4. **获取URL**
   - 部署完成后，Railway会提供一个URL
   - 格式: `https://你的项目名.up.railway.app`

---

## 方案三: Render

Render 提供免费的Web服务托管。

### 步骤:

1. **注册/登录 Render**
   - 访问 https://render.com

2. **创建Web Service**
   - 点击 "New +" → "Web Service"
   - 连接GitHub仓库

3. **配置**
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成

---

## 方案四: 自己的VPS服务器

如果你有自己的VPS服务器，可以使用以下方式部署：

### 使用Docker部署

```bash
# 1. 克隆代码到服务器
git clone <你的仓库地址> stillool
cd stillool

# 2. 使用Docker Compose启动
docker-compose up -d

# 3. 服务将在3000端口运行
# 访问: http://你的服务器IP:3000
```

### 使用PM2部署

```bash
# 1. 安装Node.js和npm
# 2. 安装依赖
npm install

# 3. 安装PM2
npm install -g pm2

# 4. 启动服务
pm2 start server.js --name stillool

# 5. 设置开机启动
pm2 save
pm2 startup
```

### 使用Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 配置前端连接后端

无论使用哪种方案部署后端，都需要在前端配置API地址：

1. 打开前端页面: https://admy6fvwmgpb4.ok.kimi.link
2. 在"服务器设置"输入框中输入你的后端地址
   - 例如: `https://stillool-api.glitch.me`
3. 点击"保存"
4. 页面会自动连接到后端服务器

---

## 更新Bash脚本

部署完成后，更新 `upload.sh` 脚本中的服务器地址：

```bash
# 编辑upload.sh
DEFAULT_SERVER="https://你的服务器地址"
```

然后使用脚本上传文件：

```bash
chmod +x upload.sh
./upload.sh /path/to/your/file.txt
```

---

## 注意事项

1. **免费套餐限制**
   - Glitch: 项目会在5分钟后休眠，首次访问需要唤醒
   - Railway: 每月有一定免费额度
   - Render: 免费套餐有流量限制

2. **文件存储**
   - 免费平台的文件存储是临时的
   - 建议定期备份重要文件
   - 生产环境建议使用云存储服务

3. **安全性**
   - 生产环境建议添加身份验证
   - 可以添加API密钥验证
   - 限制文件类型和大小

---

## 故障排除

### 前端显示"离线"
- 检查后端服务是否正常运行
- 确认API地址是否正确
- 检查浏览器控制台是否有CORS错误

### 上传失败
- 检查文件大小是否超过限制
- 确认后端磁盘空间是否充足
- 查看后端日志获取详细信息

### 文件列表不显示
- 刷新页面
- 检查网络连接
- 确认后端API是否正常响应

---

## 技术支持

如有问题，请检查：
1. 浏览器开发者工具 (F12) 的Console和Network标签
2. 后端服务的日志输出
3. API地址是否正确配置
