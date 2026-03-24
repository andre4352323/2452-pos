import type CashierController from "../controller/cashier-controller";
import {
    InvalidCashierUsernameException,
    InvalidCashierPasswordException,
    CashierAlreadyExistsException
} from "../model/cashier";

export default class CreateCashierView {
    #controller: CashierController;
    #dialog: HTMLDialogElement;

    constructor(controller: CashierController) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.innerHTML = `
            <h2>Create Cashier Account</h2>
            <span id="error"></span><br />
            <label for="username">Username</label>
            <input type="text" id="username" /><br />
            <label for="password">Password</label>
            <input type="password" id="password" /><br />
            <button id="create-btn">Create Account</button>
            <button id="cancel-btn">Cancel</button>
        `;

        this.#dialog.querySelector("#create-btn")!
            .addEventListener("click", () => this.#createCashier());

        this.#dialog.querySelector("#cancel-btn")!
            .addEventListener("click", () => this.#cancel());

        document.body.appendChild(this.#dialog);
        this.#dialog.show();
    }

    #createCashier() {
        const username = this.#dialog.querySelector<HTMLInputElement>("#username")!.value;
        const password = this.#dialog.querySelector<HTMLInputElement>("#password")!.value;

        this.#controller.signUp(username, password)
            .then(() => {
                document.body.removeChild(this.#dialog);
            })
            .catch((e: any) => {
                const errorSpan = this.#dialog.querySelector<HTMLSpanElement>("#error")!;

                if (e instanceof InvalidCashierUsernameException) {
                    errorSpan.textContent = "Username must be at least 1 characters long.";
                    this.#highlightField("#username");
                } else if (e instanceof InvalidCashierPasswordException) {
                    errorSpan.textContent = "Password must be at least 1 characters long.";
                    this.#highlightField("#password");
                } else if (e instanceof CashierAlreadyExistsException) {
                    errorSpan.textContent = "A cashier with that username already exists. Please choose another.";
                    this.#highlightField("#username");
                } else {
                    console.log("Unexpected error: " + e);
                }
            });
    }

    #cancel() {
        this.#controller.dismissCreateCashierView();
        document.body.removeChild(this.#dialog);
    }

    #highlightField(selector: string) {
        this.#dialog.querySelector<HTMLInputElement>(selector)!
            .setAttribute("style", "border-color: red;");
    }
}