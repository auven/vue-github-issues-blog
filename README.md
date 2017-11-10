## 基于 Github issues 的单页面静态博客（vue版）

> 本项目基于[github-issues-blog](https://github.com/wuhaoworld/github-issues-blog)的思路，使用vue构建了一个更完善的博客系统。

很多人仍然希望能有一个独立域名、可以自由修改主题的博客。Wordpress 、Typecho 太重，还要买 VPS、部署服务器环境、安装插件、主题，太折腾人，于是我想，完全可以利用 Github 提供的 API 来实现一个只有一个静态页面的博客，具体思路如下：

1. 作者在 Github issues 上写文章（写 issues）
2. 博客页面通过 JS Ajax 请求 Github API 来获取文章内容，进行页面的渲染
3. 通过社会化评论插件实现评论功能

## 功能

- [x] 获取 github issues 列表
- [x] 展示 issues 内容
- [x] markdown语法编译
- [x] 代码高亮
- [x] 按标签分类博客
- [x] 响应式
- [x] 评论系统
- [x] 图片预览
- [ ] 分享
- [ ] 搜索

## 使用到的框架和插件

- 框架
  - [vue](https://github.com/vuejs/vue) v2.5.2
- 插件
  - [vue-router](https://github.com/vuejs/vue-router) v3.0.1
  - [axios](https://github.com/axios/axios) v0.17.0
  - [marked](https://github.com/chjj/marked) v0.3.6
  - [highlight.js](https://github.com/isagalaev/highlight.js) v9.12.0
  - [PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe) v4.1.2
  - [gitment](https://github.com/imsun/gitment) v0.0.3
  - [anchorjs](https://github.com/bryanbraun/anchorjs) v4.1.0