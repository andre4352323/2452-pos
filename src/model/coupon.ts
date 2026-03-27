/**
 * Interface representing a discount coupon that can be applied to a cart during checkout.
 * Each coupon has a name, description, and an apply method that takes a subtotal and returns
 * the discounted total
 */


export default interface Coupon {

    readonly name: string;
    readonly description: string;
    // applies the coupon to a subtotal and returns the discounted total
    
    apply(subtotal: number): number;
}