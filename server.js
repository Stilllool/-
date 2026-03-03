const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 上传目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// 确保上传目录存在
fs.ensureDirSync(UPLOAD_DIR);

// 启用CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON和表单数据
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 上传的文件
app.use('/uploads', express.static(UPLOAD_DIR));

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 保留原始文件名，如果冲突则添加时间戳
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const filePath = path.join(UPLOAD_DIR, originalName);
    
    if (fs.existsSync(filePath)) {
      const timestamp = Date.now();
      const ext = path.extname(originalName);
      const name = path.basename(originalName, ext);
      cb(null, `${name}_${timestamp}${ext}`);
    } else {
      cb(null, originalName);
    }
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许所有文件类型
  cb(null, true);
};

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB限制
  }
});

// ============ API 路由 ============

// 获取文件列表
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const fileList = [];
    
    for (const filename of files) {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        fileList.push({
          name: filename,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          uploadTime: stats.mtime.getTime(),
          uploadTimeFormatted: formatDate(stats.mtime)
        });
      }
    }
    
    // 按上传时间排序（最新的在前）
    fileList.sort((a, b) => b.uploadTime - a.uploadTime);
    
    res.json({
      success: true,
      count: fileList.length,
      files: fileList
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文件列表失败',
      error: error.message
    });
  }
});

// 上传文件
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有选择文件'
      });
    }
    
    const filename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    
    res.json({
      success: true,
      message: '文件上传成功',
      file: {
        name: req.file.filename,
        originalName: filename,
        size: req.file.size,
        sizeFormatted: formatFileSize(req.file.size),
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({
      success: false,
      message: '上传失败',
      error: error.message
    });
  }
});

// 删除文件
app.delete('/api/files/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // 安全检查：确保文件路径在上传目录内
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return res.status(403).json({
        success: false,
        message: '非法的文件路径'
      });
    }
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    await fs.remove(filePath);
    
    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败',
      error: error.message
    });
  }
});

// 下载文件
app.get('/api/download/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // 安全检查
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return res.status(403).json({
        success: false,
        message: '非法的文件路径'
      });
    }
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 设置下载头
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // 发送文件
    res.sendFile(filePath);
  } catch (error) {
    console.error('下载失败:', error);
    res.status(500).json({
      success: false,
      message: '下载失败',
      error: error.message
    });
  }
});

// 获取服务器信息
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    info: {
      name: 'STILLOOL后台管理系统',
      version: '1.0.0',
      uploadDir: UPLOAD_DIR,
      maxFileSize: '100MB',
      serverTime: new Date().toISOString()
    }
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    timestamp: Date.now()
  });
});

// 前端页面
app.use(express.static(path.join(__dirname, 'public')));

// 首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 辅助函数：格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 辅助函数：格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`STILLOOL后台管理系统`);
  console.log(`服务器运行在端口: ${PORT}`);
  console.log(`上传目录: ${UPLOAD_DIR}`);
  console.log(`=================================`);
});

module.exports = app;
