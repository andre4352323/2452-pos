import type Cart from "../model/cart.ts";
import type Product from "../model/product.ts";
import Receipt from "../model/receipt.ts";
import BogoCoupon from "../model/bogo-coupon.ts";
import TotalDiscountCoupon from "../model/total-discount-coupon.ts";
import type Coupon from "../model/coupon.ts";
import type CartController from "./cart-controller.ts";
import ReceiptView from "../view/receipt-view.ts";

/**
 * Manages the checkout flow, coordinating between {@link ReceiptView},
 * {@link BogoCoupon}, {@link TotalDiscountCoupon}, {@link Receipt},
 * and {@link CartController}.
 */
export default class ReceiptController {

    #cart: Cart;
    #cartController: CartController;
    #receiptView: ReceiptView;

    /**
     * Creates the receipt controller and immediately opens the {@link ReceiptView}
     * for the given cart
     *
     * @param cart the cart being checked out
     * @param cartController the active cart controller, used to confirm checkout
     */
    constructor(cart: Cart, cartController: CartController) {

        this.#cart = cart;
        this.#cartController = cartController;
        this.#receiptView = new ReceiptView(cart, this);
    }

    /**
     * Creates a {@link TotalDiscountCoupon} and a {@link Receipt}, then passes
     * the receipt to the view to render the final receipt screen
     * Side-effect: triggers {@link ReceiptView} to render the final receipt
     */
    selectTotalDiscount(): void {

        TotalDiscountCoupon.fromInventory().then((coupon) => {
            const receipt = this.#buildReceipt(coupon);
            this.#receiptView.showFinalReceipt(receipt);
        });
    }

    /**
     * Creates a {@link BogoCoupon} for the selected product and a {@link Receipt},
     * then passes the receipt to the view to render the final receipt screen
     * Side-effect: triggers {@link ReceiptView} to render the final receipt
     *
     * @param selectedProduct the product the cashier chose to get one free
     */
    selectBogo(selectedProduct: Product): void {

        BogoCoupon.fromInventory(selectedProduct).then((coupon) => {
            const receipt = this.#buildReceipt(coupon);
            this.#receiptView.showFinalReceipt(receipt);
        });
    }

    /**
     * Delegates the confirmed receipt to {@link CartController} to persist
     * and complete the transaction
     *
     * @param receipt the receipt the cashier confirmed. Must not be {@code null}
     */
    confirmCheckout(receipt: Receipt): void {

        this.#cartController.confirmCheckout(receipt, receipt.coupon);
    }

    /**
     * Constructs a {@link Receipt} for the current cart with the given coupon
     *
     * @param coupon the coupon to apply to the receipt
     * @return a new Receipt instance for this transaction
     */
    #buildReceipt(coupon: Coupon): Receipt {

        return new Receipt(
            [...this.#cart.items],
            this.#cart.cashierUsername,
            this.#cart.id,
            coupon
        );
    }
}