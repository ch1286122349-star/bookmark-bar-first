# 书签栏新收藏置顶 / Bookmark Bar First

将新收藏到 Chrome 书签栏的网页自动放到第一位。

## 功能

- 新建到书签栏的网页书签自动置顶。
- 从其他文件夹移入书签栏的网页书签也会置顶，包括已有书签。
- 不批量整理已有书签，不改变其他书签的相对顺序。
- 不处理子文件夹中的收藏和新建文件夹。
- 保留同一文件夹内的手动拖动排序。
- 兼容本地书签栏及账号书签栏。

## 安装

本项目尚未上架 Chrome 应用商店，可免费从源码加载。

1. 下载仓库源码并解压，或者运行：
   ```sh
   git clone https://github.com/ch1286122349-star/bookmark-bar-first.git
   ```
2. 在 Chrome 地址栏输入 `chrome://extensions/`。
3. 打开“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择仓库中的 **extension 文件夹**，该文件夹内直接包含 `manifest.json`。
6. 打开一个尚未收藏的网页，点击地址栏星标，并选择“书签栏”。新书签应出现在最左侧。

安装后请保留 extension 文件夹。更新源码后，点击扩展卡片上的重新加载按钮。
卸载扩展不会删除书签，也不会恢复之前调整的位置。

## 隐私与权限

仅请求 `bookmarks` 权限，用于读取相关书签的目录、位置并进行置顶。
不请求网站访问权限，不读取网页正文、密码或 Cookie。
不包含广告、分析服务、远程代码或网络请求，不把书签信息发送给开发者。
Chrome 自身的书签同步由 Chrome 和用户账号设置管理。

## 验证与已知限制

版本：2.1.0。用户已确认该版本在实际 Chrome 中新收藏置顶正常。

自动回归覆盖：本地/账号书签栏、先创建后移动、子文件夹、导入事件、手动排序、删除竞态、异常后继续处理和后台重新初始化。

这些自动回归使用模拟的 Chrome API，不等同于浏览器端到端测试。
后台长时间休眠后首次收藏、导入期间后台重启尚未完成真实浏览器验证。
当前导入保护状态只保存在后台内存中；后台在长时间导入中重启时，导入保护可能失效。大量导入前建议先停用本扩展，导入完成后再启用。

## 开发与测试

无需安装项目依赖。使用 Node.js 运行：

```sh
node --check extension/background.js
node tests/bookmarks.cjs
```

## 反馈

请在 [GitHub Issues](https://github.com/ch1286122349-star/bookmark-bar-first/issues) 提交问题，注明 Chrome 版本、扩展版本及复现步骤。截图前请遮盖私人书签。

## 许可证

[MIT](LICENSE)，Copyright (c) 2026 陈航。

---

Automatically places new website bookmarks at the beginning of the Chrome bookmarks bar. Website bookmarks moved into the bar from another folder are also placed first. Existing bookmarks are not bulk-sorted.

Install by loading the `extension` directory as an unpacked extension in Chrome Developer Mode. No website permissions, telemetry, advertising, or network requests are included. Chrome Web Store publication is not available yet.

Tests use mocked Chrome APIs. Import protection currently uses in-memory state and may be lost if the service worker restarts during an import; disable the extension before large imports.
