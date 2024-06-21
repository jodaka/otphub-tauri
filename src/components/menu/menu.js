import { tinykeys } from "./tinykeys.module.js";

const appExit = () => console.log("bye");

export class Menu {
  wrapper = null;

  constructor() {
    this.wrapper = document.getElementById("menu");
    this.wrapper.setAttribute("data-tauri-drag-region", true);

    tinykeys(document.body, {
      "Meta+Q": appExit,
      "Control+Q": appExit,
    });
  }
}
