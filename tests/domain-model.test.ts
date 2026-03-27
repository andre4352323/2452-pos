import { expect, test, describe, vi, beforeEach } from 'vitest';
import Product from '../src/model/product';
import Receipt from '../src/model/receipt';
import Cart from '../src/model/cart';
import Cashier from '../src/model/cashier';
import BogoCoupon from '../src/model/bogo-coupon';
import TotalDiscountCoupon from '../src/model/total-discount-coupon';
import type Listener from '../src/model/listeners';

// required so that the test runs more than once using mock

const mockQuery = vi.fn();

vi.mock('../src/model/connection', () => ({
    default: () => ({ query: mockQuery }),
}));

function rows<T>(data: T[]) {
    return { rows: data };
}

beforeEach(() => mockQuery.mockReset());

const noCoupon = { name: 'None', description: '', apply: (s: number) => s };

describe('Product', () => {

    test('valid product is created correctly', () => {

        const p = Product.withQuantity('POPCORN', 5.0, 'UNITS', 2);
        expect(p.name).toBe('POPCORN');
        expect(p.price).toBe(5.0);
        expect(p.quantityValue).toBe(2);
    });

    test('empty name throws', () => {

        expect(() => new Product('' as any, 5.0, 'UNITS')).toThrow('Product name should be at least 1 character long');
    });

    test('zero or negative price throws', () => {

        expect(() => new Product('SODA', 0, 'UNITS')).toThrow('Product price should be greater than 0.0');
        expect(() => new Product('SODA', -1, 'UNITS')).toThrow('Product price should be greater than 0.0');
    });

    test('saveToCart sets id from db', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ id: 42 }]));
        const p = Product.withQuantity('POPCORN', 5.0, 'UNITS', 1);
        await p.saveToCart(1);
        expect(p.id).toBe(42);
    });

    test('getAllProducts returns mapped products', async () => {

        mockQuery.mockResolvedValueOnce(rows([
            { product_type: 'SODA', product_unit: 'UNITS', product_price: 2.5 },
        ]));
        const products = await Product.getAllProducts();
        expect(products).toHaveLength(1);
        expect(products[0].name).toBe('SODA');
    });

    test('getProductsForCart returns 3 products when 3 rows exist in db', async () => {

        mockQuery.mockResolvedValueOnce(rows([
            { id: 1, name: 'SODA',    price: 2.5, quantity_unit: 'UNITS', quantity_value: 1 },
            { id: 2, name: 'POPCORN', price: 4.0, quantity_unit: 'UNITS', quantity_value: 2 },
            { id: 3, name: 'SUGAR',   price: 1.5, quantity_unit: 'GR', quantity_value: 3 },
        ]));
        const products = await Product.getProductsForCart(1);
        expect(products).toHaveLength(3);
        expect(products[0].name).toBe('SODA');
        expect(products[1].name).toBe('POPCORN');
        expect(products[2].name).toBe('SUGAR');
    });
});

describe('Cashier', () => {

    test('valid cashier is created', () => {

        const c = new Cashier('va', 'validpass1');
        expect(c.username).toBe('va');
    });

    test('short username throws', () => {

        expect(() => new Cashier('', 'validpass1')).toThrow();
    });

    test('short password throws', () => {

        expect(() => new Cashier('validuser1', '')).toThrow();
    });

    test('login throws CashierNotFoundException when not found', async () => {

        mockQuery.mockResolvedValueOnce(rows([]));
        await expect(Cashier.login('cashier_one', 'wrongpass')).rejects.toThrow();
    });

    test('login returns cashier when credentials match', async () => {

        mockQuery
            .mockResolvedValueOnce(rows([{ username: 'cashier_one', password: 'password_one' }]))
            .mockResolvedValueOnce(rows([]));
        const cashier = await Cashier.login('cashier_one', 'password_one');
        expect(cashier.username).toBe('cashier_one');
    });

    test('usernameExists returns true/false correctly', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ username: 'cashier_one' }]));
        expect(await Cashier.usernameExists('cashier_one')).toBe(true);

        mockQuery.mockResolvedValueOnce(rows([]));
        expect(await Cashier.usernameExists('nobody')).toBe(false);
    });

    test('getAllCashiers returns 3 cashiers when 3 rows exist in db', async () => {

        mockQuery.mockResolvedValueOnce(rows([
            { username: 'cashier_one',   password: 'pass1' },
            { username: 'cashier_two',   password: 'pass2' },
            { username: 'cashier_three', password: 'pass3' },
        ]));
        const cashiers = await Cashier.getAllCashiers();
        expect(cashiers).toHaveLength(3);
        expect(cashiers[0].username).toBe('cashier_one');
        expect(cashiers[1].username).toBe('cashier_two');
        expect(cashiers[2].username).toBe('cashier_three');
    });
});

describe('Coupons', () => {

    test('TotalDiscountCoupon applies 10% off', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ name: '10% Off', description: 'Ten percent off' }]));
        const coupon = await TotalDiscountCoupon.fromInventory();
        expect(coupon.apply(100)).toBeCloseTo(90);
    });

    test('BogoCoupon subtracts selected product price', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ name: 'BOGO', description: 'Buy one get one' }]));
        const product = Product.withQuantity('SODA', 3.0, 'UNITS', 1);
        const coupon = await BogoCoupon.fromInventory(product);
        expect(coupon.apply(10)).toBeCloseTo(7);
    });
});

describe('Receipt', () => {

    test('totalCost sums price x quantity with no coupon', () => {

        const p1 = Product.withQuantity('POPCORN', 4.0, 'UNITS', 2);
        const p2 = Product.withQuantity('SODA', 2.5, 'UNITS', 1);
        const receipt = new Receipt([p1, p2], 'cashier_one', 1, noCoupon);
        expect(receipt.totalCost()).toBeCloseTo(10.5);
    });

    test('totalCost applies coupon discount', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ name: '10% Off', description: 'Ten percent off' }]));
        const coupon = await TotalDiscountCoupon.fromInventory();
        const receipt = new Receipt([Product.withQuantity('POPCORN', 10.0, 'UNITS', 1)], 'cashier_one', 1, coupon);
        expect(receipt.totalCost()).toBeCloseTo(9.0);
    });

    test('empty cart receipt totals zero', () => {

        const receipt = new Receipt([], 'cashier_one', 1, noCoupon);
        expect(receipt.totalCost()).toBe(0);
    });

    test('receipt products contains all 3 items passed in', () => {

        const p1 = Product.withQuantity('SODA',    2.5, 'UNITS', 1);
        const p2 = Product.withQuantity('POPCORN', 4.0, 'UNITS', 2);
        const p3 = Product.withQuantity('SUGAR',   1.5, 'GR', 3);
        const receipt = new Receipt([p1, p2, p3], 'cashier_one', 1, noCoupon);
        expect(receipt.products).toHaveLength(3);
    });
});

describe('Cart', () => {

    test('addToCart adds item and notifies listener', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ id: 1 }]));
        const cart = await Cart.createForCashier('cashier_one');

        let notified = false;
        const listener: Listener = { notify: () => { notified = true; } };
        cart.registerListener(listener);

        mockQuery.mockResolvedValueOnce(rows([{ id: 5 }]));
        await cart.addToCart(Product.withQuantity('SODA', 2.5, 'UNITS', 1));

        expect(cart.items).toHaveLength(1);
        expect(notified).toBe(true);
    });

    test('addToCart adds 3 items and cart contains all 3', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ id: 1 }]));
        const cart = await Cart.createForCashier('cashier_one');

        mockQuery.mockResolvedValueOnce(rows([{ id: 1 }]));
        await cart.addToCart(Product.withQuantity('SODA',    2.5, 'UNITS', 1));

        mockQuery.mockResolvedValueOnce(rows([{ id: 2 }]));
        await cart.addToCart(Product.withQuantity('POPCORN', 4.0, 'UNITS', 2));

        mockQuery.mockResolvedValueOnce(rows([{ id: 3 }]));
        await cart.addToCart(Product.withQuantity('SUGAR',   1.5, 'GR', 3));

        expect(cart.items).toHaveLength(3);
        expect(cart.items[0].name).toBe('SODA');
        expect(cart.items[1].name).toBe('POPCORN');
        expect(cart.items[2].name).toBe('SUGAR');
    });

    test('checkout stores receipt and coupon on cart', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ id: 1 }]));
        const cart = await Cart.createForCashier('cashier_one');

        mockQuery.mockResolvedValueOnce(rows([{ id: 10 }]));
        await cart.addToCart(Product.withQuantity('POPCORN', 5.0, 'UNITS', 2));

        const receipt = new Receipt(cart.items, 'cashier_one', cart.id, noCoupon);

        mockQuery
            .mockResolvedValueOnce(rows([]))  // saveReceipt
            .mockResolvedValueOnce(rows([]))  // markCheckedOut

        await cart.checkout(receipt, noCoupon);
        expect(cart.receipt).toBeInstanceOf(Receipt);
        expect(cart.receipt!.totalCost()).toBeCloseTo(10.0);
    });

    test('loadOrCreateForCashier creates new cart when none exists', async () => {

        mockQuery
            .mockResolvedValueOnce(rows([]))
            .mockResolvedValueOnce(rows([{ id: 5 }]));
        const cart = await Cart.loadOrCreateForCashier('cashier_one');
        expect(cart.id).toBe(5);
    });
});