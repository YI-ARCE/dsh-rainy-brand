# dsh-rainy-brand

DSH web 插件：把侧栏字标、空白会话（Hero）大标题与它右侧的「预览版」标签换成**用户可编辑的品牌配置**，改动即时生效，保存在 `~/.dsh/settings.yaml` 的 `dsh-rainy-brand:` 段。

## 安装

```powershell
dsh plugin --profile web add dsh-rainy-brand
```

重启 dsh web（桌面壳 = 关掉窗口重开）后生效。

## 配置

**设置 → 品牌**：四个字段各带「已修改」标记与「恢复默认」，底部「全部恢复默认」；文本改动 400ms 防抖后写入，`恢复默认` 走 `scope.unset` 回到出厂文案。

| 字段 | 出厂值 | 说明 |
|---|---|---|
| `sidebarName` | 淋雨的DSH | 侧栏左上角字标；留空 = 不显示名称 |
| `heroHeadline` | 探索未至之境 | 空白会话中央的大标题 |
| `showPreviewBadge` | `true` | 是否显示标题右侧的标签 |
| `previewBadgeText` | 预览版 | 标签文字；留空 = 不显示 |

也可以直接编辑 `~/.dsh/settings.yaml`：

```yaml
dsh-rainy-brand:
  sidebarName: 淋雨的DSH
  heroHeadline: 探索未至之境
  showPreviewBadge: true
  previewBadgeText: 预览版
```

## 实现说明

- **侧栏名称**：遮蔽 `sidebar.brand.name` 槽位（single 槽位，低 priority 胜出）。
- **对话标题 / 标签**：Hero 的标题与标签在 `dsh-client-ui-conversation` 里写死且无槽位，本插件用 `MutationObserver` 做 DOM 校准，只依赖 `data-slot="conversation.hero.brand.mark"` 这个稳定锚点，不依赖 hash 类名；DSH 升级若改掉该结构，插件静默失效、回到官方文案，不会报错也不会破坏界面。
- **配色字体**：复用主题 token（`--dsw-alias-*`），跟随当前皮肤。

## 生效与自检

1. 重启后打开 **设置 → 品牌**，应看到四个字段；改名称，侧栏字标即时跟随。
2. 开一个**新会话**（空白态），标题与标签应跟随配置。
3. `~/.dsh/settings.yaml` 应出现 `dsh-rainy-brand:` 段，且只含被改过的字段。
4. 若设置页显示「配置服务不可用」：宿主半没注册命名空间，确认插件已装入 profile 并重启 dsh web。

## 卸载

```powershell
dsh plugin --profile web remove dsh-rainy-brand
```

（settings.yaml 里的 `dsh-rainy-brand:` 段不会自动删除，可手动清理。）

## 开发

| 文件 | 作用 |
|---|---|
| `lib/index.js` | 宿主半：注册 `dsh-rainy-brand` 设置命名空间（schemastery，schema 默认值即出厂文案） |
| `lib/client.js` | 客户端半：字标槽位、Hero 校准、`设置 → 品牌` 页面 |
| `cordis.patch.yml` | bundle patch：官方层之后插入本插件 row |

本地开发：`dsh plugin --profile web add C:/path/to/dsh-rainy-brand`；改 `lib/client.js` 有约 500ms 热替换，改 `lib/index.js` 需重启 dsh web。
