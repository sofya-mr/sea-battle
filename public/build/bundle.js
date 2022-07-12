(function (l, r) {
	if (!l || l.getElementById("livereloadscript")) return;
	r = l.createElement("script");
	r.async = 1;
	r.src =
		"//" +
		(self.location.host || "localhost").split(":")[0] +
		":35729/livereload.js?snipver=1";
	r.id = "livereloadscript";
	l.getElementsByTagName("head")[0].appendChild(r);
})(self.document);
(function () {
	"use strict";

	function noop() {}
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char },
		};
	}
	function run(fn) {
		return fn();
	}
	function blank_object() {
		return Object.create(null);
	}
	function run_all(fns) {
		fns.forEach(run);
	}
	function is_function(thing) {
		return typeof thing === "function";
	}
	function safe_not_equal(a, b) {
		return a != a
			? b == b
			: a !== b || (a && typeof a === "object") || typeof a === "function";
	}
	let src_url_equal_anchor;
	function src_url_equal(element_src, url) {
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement("a");
		}
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}
	function append(target, node) {
		target.appendChild(node);
	}
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}
	function detach(node) {
		node.parentNode.removeChild(node);
	}
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}
	function element(name) {
		return document.createElement(name);
	}
	function text(data) {
		return document.createTextNode(data);
	}
	function space() {
		return text(" ");
	}
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value)
			node.setAttribute(attribute, value);
	}
	function children(element) {
		return Array.from(element.childNodes);
	}
	function set_style(node, key, value, important) {
		if (value === null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? "important" : "");
		}
	}
	function toggle_class(element, name, toggle) {
		element.classList[toggle ? "add" : "remove"](name);
	}
	function custom_event(
		type,
		detail,
		{ bubbles = false, cancelable = false } = {}
	) {
		const e = document.createEvent("CustomEvent");
		e.initCustomEvent(type, bubbles, cancelable, detail);
		return e;
	}

	let current_component;
	function set_current_component(component) {
		current_component = component;
	}
	function get_current_component() {
		if (!current_component)
			throw new Error("Function called outside component initialization");
		return current_component;
	}
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(type, detail, { cancelable });
				callbacks.slice().forEach(fn => {
					fn.call(component, event);
				});
				return !event.defaultPrevented;
			}
			return true;
		};
	}

	const dirty_components = [];
	const binding_callbacks = [];
	const render_callbacks = [];
	const flush_callbacks = [];
	const resolved_promise = Promise.resolve();
	let update_scheduled = false;
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}
	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();
	let flushidx = 0; // Do *not* move this inside the flush() function
	function flush() {
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}
	const outroing = new Set();
	let outros;
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		}
	}
	function create_component(block) {
		block && block.c();
	}
	function mount_component(component, target, anchor, customElement) {
		const { fragment, on_mount, on_destroy, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		if (!customElement) {
			// onMount happens before the initial afterUpdate
			add_render_callback(() => {
				const new_on_destroy = on_mount.map(run).filter(is_function);
				if (on_destroy) {
					on_destroy.push(...new_on_destroy);
				} else {
					// Edge case - component was destroyed immediately,
					// most likely as a result of a binding initialising
					run_all(new_on_destroy);
				}
				component.$$.on_mount = [];
			});
		}
		after_update.forEach(add_render_callback);
	}
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		const $$ = (component.$$ = {
			fragment: null,
			ctx: null,
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(
				options.context || (parent_component ? parent_component.$$.context : [])
			),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root,
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				const nodes = children(options.target);
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(
				component,
				options.target,
				options.anchor,
				options.customElement
			);
			flush();
		}
		set_current_component(parent_component);
	}
	/**
	 * Base class for Svelte components. Used when dev=false.
	 */
	class SvelteComponent {
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}
		$on(type, callback) {
			const callbacks =
				this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}
		$set($$props) {
			if (this.$$set && !is_empty($$props)) {
				this.$$.skip_bound = true;
				this.$$set($$props);
				this.$$.skip_bound = false;
			}
		}
	}

	function dispatch_dev(type, detail) {
		document.dispatchEvent(
			custom_event(type, Object.assign({ version: "3.48.0" }, detail), {
				bubbles: true,
			})
		);
	}
	function append_dev(target, node) {
		dispatch_dev("SvelteDOMInsert", { target, node });
		append(target, node);
	}
	function insert_dev(target, node, anchor) {
		dispatch_dev("SvelteDOMInsert", { target, node, anchor });
		insert(target, node, anchor);
	}
	function detach_dev(node) {
		dispatch_dev("SvelteDOMRemove", { node });
		detach(node);
	}
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation
	) {
		const modifiers =
			options === true
				? ["capture"]
				: options
				? Array.from(Object.keys(options))
				: [];
		if (has_prevent_default) modifiers.push("preventDefault");
		if (has_stop_propagation) modifiers.push("stopPropagation");
		dispatch_dev("SvelteDOMAddEventListener", {
			node,
			event,
			handler,
			modifiers,
		});
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev("SvelteDOMRemoveEventListener", {
				node,
				event,
				handler,
				modifiers,
			});
			dispose();
		};
	}
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null)
			dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
		else dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
	}
	function prop_dev(node, property, value) {
		node[property] = value;
		dispatch_dev("SvelteDOMSetProperty", { node, property, value });
	}
	function set_data_dev(text, data) {
		data = "" + data;
		if (text.wholeText === data) return;
		dispatch_dev("SvelteDOMSetData", { node: text, data });
		text.data = data;
	}
	function validate_each_argument(arg) {
		if (
			typeof arg !== "string" &&
			!(arg && typeof arg === "object" && "length" in arg)
		) {
			let msg = "{#each} only iterates over array-like objects.";
			if (typeof Symbol === "function" && arg && Symbol.iterator in arg) {
				msg += " You can use a spread to convert this iterable into an array.";
			}
			throw new Error(msg);
		}
	}
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}
	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 */
	class SvelteComponentDev extends SvelteComponent {
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn("Component was already destroyed"); // eslint-disable-line no-console
			};
		}
		$capture_state() {}
		$inject_state() {}
	}

	/* src/Field.svelte generated by Svelte v3.48.0 */
	const file$2 = "src/Field.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[5] = list[i];
		child_ctx[7] = i;
		return child_ctx;
	}

	// (15:1) {#each cells as cell, i}
	function create_each_block(ctx) {
		let button;
		let mounted;
		let dispose;

		function click_handler() {
			return /*click_handler*/ ctx[3](/*i*/ ctx[7]);
		}

		const block = {
			c: function create() {
				button = element("button");
				attr_dev(button, "class", "svelte-1cecogh");
				toggle_class(button, "checked", /*cell*/ ctx[5].checked);
				toggle_class(
					button,
					"damaged",
					/*cell*/ ctx[5].ship && /*cell*/ ctx[5].checked
				);
				toggle_class(
					button,
					"sunk",
					/*cell*/ ctx[5].ship && /*cell*/ ctx[5].ship.isSunk
				);
				toggle_class(
					button,
					"sunkByMagic",
					/*cell*/ ctx[5].ship && /*cell*/ ctx[5].ship.isSunk == 2
				);
				add_location(button, file$2, 15, 2, 293);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);

				if (!mounted) {
					dispose = listen_dev(
						button,
						"click",
						click_handler,
						false,
						false,
						false
					);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (dirty & /*cells*/ 2) {
					toggle_class(button, "checked", /*cell*/ ctx[5].checked);
				}

				if (dirty & /*cells*/ 2) {
					toggle_class(
						button,
						"damaged",
						/*cell*/ ctx[5].ship && /*cell*/ ctx[5].checked
					);
				}

				if (dirty & /*cells*/ 2) {
					toggle_class(
						button,
						"sunk",
						/*cell*/ ctx[5].ship && /*cell*/ ctx[5].ship.isSunk
					);
				}

				if (dirty & /*cells*/ 2) {
					toggle_class(
						button,
						"sunkByMagic",
						/*cell*/ ctx[5].ship && /*cell*/ ctx[5].ship.isSunk == 2
					);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(button);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(15:1) {#each cells as cell, i}",
			ctx,
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let div;
		let each_value = /*cells*/ ctx[1];
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(div, "class", "container svelte-1cecogh");
				set_style(div, "width", /*fieldSize*/ ctx[0] * 80 + "px");
				add_location(div, file$2, 13, 0, 208);
			},
			l: function claim(nodes) {
				throw new Error(
					"options.hydrate only works if the component was compiled with the `hydratable: true` option"
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*cells, sendEvent*/ 6) {
					each_value = /*cells*/ ctx[1];
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*fieldSize*/ 1) {
					set_style(div, "width", /*fieldSize*/ ctx[0] * 80 + "px");
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_each(each_blocks, detaching);
			},
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx,
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots("Field", slots, []);
		const dispatch = createEventDispatcher();
		let { fieldSize } = $$props;
		let { cells } = $$props;

		function sendEvent(i) {
			dispatch("fire", i);
		}

		const writable_props = ["fieldSize", "cells"];

		Object.keys($$props).forEach(key => {
			if (
				!~writable_props.indexOf(key) &&
				key.slice(0, 2) !== "$$" &&
				key !== "slot"
			)
				console.warn(`<Field> was created with unknown prop '${key}'`);
		});

		const click_handler = i => sendEvent(i);

		$$self.$$set = $$props => {
			if ("fieldSize" in $$props)
				$$invalidate(0, (fieldSize = $$props.fieldSize));
			if ("cells" in $$props) $$invalidate(1, (cells = $$props.cells));
		};

		$$self.$capture_state = () => ({
			createEventDispatcher,
			dispatch,
			fieldSize,
			cells,
			sendEvent,
		});

		$$self.$inject_state = $$props => {
			if ("fieldSize" in $$props)
				$$invalidate(0, (fieldSize = $$props.fieldSize));
			if ("cells" in $$props) $$invalidate(1, (cells = $$props.cells));
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [fieldSize, cells, sendEvent, click_handler];
	}

	class Field extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, {
				fieldSize: 0,
				cells: 1,
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Field",
				options,
				id: create_fragment$2.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*fieldSize*/ ctx[0] === undefined && !("fieldSize" in props)) {
				console.warn("<Field> was created without expected prop 'fieldSize'");
			}

			if (/*cells*/ ctx[1] === undefined && !("cells" in props)) {
				console.warn("<Field> was created without expected prop 'cells'");
			}
		}

		get fieldSize() {
			throw new Error(
				"<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set fieldSize(value) {
			throw new Error(
				"<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get cells() {
			throw new Error(
				"<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set cells(value) {
			throw new Error(
				"<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}
	}

	/* src/StatsMagic.svelte generated by Svelte v3.48.0 */
	const file$1 = "src/StatsMagic.svelte";

	// (45:0) {:else}
	function create_else_block(ctx) {
		let div;
		let h2;
		let t1;
		let button;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div = element("div");
				h2 = element("h2");
				h2.textContent = "You are the winner!";
				t1 = space();
				button = element("button");
				button.textContent = "RESTART GAME";
				attr_dev(h2, "class", "svelte-vk0mpm");
				add_location(h2, file$1, 47, 1, 1069);
				attr_dev(button, "class", "resettingButton svelte-vk0mpm");
				add_location(button, file$1, 48, 1, 1099);
				attr_dev(div, "class", "scaleContainer svelte-vk0mpm");
				add_location(div, file$1, 46, 0, 1041);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, h2);
				append_dev(div, t1);
				append_dev(div, button);

				if (!mounted) {
					dispose = listen_dev(
						button,
						"click",
						/*restart*/ ctx[7],
						false,
						false,
						false
					);
					mounted = true;
				}
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(45:0) {:else}",
			ctx,
		});

		return block;
	}

	// (35:0) {#if sunkShips!==ships.length}
	function create_if_block(ctx) {
		let div3;
		let div0;
		let t1;
		let div2;
		let button;
		let t2;
		let button_disabled_value;
		let t3;
		let div1;
		let div1_class_value;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div3 = element("div");
				div0 = element("div");
				div0.textContent =
					"The button will be activated when you gain enough power:";
				t1 = space();
				div2 = element("div");
				button = element("button");
				t2 = text("Let magic unicorn help");
				t3 = space();
				div1 = element("div");
				add_location(div0, file$1, 36, 2, 733);
				attr_dev(button, "class", "magicButton svelte-vk0mpm");
				button.disabled = button_disabled_value = /*powerLevel*/ ctx[4] < 5;
				add_location(button, file$1, 39, 3, 836);
				attr_dev(
					div1,
					"class",
					(div1_class_value =
						"scale closer" +
						/*powerLevel*/ (ctx[4] <= 5 ? /*powerLevel*/ ctx[4] : 5) +
						" svelte-vk0mpm")
				);
				add_location(div1, file$1, 41, 3, 955);
				attr_dev(div2, "class", "scaleContainer svelte-vk0mpm");
				add_location(div2, file$1, 38, 2, 804);
				add_location(div3, file$1, 35, 1, 725);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div3, anchor);
				append_dev(div3, div0);
				append_dev(div3, t1);
				append_dev(div3, div2);
				append_dev(div2, button);
				append_dev(button, t2);
				append_dev(div2, t3);
				append_dev(div2, div1);

				if (!mounted) {
					dispose = listen_dev(
						button,
						"click",
						/*activateUnicorn*/ ctx[6],
						false,
						false,
						false
					);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (
					dirty & /*powerLevel*/ 16 &&
					button_disabled_value !==
						(button_disabled_value = /*powerLevel*/ ctx[4] < 5)
				) {
					prop_dev(button, "disabled", button_disabled_value);
				}

				if (
					dirty & /*powerLevel*/ 16 &&
					div1_class_value !==
						(div1_class_value =
							"scale closer" +
							/*powerLevel*/ (ctx[4] <= 5 ? /*powerLevel*/ ctx[4] : 5) +
							" svelte-vk0mpm")
				) {
					attr_dev(div1, "class", div1_class_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div3);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(35:0) {#if sunkShips!==ships.length}",
			ctx,
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let div2;
		let div1;
		let div0;
		let t0;
		let t1_value = /*ships*/ ctx[5].length + "";
		let t1;
		let t2;
		let br0;
		let t3;
		let t4;
		let t5;
		let br1;
		let t6;
		let t7;
		let t8;
		let br2;
		let t9;
		let t10;
		let t11;
		let br3;
		let t12;
		let t13;
		let t14;
		let br4;
		let t15;

		function select_block_type(ctx, dirty) {
			if (/*sunkShips*/ ctx[0] !== /*ships*/ ctx[5].length)
				return create_if_block;
			return create_else_block;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				div2 = element("div");
				div1 = element("div");
				div0 = element("div");
				t0 = text("Number of ships: ");
				t1 = text(t1_value);
				t2 = space();
				br0 = element("br");
				t3 = text("\n\t\t\tAttempts: ");
				t4 = text(/*attempts*/ ctx[3]);
				t5 = space();
				br1 = element("br");
				t6 = text("\n\t\t\tCells damage: ");
				t7 = text(/*damagedCells*/ ctx[1]);
				t8 = space();
				br2 = element("br");
				t9 = text("\n\t\t\tSunk ships: ");
				t10 = text(/*sunkShips*/ ctx[0]);
				t11 = space();
				br3 = element("br");
				t12 = text("\n\t\t\tShips left: ");
				t13 = text(/*shipsLeft*/ ctx[2]);
				t14 = space();
				br4 = element("br");
				t15 = space();
				if_block.c();
				add_location(br0, file$1, 26, 35, 530);
				add_location(br1, file$1, 27, 24, 561);
				add_location(br2, file$1, 28, 32, 600);
				add_location(br3, file$1, 29, 27, 634);
				add_location(br4, file$1, 30, 27, 668);
				attr_dev(div0, "class", "stats svelte-vk0mpm");
				add_location(div0, file$1, 24, 2, 438);
				attr_dev(div1, "class", "statsContainer svelte-vk0mpm");
				add_location(div1, file$1, 23, 1, 407);
				attr_dev(div2, "class", "bottom svelte-vk0mpm");
				add_location(div2, file$1, 22, 0, 385);
			},
			l: function claim(nodes) {
				throw new Error(
					"options.hydrate only works if the component was compiled with the `hydratable: true` option"
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div1);
				append_dev(div1, div0);
				append_dev(div0, t0);
				append_dev(div0, t1);
				append_dev(div0, t2);
				append_dev(div0, br0);
				append_dev(div0, t3);
				append_dev(div0, t4);
				append_dev(div0, t5);
				append_dev(div0, br1);
				append_dev(div0, t6);
				append_dev(div0, t7);
				append_dev(div0, t8);
				append_dev(div0, br2);
				append_dev(div0, t9);
				append_dev(div0, t10);
				append_dev(div0, t11);
				append_dev(div0, br3);
				append_dev(div0, t12);
				append_dev(div0, t13);
				append_dev(div0, t14);
				append_dev(div0, br4);
				append_dev(div2, t15);
				if_block.m(div2, null);
			},
			p: function update(ctx, [dirty]) {
				if (
					dirty & /*ships*/ 32 &&
					t1_value !== (t1_value = /*ships*/ ctx[5].length + "")
				)
					set_data_dev(t1, t1_value);
				if (dirty & /*attempts*/ 8) set_data_dev(t4, /*attempts*/ ctx[3]);
				if (dirty & /*damagedCells*/ 2)
					set_data_dev(t7, /*damagedCells*/ ctx[1]);
				if (dirty & /*sunkShips*/ 1) set_data_dev(t10, /*sunkShips*/ ctx[0]);
				if (dirty & /*shipsLeft*/ 4) set_data_dev(t13, /*shipsLeft*/ ctx[2]);

				if (
					current_block_type ===
						(current_block_type = select_block_type(ctx)) &&
					if_block
				) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div2, null);
					}
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div2);
				if_block.d();
			},
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx,
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots("StatsMagic", slots, []);
		const dispatch = createEventDispatcher();
		let { sunkShips = 0 } = $$props;
		let { damagedCells = 0 } = $$props;
		let { shipsLeft = 0 } = $$props;
		let { attempts = 0 } = $$props;
		let { powerLevel = 0 } = $$props;
		let { ships } = $$props;

		function activateUnicorn() {
			dispatch("activateUnicorn");
		}

		function restart() {
			dispatch("restart");
		}

		const writable_props = [
			"sunkShips",
			"damagedCells",
			"shipsLeft",
			"attempts",
			"powerLevel",
			"ships",
		];

		Object.keys($$props).forEach(key => {
			if (
				!~writable_props.indexOf(key) &&
				key.slice(0, 2) !== "$$" &&
				key !== "slot"
			)
				console.warn(`<StatsMagic> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ("sunkShips" in $$props)
				$$invalidate(0, (sunkShips = $$props.sunkShips));
			if ("damagedCells" in $$props)
				$$invalidate(1, (damagedCells = $$props.damagedCells));
			if ("shipsLeft" in $$props)
				$$invalidate(2, (shipsLeft = $$props.shipsLeft));
			if ("attempts" in $$props) $$invalidate(3, (attempts = $$props.attempts));
			if ("powerLevel" in $$props)
				$$invalidate(4, (powerLevel = $$props.powerLevel));
			if ("ships" in $$props) $$invalidate(5, (ships = $$props.ships));
		};

		$$self.$capture_state = () => ({
			createEventDispatcher,
			dispatch,
			sunkShips,
			damagedCells,
			shipsLeft,
			attempts,
			powerLevel,
			ships,
			activateUnicorn,
			restart,
		});

		$$self.$inject_state = $$props => {
			if ("sunkShips" in $$props)
				$$invalidate(0, (sunkShips = $$props.sunkShips));
			if ("damagedCells" in $$props)
				$$invalidate(1, (damagedCells = $$props.damagedCells));
			if ("shipsLeft" in $$props)
				$$invalidate(2, (shipsLeft = $$props.shipsLeft));
			if ("attempts" in $$props) $$invalidate(3, (attempts = $$props.attempts));
			if ("powerLevel" in $$props)
				$$invalidate(4, (powerLevel = $$props.powerLevel));
			if ("ships" in $$props) $$invalidate(5, (ships = $$props.ships));
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			sunkShips,
			damagedCells,
			shipsLeft,
			attempts,
			powerLevel,
			ships,
			activateUnicorn,
			restart,
		];
	}

	class StatsMagic extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$1, create_fragment$1, safe_not_equal, {
				sunkShips: 0,
				damagedCells: 1,
				shipsLeft: 2,
				attempts: 3,
				powerLevel: 4,
				ships: 5,
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "StatsMagic",
				options,
				id: create_fragment$1.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*ships*/ ctx[5] === undefined && !("ships" in props)) {
				console.warn("<StatsMagic> was created without expected prop 'ships'");
			}
		}

		get sunkShips() {
			throw new Error(
				"<StatsMagic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set sunkShips(value) {
			throw new Error(
				"<StatsMagic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get damagedCells() {
			throw new Error(
				"<StatsMagic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set damagedCells(value) {
			throw new Error(
				"<StatsMagic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get shipsLeft() {
			throw new Error(
				"<StatsMagic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set shipsLeft(value) {
			throw new Error(
				"<StatsMagic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get attempts() {
			throw new Error(
				"<StatsMagic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set attempts(value) {
			throw new Error(
				"<StatsMagic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get powerLevel() {
			throw new Error(
				"<StatsMagic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set powerLevel(value) {
			throw new Error(
				"<StatsMagic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		get ships() {
			throw new Error(
				"<StatsMagic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}

		set ships(value) {
			throw new Error(
				"<StatsMagic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
			);
		}
	}

	function newShips() {
		return [
			{ shipLength: 3, isSunk: false, cellDamage: 0, coords: [] },
			{ shipLength: 2, isSunk: false, cellDamage: 0, coords: [] },
			{ shipLength: 2, isSunk: false, cellDamage: 0, coords: [] },
			{ shipLength: 1, isSunk: false, cellDamage: 0, coords: [] },
			{ shipLength: 1, isSunk: false, cellDamage: 0, coords: [] },
		];
	}

	const directions = [
		{ x: 1, y: 0 }, // right
		{ x: 0, y: 1 }, // bottom
	];

	/* src/App.svelte generated by Svelte v3.48.0 */
	const file = "src/App.svelte";

	function create_fragment(ctx) {
		let div;
		let img;
		let img_src_value;
		let t0;
		let p;
		let t1;
		let t2;
		let field;
		let t3;
		let statsmagic;
		let current;

		field = new Field({
			props: { fieldSize, cells: /*cells*/ ctx[8] },
			$$inline: true,
		});

		field.$on("fire", /*fire_handler*/ ctx[12]);

		statsmagic = new StatsMagic({
			props: {
				sunkShips: /*sunkShips*/ ctx[0],
				damagedCells: /*damagedCells*/ ctx[2],
				shipsLeft: /*shipsLeft*/ ctx[3],
				attempts: /*attempts*/ ctx[4],
				powerLevel: /*powerLevel*/ ctx[7],
				ships: /*ships*/ ctx[1],
			},
			$$inline: true,
		});

		statsmagic.$on("activateUnicorn", /*magic*/ ctx[10]);
		statsmagic.$on("restart", /*restart*/ ctx[11]);

		const block = {
			c: function create() {
				div = element("div");
				img = element("img");
				t0 = space();
				p = element("p");
				t1 = text(/*text*/ ctx[5]);
				t2 = space();
				create_component(field.$$.fragment);
				t3 = space();
				create_component(statsmagic.$$.fragment);
				if (!src_url_equal(img.src, (img_src_value = "./unicorn.png")))
					attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", "Unicorn Gif");
				attr_dev(img, "class", "image svelte-b17uld");
				toggle_class(img, "fly", !(/*unicornState*/ ctx[6]));
				add_location(img, file, 184, 1, 4424);
				add_location(div, file, 183, 0, 4417);
				attr_dev(p, "class", "svelte-b17uld");
				add_location(p, file, 192, 0, 4527);
			},
			l: function claim(nodes) {
				throw new Error(
					"options.hydrate only works if the component was compiled with the `hydratable: true` option"
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, img);
				insert_dev(target, t0, anchor);
				insert_dev(target, p, anchor);
				append_dev(p, t1);
				insert_dev(target, t2, anchor);
				mount_component(field, target, anchor);
				insert_dev(target, t3, anchor);
				mount_component(statsmagic, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*unicornState*/ 64) {
					toggle_class(img, "fly", !(/*unicornState*/ ctx[6]));
				}

				if (!current || dirty & /*text*/ 32) set_data_dev(t1, /*text*/ ctx[5]);
				const field_changes = {};
				if (dirty & /*cells*/ 256) field_changes.cells = /*cells*/ ctx[8];
				field.$set(field_changes);
				const statsmagic_changes = {};
				if (dirty & /*sunkShips*/ 1)
					statsmagic_changes.sunkShips = /*sunkShips*/ ctx[0];
				if (dirty & /*damagedCells*/ 4)
					statsmagic_changes.damagedCells = /*damagedCells*/ ctx[2];
				if (dirty & /*shipsLeft*/ 8)
					statsmagic_changes.shipsLeft = /*shipsLeft*/ ctx[3];
				if (dirty & /*attempts*/ 16)
					statsmagic_changes.attempts = /*attempts*/ ctx[4];
				if (dirty & /*powerLevel*/ 128)
					statsmagic_changes.powerLevel = /*powerLevel*/ ctx[7];
				if (dirty & /*ships*/ 2) statsmagic_changes.ships = /*ships*/ ctx[1];
				statsmagic.$set(statsmagic_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(field.$$.fragment, local);
				transition_in(statsmagic.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(field.$$.fragment, local);
				transition_out(statsmagic.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (detaching) detach_dev(t0);
				if (detaching) detach_dev(p);
				if (detaching) detach_dev(t2);
				destroy_component(field, detaching);
				if (detaching) detach_dev(t3);
				destroy_component(statsmagic, detaching);
			},
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx,
		});

		return block;
	}

	const fieldSize = 6;

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots("App", slots, []);
		let sunkShips = 0;
		let damagedCells = 0;
		let shipsLeft = 0;
		let attempts = 0;
		let text = "The Empire set it's ships in your sea. Find and sink them!";
		let textOption = "";
		let unicornState = false;
		let powerLevel = 0;
		let cells = [];
		let ships;

		// getting ships set//
		let occupied;

		let watchDog = 0;

		function getCoords(i, obj) {
			watchDog++;
			if (watchDog > 1000) alert("bad things happen");
			let dir = directions[Math.floor(Math.random() * 2)];

			if (
				obj.x * dir.x > fieldSize - ships[i].shipLength ||
				obj.y * dir.y > fieldSize - ships[i].shipLength
			) {
				return false; // если корабль не помещается по ширине или высоте, то прервать выполнение функции
			}

			for (let j = 0; j < ships[i].shipLength; j++) {
				//повторять столько раз, сколько клеток в корабле
				const ind = obj.x + obj.y * fieldSize; // рассчит клетка по координатам, кот пришли как аргумент

				$$invalidate(1, (ships[i].coords[j] = ind), ships); // в массив шипс, в соответствующий корабль (объект)

				// в проперти коордс кладется значение соответствующей клетки (номер клетки, что соответствует
				//индексу в массиве целс)
				obj = { x: obj.x + dir.x, y: obj.y + dir.y }; // корабль удлиняется по вертикали или горизонтали

				if (occupied.indexOf(ind) !== -1) {
					// если полученная клетка (инд) присутствует в массиве окупаед
					return false; // прервать выполнение функции
				}
			}

			ships[i].coords.forEach(ind =>
				$$invalidate(8, (cells[ind].ship = ships[i]), cells)
			); //добавляем определенным клеткам (инд) проперти шипс, присваиваем туда

			//аналогичный объект из массива шипс (то есть целый корабль)
			return true;
		}

		const validPos = function (point) {
			// {x, y}
			const x = point.x;

			const y = point.y;

			if (x > fieldSize || x < 0 || y > fieldSize || y < 0) {
				return false;
			}

			return true;
		};

		restart();

		function placeShips() {
			for (let i = 0; i < ships.length; i++) {
				// for each ship
				let obj = {
					x: Math.floor(Math.random() * fieldSize),
					y: Math.floor(Math.random() * fieldSize),
				};

				if (!getCoords(i, obj)) {
					i--;
					continue;
				}

				occupied.push(...ships[i].coords);

				ships[i].coords.forEach(i => {
					let y = Math.floor(i / fieldSize);
					let x = i % fieldSize;

					let neighbors = [
						{ x: x + 1, y },
						{ x: x - 1, y },
						{ x, y: y + 1 },
						{ x, y: y - 1 },
						{ x: x + 1, y: y - 1 },
						{ x: x + 1, y: y + 1 },
						{ x: x - 1, y: y + 1 },
						{ x: x - 1, y: y - 1 },
					];

					let validNeigbors = neighbors
						.filter(validPos)
						.map(o => o.x + o.y * fieldSize);
					occupied.push(...validNeigbors);
				});
			}
		}

		// game actions
		function checkCell(i) {
			$$invalidate(4, (attempts += 1));
			$$invalidate(5, (text = "Missed..."));

			if (cells[i].ship) {
				if (!cells[i].checked) {
					$$invalidate(8, (cells[i].ship.cellDamage += 1), cells);
					$$invalidate(5, (text = "Hit!"));
					$$invalidate(2, (damagedCells += 1));
					$$invalidate(7, (powerLevel += 1));

					if (cells[i].ship.cellDamage === cells[i].ship.shipLength) {
						$$invalidate(8, (cells[i].ship.isSunk = true), cells);
						$$invalidate(0, (sunkShips += 1));
						$$invalidate(3, (shipsLeft = ships.length - sunkShips));
						$$invalidate(5, (text = "You sunk a ship!"));
					}
				}

				$$invalidate(8, cells);
			}

			$$invalidate(8, (cells[i].checked = true), cells);
		}

		//magic
		function magic(i) {
			$$invalidate(6, (unicornState = !unicornState));

			setTimeout(() => {
				$$invalidate(7, (powerLevel = 0));
			}, 1000);

			setTimeout(() => {
				for (let ship of ships) {
					// ships.forEach((ship) => {
					if (ship.isSunk == false) {
						ship.isSunk = 2;
						$$invalidate(0, (sunkShips += 1));
						textOption = shipsLeft == 1 ? "There's" : "There are";
						$$invalidate(
							5,
							(text = `Magic unicorn sunk a ship! ${textOption} only ${shipsLeft} left.`)
						);
						$$invalidate(3, (shipsLeft = ships.length - sunkShips));
						ship.damagedCells = ship.shipLength;
						$$invalidate(2, (damagedCells += ship.shipLength));

						for (let i = 0; i < ship.coords.length; i++) {
							$$invalidate(8, (cells[ship.coords[i]].checked = true), cells);
						}

						break;
					}
				}
			}, 2000);
		}

		function restart() {
			$$invalidate(0, (sunkShips = 0));
			$$invalidate(2, (damagedCells = 0));
			$$invalidate(4, (attempts = 0));
			$$invalidate(
				5,
				(text = "The Empire set it's ships in your sea. Find and sink them!")
			);
			$$invalidate(6, (unicornState = false));
			$$invalidate(7, (powerLevel = 0));
			$$invalidate(8, (cells = []));

			for (let counter = 0; counter < fieldSize * fieldSize; counter++) {
				cells.push({ ship: false, checked: false });
			}

			occupied = [];
			$$invalidate(1, (ships = newShips()));
			placeShips();
		}

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (
				!~writable_props.indexOf(key) &&
				key.slice(0, 2) !== "$$" &&
				key !== "slot"
			)
				console.warn(`<App> was created with unknown prop '${key}'`);
		});

		const fire_handler = ev => checkCell(ev.detail);

		$$self.$capture_state = () => ({
			Field,
			StatsMagic,
			newShips,
			directions,
			sunkShips,
			damagedCells,
			shipsLeft,
			attempts,
			text,
			textOption,
			unicornState,
			powerLevel,
			fieldSize,
			cells,
			ships,
			occupied,
			watchDog,
			getCoords,
			validPos,
			placeShips,
			checkCell,
			magic,
			restart,
		});

		$$self.$inject_state = $$props => {
			if ("sunkShips" in $$props)
				$$invalidate(0, (sunkShips = $$props.sunkShips));
			if ("damagedCells" in $$props)
				$$invalidate(2, (damagedCells = $$props.damagedCells));
			if ("shipsLeft" in $$props)
				$$invalidate(3, (shipsLeft = $$props.shipsLeft));
			if ("attempts" in $$props) $$invalidate(4, (attempts = $$props.attempts));
			if ("text" in $$props) $$invalidate(5, (text = $$props.text));
			if ("textOption" in $$props) textOption = $$props.textOption;
			if ("unicornState" in $$props)
				$$invalidate(6, (unicornState = $$props.unicornState));
			if ("powerLevel" in $$props)
				$$invalidate(7, (powerLevel = $$props.powerLevel));
			if ("cells" in $$props) $$invalidate(8, (cells = $$props.cells));
			if ("ships" in $$props) $$invalidate(1, (ships = $$props.ships));
			if ("occupied" in $$props) occupied = $$props.occupied;
			if ("watchDog" in $$props) watchDog = $$props.watchDog;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*sunkShips, ships*/ 3) {
				if (sunkShips == ships.length) {
					$$invalidate(
						5,
						(text = "Congratulations! You won. All the ship's are sunk.")
					);
				}
			}
		};

		return [
			sunkShips,
			ships,
			damagedCells,
			shipsLeft,
			attempts,
			text,
			unicornState,
			powerLevel,
			cells,
			checkCell,
			magic,
			restart,
			fire_handler,
		];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name,
			});
		}
	}

	new App({
		target: document.querySelector("#here"),
		props: {},
	});
})();
//# sourceMappingURL=bundle.js.map
