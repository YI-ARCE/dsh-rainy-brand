window.__ModuleLoader__.load({
	id: "dsh-rainy-brand",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region client/brand.js
		/** Settings namespace owned by this package's host half. */
		const SETTINGS_NS = "dsh-rainy-brand";
		/** Locale namespace owning this plugin's own copy. */
		const LOCALE_NS = "dsh-rainy-brand";
		/**
		 * Built-in defaults, mirrored from the host half's schema. They stand
		 * whenever the namespace is absent, still loading, or carrying a value
		 * this bundle cannot read — the brand surface must never render blank
		 * just because the settings transport is missing.
		 */
		const DEFAULTS = {
			sidebarName: "淋雨的DSH",
			heroHeadline: "探索未至之境",
			showPreviewBadge: true,
			previewBadgeText: "预览版",
			cssRules: [],
		};
		/** Editable fields, in the order the settings page renders them. */
		const FIELDS = ["sidebarName", "heroHeadline", "showPreviewBadge", "previewBadgeText"];
		/** Every writable field of the namespace, including the rule list. */
		const ALL_FIELDS = FIELDS.concat("cssRules");
		/**
		 * Narrow one raw rule entry into its two string fields.
		 * @param raw - one entry of the stored rule list (arbitrary on the wire).
		 * @returns a rule with plain-string fields.
		 */
		function normalizeRule(raw) {
			const source = raw !== null && typeof raw === "object" ? raw : {};
			return {
				selector: typeof source.selector === "string" ? source.selector : "",
				css: typeof source.css === "string" ? source.css : "",
			};
		}
		/**
		 * Narrow one raw rule list into normalized rules; non-array junk becomes
		 * an empty list so a malformed document never reaches the UI.
		 * @param raw - the stored list (arbitrary on the wire).
		 * @returns normalized rules.
		 */
		function normalizeRules(raw) {
			if (!Array.isArray(raw)) return [];
			return raw.map(normalizeRule);
		}
		/**
		 * Whether two rule lists carry the same selector/css pairs. The wire
		 * echoes every write back as a fresh array, so identity never holds and
		 * the draft fence must compare by value.
		 * @param a - one normalized list.
		 * @param b - another normalized list.
		 * @returns true when both lists match pairwise.
		 */
		function sameRules(a, b) {
			if (a === b) return true;
			if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
			for (let index = 0; index < a.length; index++) {
				if (a[index].selector !== b[index].selector || a[index].css !== b[index].css) return false;
			}
			return true;
		}
		/**
		 * Drop rules whose selector and css are both empty — placeholder rows the
		 * user added but never filled in are draft-local and never stored.
		 * @param rules - normalized rules.
		 * @returns the rules worth persisting.
		 */
		function compactRules(rules) {
			return rules.filter((rule) => rule.selector !== "" || rule.css !== "");
		}
		/**
		 * Narrow one raw settings section into the brand values, including the
		 * CSS rule list.
		 * @param raw - the scope snapshot's resolved value (arbitrary on the wire).
		 * @returns complete values, every absent or malformed field defaulted.
		 */
		function normalizeBrand(raw) {
			const source = raw !== null && typeof raw === "object" ? raw : {};
			return {
				sidebarName: typeof source.sidebarName === "string" ? source.sidebarName : DEFAULTS.sidebarName,
				heroHeadline: typeof source.heroHeadline === "string" ? source.heroHeadline : DEFAULTS.heroHeadline,
				showPreviewBadge: typeof source.showPreviewBadge === "boolean" ? source.showPreviewBadge : DEFAULTS.showPreviewBadge,
				previewBadgeText: typeof source.previewBadgeText === "string" ? source.previewBadgeText : DEFAULTS.previewBadgeText,
				cssRules: normalizeRules(source.cssRules),
			};
		}
		/**
		 * Read the brand values out of one settings scope snapshot.
		 * @param snapshot - client settings scope snapshot (may be undefined while binding).
		 * @returns complete brand values.
		 */
		function brandOf(snapshot) {
			return normalizeBrand(snapshot === undefined || snapshot === null ? undefined : snapshot.value);
		}
		/**
		 * Whether the stored user layer carries an explicit value for one field —
		 * presence, not equality, is what marks a field overridden.
		 * @param snapshot - client settings scope snapshot.
		 * @param field - field name.
		 * @returns true when the field is user-overridden.
		 */
		function isOverridden(snapshot, field) {
			const user = snapshot === undefined || snapshot === null ? undefined : snapshot.user;
			return user !== null && typeof user === "object" && Object.prototype.hasOwnProperty.call(user, field);
		}
		//#endregion
		//#region client/hero-brand.js
		/** Slot outlet anchoring the blank-session headline cluster in the DOM. */
		const HERO_MARK_SLOT = '[data-slot="conversation.hero.brand.mark"]';
		/** Shortest interval between two anchor lookups while the hero is absent. */
		const LOCATE_INTERVAL_MS = 300;
		/**
		 * Keep the blank-session hero in sync with the brand values.
		 *
		 * The hero headline and its "preview" tag are hard-coded spans inside the
		 * conversation package: no slot renders them, and the locale namespace
		 * carrying their text has a single owner (a second register throws), so
		 * the only seam left is the rendered DOM. It is addressed through the one
		 * stable anchor the hero offers — the brand-mark slot outlet, whose
		 * wrapper carries `data-slot` and sits beside the headline cluster — so
		 * nothing here depends on a hashed CSS class. A structure this patch does
		 * not recognize is left untouched: the shipped copy simply stays.
		 * @param read - reads the current brand values.
		 * @returns the observer handle: `kick` re-applies on demand (a settings
		 * change mutates no DOM of its own) and `dispose` stops observing and
		 * restores the touched copy.
		 */
		function mountHeroBrand(read) {
			const scheduleFrame = typeof requestAnimationFrame === "function"
				? (callback) => requestAnimationFrame(callback)
				: (callback) => setTimeout(callback, 16);
			const cancelFrame = typeof cancelAnimationFrame === "function"
				? (handle) => cancelAnimationFrame(handle)
				: (handle) => clearTimeout(handle);
			let frame = 0;
			let group = null;
			let originalHeadline = null;
			let touchedHeadline = null;
			let nextLocateAt = 0;
			/**
			 * Adopt the headline cluster out of one candidate element, when that
			 * element is (or contains) the brand-mark outlet.
			 * @param node - an element from a mutation record (target or added node).
			 * @returns true when the cluster was found and adopted.
			 */
			const probe = (node) => {
				if (node === null || node === undefined || node.nodeType !== 1) return false;
				const mark = node.matches(HERO_MARK_SLOT) ? node : node.querySelector(HERO_MARK_SLOT);
				if (mark === null) return false;
				const host = mark.parentElement;
				const found = host === null ? null : host.nextElementSibling;
				if (found === null || found.children.length < 2) return false;
				group = found;
				return true;
			};
			/** Locate (or relocate) the headline cluster beside the brand mark. */
			const locate = () => {
				// The anchor only exists on a blank session, so a miss is the common
				// case while a transcript streams. Rate-limit the miss path: the
				// mutation stream is most active exactly then, and a full-document
				// attribute query on every frame is the one cost worth avoiding.
				const now = Date.now();
				if (now < nextLocateAt) return;
				nextLocateAt = now + LOCATE_INTERVAL_MS;
				const mark = document.querySelector(HERO_MARK_SLOT);
				const host = mark === null ? null : mark.parentElement;
				group = host === null ? null : host.nextElementSibling;
				if (group === null || group.children.length < 2) group = null;
			};
			const sync = () => {
				frame = 0;
				if (group !== null && group.isConnected !== true) group = null;
				if (group === null) {
					locate();
					if (group === null || group.isConnected !== true) return;
				}
				const headline = group.children[0];
				const badge = group.children[1];
				const values = read();
				if (originalHeadline === null) originalHeadline = headline.textContent;
				if (headline.textContent !== values.heroHeadline) {
					headline.textContent = values.heroHeadline;
					touchedHeadline = headline;
				}
				const badgeText = values.previewBadgeText;
				const showBadge = values.showPreviewBadge === true && badgeText !== "";
				const display = showBadge ? "" : "none";
				if (badge.style.display !== display) badge.style.display = display;
				if (showBadge && badge.textContent !== badgeText) badge.textContent = badgeText;
			};
			const schedule = () => {
				if (frame !== 0) return;
				frame = scheduleFrame(sync);
			};
			const observer = new MutationObserver((records) => {
				// A miss normally means a streaming transcript, where coalescing is
				// right. The hero's own mount is an INSERTION though: adopt it in the
				// batch that carried it instead of waiting out the miss throttle,
				// which is what made a freshly opened session show the shipped copy
				// for a moment first.
				if (group === null || group.isConnected !== true) {
					group = null;
					for (const record of records) {
						if (record.type !== "childList") continue;
						if (probe(record.target)) break;
						const added = record.addedNodes;
						let found = false;
						for (let index = 0; index < added.length; index++) {
							if (probe(added[index])) {
								found = true;
								break;
							}
						}
						if (found) break;
					}
					if (group !== null) {
						sync();
						return;
					}
				}
				schedule();
			});
			observer.observe(document.body, { childList: true, characterData: true, subtree: true });
			schedule();
			return {
				kick: sync,
				dispose: () => {
					observer.disconnect();
					if (frame !== 0) cancelFrame(frame);
					frame = 0;
					if (touchedHeadline !== null && touchedHeadline.isConnected === true && originalHeadline !== null) {
						touchedHeadline.textContent = originalHeadline;
					}
					if (group !== null && group.isConnected === true && group.children.length >= 2) {
						group.children[1].style.display = "";
					}
				},
			};
		}
		//#endregion
		//#region client/styles.js
		/** Owned style tag id (the HMR driver inventories `data-plugin` tags by it). */
		const STYLE_ID = "dsh-rainy-brand/settings.css";
		/**
		 * Section styles, mirroring the shipped plugin-configuration field chrome
		 * (same theme tokens, same metrics) so this page reads as a native part of
		 * the settings panel in both themes.
		 */
		const STYLE_TEXT = [
			".drbSection{display:flex;flex-direction:column;padding:4px 0}",
			".drbHeading{margin:0;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600;line-height:1.5}",
			".drbDescription{margin:6px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}",
			".drbRow{display:flex;flex-direction:column;gap:6px;padding:14px 0;border-top:.5px solid var(--dsw-alias-border-l2)}",
			".drbRow:first-of-type{border-top:none}",
			".drbHead{display:flex;align-items:center;gap:8px}",
			".drbLabel{flex:1;min-width:0;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:1.5}",
			".drbChanged{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}",
			".drbReset{font:inherit;color:var(--dsw-alias-label-secondary);background:none;border:none;padding:0;cursor:pointer;font-size:12px;line-height:1.5}",
			".drbReset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}",
			".drbReset:disabled{cursor:default}",
			".drbInput{border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}",
			".drbInput:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}",
			".drbInput:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}",
			".drbSwitchRow{display:flex;align-items:center;gap:8px}",
			".drbHint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}",
			".drbFoot{display:flex;align-items:center;gap:12px;padding-top:14px;border-top:.5px solid var(--dsw-alias-border-l2)}",
			".drbError{margin:0;color:var(--dsw-alias-label-error);font-size:12px;line-height:1.5}",
			".drbCssList{display:flex;flex-direction:column;gap:12px}",
			".drbCssItem{display:flex;flex-direction:column;gap:6px}",
			".drbCssHead{display:flex;align-items:center;gap:8px}",
			".drbSelector{flex:1;min-width:0}",
			".drbTextarea{border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 12px;font-family:ui-monospace,SFMono-Regular,Consolas,\"Courier New\",monospace;font-size:12px;line-height:1.6;min-height:72px;resize:vertical;width:100%;box-sizing:border-box}",
			".drbTextarea:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}",
			".drbTextarea:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}",
			".drbAddRow{display:flex;padding-top:2px}",
		].join("");
		/**
		 * Install this section's stylesheet as a plugin-owned style tag.
		 * @returns the disposer removing exactly the tag this call created.
		 */
		function installStyles() {
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID) + "]") !== null) return () => {};
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-rainy-brand";
			tag.dataset.pluginCss = STYLE_ID;
			tag.textContent = STYLE_TEXT;
			document.head.appendChild(tag);
			return () => {
				if (tag.parentElement !== null) tag.parentElement.removeChild(tag);
			};
		}
		//#endregion
		//#region client/css-inject.js
		/** Owned style tag id for user-injected rules (the HMR driver inventories `data-plugin` tags by it). */
		const USER_CSS_ID = "dsh-rainy-brand/user.css";
		/** Header comment marking the tag content as user-authored. */
		const USER_CSS_HEADER = "/* dsh-rainy-brand: user CSS rules (Settings > Brand) */\n";
		/**
		 * Compile the rule list into one stylesheet text. A rule without a
		 * selector cannot target anything and is skipped; a malformed selector
		 * only invalidates its own rule, which is exactly how the browser would
		 * drop it anyway, so no stricter gate is needed here.
		 * @param rules - normalized rule list.
		 * @returns the stylesheet text, empty when no rule survives.
		 */
		function compileRules(rules) {
			const blocks = [];
			for (const rule of rules) {
				if (rule.selector === "") continue;
				blocks.push(rule.selector + "{" + rule.css + "}");
			}
			return blocks.length === 0 ? "" : USER_CSS_HEADER + blocks.join("\n") + "\n";
		}
		/**
		 * Keep one plugin-owned style tag in sync with the injected rules.
		 *
		 * The tag mirrors the section stylesheet's ownership protocol: marked
		 * with `data-plugin` / `data-plugin-css` so the HMR driver can inventory
		 * it, created only when absent (an instance that survives a hot swap
		 * adopts the existing tag instead of stacking a second one), and updated
		 * in place on every settings change — the compiled text is compared
		 * first so typing cannot thrash the stylesheet per keystroke.
		 * @param read - reads the current brand values.
		 * @returns `apply` re-syncs the tag and `dispose` stops the injection.
		 */
		function mountUserCss(read) {
			const selector = "style[data-plugin-css=" + JSON.stringify(USER_CSS_ID) + "]";
			let tag = document.querySelector(selector);
			let owned = false;
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = "dsh-rainy-brand";
				tag.dataset.pluginCss = USER_CSS_ID;
				document.head.appendChild(tag);
				owned = true;
			}
			const apply = () => {
				const text = compileRules(read().cssRules);
				if (tag.textContent !== text) tag.textContent = text;
			};
			apply();
			return {
				apply,
				dispose: () => {
					if (owned) {
						if (tag.parentElement !== null) tag.parentElement.removeChild(tag);
					} else {
						tag.textContent = "";
					}
				},
			};
		}
		//#endregion
		//#region client/locales.js
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			title: "品牌",
			description: "侧栏字标与空白会话的大标题；修改即时生效，并记入 ~/.dsh/settings.yaml。",
			sidebarName: "侧栏名称",
			sidebarNameHint: "侧栏左上角的品牌文字；留空则隐藏名称。",
			heroHeadline: "对话标题",
			heroHeadlineHint: "空白会话中央的大标题。",
			badgeVisible: "「预览版」标签",
			badgeVisibleHint: "是否显示对话标题右侧的标签。",
			badgeText: "标签文字",
			badgeTextHint: "标签内容；留空等同于隐藏。",
			cssTitle: "CSS 注入",
			cssDescription: "按选择器给页面注入自定义 CSS；改动即时生效，并记入 ~/.dsh/settings.yaml。",
			cssSelector: "选择器",
			cssSelectorPlaceholder: "例如：.sidebar 或 body::before",
			cssContent: "CSS 内容",
			cssContentPlaceholder: "例如：color: red;",
			cssAdd: "添加选择器",
			cssRemove: "删除",
			cssInvalid: "选择器语法无效，这条规则不会生效。",
			cssEmpty: "暂无规则，点击「添加选择器」开始。",
			changed: "已修改",
			reset: "恢复默认",
			resetAll: "全部恢复默认",
			unavailable: "配置服务不可用：宿主侧未注册 dsh-rainy-brand 命名空间（可能需要重启 dsh web）。",
			readonly: "当前配置文档只读，修改不会被保存。",
			failed: "保存失败：{message}",
			note: "对话标题与标签通过页面结构定位生效；DSH 升级若改动该结构，它们会回到默认文案。",
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			title: "Brand",
			description: "The sidebar wordmark and the blank-session headline. Edits apply live and persist to ~/.dsh/settings.yaml.",
			sidebarName: "Sidebar name",
			sidebarNameHint: "Brand text at the top-left of the sidebar; leave it empty to hide the name.",
			heroHeadline: "Conversation headline",
			heroHeadlineHint: "The large headline of a blank session.",
			badgeVisible: "\u201cPreview\u201d tag",
			badgeVisibleHint: "Whether the tag beside the conversation headline is shown.",
			badgeText: "Tag text",
			badgeTextHint: "Tag content; an empty value hides the tag.",
			cssTitle: "CSS injection",
			cssDescription: "Inject custom CSS per selector. Edits apply live and persist to ~/.dsh/settings.yaml.",
			cssSelector: "Selector",
			cssSelectorPlaceholder: "e.g. .sidebar or body::before",
			cssContent: "CSS content",
			cssContentPlaceholder: "e.g. color: red;",
			cssAdd: "Add selector",
			cssRemove: "Delete",
			cssInvalid: "Invalid selector; this rule will not apply.",
			cssEmpty: "No rules yet; click \u201cAdd selector\u201d to start.",
			changed: "Changed",
			reset: "Reset",
			resetAll: "Reset all",
			unavailable: "Settings unavailable: the host half did not register the dsh-rainy-brand namespace (a dsh web restart may be required).",
			readonly: "This settings document is read-only; edits will not be saved.",
			failed: "Save failed: {message}",
			note: "The conversation headline and tag are applied by locating the rendered hero; if a DSH upgrade changes that structure they fall back to the shipped copy.",
		};
		//#endregion
		//#region client/settings-section.js
		/** Delay before a text edit reaches the settings document. */
		const COMMIT_DELAY_MS = 400;
		/**
		 * Whether one non-empty selector parses in this document. A hint only:
		 * the compiled stylesheet is emitted regardless, and the browser drops
		 * exactly the rules whose selectors it cannot parse.
		 * @param selector - the selector text.
		 * @returns true when `document.querySelector` accepts it.
		 */
		function selectorIsValid(selector) {
			try {
				document.querySelector(selector);
				return true;
			} catch {
				return false;
			}
		}
		/**
		 * Render the Brand settings page: the four brand values plus the CSS
		 * rule list of the `dsh-rainy-brand` namespace, each with its own reset.
		 * @param props - `t` bound to this plugin's locale namespace, plus the bound scope.
		 * @returns the section element tree.
		 */
		function RainyBrandSection(props) {
			const t = props.t;
			const scope = props.scope;
			const snapshot = (0, react.useSyncExternalStore)(
				(listener) => scope.subscribe(listener),
				() => scope.getSnapshot(),
			);
			const values = brandOf(snapshot);
			const [draft, setDraft] = (0, react.useState)(values);
			const draftRef = (0, react.useRef)(draft);
			draftRef.current = draft;
			/** Last document value seen for each field (the write no-op fence). */
			const committedRef = (0, react.useRef)(values);
			committedRef.current = values;
			/** Last value this page already pushed for each field. */
			const writtenRef = (0, react.useRef)({});
			const focusedRef = (0, react.useRef)(null);
			const timerRef = (0, react.useRef)(0);
			const [error, setError] = (0, react.useState)(null);
			const unavailable = snapshot.status === "unavailable";
			// `writable` is false before the first Host view arrives; only a resolved
			// document can actually be read-only, so gate the notice on `ready`.
			const readonly = snapshot.status === "ready" && snapshot.writable === false;
			const disabled = unavailable || readonly || snapshot.status === "loading";
			(0, react.useEffect)(() => {
				setDraft((previous) => {
					let changed = false;
					const next = { ...previous };
					for (const field of FIELDS) {
						// A field the user is editing keeps the caret's text; every other
						// field follows the document (our own write echoes back the same
						// value, so adopting it is a no-op).
						if (focusedRef.current === field) continue;
						if (next[field] !== values[field]) {
							next[field] = values[field];
							changed = true;
						}
					}
					// The rule list additionally keeps placeholder rows the user has
					// not filled in yet: adopt the document only when the draft,
					// stripped of those rows, actually differs from it.
					if (focusedRef.current !== "cssRules" && !sameRules(compactRules(next.cssRules), values.cssRules)) {
						next.cssRules = values.cssRules;
						changed = true;
					}
					return changed ? next : previous;
				});
			}, [values.sidebarName, values.heroHeadline, values.showPreviewBadge, values.previewBadgeText, snapshot.revision]);
			(0, react.useEffect)(() => () => {
				if (timerRef.current !== 0) clearTimeout(timerRef.current);
			}, []);
			const report = (reason) => {
				setError(reason instanceof Error ? reason.message : String(reason));
			};
			const write = (field) => {
				if (timerRef.current !== 0) {
					clearTimeout(timerRef.current);
					timerRef.current = 0;
				}
				const value = draftRef.current[field];
				// Focusing and leaving a field must not pin it into the user layer:
				// only a value that differs from the document is a user override.
				if (value === committedRef.current[field] || value === writtenRef.current[field]) return;
				writtenRef.current[field] = value;
				scope.set(field, value).then(() => setError(null), (reason) => {
					delete writtenRef.current[field];
					report(reason);
				});
			};
			const stage = (field, value) => {
				const next = { ...draftRef.current, [field]: value };
				draftRef.current = next;
				setDraft(next);
			};
			const edit = (field, value) => {
				stage(field, value);
				if (timerRef.current !== 0) clearTimeout(timerRef.current);
				timerRef.current = setTimeout(() => {
					timerRef.current = 0;
					write(field);
				}, COMMIT_DELAY_MS);
			};
			const toggle = (next) => {
				const value = typeof next === "boolean" ? next : !draftRef.current.showPreviewBadge;
				stage("showPreviewBadge", value);
				write("showPreviewBadge");
			};
			const clear = (field) => {
				if (timerRef.current !== 0) {
					clearTimeout(timerRef.current);
					timerRef.current = 0;
				}
				delete writtenRef.current[field];
				scope.unset(field).then(() => setError(null), report);
			};
			/**
			 * Push the rule draft into the document. Placeholder rows never
			 * persist, so an emptied list resets (`unset`) instead of storing an
			 * empty array — the user layer then holds no rule override at all.
			 */
			const writeRules = () => {
				if (timerRef.current !== 0) {
					clearTimeout(timerRef.current);
					timerRef.current = 0;
				}
				const rules = compactRules(draftRef.current.cssRules);
				const written = writtenRef.current.cssRules;
				if (sameRules(rules, committedRef.current.cssRules) || (written !== undefined && sameRules(rules, written))) return;
				writtenRef.current.cssRules = rules;
				const settle = rules.length === 0 ? scope.unset("cssRules") : scope.set("cssRules", rules);
				settle.then(() => setError(null), (reason) => {
					delete writtenRef.current.cssRules;
					report(reason);
				});
			};
			const stageRules = (rules) => {
				const next = { ...draftRef.current, cssRules: rules };
				draftRef.current = next;
				setDraft(next);
			};
			const editRule = (index, key, value) => {
				stageRules(draftRef.current.cssRules.map((rule, at) => at === index ? { ...rule, [key]: value } : rule));
				if (timerRef.current !== 0) clearTimeout(timerRef.current);
				timerRef.current = setTimeout(() => {
					timerRef.current = 0;
					writeRules();
				}, COMMIT_DELAY_MS);
			};
			const addRule = () => {
				// A fresh row is draft-local only: it persists once it carries a
				// selector or content, so an abandoned click stores nothing.
				stageRules(draftRef.current.cssRules.concat([{ selector: "", css: "" }]));
			};
			const removeRule = (index) => {
				stageRules(draftRef.current.cssRules.filter((_, at) => at !== index));
				writeRules();
			};
			const clearAll = () => {
				if (timerRef.current !== 0) {
					clearTimeout(timerRef.current);
					timerRef.current = 0;
				}
				writtenRef.current = {};
				Promise.all(ALL_FIELDS.map((field) => scope.unset(field))).then(() => setError(null), report);
			};
			const textRow = (field, label, hint) => (0, react.createElement)("div", { className: "drbRow", key: field },
				(0, react.createElement)("div", { className: "drbHead" },
					(0, react.createElement)("label", { className: "drbLabel", htmlFor: "drb-" + field }, label),
					isOverridden(snapshot, field)
						? (0, react.createElement)("span", { className: "drbChanged" }, t("changed"))
						: null,
					isOverridden(snapshot, field)
						? (0, react.createElement)("button", {
							type: "button",
							className: "drbReset",
							disabled,
							onClick: () => clear(field),
						}, t("reset"))
						: null,
				),
				(0, react.createElement)("input", {
					id: "drb-" + field,
					className: "drbInput",
					type: "text",
					value: draft[field],
					disabled,
					spellCheck: false,
					autoComplete: "off",
					onFocus: () => {
						focusedRef.current = field;
					},
					onBlur: () => {
						focusedRef.current = null;
						write(field);
					},
					onChange: (event) => edit(field, event.target.value),
				}),
				(0, react.createElement)("p", { className: "drbHint" }, hint),
			);
			const ruleRow = (rule, index) => (0, react.createElement)("div", { className: "drbCssItem", key: index },
				(0, react.createElement)("div", { className: "drbCssHead" },
					(0, react.createElement)("input", {
						className: "drbInput drbSelector",
						type: "text",
						value: rule.selector,
						placeholder: t("cssSelectorPlaceholder"),
						disabled,
						spellCheck: false,
						autoComplete: "off",
						"aria-label": t("cssSelector"),
						onFocus: () => {
							focusedRef.current = "cssRules";
						},
						onBlur: () => {
							focusedRef.current = null;
							writeRules();
						},
						onChange: (event) => editRule(index, "selector", event.target.value),
					}),
					(0, react.createElement)("button", {
						type: "button",
						className: "drbReset",
						disabled,
						onClick: () => removeRule(index),
					}, t("cssRemove")),
				),
				(0, react.createElement)("textarea", {
					className: "drbTextarea",
					value: rule.css,
					placeholder: t("cssContentPlaceholder"),
					disabled,
					spellCheck: false,
					rows: 3,
					"aria-label": t("cssContent"),
					onFocus: () => {
						focusedRef.current = "cssRules";
					},
					onBlur: () => {
						focusedRef.current = null;
						writeRules();
					},
					onChange: (event) => editRule(index, "css", event.target.value),
				}),
				rule.selector !== "" && !selectorIsValid(rule.selector)
					? (0, react.createElement)("p", { className: "drbError" }, t("cssInvalid"))
					: null,
			);
			return (0, react.createElement)("div", { className: "drbSection" },
				(0, react.createElement)("h2", { className: "drbHeading" }, t("title")),
				(0, react.createElement)("p", { className: "drbDescription" }, t("description")),
				textRow("sidebarName", t("sidebarName"), t("sidebarNameHint")),
				textRow("heroHeadline", t("heroHeadline"), t("heroHeadlineHint")),
				(0, react.createElement)("div", { className: "drbRow", key: "showPreviewBadge" },
					(0, react.createElement)("div", { className: "drbHead" },
						(0, react.createElement)("span", { className: "drbLabel" }, t("badgeVisible")),
						isOverridden(snapshot, "showPreviewBadge")
							? (0, react.createElement)("span", { className: "drbChanged" }, t("changed"))
							: null,
						isOverridden(snapshot, "showPreviewBadge")
							? (0, react.createElement)("button", {
								type: "button",
								className: "drbReset",
								disabled,
								onClick: () => clear("showPreviewBadge"),
							}, t("reset"))
							: null,
					),
					(0, react.createElement)("div", { className: "drbSwitchRow" },
						(0, react.createElement)(primitives.Switch, {
							checked: draft.showPreviewBadge === true,
							label: t("badgeVisible"),
							disabled,
							onChange: toggle,
						}),
					),
					(0, react.createElement)("p", { className: "drbHint" }, t("badgeVisibleHint")),
				),
				textRow("previewBadgeText", t("badgeText"), t("badgeTextHint")),
				(0, react.createElement)("div", { className: "drbRow", key: "cssRules" },
					(0, react.createElement)("div", { className: "drbHead" },
						(0, react.createElement)("span", { className: "drbLabel" }, t("cssTitle")),
						isOverridden(snapshot, "cssRules")
							? (0, react.createElement)("span", { className: "drbChanged" }, t("changed"))
							: null,
						isOverridden(snapshot, "cssRules")
							? (0, react.createElement)("button", {
								type: "button",
								className: "drbReset",
								disabled,
								onClick: () => clear("cssRules"),
							}, t("reset"))
							: null,
					),
					(0, react.createElement)("p", { className: "drbHint" }, t("cssDescription")),
					draft.cssRules.length === 0
						? (0, react.createElement)("p", { className: "drbHint" }, t("cssEmpty"))
						: (0, react.createElement)("div", { className: "drbCssList" }, draft.cssRules.map(ruleRow)),
					(0, react.createElement)("div", { className: "drbAddRow" },
						(0, react.createElement)(primitives.Button, {
							variant: "outline",
							size: "sm",
							disabled,
							onClick: addRule,
						}, t("cssAdd")),
					),
				),
				unavailable ? (0, react.createElement)("p", { className: "drbError", role: "status" }, t("unavailable")) : null,
				!unavailable && readonly ? (0, react.createElement)("p", { className: "drbError", role: "status" }, t("readonly")) : null,
				error !== null ? (0, react.createElement)("p", { className: "drbError", role: "alert" }, t("failed", { message: error })) : null,
				(0, react.createElement)("div", { className: "drbFoot" },
					(0, react.createElement)(primitives.Button, {
						variant: "outline",
						size: "sm",
						disabled,
						onClick: clearAll,
					}, t("resetAll")),
					(0, react.createElement)("p", { className: "drbHint" }, t("note")),
				),
			);
		}
		//#endregion
		//#region client/index.js
		/** Required services: the slot registry, the locale registry, and the settings transport. */
		const inject = ["slots", "locale", "settingsScope"];
		/**
		 * Occupy the sidebar brand-name slot with the configured name, keep the
		 * blank-session hero in sync with it, keep one plugin-owned style tag in
		 * sync with the user's injected CSS rules, and contribute the Brand
		 * settings page that owns all of these values.
		 *
		 * The brand-name slot is a single slot: the official wordmark registers at
		 * the default priority 0, a second registration at the SAME priority is
		 * refused, and the lowest priority renders — so -1 shadows it cleanly.
		 * The brand-mark slot is left untouched so the official fish logo stays.
		 * @param ctx - Client root context.
		 */
		function apply(ctx) {
			ctx.effect(installStyles, "dsh-rainy-brand: section styles");
			ctx.effect(() => {
				try {
					return ctx.locale.register(LOCALE_NS, { zh, en });
				} catch {
					// Copy is owned by this plugin alone; a rejected registration would
					// mean the namespace is already taken, so keep the page readable
					// with the raw keys rather than failing the whole plugin.
					return () => {};
				}
			}, "dsh-rainy-brand: dictionaries");
			const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS });
			const read = () => brandOf(scope.getSnapshot());
			ctx.effect(() => {
				const hero = mountHeroBrand(read);
				// A settings change mutates no hero DOM of its own, so the observer has
				// nothing to react to: kick it explicitly for a live preview.
				const off = scope.subscribe(hero.kick);
				return () => {
					off();
					hero.dispose();
				};
			}, "dsh-rainy-brand: hero brand sync");
			ctx.effect(() => {
				const userCss = mountUserCss(read);
				// Every settings change recompiles the rule list into the tag; the
				// text diff inside `apply` keeps identical snapshots from churning
				// the stylesheet.
				const off = scope.subscribe(userCss.apply);
				return () => {
					off();
					userCss.dispose();
				};
			}, "dsh-rainy-brand: user css injection");
			/**
			 * Render the sidebar wordmark as the configured text. An empty value
			 * deliberately renders nothing: the slot then shows no name at all.
			 * @returns the text element, or null when the name is hidden.
			 */
			function BrandName() {
				const snapshot = (0, react.useSyncExternalStore)(
					(listener) => scope.subscribe(listener),
					() => scope.getSnapshot(),
				);
				const name = brandOf(snapshot).sidebarName;
				if (name === "") return null;
				return (0, react.createElement)("span", { style: { whiteSpace: "nowrap" } }, name);
			}
			/**
			 * Bind the settings page to this plugin's scope and copy.
			 * @param props - owner props of a settings section entry.
			 * @returns the section element.
			 */
			function BrandSection(props) {
				return (0, react.createElement)(RainyBrandSection, { t: props.t, scope });
			}
			ctx.slots.inject("sidebar.brand.name", () => ctx.slots.register(
				{ name: "sidebar.brand.name", priority: -1 },
				BrandName,
			));
			ctx.slots.inject("settings.section", () => {
				try {
					return ctx.slots.register({
						name: "settings.section",
						id: "rainy-brand",
						order: 160,
						label: () => ctx.locale.bind(LOCALE_NS)("title"),
						locale: LOCALE_NS,
					}, BrandSection);
				} catch {
					// The settings shell is optional; the brand surfaces above still work.
					return () => {};
				}
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
