import Cashier from "../model/cashier";
import CashierLoginView from "../view/cashier-login-view";
import CreateCashierView from "../view/create-cashier-view";
import MainController from "./main-controller";

/**
 * Manages cashier authentication, coordinating between {@link Cashier},
 * {@link CashierLoginView}, and {@link CreateCashierView}.
 */
export default class CashierController {

    #cashier?: Cashier;
    #loginView?: CashierLoginView;
    #createCashierView?: CreateCashierView;

    /**
     * Creates the controller and shows the {@link CashierLoginView}
     */
    constructor() {

        this.#loginView = new CashierLoginView(this);
    }

    /**
     * Attempts to sign in a cashier with the given credentials and hands off
     * to {@link MainController} on success. Throws {@link InvalidCashierUsernameException}
     * if username is empty, {@link InvalidCashierPasswordException} if password is empty,
     * or {@link CashierNotFoundException} if no matching cashier exists
     *
     * @param username the cashiers username, must not be empty
     * @param password the cashiers password, must not be empty
     */
    async signIn(username: string, password: string): Promise<void> {

        new Cashier(username, password);
        this.#cashier = await Cashier.login(username, password);
        this.#loginView = undefined;
        new MainController(this.#cashier);
    }

    /**
     * Shows the {@link CreateCashierView} if it is not already open
     */
    showCreateCashierView(): void {

        if (this.#createCashierView === undefined) {

            this.#createCashierView = new CreateCashierView(this);
        }
    }

    /**
     * Registers a new cashier with the given credentials and dismisses the
     * {@link CreateCashierView} on success. Throws {@link InvalidCashierUsernameException}
     * if username is empty, {@link InvalidCashierPasswordException} if password is empty,
     * or {@link CashierAlreadyExistsException} if the username is already taken
     *
     * @param username the desired username, must not be empty
     * @param password the desired password, must not be empty
     */
    async signUp(username: string, password: string): Promise<void> {

        const cashier = new Cashier(username, password);

        // domain model handles duplicate check and persistence
        await cashier.save();

        // original login view is still on the page, no need to recreate it
        this.#createCashierView = undefined;
    }

    /**
     * Dismisses the {@link CreateCashierView}.
     */
    dismissCreateCashierView(): void { this.#createCashierView = undefined; }
}