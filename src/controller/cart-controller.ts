import Product from "../model/product.ts";
import Cart from "../model/cart.ts";
import Receipt from "../model/receipt.ts";
import CartView from "../view/cart-view.ts";
import ReceiptController from "./receipt-controller.ts";
import type Cashier from "../model/cashier.ts";
import type Coupon from "../model/coupon.ts";
import type { ProductType } from "../model/product-type.ts";
import type { ProductQuantity } from "../model/product-quantity.ts";

/**
 * Manages the active cart for a signed-in cashier, coordinating between
 * {@link Cart}, {@link CartView}, and {@link ReceiptController}.
 */
export default class CartController {

    #cart: Cart;
    #cashier: Cashier;
    #cartView?: CartView;

    /**
     * Creates the cart controller and its {@link CartView} for the given cashier
     * If the cart already has items, the view is shown and notified immediately
     *
     * @param cart the active cart for this cashier, loaded or created from the db
     * @param cashier the signed-in cashier who owns this cart
     */
    constructor(cart: Cart, cashier: Cashier) {

        this.#cart = cart;
        this.#cashier = cashier;

        this.#cartView = new CartView(this.#cart, this);

        if (this.#cart.items.length > 0) {

            this.#cartView.notify();
            this.#cartView.show();

        } else {
            this.#cartView.hide();
        }
    }

    /**
     * Opens the {@link ReceiptView} to begin the checkout flow
     * The actual checkout is only confirmed when the cashier selects a coupon
     */
    checkout(): void {

        new ReceiptController(this.#cart, this);
    }

    /**
     * Creates a new {@link Product} entry with the given quantity and adds it to
     * the active cart, then shows the {@link CartView}. Throws
     * {@link InvalidProductQuantityException} if quantityValue is less than 1
     * the calling view is responsible for catching it
     *
     * @param product the catalog product to add.
     * @param quantityValue the quantity entered by the cashier, must be at least 1
     */
    async addToCart(product: Product, quantityValue: number): Promise<void> {

        const entry = Product.withQuantity(
            product.name as ProductType,
            product.price,
            product.quantity as ProductQuantity,
            quantityValue
        );

        await this.#cart.addToCart(entry);
        this.#cartView!.show();
    }

    /**
     * Ask domain model to persit the given receipt and coupon, clears the cart view, and creates
     * a fresh cart for the cashier to start the next transaction
     *
     * @param receipt the already-constructed receipt for this transaction
     * @param coupon the coupon applied to this transaction. Must not be {@code null}
     */
    async confirmCheckout(receipt: Receipt, coupon: Coupon): Promise<void> {

        await this.#cart.checkout(receipt, coupon);

        this.#cartView!.clearItems();
        this.#cartView!.hide();

        // controller is responsible for creating the new cart instance
        const nextCart = await Cart.createForCashier(this.#cashier.username);
        this.#cart = nextCart;
        nextCart.registerListener(this.#cartView!);
        this.#cartView!.updateCart(nextCart);
    }
}