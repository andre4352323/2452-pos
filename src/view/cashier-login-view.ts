import type CashierController from "../controller/cashier-controller";
import {
    InvalidCashierUsernameException,
    InvalidCashierPasswordException,
    CashierNotFoundException
} from "../model/cashier";

/**
 * Renders and manages the cashier login screen.
 * All authentication logic is delegated to {@link CashierController}
 */
export default class CashierLoginView {

    #controller: CashierController;
    #container: HTMLDivElement;

    /**
     * Creates the login UI, wires up event handlers
     *
     * @param controller the controller responsible for cashier authentication
     */
    constructor(controller: CashierController) {

        this.#controller = controller;
        this.#container = document.createElement("div");
        this.#container.innerHTML = `
            <h2>Cashier Login</h2>
            <span id="error"></span><br />
            <label for="username">Username</label>
            <input type="text" id="username" /><br />
            <label for="password">Password</label>
            <input type="password" id="password" /><br />
            <button id="sign-in-btn">Sign In</button>
            <button id="sign-up-btn">Sign Up</button>
        `;

        this.#container.querySelector("#sign-in-btn")!
            .addEventListener("click", () => this.#signIn());

        
        this.#container.querySelector("#sign-up-btn")!
            .addEventListener("click", () => this.#openSignUp());

        document.body.appendChild(this.#container);
    }

    /**
     * Attempts to sign in using the provided credentials
     * Specific error messages are displayed depending on which validation failed
     */
    #signIn() {

        const username =
            this.#container.querySelector<HTMLInputElement>("#username")!.value;

        const password =
            this.#container.querySelector<HTMLInputElement>("#password")!.value;

        this.#controller.signIn(username, password)
            .then(() => {

                // successful login, remove login screen
                document.body.removeChild(this.#container);
            })
            .catch((e: any) => {

                const errorSpan =
                    this.#container.querySelector<HTMLSpanElement>("#error")!;

                if (e instanceof InvalidCashierUsernameException) {

                    errorSpan.textContent =
                        "Username must be at least 1 characters long.";
                    this.#highlightField("#username");

                } else if (e instanceof InvalidCashierPasswordException) {

                    errorSpan.textContent =
                        "Password must be at least 1 characters long.";
                    this.#highlightField("#password");

                } else if (e instanceof CashierNotFoundException) {

                    errorSpan.textContent =
                        "No cashier found with those credentials. Check your username and password.";
                    this.#highlightField("#username");
                    this.#highlightField("#password");

                } else {

                    console.log("Unexpected error: " + e);
                }
            });
    }

    /**
     * Opens the cashier creation view handled by the controller
     */
    #openSignUp() { this.#controller.showCreateCashierView(); }

    /**
     * Highlights an invalid input field by marking its border red
     *
     * @param selector CSS selector targeting the input to highlight
     */
    #highlightField(selector: string) {
        
        this.#container.querySelector<HTMLInputElement>(selector)!
            .setAttribute("style", "border-color: red;");
    }
}