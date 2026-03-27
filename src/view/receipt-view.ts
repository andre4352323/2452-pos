import type Cart from "../model/cart.ts";
import type Receipt from "../model/receipt.ts";
import type ReceiptController from "../controller/receipt-controller.ts";

/**
 * Displays the checkout dialog, including coupon selection and the final receipt.
 * All business logic is delegated to {@link ReceiptController} and the model
 */
export default class ReceiptView {

    #cart: Cart;
    #receiptController: ReceiptController;
    #dialog: HTMLDialogElement;

    /**
     * Creates the receipt view dialog and shows the coupon selection screen
     *
     * @param cart the cart being checked out
     * @param receiptController the controller that handles coupon creation and checkout
     */
    constructor(cart: Cart, receiptController: ReceiptController) {

        this.#cart = cart;
        this.#receiptController = receiptController;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "receipt";
        document.body.appendChild(this.#dialog);

        this.#showCouponSelection();
        this.#dialog.showModal();
    }

    /**
     * Renders the coupon selection buttons. Disables the BOGO button if no
     * UNITS product has a total quantity of at least 2
     */
    #showCouponSelection(): void {

        const grouped = this.#cart.getBogoEligible();
        const bogoEligible = [...grouped.values()].some(e => e.totalQty >= 2);

        this.#dialog.innerHTML = `
            <h3>Apply a Coupon</h3>
            <p>You must choose one coupon to proceed.</p>
            <button id="bogo-btn" ${!bogoEligible ? "disabled title='Requires at least one UNITS product with total quantity ≥ 2'" : ""}>
                BOGO — Buy one get one free
            </button>
            <button id="discount-btn">Total Discount — 10% off</button>
        `;

        this.#dialog.querySelector("#discount-btn")!
            .addEventListener("click", () => this.#receiptController.selectTotalDiscount());

        if (bogoEligible) {

            this.#dialog.querySelector("#bogo-btn")!
                .addEventListener("click", () => this.#showBogoPicker());
        }
    }

    /**
     * Renders the BOGO product picker, listing all eligible UNITS products
     * the cashier can choose to get one free
     */
    #showBogoPicker(): void {

        const grouped = this.#cart.getBogoEligible();
        const eligible = [...grouped.values()].filter(e => e.totalQty >= 2);

        const listItems = eligible.map((e, i) =>
            `<li>
                <button class="bogo-pick-btn" data-index="${i}">
                    ${e.product.name} — ${e.totalQty} units
                    (1 unit free = save $${Number(e.product.price).toFixed(2)})
                </button>
             </li>`
        ).join("");

        this.#dialog.innerHTML = `
            <h3>BOGO — Choose which product gets a free unit</h3>
            <ul>${listItems}</ul>
            <button id="bogo-back-btn">Back</button>
        `;

        this.#dialog.querySelector("#bogo-back-btn")!
            .addEventListener("click", () => this.#showCouponSelection());

        this.#dialog.querySelectorAll(".bogo-pick-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt((e.currentTarget as HTMLElement).dataset.index!);
                this.#receiptController.selectBogo(eligible[idx].product);
            });
        });
    }

    /**
     * Renders the final receipt using pre-computed values from {@link Receipt}.
     * Shows a confirm button to complete the transaction
     *
     * @param receipt the receipt containing subtotal, discount, and total
     */
    showFinalReceipt(receipt: Receipt): void {

        const itemRows = receipt.products.map((item) =>
            `<li><strong>${item.name}</strong> — ${Number(item.quantityValue)} ${item.quantity} — $${(Number(item.price) * Number(item.quantityValue)).toFixed(2)}</li>`
        ).join("");

        this.#dialog.innerHTML = `
            <h3>Receipt</h3>
            <ul>${itemRows}</ul>
            <p>Subtotal: $${receipt.subtotal().toFixed(2)}</p>
            <p>Coupon: ${receipt.coupon.name} — -$${receipt.discount().toFixed(2)}</p>
            <p><strong>Total: $${receipt.totalCost().toFixed(2)}</strong></p>
            <button id="confirm-btn">Paid and done</button>
        `;

        this.#dialog.querySelector("#confirm-btn")!
            .addEventListener("click", () => {
                this.#dialog.close();
                document.body.removeChild(this.#dialog);
                this.#receiptController.confirmCheckout(receipt);
            });
    }
}