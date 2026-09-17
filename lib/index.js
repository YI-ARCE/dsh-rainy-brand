/**
 * Host plugin body — the durable half of this package.
 *
 * The browser half owns every rendered surface; this half exists for one
 * reason: the user-editable brand values belong to the DSH settings document
 * (`~/.dsh/settings.yaml`), and only a host plugin can register a settings
 * namespace. The browser reads and writes it through the client settings scope
 * (`ctx.settingsScope.bind`), the same seam the theme and skin plugins use.
 *
 * Dependency note: this package is installed into the profile as a symlink, so
 * Node resolves the real path (this repository) and never walks up into
 * `$DSH_HOME/profiles/node_modules`, where DSH materializes the host packages
 * an installed plugin may import. `scripts/setup-deps.ps1` creates the
 * plugin-local `node_modules` junction that makes the schemastery import
 * resolvable; without it this row fails to load and the browser half degrades
 * to its built-in defaults.
 */
import z from '@deepseek-ai/schemastery'

/** Settings namespace owning every user-facing brand value. */
const SETTINGS_NS = 'dsh-rainy-brand'

/**
 * Shipped defaults: the sidebar wordmark and the blank-session hero copy.
 * Mirrored (not imported) by the browser half, which must keep working when
 * this namespace is absent.
 */
const BRAND_DEFAULTS = {
  sidebarName: '淋雨的DSH',
  heroHeadline: '探索未至之境',
  showPreviewBadge: true,
  previewBadgeText: '预览版',
  cssRules: [],
}

/** One user-injected CSS rule: a selector plus the declarations it owns. */
const CSS_RULE_SCHEMA = z.object({
  selector: z.string().default(''),
  css: z.string().default(''),
})

/**
 * Schema of the brand settings section. Every field carries its shipped value
 * as the schema default, so a cleared field re-inherits it and the stored user
 * section only ever holds values the user actually changed.
 */
const BRAND_SCHEMA = z.object({
  sidebarName: z.string().default(BRAND_DEFAULTS.sidebarName),
  heroHeadline: z.string().default(BRAND_DEFAULTS.heroHeadline),
  showPreviewBadge: z.boolean().default(BRAND_DEFAULTS.showPreviewBadge),
  previewBadgeText: z.string().default(BRAND_DEFAULTS.previewBadgeText),
  cssRules: z.array(CSS_RULE_SCHEMA).default(BRAND_DEFAULTS.cssRules),
})

/**
 * Register the brand settings namespace while this deployment mounts a settings
 * provider. A deployment without one keeps working: the browser half falls back
 * to the defaults above and its settings page reports the namespace as absent.
 * @param ctx - Host root context.
 */
function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(SETTINGS_NS, BRAND_SCHEMA, { applies: 'live' })
  })
}

export { SETTINGS_NS, BRAND_DEFAULTS, BRAND_SCHEMA, CSS_RULE_SCHEMA, apply }
