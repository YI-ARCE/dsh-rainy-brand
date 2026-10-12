/** Host Config owns the live brand fields persisted in the active profile patch. */
import z from '@deepseek-ai/schemastery'

/** Loader entry id shared with the browser form and bundle patch. */
const SETTINGS_NS = 'ui-brand-rainy'

/** Mirrored by the browser for the interval before its first configuration view. */
const BRAND_DEFAULTS = {
  "sidebarName": "淋雨的DSH",
  "heroHeadline": "风经过很多地方，我仍只记得一种温度",
  "showPreviewBadge": true,
  "previewBadgeText": "风向",
  "cssRules": [
    {
      "selector": "[data-overflow-below]:after",
      "css": "display: none;"
    },
    {
      "selector": "[role=\"menu\"]:not([data-dockkit-tab-menu]), [role=\"listbox\"], body > [role=\"tree\"], body > [role=\"dialog\"]:not([aria-modal=\"true\"])",
      "css": "border-radius: 10px;"
    },
    {
      "selector": ".bhn1Oq_fade",
      "css": "display:none;"
    },
    {
      "selector": ".hHd-Xa_footerActions",
      "css": "flex-direction: column;"
    },
    {
      "selector": "[data-slot=\"conversation.session.header\"]",
      "css": "--wails-draggable: drag;"
    },
    {
      "selector": "[data-slot=\"conversation.session.header\"] nav,[data-slot=\"conversation.session.header\"] span",
      "css": "--wails-draggable: no-drag;"
    },
    {
      "selector": "[data-composer-seat]",
      "css": "background: transparent !important;"
    },
    {
      "selector": ".mna1RW_card",
      "css": "backdrop-filter: blur(10px);"
    },
    {
      "selector": ".bOPqQW_anchor",
      "css": "    background: var(--dsw-alias-bg-layer-3);\n    backdrop-filter: blur(10px);\n    border-radius: 10px;\n    overflow: hidden;"
    },
    {
      "selector": "[data-trigger-menu]",
      "css": "backdrop-filter: blur(10px);"
    },
    {
      "selector": "[aria-label=\"Agent Team\"]",
      "css": "backdrop-filter: blur(10px);"
    },
    {
      "selector": "*",
      "css": "--dsw-font-family:'Google sans code','DAnyFont',-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif !important;\n--ds-font-family-code: 'Google sans code','DAnyFont',-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;"
    },
    {
      "selector": ".cm-stat-dialog",
      "css": "backdrop-filter: blur(10px);"
    }
  ]
}

const CSS_RULE_SCHEMA = z.object({
  selector: z.string().default(''),
  css: z.string().default(''),
})

/** Volatile fields are exposed by DSH 0.1.7's Config-derived forms. */
const Config = z.object({
  sidebarName: z.string().default(BRAND_DEFAULTS.sidebarName).volatile(),
  heroHeadline: z.string().default(BRAND_DEFAULTS.heroHeadline).volatile(),
  showPreviewBadge: z.boolean().default(BRAND_DEFAULTS.showPreviewBadge).volatile(),
  previewBadgeText: z.string().default(BRAND_DEFAULTS.previewBadgeText).volatile(),
  cssRules: z.array(CSS_RULE_SCHEMA).default(BRAND_DEFAULTS.cssRules).volatile(),
})

/** Retain the prior schema export as an alias for consumers. */
const BRAND_SCHEMA = Config

/** This instance supplies its own settings page; Settings itself is optional. */
function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber))
  })
}

export { SETTINGS_NS, BRAND_DEFAULTS, BRAND_SCHEMA, CSS_RULE_SCHEMA, Config, apply }
