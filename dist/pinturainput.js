/*!
* Pintura Input v9.0.0 
* (c) 2018-2023 PQINA Inc. - All Rights Reserved
* License: https://pqina.nl/pintura/license/
*/
/* eslint-disable */
const R = (e, t, n = []) => {
  const s = document.createElement(e), i = Object.getOwnPropertyDescriptors(s.__proto__);
  for (const r in t)
    r === "style" ? s.style.cssText = t[r] : i[r] && i[r].set || /textContent|innerHTML/.test(r) || typeof t[r] == "function" ? s[r] = t[r] : s.setAttribute(r, t[r]);
  return n.forEach((r) => s.appendChild(r)), s;
}, H = (e) => typeof e == "string";
let b = null;
const N = () => (b === null && (b = typeof window < "u" && typeof window.document < "u"), b), k = (e) => e.charAt(0).toLowerCase() + e.slice(1), q = (e) => e.charAt(0).toUpperCase() + e.slice(1), U = (e) => k(e.split("-").map(q).join("")), B = (e) => typeof e == "object", w = (e, t = {}, n = "", s = "") => Object.keys(t).filter((i) => !B(t[i])).reduce((i, r) => i.replace(new RegExp(n + r + s), t[r]), e), V = (e) => document.createElement(e).constructor !== HTMLElement, W = (e) => e instanceof Blob, G = (e) => /^image/.test(e.type), K = async (e) => new Promise((t) => {
  if (e.kind === "file")
    return t(e.getAsFile());
  e.getAsString(t);
}), $ = (e) => new Promise((t, n) => {
  const { items: s } = e.dataTransfer;
  if (!s)
    return t([]);
  Promise.all(Array.from(s).map(K)).then((i) => {
    t(
      i.filter(
        (r) => W(r) && G(r) || /^http/.test(r)
      )
    );
  }).catch(n);
}), J = (e, t = {}) => {
  const n = (i) => {
    i.preventDefault();
  }, s = async (i) => {
    i.preventDefault(), i.stopPropagation();
    try {
      const r = await $(i);
      e.dispatchEvent(
        new CustomEvent("dropfiles", {
          detail: {
            event: i,
            resources: r
          },
          ...t
        })
      );
    } catch {
    }
  };
  return e.addEventListener("drop", s), e.addEventListener("dragover", n), {
    destroy() {
      e.removeEventListener("drop", s), e.removeEventListener("dragover", n);
    }
  };
}, C = "pintura-input", Y = "PinturaInput", z = `<output data-process style="display:flex;align-items:center;pointer-events:none;">
    <img src="{url}" alt="" style="object-fit:cover;width:auto;height:1.5em;margin-right:.5em;"/>
    <span>{{success}}</span>
    <button data-remove style="pointer-events:all;margin-left:.5em;" aria-label="Reset">{{reset}}</button>
</output>`, Q = `<div data-load style="display:flex;align-items:center;pointer-events:none;">
    <img src="{{url}}" alt="" style="object-fit:cover;width:auto;height:1.5em;margin-right:.5em;"/>
    <button data-remove style="pointer-events:all;margin-left:.5em;" aria-label="Reset">{{reset}}</button>
</output>`, X = ["accept", "capture"], Z = (e, t) => new Promise((n, s) => {
  const { store: i, editor: r, eventTarget: c, imageState: u } = t, { openDefaultEditor: p, dispatchEditorEvents: o } = window.pintura, l = {};
  r.imageReader && (l.imageReader = {
    ...r.imageReader
  }), (r.imageWriter || i) && (l.imageWriter = {
    store: (H(i), i),
    ...r.imageWriter
  });
  const a = p({
    // set reader and writer props
    ...l,
    // can overwrite anything with global props, except src property, will filter out properties below
    ...ee(r, ["id", "name", "store", "imageWriter", "imageReader"]),
    src: e,
    // set initial image state
    imageState: u
  }), D = o(a, c);
  let L = !1;
  a.on("loadabort", () => {
    a.close(), L = !0;
  }), a.on("loaderror", s), a.on("processerror", s), a.on("close", () => {
    D.forEach((M) => M()), L ? s() : n(void 0);
  }), a.on("process", n);
}), d = (e, t) => e.getAttribute(t), ee = (e, t) => Object.keys(e).filter((n) => !t.includes(n)).reduce((n, s) => ({
  ...n,
  [s]: e[s]
}), {}), g = (e) => {
  e.value = "", /safari/i.test(navigator.userAgent) || (e.type = "", e.type = "file"), delete e._files;
}, P = (e, t) => {
  try {
    const n = new DataTransfer();
    n.items.add(t), e.files = n.files;
  } catch {
    e._files = [t];
  }
}, te = (e) => {
  if (!e || !e.matches('input[type="file"]'))
    return;
  const t = e, n = t.files[0] || (t._files || [])[0];
  if (n && /image/.test(n.type))
    return n;
}, se = (e, t = "") => U(e.replace(new RegExp("^" + t, "g"), "")), ne = (e) => {
  if (e === "true" || e === "false")
    return e === "true";
  if (!isNaN(e))
    return parseFloat(e);
  if (/[0-9]+\/[0-9]+/.test(e)) {
    const [t, n] = e.split("/").map((s) => s.trim()).map(parseFloat);
    return t / n;
  }
  if (/^\{|\[/.test(e))
    try {
      return JSON.parse(e);
    } catch {
    }
  return e;
}, re = (e) => Object.values(e).reduce((t, n) => {
  const s = se(n.name);
  return t[s] = ne(n.value), t;
}, {}), ie = (e, t, n) => {
  const s = Object.values(n).filter((r) => /^post/.test(r.name)).map((r) => [r.name.replace(/^post-/, ""), r.value]);
  return {
    url: t || "",
    dataset: (r) => [...s, [e, r.dest, r.dest.name]]
  };
}, j = (e, t) => (Array.from(e.attributes).filter(({ value: s }) => s.length && s.includes("{")).forEach(
  ({ name: s, value: i }) => e.setAttribute(s, w(i, t, "{", "}"))
), e.childNodes.forEach((s) => {
  s.nodeType === 1 && (s = j(s, t)), s.nodeType === 3 && (s.textContent = w(s.textContent, t, "{", "}"));
}), e), E = (e, t) => e && e.content.querySelector(`[data-${t}]`), F = (e) => e.querySelector("template"), _ = (e) => {
  const t = F(e), n = E(t, "empty"), s = E(t, "load"), i = E(t, "process");
  return {
    empty: n,
    load: s,
    process: i
  };
}, h = (e, t) => !!_(e)[t], oe = (e, t) => e.querySelector(`[data-${t}]`), m = (e, t, n) => {
  const s = _(e);
  if (Object.keys(s).map((r) => oe(e, r)).filter(Boolean).forEach((r) => r.remove()), !s[t])
    return !1;
  let i = s[t].cloneNode(!0);
  return n && (i = j(i, n)), e.appendChild(i), e.querySelector("[data-drop]") && J(i, { bubbles: !0 }), !0;
}, f = (e) => e.querySelector('input[type="file"]'), y = (e) => e.querySelector('input[type="hidden"]'), S = (e) => {
  const t = d(e, "src");
  if (t != null)
    return t;
}, I = (e) => e.currentState, v = (e, t) => {
  e.currentState = t;
}, x = (e) => d(e, "store"), A = (e, t, n) => {
  const s = F(e) || document.createElement("template");
  s.innerHTML = s.innerHTML + w(t, n, "{{", "}}"), s.parentNode || e.appendChild(s);
}, ae = (e, t, n) => {
  if (!t)
    return;
  const s = f(e);
  if (!s)
    return;
  const i = {
    ...window[Y],
    ...window[e.id],
    ...re(e.attributes)
  }, r = (o, l) => {
    s.hidden = !0;
    const a = y(e);
    a.value = l.responseText, m(e, "process", {
      response: l.responseText,
      filename: o.name,
      url: URL.createObjectURL(o)
    });
  }, c = (o) => {
    m(e, "process", {
      filename: o.name,
      url: URL.createObjectURL(o)
    }) && (f(e).hidden = !0);
  }, u = (o) => {
    if (!o) {
      v(globalThis, void 0), g(s);
      return;
    }
    const { dest: l, store: a } = o;
    v(e, o), a ? r(l, a) : (P(s, l), c(l));
  }, p = () => {
    g(s);
  };
  Z(t, {
    editor: i,
    eventTarget: e,
    imageState: n,
    store: i.store && ie(y(e).name, i.store, e.attributes)
  }).then(u).catch(p);
};
function T() {
  const e = x(this), t = S(this), n = {
    success: d(this, "input-store-success") || '"{filename}" uploaded successfully',
    reset: d(this, "input-button-reset") || "&times;",
    url: t
  };
  t && !h(this, "load") && A(this, Q, n), e && !h(this, "process") && A(this, z, n);
  let s = f(this), i = y(this);
  const r = s && s.name || d(this, "name") || "image";
  s || (s = R("input", { type: "file" }), X.forEach((c) => {
    const u = d(this, c);
    u !== null && s.setAttribute(c, u);
  }), this.removeAttribute("name"), this.append(s)), e ? (s.removeAttribute("name"), i || (i = R("input", { type: "hidden", name: r }), this.append(i))) : s.name = r, !t && h(this, "empty") && (m(this, "empty"), s.hidden = !0), t && h(this, "load") && (m(this, "load"), s.hidden = !0), (!s.accept || !/image/.test(s.accept)) && (s.accept = "image/*"), s.removeAttribute("multiple"), s.addEventListener("change", () => this.edit()), this.addEventListener("click", (c) => {
    const { target: u } = c, p = ["reset", "remove", "browse", "edit"].find(
      (o) => u.dataset[o] === ""
    );
    p && this[p]();
  }), this.addEventListener("dropfiles", (c) => {
    c.stopPropagation();
    const { detail: u } = c, p = u.resources[0];
    p && (P(s, p), this.edit());
  });
}
const O = N() && class extends HTMLElement {
  constructor() {
    super(...arguments), this.currentState = void 0;
  }
  connectedCallback() {
    if (this.innerHTML)
      return T.apply(this);
    let e;
    const t = new MutationObserver(() => {
      e !== null && (clearTimeout(e), T.apply(this), t.disconnect());
    });
    t.observe(this, {
      childList: !0
    }), e = setTimeout(() => {
      e = null, T.apply(this);
    }, 0);
  }
  browse() {
    this.querySelector('input[type="file"]').click();
  }
  reset() {
    if (v(this, void 0), !S(this))
      return this.remove();
    g(f(this)), m(this, "load");
  }
  remove() {
    const e = f(this);
    g(e), v(this, void 0), x(this) && (y(this).value = ""), m(this, "empty") || (e.hidden = !1);
  }
  edit() {
    var n, s;
    const e = f(this);
    if (!e)
      return;
    const t = ((n = I(this)) == null ? void 0 : n.src) || te(e) || S(this);
    ae(this, t, (s = I(this)) == null ? void 0 : s.imageState);
  }
};
O && !V(C) && customElements.define(C, O);
