// The Dark switch (remembered as "ag-theme") and the phone Menu button.
(function () {
  var root = document.documentElement;
  var theme = document.getElementById("themebtn");
  if (theme) theme.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark";
    if (dark) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", "dark");
    try { localStorage.setItem("ag-theme", dark ? "light" : "dark"); } catch (e) {}
  });
  var rail = document.getElementById("sidenav");
  var menu = document.getElementById("menubtn");
  if (rail && menu) menu.addEventListener("click", function () {
    var open = rail.classList.toggle("open");
    menu.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();
