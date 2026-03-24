import Product from "../model/product";
import Cart from "../model/cart.ts";
import CartView from "../view/cart-view.ts";
import ReceiptView from "../view/receipt-view.ts";
import type Cashier from "../model/cashier.ts";
import type Coupon from "../model/coupon.ts";

export default class CartController {

    #cart: Cart;
    #cashier: Cashier;
    #cartView?: CartView;
    #receiptView?: ReceiptView;

    constructor(cart: Cart, cashier: Cashier) {
        this.#cart = cart;
        this.#cashier = cashier;

        // Always create the CartView once here so there is only ever one instance.
        // If the cart has items, render and show them immediately.
        // If empty, create it hidden so it's ready when addToCart is called.
        this.#cartView = new CartView(this.#cart, this);

        if (this.#cart.items.length > 0) {
            this.#cartView.notify();
            this.#cartView.show();
        } else {
            this.#cartView.hide();
        }
    }

   checkout(): void {

        // Pass the cart items and cart itself to ReceiptView for coupon selection.
        // The actual DB checkout happens only after the cashier confirms.
        new ReceiptView(this.#cart, this);

    }

    addToCart(product: Product, quantityValue: number): void {

        this.#cartView!.show();
        // addToCart is now async — handle the promise.
        this.#cart.addToCart(product, quantityValue).catch((e) => {
            console.log("Add to cart error: " + e);
        });
    }

    confirmCheckout(coupon: Coupon): void {
        
        this.#cart.checkout(coupon).then(() => {
            // Explicitly clear the cart view list before switching to new cart.
            this.#cartView!.clearItems();
            this.#cartView!.hide();

            Cart.createForCashier(this.#cashier.username).then((newCart) => {
                this.#cart = newCart;
                newCart.registerListener(this.#cartView!);
                this.#cartView!.updateCart(newCart);
            });
        }).catch((e) => console.log("Checkout error: " + e));
    }
}