# dsh-rainy-brand

DSH web 插件：把侧栏字标、空白会话（Hero）大标题与它右侧的「预览版」标签换成**用户可编辑的品牌配置**，并支持**按选择器注入自定义 CSS**，改动即时生效，保存在 `~/.dsh/settings.yaml` 的 `dsh-rainy-brand:` 段。

## 安装

```powershell
dsh plugin --profile web add dsh-rainy-brand
```

重启 dsh web（桌面壳 = 关掉窗口重开）后生效。

## 配置

**设置 → 品牌**：四个字段各带「已修改」标记与「恢复默认」，底部「全部恢复默认」；文本改动 400ms 防抖后写入，`恢复默认` 走 `scope.unset` 回到出厂文案。同一页下方是 **CSS 注入** 块：每条规则 = 一个选择器 + 一段 CSS 声明，编译为 `selector{css}` 注入单个 `<style>` 标签，同样即时生效。

| 字段 | 出厂值 | 说明 |
|---|---|---|
| `sidebarName` | 淋雨的DSH | 侧栏左上角字标；留空 = 不显示名称 |
| `heroHeadline` | 探索未至之境 | 空白会话中央的大标题 |
| `showPreviewBadge` | `true` | 是否显示标题右侧的标签 |
| `previewBadgeText` | 预览版 | 标签文字；留空 = 不显示 |
| `cssRules` | `[]` | CSS 注入规则列表，每项 `{ selector, css }`；选择器留空的条目不生效 |

**CSS 注入**：

- 每条规则一行：选择器输入框 + CSS 多行文本框 + 「删除」；**「添加选择器」** 按钮追加新规则。
- 编辑 400ms 防抖后写入；选择器与内容都为空的行只停留在界面上，不会落盘；全部删空时等于恢复默认（不写空数组）。
- 复合选择器（`.a, .b`）直接写在选择器框里即可；选择器语法非法时行内红字提示，该条规则由浏览器按 CSS 规则丢弃，不影响其他规则。
- 要压过应用自身样式，按需提高选择器优先级或使用 `!important`。

也可以直接编辑 `~/.dsh/settings.yaml`：

```yaml
dsh-rainy-brand:
  sidebarName: 淋雨的DSH
  heroHeadline: 探索未至之境
  showPreviewBadge: true
  previewBadgeText: 预览版
  cssRules:
    - selector: .sidebar
      css: "background: red;"
    - selector: body::before
      css: "content: ''; position: fixed; inset: 0; pointer-events: none;"
```

## 实现说明

- **侧栏名称**：遮蔽 `sidebar.brand.name` 槽位（single 槽位，低 priority 胜出）。
- **对话标题 / 标签**：Hero 的标题与标签在 `dsh-client-ui-conversation` 里写死且无槽位，本插件用 `MutationObserver` 做 DOM 校准，只依赖 `data-slot="conversation.hero.brand.mark"` 这个稳定锚点，不依赖 hash 类名；DSH 升级若改掉该结构，插件静默失效、回到官方文案，不会报错也不会破坏界面。
- **CSS 注入**：规则列表编译为 `selector{css}` 写入一个插件自有的 `<style data-plugin-css="dsh-rainy-brand/user.css">` 标签，随设置变更原地更新；卸载/热替换时移除标签，页面回到官方样式。
- **配色字体**：复用主题 token（`--dsw-alias-*`），跟随当前皮肤。

## 生效与自检

1. 重启后打开 **设置 → 品牌**，应看到四个字段与「CSS 注入」块；改名称，侧栏字标即时跟随。
2. 开一个**新会话**（空白态），标题与标签应跟随配置。
3. 点「添加选择器」，填入 `body` 与 `filter: saturate(1.2);` 之类的内容，页面应立即变化；删空后恢复。
4. `~/.dsh/settings.yaml` 应出现 `dsh-rainy-brand:` 段，且只含被改过的字段。
5. 若设置页显示「配置服务不可用」：宿主半没注册命名空间，确认插件已装入 profile 并重启 dsh web。

## 卸载

```powershell
dsh plugin --profile web remove dsh-rainy-brand
```

（settings.yaml 里的 `dsh-rainy-brand:` 段不会自动删除，可手动清理。）

## 开发

| 文件 | 作用 |
|---|---|
| `lib/index.js` | 宿主半：注册 `dsh-rainy-brand` 设置命名空间（schemastery，schema 默认值即出厂文案，含 `cssRules` 规则数组） |
| `lib/client.js` | 客户端半：字标槽位、Hero 校准、CSS 注入标签、`设置 → 品牌` 页面 |
| `cordis.patch.yml` | bundle patch：官方层之后插入本插件 row |

本地开发：`dsh plugin --profile web add C:/path/to/dsh-rainy-brand`；改 `lib/client.js` 有约 500ms 热替换，改 `lib/index.js` 需重启 dsh web。
