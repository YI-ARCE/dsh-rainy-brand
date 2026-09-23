/** Host Config owns the live brand fields persisted in the active profile patch. */
import z from '@deepseek-ai/schemastery'

/** Loader entry id shared with the browser form and bundle patch. */
const SETTINGS_NS = 'ui-brand-rainy'

/** Mirrored by the browser for the interval before its first configuration view. */
const BRAND_DEFAULTS = {
  sidebarName: '淋雨的DSH',
  heroHeadline: '探索未至之境',
  showPreviewBadge: true,
  previewBadgeText: '预览版',
  cssRules: [],
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
