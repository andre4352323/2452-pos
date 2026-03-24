import Cashier from "../model/cashier";
import CashierLoginView from "../view/cashier-login-view";
import CreateCashierView from "../view/create-cashier-view";
import MainController from "./main-controller";
import {
    CashierAlreadyExistsException,
    CashierNotFoundException,
    InvalidCashierPasswordException,
    InvalidCashierUsernameException
} from "../model/cashier";

export default class CashierController {
    #cashier?: Cashier;
    #loginView?: CashierLoginView;
    #createCashierView?: CreateCashierView;

    constructor() {
        this.#loginView = new CashierLoginView(this);
    }

    async signIn(username: string, password: string): Promise<void> {
        if (username.length < 1) throw new InvalidCashierUsernameException();
        if (password.length < 1) throw new InvalidCashierPasswordException();

        const cashier = await Cashier.findCashier(username, password);
        if (cashier === null) throw new CashierNotFoundException();

        this.#cashier = cashier;
        this.#loginView = undefined;

        // Hand off to MainController — cashier session starts here.
        new MainController(this.#cashier);
    }

    showCreateCashierView(): void {
        if (this.#createCashierView === undefined) {
            this.#createCashierView = new CreateCashierView(this);
        }
    }

    async signUp(username: string, password: string): Promise<void> {
        if (username.length < 1) throw new InvalidCashierUsernameException();
        if (password.length < 1) throw new InvalidCashierPasswordException();

        const alreadyExists = await Cashier.usernameExists(username);
        if (alreadyExists) throw new CashierAlreadyExistsException();

        const cashier = new Cashier(username, password);
        await Cashier.saveCashier(cashier);

        this.#createCashierView = undefined;
        // Original login view is still on the page — no need to recreate it.
    }

    dismissCreateCashierView(): void {
        this.#createCashierView = undefined;
    }
}