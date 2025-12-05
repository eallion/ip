# IP 查询服务

一个部署在腾讯云 EdgeOne Pages 的 IP 查询服务，简洁展示访客 IP 地址和分流 IP 信息。

## 功能特性

- ✅ 显示国内访客 IP（IPv4/IPv6）
- ✅ 显示 IPInfo.io 分流 IP
- ✅ 显示 Google 分流 IP  
- ✅ 现代化的深色主题界面
- ✅ 响应式设计，支持移动端
- ✅ 一键复制 IP 地址

## 文件结构

```
ip/
├── functions/
│   └── ip/
│       └── index.js          # EdgeOne Pages 函数
├── index.html                 # 前端页面
├── style.css                  # 样式文件
├── script.js                  # JavaScript 脚本
└── README.md                  # 说明文档
```

## API 使用

### 访问路径说明

EdgeOne Pages 会自动将请求路由到对应的函数：
- 访问 `/ip` → 路由到 `functions/ip/index.js`
- 访问 `/ip?type=json` → 路由到 `functions/ip/index.js` 并传递参数

### 获取纯文本 IP

```bash
curl https://ip.eallion.com/ip
```

返回示例：
```
203.0.113.1
```

### 获取 JSON 格式的完整信息

```bash
curl https://ip.eallion.com/ip?type=json
```

返回示例：
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "ip": "203.0.113.1",
    "protocol": "IPv4",
    "timestamp": 1733404800000
  }
}
```

> **注意**：分流 IP 信息（IPInfo.io、Google）不在 API 响应中，而是由前端浏览器直接调用对应服务获取，这样更准确地反映访客的网络路径。

## 部署说明

### 部署到腾讯云 EdgeOne Pages

1. 在 EdgeOne 控制台创建新的 Pages 项目
2. 将本项目文件上传到项目目录
3. 配置域名 `ip.eallion.com`
4. 部署完成后即可访问

### 本地开发测试

```bash
# 使用 EdgeOne Pages CLI 进行本地开发
edgeone pages dev
```

## 技术说明

### 架构设计

**EdgeOne Pages 函数（后端）**
- 使用 EdgeOne 原生功能 `request.eo.clientIp` 获取访客真实 IP
- 自动识别 IPv4/IPv6 协议
- 只返回必要的 IP 信息，无外部依赖
- 响应速度快，稳定可靠

**前端 JavaScript（浏览器端）**
- 访客浏览器直接调用外部服务查询分流 IP
- 并行请求：`Promise.all` 同时查询 IPInfo.io 和 Google
- IPInfo.io: `https://ipinfo.io/ip`
- Google: `https://domains.google.com/checkip`
- 超时控制：每个请求设置 5 秒超时
- 渐进式展示：主 IP 立即显示，分流 IP 异步加载
- 独立失败：单个外部服务失败不影响其他服务和主功能

### 三卡片展示

1. **🇨🇳 国内 IP** - EdgeOne 检测的访客真实 IP
2. **🌐 IPInfo.io** - 通过 IPInfo.io 服务获取的 IP
3. **🔍 Google** - 通过 Google 服务获取的 IP

每个卡片显示：
- IP 地址
- 协议类型（IPv4/IPv6）
- 独立的复制按钮

### 架构优势

1. **更准确的分流 IP**：从访客浏览器发起请求，反映真实的网络路径
2. **快速响应**：EdgeOne 函数无需等待外部服务，立即返回主 IP
3. **更好的用户体验**：主信息快速展示，分流 IP 逐步加载
4. **容错性强**：外部服务失败只影响分流 IP 显示
5. **符合设计原则**：充分利用 EdgeOne Pages 原生功能

## 参考项目

本项目参考了 `api/functions/ip` 的实现。

## 作者

Eallion - [https://www.eallion.com](https://www.eallion.com)

## 许可证

MIT
