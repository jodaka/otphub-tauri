var t = ["Shift", "Meta", "Alt", "Control"],
  e = "object" == typeof navigator ? navigator.platform : "",
  n = /Mac|iPod|iPhone|iPad/.test(e),
  r = n ? "Meta" : "Control",
  o = "Win32" === e ? ["Control", "Alt"] : n ? ["Alt"] : [];
function i(t, e) {
  return (
    "function" == typeof t.getModifierState &&
    (t.getModifierState(e) || (o.includes(e) && t.getModifierState("AltGraph")))
  );
}
function a(t) {
  return t
    .trim()
    .split(" ")
    .map(function (t) {
      var e = t.split(/\b\+/),
        n = e.pop();
      return [
        (e = e.map(function (t) {
          return "$mod" === t ? r : t;
        })),
        n,
      ];
    });
}
function u(e, n) {
  var r;
  void 0 === n && (n = {});
  var o = null != (r = n.timeout) ? r : 1e3,
    u = Object.keys(e).map(function (t) {
      return [a(t), e[t]];
    }),
    c = new Map(),
    f = null;
  return function (e) {
    e instanceof KeyboardEvent &&
      (u.forEach(function (n) {
        var r = n[0],
          o = n[1],
          a = c.get(r) || r;
        !(function (e, n) {
          return !(
            (n[1].toUpperCase() !== e.key.toUpperCase() && n[1] !== e.code) ||
            n[0].find(function (t) {
              return !i(e, t);
            }) ||
            t.find(function (t) {
              return !n[0].includes(t) && n[1] !== t && i(e, t);
            })
          );
        })(e, a[0])
          ? i(e, e.key) || c.delete(r)
          : a.length > 1
            ? c.set(r, a.slice(1))
            : (c.delete(r), o(e));
      }),
      f && clearTimeout(f),
      (f = setTimeout(c.clear.bind(c), o)));
  };
}
function c(t, e, n) {
  var r;
  void 0 === n && (n = {});
  var o = null != (r = n.event) ? r : "keydown",
    i = u(e, n);
  return (
    t.addEventListener(o, i),
    function () {
      t.removeEventListener(o, i);
    }
  );
}
export { u as createKeybindingsHandler, a as parseKeybinding, c as tinykeys };
