module.exports = function (/** @type {import("D:/# ADMIN/Documents/- Programmation/JS - Plugin Signal/plugins/appFiles").BsApi}*/ Bs) {
	return class {
		constructor() {
			this.name = "SendButton";
			this.description = "Add send button";
			this.author = "Albatros";
			this.version = "1.0.0";
			this.settings = [];
			this.links = [
				{
					type: "discord",
					title: "My discord serveur",
					link: "https://discord.gg/yXTpveSabF",
				},
				{
					type: "github",
					title: "Github",
					link: "https://github.com/0xybo",
				},
			];
			this.messages = {
				send: {
					fr: "Envoyer le message",
					en: "Send message",
				},
			};
		}
		load() {}
		main() {
			Bs.css.inject({
				".SendButton": {
					border: 0,
					background: "none",
					width: "32px",
					height: "32px",
					"border-radius": "16px",
					display: "flex",
					"justify-content": "center",
					"align-items": "center",
					opacity: "0.5",
					outline: "none",
					cursor: "pointer",
				},
				".SendButton:after": {
					"-webkit-mask": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' style='&%2310;'%3E%3Ctitle%3Esend%3C/title%3E%3Cpath d='M6.48 6.794l.49 1.963a1 1 0 0 1-1.94.486l-1-4a1 1 0 0 1 1.393-1.15l15 7a1 1 0 0 1 0 1.813l-15 7a1 1 0 0 1-1.385-1.18l2-7A1 1 0 0 1 7 11h4a1 1 0 0 1 0 2H7.754l-1.19 4.167L17.635 12 6.48 6.794z' fill='%23000' fill-rule='nonzero' style='&%2310; fill: white;&%2310;'/%3E%3C/svg%3E")`,
					content: `""`,
					"-webkit-mask-size": "100%",
					"background-color": "#dedede",
					display: "block",
					width: "36px",
					height: "36px",
					"flex-shrink": 0,
				},
				".sendButton:hover": {
					opacity: 1,
				},
			});
			this.button = Bs.util.E("button").set({
				props: {
					class: "SendButton",
					title: Bs.translate.get("send", null, this.messages),
				},
				events: {
					click: this.handleClick,
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
		}
		handleClick = async function () {
			Bs.messages.send();
			// var conversation = await Bs.conversation.current();
			// var messageElement = document.querySelector(".module-composition-area__input .ql-editor.ql-editor--loaded > div");
			// var message = messageElement.textContent;
			// messageElement.textContent = "";
			// conversation.sendMessage(message, []);
		}.bind(this);
		stop() {
			this.observer.disconnect();
		}
	};

	/* <div class="GifPickerButton" style="border: 0;background: none;width: 32px;height: 32px;border-radius: 16px;display: flex;justify-content: center;align-items: center;opacity: 0.5;outline: none;"></div>; */
};
