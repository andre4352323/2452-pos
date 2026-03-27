/**
 * Interface representing a listener that can be notified of changes to the cart
 */
export default interface Listener {

    notify(): void;
}