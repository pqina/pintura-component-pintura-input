/*!
* Pintura Input v9.0.1 
* (c) 2018-2023 PQINA Inc. - All Rights Reserved
* License: https://pqina.nl/pintura/license/
*/
/* eslint-disable */
const C = (e, s, n = []) => {
  const t = document.createElement(e), i = Object.getOwnPropertyDescriptors(t.__proto__);
  for (const r in s)
    r === "style" ? t.style.cssText = s[r] : i[r] && i[r].set || /textContent|innerHTML/.test(r) || typeof s[r] == "function" ? t[r] = s[r] : t.setAttribute(r, s[r]);
  return n.forEach((r) => t.appendChild(r)), t;
}, M = (e) => typeof e == "string";
let b = null;
const H = () => (b === null && (b = typeof window < "u" && typeof window.document < "u"), b), N = (e) => e.charAt(0).toLowerCase() + e.slice(1), q = (e) => e.charAt(0).toUpperCase() + e.slice(1), U = (e) => N(e.split("-").map(q).join("")), B = (e) => typeof e == "object", w = (e, s = {}, n = "", t = "") => Object.keys(s).filter((i) => !B(s[i])).reduce((i, r) => i.replace(new RegExp(n + r + t), s[r]), e), V = (e) => document.createElement(e).constructor !== HTMLElement, W = (e) => e instanceof Blob, G = (e) => /^image/.test(e.type), K = async (e) => new Promise((s) => {
  if (e.kind === "file")
    return s(e.getAsFile());
  e.getAsString(s);
}), $ = (e) => new Promise((s, n) => {
  const { items: t } = e.dataTransfer;
  if (!t)
    return s([]);
  Promise.all(Array.from(t).map(K)).then((i) => {
    s(
      i.filter(
        (r) => W(r) && G(r) || /^http/.test(r)
      )
    );
  }).catch(n);
}), J = (e, s = {}) => {
  const n = (i) => {
    i.preventDefault();
  }, t = async (i) => {
    i.preventDefault(), i.stopPropagation();
    try {
      const r = await $(i);
      e.dispatchEvent(
        new CustomEvent("dropfiles", {
          detail: {
            event: i,
            resources: r
          },
          ...s
        })
      );
    } catch {
    }
  };
  return e.addEventListener("drop", t), e.addEventListener("dragover", n), {
    destroy() {
      e.removeEventListener("drop", t), e.removeEventListener("dragover", n);
    }
  };
}, R = "pintura-input", Y = "PinturaInput", z = `<output data-process style="display:flex;align-items:center;pointer-events:none;">
    <img src="{url}" alt="" style="object-fit:cover;width:auto;height:1.5em;margin-right:.5em;"/>
    <span>{{success}}</span>
    <button data-remove style="pointer-events:all;margin-left:.5em;" aria-label="Reset">{{reset}}</button>
</output>`, Q = `<div data-load style="display:flex;align-items:center;pointer-events:none;">
    <img src="{{url}}" alt="" style="object-fit:cover;width:auto;height:1.5em;margin-right:.5em;"/>
    <button data-remove style="pointer-events:all;margin-left:.5em;" aria-label="Reset">{{reset}}</button>
</output>`, X = ["accept", "capture"], Z = (e, s) => new Promise((n, t) => {
  const { store: i, editor: r, eventTarget: f, imageState: m } = s, { openDefaultEditor: c, dispatchEditorEvents: o } = window.pintura, a = {};
  r.imageReader && (a.imageReader = {
    ...r.imageReader
  }), (r.imageWriter || i) && (a.imageWriter = {
    store: (M(i), i),
    ...r.imageWriter
  });
  const l = c({
    // set reader and writer props
    ...a,
    // can overwrite anything with global props, except src property, will filter out properties below
    ...ee(r, ["id", "name", "store", "imageWriter", "imageReader"]),
    src: e,
    // set initial image state
    imageState: m
  }), x = o(l, f);
  let S = !1;
  l.on("loadabort", () => {
    l.close(), S = !0;
  }), l.on("loaderror", t), l.on("processerror", t), l.on("close", () => {
    x.forEach((D) => D()), S ? t() : n(void 0);
  }), l.on("process", n);
}), u = (e, s) => e.getAttribute(s), ee = (e, s) => Object.keys(e).filter((n) => !s.includes(n)).reduce((n, t) => ({
  ...n,
  [t]: e[t]
}), {}), g = (e) => {
  e.value = "", /safari/i.test(navigator.userAgent) || (e.type = "", e.type = "file"), delete e._files;
}, P = (e, s) => {
  try {
    const n = new DataTransfer();
    n.items.add(s), e.files = n.files;
  } catch {
    e._files = [s];
  }
}, te = (e) => {
  if (!e || !e.matches('input[type="file"]'))
    return;
  const s = e, n = s.files[0] || (s._files || [])[0];
  if (n && /image/.test(n.type))
    return n;
}, se = (e, s = "") => U(e.replace(new RegExp("^" + s, "g"), "")), ne = (e) => {
  if (e === "true" || e === "false")
    return e === "true";
  if (!isNaN(e))
    return parseFloat(e);
  if (/[0-9]+\/[0-9]+/.test(e)) {
    const [s, n] = e.split("/").map((t) => t.trim()).map(parseFloat);
    return s / n;
  }
  if (/^\{|\[/.test(e))
    try {
      return JSON.parse(e);
    } catch {
    }
  return e;
}, re = (e) => Object.values(e).reduce((s, n) => {
  const t = se(n.name);
  return s[t] = ne(n.value), s;
}, {}), ie = (e, s, n) => {
  const t = Object.values(n).filter((r) => /^post/.test(r.name)).map((r) => [r.name.replace(/^post-/, ""), r.value]);
  return {
    url: s || "",
    dataset: (r) => [...t, [e, r.dest, r.dest.name]]
  };
}, F = (e, s) => (Array.from(e.attributes).filter(({ value: t }) => t.length && t.includes("{")).forEach(
  ({ name: t, value: i }) => e.setAttribute(t, w(i, s, "{", "}"))
), e.childNodes.forEach((t) => {
  t.nodeType === 1 && (t = F(t, s)), t.nodeType === 3 && (t.textContent = w(t.textContent, s, "{", "}"));
}), e), E = (e, s) => e && e.content.querySelector(`[data-${s}]`), j = (e) => e.querySelector("template"), _ = (e) => {
  const s = j(e), n = E(s, "empty"), t = E(s, "load"), i = E(s, "process");
  return {
    empty: n,
    load: t,
    process: i
  };
}, h = (e, s) => !!_(e)[s], oe = (e, s) => e.querySelector(`[data-${s}]`), d = (e, s, n) => {
  const t = _(e);
  if (Object.keys(t).map((r) => oe(e, r)).filter(Boolean).forEach((r) => r.remove()), !t[s])
    return !1;
  let i = t[s].cloneNode(!0);
  return n && (i = F(i, n)), e.appendChild(i), e.querySelector("[data-drop]") && J(i, { bubbles: !0 }), !0;
}, p = (e) => e.querySelector('input[type="file"]'), y = (e) => e.querySelector('input[type="hidden"]'), L = (e) => {
  const s = u(e, "src");
  if (s != null)
    return s;
}, I = (e) => e.currentState, v = (e, s) => {
  e.currentState = s;
}, k = (e) => u(e, "store"), A = (e, s, n) => {
  const t = j(e) || document.createElement("template");
  t.innerHTML = t.innerHTML + w(s, n, "{{", "}}"), t.parentNode || e.appendChild(t);
}, ae = (e, s, n) => {
  if (!s)
    return;
  const t = p(e);
  if (!t)
    return;
  const i = {
    ...window[Y],
    ...window[e.id],
    ...re(e.attributes)
  }, r = (o, a) => {
    t.hidden = !0;
    const l = y(e);
    l.value = a.responseText, d(e, "process", {
      response: a.responseText,
      filename: o.name,
      url: URL.createObjectURL(o)
    });
  }, f = (o) => {
    d(e, "process", {
      filename: o.name,
      url: URL.createObjectURL(o)
    }) && (p(e).hidden = !0);
  }, m = (o) => {
    if (!o) {
      v(globalThis, void 0), g(t);
      return;
    }
    const { dest: a, store: l } = o;
    v(e, o), l ? r(a, l) : (P(t, a), f(a));
  }, c = () => {
    g(t);
  };
  Z(s, {
    editor: i,
    eventTarget: e,
    imageState: n,
    store: i.store && ie(y(e).name, i.store, e.attributes)
  }).then(m).catch(c);
};
function T() {
  const e = k(this), s = L(this), n = {
    success: u(this, "input-store-success") || '"{filename}" uploaded successfully',
    reset: u(this, "input-button-reset") || "&times;",
    url: s
  };
  s && !h(this, "load") && A(this, Q, n), e && !h(this, "process") && A(this, z, n);
  let t = p(this), i = y(this);
  const r = t && t.name || u(this, "name") || "image";
  t || (t = C("input", { type: "file" }), X.forEach((c) => {
    const o = u(this, c);
    o !== null && t.setAttribute(c, o);
  }), this.removeAttribute("name"), this.append(t)), e ? (t.removeAttribute("name"), i || (i = C("input", { type: "hidden", name: r }), this.append(i))) : t.name = r, !s && h(this, "empty") && (d(this, "empty"), t.hidden = !0), s && h(this, "load") && (d(this, "load"), t.hidden = !0), (!t.accept || !/image/.test(t.accept)) && (t.accept = "image/*"), t.removeAttribute("multiple"), this.handleEvent = (c) => {
    const { type: o, target: a } = c;
    if (o === "change" && a === t)
      return this.edit();
    if (o === "click")
      return f(c);
    if (o === "dropfiles")
      return m(c);
  };
  const f = (c) => {
    const { target: o } = c, a = ["reset", "remove", "browse", "edit"].find(
      (l) => o.dataset[l] === ""
    );
    a && this[a]();
  }, m = (c) => {
    c.stopPropagation();
    const { detail: o } = c, a = o.resources[0];
    a && (P(t, a), this.edit());
  };
  t.addEventListener("change", this), this.addEventListener("click", this), this.addEventListener("dropfiles", this);
}
function ce() {
  this.removeEventListener("click", this), this.removeEventListener("dropfiles", this);
}
const O = H() && class extends HTMLElement {
  constructor() {
    super(...arguments), this.currentState = void 0;
  }
  connectedCallback() {
    if (this.innerHTML)
      return T.apply(this);
    let e;
    const s = new MutationObserver(() => {
      e !== null && (clearTimeout(e), T.apply(this), s.disconnect());
    });
    s.observe(this, {
      childList: !0
    }), e = setTimeout(() => {
      e = null, T.apply(this);
    }, 0);
  }
  disconnectedCallback() {
    ce.apply(this);
  }
  browse() {
    this.querySelector('input[type="file"]').click();
  }
  reset() {
    if (v(this, void 0), !L(this))
      return this.remove();
    g(p(this)), d(this, "load");
  }
  remove() {
    const e = p(this);
    g(e), v(this, void 0), k(this) && (y(this).value = ""), d(this, "empty") || (e.hidden = !1);
  }
  edit() {
    var n, t;
    const e = p(this);
    if (!e)
      return;
    const s = ((n = I(this)) == null ? void 0 : n.src) || te(e) || L(this);
    ae(this, s, (t = I(this)) == null ? void 0 : t.imageState);
  }
};
O && !V(R) && customElements.define(R, O);
