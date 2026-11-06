# 桜日和 · 樱花水岸小屋

一个基于 Three.js 的可交互微缩庭院网页原型。

## 本地预览
建议使用 VS Code 的 Live Server，或在项目根目录运行：

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000

## 发布到 GitHub Pages
仓库使用 GitHub Actions 自动部署。将项目推送到 `main` 分支后，在 GitHub 仓库的 **Settings → Pages** 中确认发布来源为 **GitHub Actions**。部署完成后网址为：

https://zhiling0987-art.github.io/sakura-biyori/

## 当前原型包含
- Three.js 微缩庭院场景、拖拽旋转与滚轮缩放
- 清晨 / 黄昏 / 夜晚光线切换
- 障子门开合、飘落花瓣、游动锦鲤
- 桌面与移动端基础布局

这是可继续迭代的第一版场景原型。樱花树、溪流形态、材质细节、交互音效等仍可进一步精修。
