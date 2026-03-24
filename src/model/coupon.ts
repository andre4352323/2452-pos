export default interface Coupon {
    readonly name: string;
    readonly description: string;
    // Applies the coupon to a subtotal and returns the discounted total.
    apply(subtotal: number): number;
}