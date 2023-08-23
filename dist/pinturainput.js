/*!
* Pintura Input v9.0.2 
* (c) 2018-2023 PQINA Inc. - All Rights Reserved
* License: https://pqina.nl/pintura/license/
*/
/* eslint-disable */
const C = (e, t, n = []) => {
  const s = document.createElement(e), i = Object.getOwnPropertyDescriptors(s.__proto__);
  for (const r in t)
    r === "style" ? s.style.cssText = t[r] : i[r] && i[r].set || /textContent|innerHTML/.test(r) || typeof t[r] == "function" ? s[r] = t[r] : s.setAttribute(r, t[r]);
  return n.forEach((r) => s.appendChild(r)), s;
}, H = (e) => typeof e == "string";
let b = null;
const N = () => (b === null && (b = typeof window < "u" && typeof window.document < "u"), b), q = (e) => e.charAt(0).toLowerCase() + e.slice(1), U = (e) => e.charAt(0).toUpperCase() + e.slice(1), B = (e) => q(e.split("-").map(U).join("")), V = (e) => typeof e == "object", w = (e, t = {}, n = "", s = "") => Object.keys(t).filter((i) => !V(t[i])).reduce((i, r) => i.replace(new RegExp(n + r + s), t[r]), e), W = (e) => document.createElement(e).constructor !== HTMLElement, G = (e) => e instanceof Blob, K = (e) => /^image/.test(e.type), $ = async (e) => new Promise((t) => {
  if (e.kind === "file")
    return t(e.getAsFile());
  e.getAsString(t);
}), J = (e) => new Promise((t, n) => {
  const { items: s } = e.dataTransfer;
  if (!s)
    return t([]);
  Promise.all(Array.from(s).map($)).then((i) => {
    t(
      i.filter(
        (r) => G(r) && K(r) || /^http/.test(r)
      )
    );
  }).catch(n);
}), Y = (e, t = {}) => {
  const n = (i) => {
    i.preventDefault();
  }, s = async (i) => {
    i.preventDefault(), i.stopPropagation();
    try {
      const r = await J(i);
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
}, R = "pintura-input", z = "PinturaInput", Q = `<output data-process style="display:flex;align-items:center;pointer-events:none;">
    <img src="{url}" alt="" style="object-fit:cover;width:auto;height:1.5em;margin-right:.5em;"/>
    <span>{{success}}</span>
    <button data-remove style="pointer-events:all;margin-left:.5em;" aria-label="Reset">{{reset}}</button>
</output>`, X = `<div data-load style="display:flex;align-items:center;pointer-events:none;">
    <img src="{{url}}" alt="" style="object-fit:cover;width:auto;height:1.5em;margin-right:.5em;"/>
    <button data-remove style="pointer-events:all;margin-left:.5em;" aria-label="Reset">{{reset}}</button>
</output>`, Z = ["accept", "capture"], ee = (e, t) => new Promise((n, s) => {
  const { store: i, editor: r, eventTarget: m, imageState: p } = t, { openDefaultEditor: o, dispatchEditorEvents: a } = window.pintura, c = {};
  r.imageReader && (c.imageReader = {
    ...r.imageReader
  }), (r.imageWriter || i) && (c.imageWriter = {
    store: (H(i), i),
    ...r.imageWriter
  });
  const l = o({
    // set reader and writer props
    ...c,
    // can overwrite anything with global props, except src property, will filter out properties below
    ...te(r, ["id", "name", "store", "imageWriter", "imageReader"]),
    src: e,
    // set initial image state
    imageState: p
  }), D = a(l, m);
  let L = !1;
  l.on("loadabort", () => {
    l.close(), L = !0;
  }), l.on("loaderror", s), l.on("processerror", s), l.on("close", () => {
    D.forEach((M) => M()), L ? s() : n(void 0);
  }), l.on("process", n);
}), d = (e, t) => e.getAttribute(t), te = (e, t) => Object.keys(e).filter((n) => !t.includes(n)).reduce((n, s) => ({
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
}, se = (e) => {
  if (!e || !e.matches('input[type="file"]'))
    return;
  const t = e, n = t.files[0] || (t._files || [])[0];
  if (n && /image/.test(n.type))
    return n;
}, ne = (e, t = "") => B(e.replace(new RegExp("^" + t, "g"), "")), re = (e) => {
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
}, ie = (e) => Object.values(e).reduce((t, n) => {
  const s = ne(n.name);
  return t[s] = re(n.value), t;
}, {}), oe = (e, t, n) => {
  const s = Object.values(n).filter((r) => /^post/.test(r.name)).map((r) => [r.name.replace(/^post-/, ""), r.value]);
  return {
    url: t || "",
    dataset: (r) => [...s, [e, r.dest, r.dest.name]]
  };
}, F = (e, t) => (Array.from(e.attributes).filter(({ value: s }) => s.length && s.includes("{")).forEach(
  ({ name: s, value: i }) => e.setAttribute(s, w(i, t, "{", "}"))
), e.childNodes.forEach((s) => {
  s.nodeType === 1 && (s = F(s, t)), s.nodeType === 3 && (s.textContent = w(s.textContent, t, "{", "}"));
}), e), E = (e, t) => e && e.content.querySelector(`[data-${t}]`), j = (e) => e.querySelector("template"), _ = (e) => {
  const t = j(e), n = E(t, "empty"), s = E(t, "load"), i = E(t, "process");
  return {
    empty: n,
    load: s,
    process: i
  };
}, h = (e, t) => !!_(e)[t], ae = (e, t) => e.querySelector(`[data-${t}]`), f = (e, t, n) => {
  const s = _(e);
  if (Object.keys(s).map((r) => ae(e, r)).filter(Boolean).forEach((r) => r.remove()), !s[t])
    return !1;
  let i = s[t].cloneNode(!0);
  return n && (i = F(i, n)), e.appendChild(i), e.querySelector("[data-drop]") && Y(i, { bubbles: !0 }), !0;
}, u = (e) => e.querySelector('input[type="file"]'), v = (e) => e.querySelector('input[type="hidden"]'), S = (e) => {
  const t = d(e, "src");
  if (t != null)
    return t;
}, I = (e) => e.currentState, y = (e, t) => {
  e.currentState = t;
}, k = (e) => d(e, "store"), A = (e, t, n) => {
  const s = j(e) || document.createElement("template");
  s.innerHTML = s.innerHTML + w(t, n, "{{", "}}"), s.parentNode || e.appendChild(s);
}, ce = (e, t, n) => {
  const s = u(e);
  s.hidden = !0;
  const i = v(e);
  i.value = n.responseText, f(e, "process", {
    response: n.responseText,
    filename: t.name,
    url: URL.createObjectURL(t)
  });
}, le = (e, t) => {
  f(e, "process", {
    filename: t.name,
    url: URL.createObjectURL(t)
  }) && (u(e).hidden = !0);
}, x = (e, t) => {
  const { dest: n, store: s } = t, i = u(e);
  s ? ce(e, n, s) : (P(i, n), le(e, n));
}, ue = (e, t, n) => {
  if (!t)
    return;
  const s = u(e);
  if (!s)
    return;
  const i = {
    ...window[z],
    ...window[e.id],
    ...ie(e.attributes)
  }, r = (p) => {
    if (!p) {
      y(globalThis, void 0), g(s);
      return;
    }
    y(e, p), x(e, p);
  }, m = () => {
    g(s);
  };
  ee(t, {
    editor: i,
    eventTarget: e,
    imageState: n,
    store: i.store && oe(v(e).name, i.store, e.attributes)
  }).then(r).catch(m);
};
function T() {
  const e = k(this), t = S(this), n = {
    success: d(this, "input-store-success") || '"{filename}" uploaded successfully',
    reset: d(this, "input-button-reset") || "&times;",
    url: t
  };
  t && !h(this, "load") && A(this, X, n), e && !h(this, "process") && A(this, Q, n);
  let s = u(this), i = v(this);
  const r = s && s.name || d(this, "name") || "image";
  s || (s = C("input", { type: "file" }), Z.forEach((o) => {
    const a = d(this, o);
    a !== null && s.setAttribute(o, a);
  }), this.removeAttribute("name"), this.append(s)), e ? (s.removeAttribute("name"), i || (i = C("input", { type: "hidden", name: r }), this.append(i))) : s.name = r, !t && h(this, "empty") && (f(this, "empty"), s.hidden = !0), t && h(this, "load") && (f(this, "load"), s.hidden = !0), (!s.accept || !/image/.test(s.accept)) && (s.accept = "image/*"), s.removeAttribute("multiple"), this.handleEvent = (o) => {
    const { type: a, target: c } = o;
    if (a === "change" && c === s)
      return this.edit();
    if (a === "click")
      return m(o);
    if (a === "dropfiles")
      return p(o);
  };
  const m = (o) => {
    const { target: a } = o, c = ["reset", "remove", "browse", "edit"].find(
      (l) => a.dataset[l] === ""
    );
    c && this[c]();
  }, p = (o) => {
    o.stopPropagation();
    const { detail: a } = o, c = a.resources[0];
    c && (P(s, c), this.edit());
  };
  s.addEventListener("change", this), this.addEventListener("click", this), this.addEventListener("dropfiles", this), this.currentState && x(this, this.currentState);
}
function pe() {
  this.removeEventListener("click", this), this.removeEventListener("dropfiles", this);
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
  disconnectedCallback() {
    pe.apply(this);
  }
  browse() {
    this.querySelector('input[type="file"]').click();
  }
  reset() {
    if (y(this, void 0), !S(this))
      return this.remove();
    g(u(this)), f(this, "load");
  }
  remove() {
    const e = u(this);
    g(e), y(this, void 0), k(this) && (v(this).value = ""), f(this, "empty") || (e.hidden = !1);
  }
  edit() {
    var n, s;
    const e = u(this);
    if (!e)
      return;
    const t = ((n = I(this)) == null ? void 0 : n.src) || se(e) || S(this);
    ue(this, t, (s = I(this)) == null ? void 0 : s.imageState);
  }
};
O && !W(R) && customElements.define(R, O);
