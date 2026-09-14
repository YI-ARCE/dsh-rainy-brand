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
		};
		/** Editable fields, in the order the settings page renders them. */
		const FIELDS = ["sidebarName", "heroHeadline", "showPreviewBadge", "previewBadgeText"];
		/**
		 * Narrow one raw settings section into the four brand values.
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
		 * Render the Brand settings page: the four brand values of the
		 * `dsh-rainy-brand` namespace, each with its own reset.
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
			const clearAll = () => {
				if (timerRef.current !== 0) {
					clearTimeout(timerRef.current);
					timerRef.current = 0;
				}
				writtenRef.current = {};
				Promise.all(FIELDS.map((field) => scope.unset(field))).then(() => setError(null), report);
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
		 * blank-session hero in sync with it, and contribute the Brand settings
		 * page that owns all four values.
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
