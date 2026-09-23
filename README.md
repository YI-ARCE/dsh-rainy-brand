# dsh-rainy-brand

DSH web 插件：提供用户可编辑的侧栏字标、空白会话（Hero）标题和预览标签，以及按选择器注入的 CSS。修改即时生效，保存在当前 profile 的 Cordis patch 中，配置条目 ID 为 `ui-brand-rainy`。

**0.4.0 适配 DSH 0.1.7-alpha.2**，使用新版 `Config` / `configForms`，不再使用旧的 `settingsScope` 或独立设置命名空间。依赖 `@deepseek-ai/schemastery ^3.18.4`；不兼容旧版设置接口。

## 安装

```powershell
dsh plugin --profile web add dsh-rainy-brand
```

替换已安装版本后重启对应的 dsh profile，并刷新浏览器页面。

## 配置

打开 **设置 → 品牌**。每个字段都有「已修改」标记和「恢复默认」，底部可全部重置。文本修改在 400ms 防抖后保存；写入被拒绝或传输失败时显示错误，可重试。全部重置通过一次原子 `mutate` 清除五个字段的 profile 覆盖，不会分多次部分生效。

恢复默认实际恢复到 profile 覆盖之下的继承值；若没有其它配置层，才恢复为以下出厂值。

| 字段 | 出厂值 | 说明 |
|---|---|---|
| `sidebarName` | 淋雨的DSH | 侧栏名称；留空隐藏 |
| `heroHeadline` | 探索未至之境 | 空白会话中央标题 |
| `showPreviewBadge` | `true` | 是否显示标题右侧标签 |
| `previewBadgeText` | 预览版 | 标签文字；留空隐藏 |
| `cssRules` | `[]` | CSS 规则列表，每项 `{ selector, css }` |

**CSS 注入**：

- 每行包含选择器、CSS 声明与删除按钮；「添加选择器」新增一行。
- 400ms 防抖后保存；选择器与内容都为空的行只留在页面。全部删空会清除字段覆盖，恢复继承规则，而不是写入空数组。
- 支持 `.a, .b` 等复合选择器。非法选择器会显示提示，由浏览器忽略对应规则。
- 按需提高选择器优先级或使用 `!important`。

也可以在当前 profile 的 `cordis.patch.yml` 中配置已有条目，例如：

```yaml
- id: ui-brand-rainy
  config:
    sidebarName: 淋雨的DSH
    heroHeadline: 探索未至之境
    showPreviewBadge: true
    previewBadgeText: 预览版
    cssRules:
      - selector: body
        css: "filter: saturate(1.2);"
```

合并到已有条目覆盖中；同一条目的覆盖配置应保留需要的其它字段。更高优先级的配置层可能阻止表单写入，界面会报告拒绝。

## 从 0.3.0 迁移

旧数据位于 DSH home 的 `settings.yaml`，section 为 `dsh-rainy-brand`。DSH 0.1.7 导入旧文档后可能将其重命名为 `settings.yaml.imported`。旧 section 名与新条目 ID 不同，不能依赖官方同名导入自动迁移。

保留旧文档或导入备份，将 `dsh-rainy-brand` 下的五个字段合并到当前 profile 的 `ui-brand-rainy.config`，避免覆盖已编辑的新配置。插件本身不会扫描、改写或删除旧文档，不会自动跨 profile 迁移。

## 实现说明

- Host 导出 `Config`，五个可编辑字段都标记 `.volatile()`，由 Loader 和设置服务提供持久化与实时更新。
- Host 可选注入 `settings`，以插件自身 fiber 为 owner 注册 `configure({ auto: false })`，退出时清理页面策略。
- Client 通过 `configForms.get('ui-brand-rainy')` 获取共享表单和写队列。
- 侧栏名称注册到 `sidebar.brand.name` 单槽位，以较低 priority 覆盖官方字标。
- Hero 标题和标签通过 `MutationObserver` 定位 `data-slot="conversation.hero.brand.mark"` 周边结构。该功能依赖 DSH 页面结构；结构变化可能使其不再替换文案，需要浏览器验证。
- CSS 编译为 `selector{css}`，写入插件自己的 `<style>` 标签；卸载时删除，Hero 修改也会还原。
- 使用宿主主题 token，跟随主题。

## 生效与自检

1. 重启并刷新后确认插件不再等待 `settingsScope`，设置页显示品牌字段与 CSS 规则。
2. 修改侧栏名称，检查立即更新；刷新后应保留。
3. 打开空白会话，检查标题、标签开关与自定义文字。
4. 添加 CSS 规则，检查生效、删除与重置。
5. 检查单字段恢复和全部恢复；上层配置阻止写入时不应显示成功。
6. 配置暂不可用时，检查 Host 条目 `ui-brand-rainy` 已启用且运行的是 0.4.0。

## 卸载

```powershell
dsh plugin --profile web remove dsh-rainy-brand
```

旧设置文档或导入备份由用户保管，不会由本插件删除。

## 开发

| 文件 | 作用 |
|---|---|
| `lib/index.js` | Host Config schema 和自定义设置页策略 |
| `lib/client.js` | 侧栏、Hero、CSS 注入和设置页 |
| `cordis.patch.yml` | 插入 `ui-brand-rainy` 条目 |

本地目录可通过 `dsh plugin --profile web add C:/path/to/dsh-rainy-brand` 安装。替换已安装代码后重启 profile 并刷新；不要假定编辑文件后一定自动热更新。
