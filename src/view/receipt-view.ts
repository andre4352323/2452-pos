import type Cart from "../model/cart";
import type CartController from "../controller/cart-controller";
import BogoCoupon from "../model/bogo-coupon.ts";
import TotalDiscountCoupon from "../model/total-discount-coupon.ts";
import type Coupon from "../model/coupon.ts";
import type Product from "../model/product.ts";

export default class ReceiptView {

    #cart: Cart;
    #cartController: CartController;
    #dialog: HTMLDialogElement;
    #coupon?: Coupon;

    constructor(cart: Cart, cartController: CartController) {
        this.#cart = cart;
        this.#cartController = cartController;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "receipt";
        document.body.appendChild(this.#dialog);

        this.#showCouponSelection();
        this.#dialog.showModal();
    }

    // Groups UNITS items by name and sums their quantities across separate entries.
    #getGroupedEligible(): Map<string, { product: Product, totalQty: number }> {
        const grouped = new Map<string, { product: Product, totalQty: number }>();
        this.#cart.items
            .filter(p => p.quantity === "UNITS")
            .forEach(p => {
                const existing = grouped.get(p.name);
                if (existing) {
                    existing.totalQty += Number(p.quantityValue);
                } else {
                    grouped.set(p.name, { product: p, totalQty: Number(p.quantityValue) });
                }
            });
        return grouped;
    }

    #showCouponSelection(): void {
        const grouped = this.#getGroupedEligible();
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
            .addEventListener("click", () => {
                TotalDiscountCoupon.fromInventory().then((coupon) => {
                    this.#coupon = coupon;
                    this.#showFinalReceipt(this.#coupon);
                });
            });

        if (bogoEligible) {
            this.#dialog.querySelector("#bogo-btn")!
                .addEventListener("click", () => this.#showBogoPicker());
        }
    }

    #showBogoPicker(): void {
        const grouped = this.#getGroupedEligible();
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
                BogoCoupon.fromInventory(eligible[idx].product).then((coupon) => {
                    this.#coupon = coupon;
                    this.#showFinalReceipt(this.#coupon);
                });
            });
        });
    }

    #showFinalReceipt(coupon: Coupon): void {
        
        const subtotal = this.#cart.items.reduce((sum, p) =>
            sum + (Number(p.price) * Number(p.quantityValue)), 0);

        const total = coupon.apply(subtotal);
        const discount = subtotal - total;

        const itemRows = this.#cart.items.map((item) =>
            `<li><strong>${item.name}</strong> — ${Number(item.quantityValue)} ${item.quantity} — $${(Number(item.price) * Number(item.quantityValue)).toFixed(2)}</li>`
        ).join("");

        const couponLine = `<p>Coupon: ${coupon.name} — -$${discount.toFixed(2)}</p>`;

        this.#dialog.innerHTML = `
            <h3>Receipt</h3>
            <ul>${itemRows}</ul>
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            ${couponLine}
            <p><strong>Total: $${total.toFixed(2)}</strong></p>
            <button id="confirm-btn">Paid and done</button>
        `;

        this.#dialog.querySelector("#confirm-btn")!
            .addEventListener("click", () => {
                this.#dialog.close();
                document.body.removeChild(this.#dialog);
                this.#cartController.confirmCheckout(coupon);
            });
    }
}