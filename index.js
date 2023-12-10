import "./navigo_EditedByLars.js";
import { setActiveLink, renderHtml, loadHtml } from "./utils.js";
import { initLogin, toggleLoginStatus } from "./pages/login/login.js";
import { initEvent } from "./pages/event/event.js";


window.addEventListener("load", async () => {
    const templateLogin = await loadHtml("./pages/login/login.html");
    const templateHome = await loadHtml("./pages/home/home.html");
    const templateLocation = await loadHtml("./pages/location/location.html");
    const templateEvent = await loadHtml("./pages/event/event.html");

    const token = localStorage.getItem("token")
    toggleLoginStatus(token)
    const router = new Navigo("/", { hash: true });
    window.router = router;
    router
      .hooks({
        before(done, match) {
          setActiveLink("menu", match.url);
          done();
        },
      })
      .on({
        "/": () => renderHtml(templateHome, "content"),
  
        "/event": () => {
          renderHtml(templateEvent, "content");
          initEvent();
        },
        "/location": () => {
          renderHtml(templateLocation, "content");
          initLocation();
        },
        "/login": () => {
          renderHtml(templateLogin, "content");
          initLogin();
        },
      })
      .notFound(
        () =>
          (document.getElementById("content").innerHTML =
            "<h2>404 - Page not found</h2>")
      )
      .resolve();
  });