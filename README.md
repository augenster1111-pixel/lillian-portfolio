# Lillian Portfolio

## 在线地址

- 国内主域名：<https://lillianli.cn>
- 国内 www 域名：<https://www.lillianli.cn>
- Vercel 备用地址：<https://website-code-coral.vercel.app>

## 技术栈

- HTML
- CSS
- JavaScript
- GitHub
- Vercel
- 阿里云域名 / 可选 OSS + CDN

## 项目简介

李安欣 Lillian 的个人作品集网站，用于展示游戏买量视频、AI 创意广告短片、游戏营销视觉设计和其他综合设计项目。

## 本地预览方式

可以直接在浏览器中打开 `index.html`。

也可以在项目根目录启动静态服务：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 部署方式

当前项目是纯静态网站，入口文件是根目录下的 `index.html`。

推荐保留两条线上通道：

- 海外 / 自动部署：GitHub main 分支连接 Vercel。
- 国内 / 稳定访问：将同一份静态文件发布到阿里云 OSS，并通过阿里云 CDN 或 DCDN 加速 `lillianli.cn`。

国内部署前请参考 [CHINA_DEPLOYMENT.md](./CHINA_DEPLOYMENT.md)。

## 性能说明

项目中的视频已采用懒加载策略：列表卡片使用 `data-src`，视频 `preload="none"`，进入可视区域后再加载 metadata。为了让国内用户更流畅，建议继续将大视频压缩到单个 3-8 MB，并优先通过阿里云 OSS/CDN 分发视频资源。
