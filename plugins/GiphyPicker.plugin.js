/** @type {import("D:/# ADMIN/Documents/- Programmation/JS - Plugin Signal/plugins/appFiles").BsApi}*/
var Bs = window.BsApi;
module.exports = class GiphyPicker {
	constructor() {
		this.name = "GiphyPicker";
		this.description = "Gif picker powered by Giphy (Shift+click : keep picker opened, Control+click : send directly message)";
		this.author = "Albatros";
		this.version = "1.0.0";
		this.settings = [];
		this.links = [];
		this.messages = {
			search: {
				fr: "Rechercher un GIF ...",
				en: "Search GIF ...",
			},
			open: {
				fr: "Ouvrir le selecteur de GIFs",
				en: "Open GIFs picker",
			},
		};
		this.apiOptions = {
			limit: 20,
			key: "g9Vo3Z0b6RauiwyRLhfxVFKeV0jVK34K",
		};
		this.currentColumn = 0;
		this.gifLoaded = 0;
		this.searchHistory = [];
		this.currentKeyPressed = null;
	}
	load() {}
	main() {
		Bs.css.inject({
			".GifPickerButton": {
				border: 0,
				background: "none",
				width: "32px",
				height: "32px",
				"border-radius": "16px",
				display: "flex",
				"justify-content": "center",
				"align-items": "center",
				opacity: 0.5,
				outline: "none",
				cursor: "pointer",
			},
			".GifPickerButton:after": {
				"-webkit-mask": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' style='&%2310; fill: white;&%2310;'%3E%3Cpath d='M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z'/%3E%3C/svg%3E")`,
				content: `""`,
				"-webkit-mask-size": "100%",
				"background-color": "#dedede",
				display: "block",
				width: "42px",
				height: "42px",
				"flex-shrink": 0,
			},
			".GifPickerButton:hover": {
				opacity: 1,
			},
			".GifPickerButtonActive": {
				background: "#3b3b3b",
				opacity: 1,
			},
			".GifPicker": {
				"z-index": "1000",
				height: "400px",
				width: "640px",
				background: "#3b3b3b",
				"margin-bottom": "6px",
				display: "grid",
				"border-radius": "8px",
				"grid-template-rows": "44px 1fr",
				"grid-template-columns": "1fr",
			},
			".GifPickerHeader": {
				"vertical-align": "middle",
				margin: "auto 0",
			},
			".GifPickerBody": {
				display: "grid",
				"grid-auto-rows": "auto",
				"grid-template-columns": "repeat(4, 1fr)",
				"grid-gap": "8px",
				overflow: "scroll",
				padding: "0 10px",
			},
			".GifPickerBody > div > img": {
				width: "100%",
				"object-fit": "contain",
				"margin-bottom": "8px",
				cursor: "pointer",
			},
			".GifPickerBody > div": {},
		});
		this.button = Bs.util.E("button").set({
			props: {
				class: "GifPickerButton",
				title: Bs.translate.get("open", null, this.messages, Bs.translate.locale),
			},
			events: {
				click: this.handleClick.bind(this),
			},
		});
		this.buttonRoot = Bs.util.E("div").set({
			props: {
				class: "module-composition-area__button-cell",
			},
			children: [this.button],
		});
		this.observer = Bs.wait.element(
			".conversation .module-composition-area__input",
			function (e) {
				e.insertAdjacentElement("afterend", this.buttonRoot);
			}.bind(this)
		);
		this.opened = false;
		document.addEventListener("keydown", this.keyDown);
		document.addEventListener("keyup", this.keyUp);
	}
	keyDown = function (e) {
		this.currentKeyPressed = { key: e.key, control: e.ctrlKey, shift: e.shiftKey };
	}.bind(this);
	keyUp = function () {
		this.currentKeyPressed = null;
	}.bind(this);
	handleClick(e) {
		e.stopPropagation();
		if (this.opened) {
			if (!this.root.contains(e.target)) {
				this.close(e);
			}
		} else {
			if (document.querySelector(".module-composition-area__button-cell [class*=active]")) document.body.click();
			this.open();
		}
	}
	_handleClick = this.handleClick.bind(this);
	open() {
		this.currentColumn = 0;
		this.popup = Bs.util.E("div").set({
			props: {
				class: "GifPicker",
			},
			children: [
				Bs.util.E("div").set({
					props: {
						class: "GifPickerHeader",
					},
					children: [
						Bs.util.E("div").set({
							props: {
								class: "BsSearch",
							},
							children: [
								Bs.util.E("input").set({
									props: {
										type: "text",
										placeholder: Bs.translate.get("search", null, this.messages),
									},
									events: {
										input: this.loadGif.bind(this, 20),
									},
								}),
								Bs.util.E("img").set({
									props: {
										src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='' fill='%23FFFFFF' viewBox='0 0 24 24' style='width: 16px; height: 16px;'%3E%3Cpath fill='none' d='M0 0h24v24H0V0z'%3E%3C/path%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'%3E%3C/path%3E%3C/svg%3E",
									},
								}),
							],
						}),
					],
				}),
				Bs.util.E("div").set({
					props: {
						class: "GifPickerBody",
					},
					children: [Bs.util.E("div"), Bs.util.E("div"), Bs.util.E("div"), Bs.util.E("div")],
				}),
			],
		});
		this.opened = true;
		this.root = document.querySelector("BsPopups");
		this.root.append(this.popup);
		this.popupBody = this.popup.querySelector(".GifPickerBody");
		this.searchInput = this.popup.querySelector(".GifPickerHeader > .BsSearch > input");
		this.popper = new Bs.util.popperJs(this.buttonRoot, this.popup, {
			placement: "top-end",
			removeOnDestroy: true,
		});
		this.button.classList.add("GifPickerButtonActive");
		document.addEventListener("click", this._handleClick);
		this.loadGif.call(this, 20);
		this.popupBody.addEventListener("scroll", this._onscroll);
	}
	onscroll(e) {
		if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
			this.loadGif.call(this, 20);
		}
	}
	_onscroll = this.onscroll.bind(this);
	loadGif(limit) {
		var formatedSearch = this.searchInput.value
			.split("")
			.map((c) => {
				return c == " " ? "%20" : c.match(/[a-z0-9]/gim) ? c : "";
			})
			.join("");
		var options = {};
		if (!this.popupBody) return false;
		if (this.searchInput.value) {
			if (this.searchHistory[this.searchHistory.length - 1] != formatedSearch) {
				this.popupBody.innerHTML = "";
				this.popupBody.append(Bs.util.E("div"), Bs.util.E("div"), Bs.util.E("div"), Bs.util.E("div"));
				this.gifLoaded = 0;
			}
			options = {
				method: "GET",
				hostname: "api.giphy.com",
				path: `/v1/gifs/search?api_key=${this.apiOptions.key}&q=${formatedSearch}&limit=${limit}&offset=${this.gifLoaded}&lang=${Bs.translate.locale}`,
				headers: {},
				maxRedirects: 20,
			};
		} else {
			options = {
				method: "GET",
				hostname: "api.giphy.com",
				path: `/v1/gifs/trending?api_key=${this.apiOptions.key}&limit=${limit}&offset=${this.gifLoaded}`,
				headers: {},
				maxRedirects: 20,
			};
		}
		var req = Bs.util.http.get(options, (res) => {
			var chunks = [];
			res.on("data", (chunk) => chunks.push(chunk));
			res.on("end", () => {
				let body = JSON.parse(Buffer.concat(chunks).toString());
				body.data.forEach((gif) => {
					var req1 = BsApi.util.https.get(gif.images.preview_gif.url, (res1) => {
						var chunks1 = [];
						res1.on("data", (chunk1) => chunks1.push(chunk1));
						res1.on("end", () => {
							let blob = new Blob(chunks1, { type: "image/gif" });
							var elem = Bs.util.E("img");
							this.popupBody.children.item(this.currentColumn === 4 ? ((this.currentColumn = 0), this.currentColumn++) : this.currentColumn++).append(elem);
							elem.src = URL.createObjectURL(blob);
							elem.data = {
								data: gif,
								blob: blob,
							};
							elem.addEventListener("click", this.gifClicked.bind(this, elem.data));
						});
					});
					req1.end();
				});
			});
		});
		req.end();
		this.gifLoaded += limit;
		this.searchHistory.push(formatedSearch);
	}
	async gifClicked(gif) {
		var _currentKeyPressed = this.currentKeyPressed;
		Bs.conversation.current().then(
			function (view) {
				if (_currentKeyPressed ? !_currentKeyPressed.shift : true) this.close();
				var req1 = BsApi.util.https.get(
					gif.data.images.original.url,
					async function (res1) {
						var chunks1 = [];
						res1.on("data", (chunk1) => chunks1.push(chunk1));
						res1.on(
							"end",
							async function () {
								let blob = new Blob(chunks1, { type: "image/gif" });
								let file = new File([blob], gif.data.id + ".gif", { type: "image/gif" });
								await view.maybeAddAttachment(file);
								if (_currentKeyPressed ? _currentKeyPressed.control : false) this.send();
							}.bind(this)
						);
					}.bind(this)
				);
				req1.end();
			}.bind(this)
		);
	}
	send = async function () {
		var conversation = await Bs.conversation.current();
		var messageElement = document.querySelector(".module-composition-area__input .ql-editor.ql-editor--loaded > div");
		var message = messageElement.textContent;
		messageElement.textContent = "";
		conversation.sendMessage(message, []);
	}.bind(this);
	_LoadGif = this.loadGif.bind(this);
	close(e) {
		this.gifLoaded = 0;
		this.currentColumn = 0;
		this.opened = false;
		if (this.root.contains(this.popup) && this.popper) {
			this.popper.destroy();
		}
		this.button.classList.remove("GifPickerButtonActive");
		document.removeEventListener("click", this._handleClick);
		this.popupBody.removeEventListener("scroll", this._onscroll);
	}
	_close = this.close.bind(this);
	stop() {
		if (this.opened) this.close();
		if (this.observer) this.observer.disconnect();
		if (document.querySelector(".GifPickerButton")) {
			var e = document.querySelector(".GifPickerButton").closest(".module-composition-area__button-cell");
			if (e) e.remove();
		}
		document.removeEventListener("keydown", this.keyDown);
		document.removeEventListener("keyup", this.keyUp);
	}
};

/* <div class="GifPickerButton" style="border: 0;background: none;width: 32px;height: 32px;border-radius: 16px;display: flex;justify-content: center;align-items: center;opacity: 0.5;outline: none;"></div>; */
