import { expect, test, describe, vi, beforeEach } from 'vitest';
import Product from '../src/model/product';
import Receipt from '../src/model/receipt';
import Cart from '../src/model/cart';
import Cashier from '../src/model/cashier';
import BogoCoupon from '../src/model/bogo-coupon';
import TotalDiscountCoupon from '../src/model/total-discount-coupon';
import type Listener from '../src/model/listeners';


//required so that the test runs more than once using mock
 
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

        const p = new Product('POPCORN', 5.0, 'UNITS', 2);
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
 
    test('saveProduct sets id from db', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ id: 42 }]));
        const p = new Product('POPCORN', 5.0, 'UNITS', 1);
        await Product.saveProduct(p, 1);
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
});
 
describe('Cashier', () => {
 
    test('valid cashier is created', () => {

        const c = new Cashier('va', 'validpass1');
        expect(c.username).toBe('va');
    });
 
    test('short username throws', () => {

        expect(() => new Cashier('', 'validpass1')).toThrow('Cashier username should be at least 1 character long');
    });
 
    test('short password throws', () => {

        expect(() => new Cashier('validuser1', '')).toThrow('Cashier password should be at least 1 character long');
    });
 
    test('findCashier returns null when not found', async () => {

        mockQuery.mockResolvedValueOnce(rows([]));
        const result = await Cashier.findCashier('cashier_one', 'wrongpass');
        expect(result).toBeNull();
    });
 
    test('findCashier returns cashier when credentials match', async () => {

        mockQuery
            .mockResolvedValueOnce(rows([{ username: 'cashier_one', password: 'password_one' }]))
            .mockResolvedValueOnce(rows([]));
        const cashier = await Cashier.findCashier('cashier_one', 'password_one');
        expect(cashier?.username).toBe('cashier_one');
    });
 
    test('usernameExists returns true/false correctly', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ username: 'cashier_one' }]));
        expect(await Cashier.usernameExists('cashier_one')).toBe(true);
 
        mockQuery.mockResolvedValueOnce(rows([]));
        expect(await Cashier.usernameExists('nobody')).toBe(false);
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
        const product = new Product('SODA', 3.0, 'UNITS', 1);
        const coupon = await BogoCoupon.fromInventory(product);
        expect(coupon.apply(10)).toBeCloseTo(7);
    });
});
 
describe('Receipt', () => {
 
    test('totalCost sums price x quantity with no coupon', () => {

        const p1 = new Product('POPCORN', 4.0, 'UNITS', 2); 
        const p2 = new Product('SODA', 2.5, 'UNITS', 1);  
        const receipt = new Receipt([p1, p2], 'cashier_one', 1, noCoupon);
        expect(receipt.totalCost()).toBeCloseTo(10.5);
    });
 
    test('totalCost applies coupon discount', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ name: '10% Off', description: 'Ten percent off' }]));
        const coupon = await TotalDiscountCoupon.fromInventory();
        const receipt = new Receipt([new Product('POPCORN', 10.0, 'UNITS', 1)], 'cashier_one', 1, coupon);
        expect(receipt.totalCost()).toBeCloseTo(9.0);
    });
 
    test('empty cart receipt totals zero', () => {

        const receipt = new Receipt([], 'cashier_one', 1, noCoupon);
        expect(receipt.totalCost()).toBe(0);
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
        await cart.addToCart(new Product('SODA', 2.5, 'UNITS', 1), 1);
 
        expect(cart.items).toHaveLength(1);
        expect(notified).toBe(true);
    });
 
    test('checkout returns receipt with correct total', async () => {

        mockQuery.mockResolvedValueOnce(rows([{ id: 1 }]));
        const cart = await Cart.createForCashier('cashier_one');
 
        mockQuery.mockResolvedValueOnce(rows([{ id: 10 }]));
        await cart.addToCart(new Product('POPCORN', 5.0, 'UNITS', 1), 2); 
 
        mockQuery
            .mockResolvedValueOnce(rows([]))  
            .mockResolvedValueOnce(rows([]))  
 
        const receipt = await cart.checkout(noCoupon);
        expect(receipt).toBeInstanceOf(Receipt);
        expect(receipt.totalCost()).toBeCloseTo(10.0);
    });
 
    test('loadOrCreateForCashier creates new cart when none exists', async () => {

        mockQuery
            .mockResolvedValueOnce(rows([]))          
            .mockResolvedValueOnce(rows([{ id: 5 }])); 
        const cart = await Cart.loadOrCreateForCashier('cashier_one');
        expect(cart.id).toBe(5);
    });
});