# 国内稳定访问部署清单

目标：让国内用户优先访问 `https://lillianli.cn`，Vercel 地址作为海外和备用访问入口。

## 1. 保留 GitHub + Vercel

- GitHub 仓库：`https://github.com/augenster1111-pixel/lillian-portfolio`
- Vercel 备用地址：`https://website-code-coral.vercel.app`
- 继续把 `main` 分支作为 Vercel 自动部署源。

这条线路适合海外访问和自动发布，不建议作为中国大陆用户的唯一入口。

## 2. 阿里云 OSS 静态网站

在阿里云控制台操作：

1. 创建 OSS Bucket。
2. 地域优先选择中国大陆离目标用户近的区域；如果域名未备案，可先选择中国香港。
3. 上传本项目根目录下的静态文件和目录：
   - `index.html`
   - `about/`
   - `media/`
   - `other-works/`
   - `scripts/`
   - `styles/`
   - `work/`
   - `vercel.json` 可不上传到 OSS。
4. 开启静态网站托管。
5. 默认首页设置为 `index.html`。
6. 404 页面可以先设置为 `index.html` 或保持默认。

## 3. 备案与 CDN

如果要使用中国大陆 CDN 节点，域名通常需要完成 ICP 备案。

建议顺序：

1. 在阿里云提交 `lillianli.cn` 的 ICP 备案。
2. 备案完成后，开通 CDN 或 DCDN。
3. 添加加速域名：
   - `lillianli.cn`
   - `www.lillianli.cn`
4. 源站类型选择 OSS Bucket 域名。
5. CDN 创建完成后，按阿里云提供的 CNAME 修改 DNS 解析。
6. 开启 HTTPS 证书。

如果暂时没有备案：

- 可以继续让 `lillianli.cn` 指向 Vercel。
- 或使用中国香港 OSS/CDN 做过渡，速度通常会比直接访问 Vercel 更稳定，但不等同于大陆 CDN。

## 4. 推荐 DNS 结构

备案完成后的推荐结构：

- `lillianli.cn` -> 阿里云 CDN/DCDN
- `www.lillianli.cn` -> 阿里云 CDN/DCDN
- `website-code-coral.vercel.app` -> Vercel 备用地址

不要同时让同一个主域名混乱指向多个平台。

## 5. 视频资源优化

当前项目视频资源体积较大，国内访问体验主要受视频影响。

推荐策略：

- 首页和列表页只加载图片封面。
- 视频保持 `preload="none"` 或 `preload="metadata"`。
- 单个展示视频建议压缩到 3-8 MB。
- 大于 20 MB 的视频优先压缩或放到 OSS/CDN。
- 不要把未使用的视频继续放在仓库和部署包里。

推荐压缩参数示例：

```bash
ffmpeg -i input.mp4 -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 96k -movflags +faststart output.mp4
```

压缩完成后，保持原文件名替换，避免修改页面引用路径。

## 6. 上线后检查

每次发布后检查：

- `https://lillianli.cn` 能打开首页。
- `https://lillianli.cn/work/01/` 到 `work/04/` 能打开。
- 手机访问无明显白屏或长期 loading。
- DevTools Network 中首屏没有直接下载大 MP4。
- CDN HTTPS 证书正常。
- GitHub/Vercel 备用部署仍可用。
