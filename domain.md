---
title: Domain model for my cool project!
author: Andre Lisandro Cruz Ibarra (cruzibal@myumanitoba.ca)
date: Winter 2026
---

# Domain model

:::mermaid

    classDiagram

    
        class Cashier{

            -~string userName
            -string password
            
            +userName() string
        }

        note for Cashier "Invariant properties:
        * username.length >=  1
        * password.lenght >= 1"

        Cashier "*" --o "1" Receipt
        
        class Product{

            -?number id
            -ProductType name
            -number price
            -number quantityValue?
            -ProductQuantity quantity
            -Cart cart
            -Receipt receipt
        
            +price() number
            +name() ProductType  
            +quantity() ProductQuantity 
            +quantityValute() number
            +id() number
        }

        Product "1" o--* "+" ProductType
        Product "1" o--* "+" ProductQuantity
        Product "1" *--o "*" Cart
        Product "1" --o "1" Receipt
        
        note for Product "Invariant properties:
        * price > 0.0
        * quantity value >= 1
        * no need to check for null quantity and name due to typescript preventing it
        * id is for ddl purposes to differentiate other instances of the same name in a cart"

        class ProductQuantity{
            <<enumeration>>

            UNITS,
            GR
        }
        
        class ProductType {
            <<enumeration>>

            POPCORN,
            SODA,
            SUGAR
        }

    
        class Receipt {

            -Array~Product~ products
            -Temporal time
            -string cashierUsername
            -Coupon coupon
            -~number cartId
        
            +totalCost() number
            +time() Temporal
            +products () Array~Product~
            
        }

        Receipt --o Coupon

        class Cart {

            -number id
            -Array~Product~ items
            -Array~Listeners~ listener
            -string cashierUsername
            -?Receipt receipt
            -?Coupon coupon
            
            +addToCart(Product p) void
            +checkout(Coupon c) Receipt
            +items() Array~Product~
            +registerListeners(Listener l) void
            +id() number
            +receipt() Receipt | undefined
            +coupon() Coupon | undefined
        }

    
        note for Cart "Invariant properties:
        *loop items, Product.price > 0.0 in items."

        Cart --* Receipt 
        Cart --* Coupon
        
        class Coupon{
            <<interface>>
            
            +apply(Cart c) number
        }

        class BogoCoupon{

            + string name {readonly}
            -?Product product
            +string description {readonly}

            +apply(number n) number
            +selectedProduct() Product
            
        }

        BogoCoupon --o Product

        note for BOGO "Invariant properties:
        * name.length >= 5
        * description.length >= 10
        * product must not be null before apply() is called
        * product must appear 2 or more times in the cart"

        Coupon <|.. BOGO

        class TotalDiscount{

            -string name  {readonly}
            -string description {readonly}

            +apply(number n) number

        }

        note for TotalDiscount "Invariant properties:
        * name.length >= 5
        * description.length >= 10"

        Coupon <|.. TotalDiscount

        
  
:::

# Domain Model Changes
 
## Cashier
- Invariants relaxed from `>= 10` to `>= 1` for username and password
- Removed `Array<Receipt>` — cashier does not hold receipts, Receipt references cashier by username
 
## Product
- Added `Receipt` reference for DDL bidirectional navigation
- `quantityValue` is no longer optional
 
## Receipt
- Replaced `Cart` object with `cartId: number` and `Cashier` object with `cashierUsername: string` — references by value not by object
- Added `Coupon` field since receipt needs it to calculate total
 
## Cart
- `receipt` and `coupon` are now optional (`?`) — only set after checkout
- Removed `clearCart()` and `applyCoupon()` — not in the implementation
- `checkout()` now takes a `Coupon` parameter
 
## Coupon / BogoCoupon / TotalDiscountCoupon
- `apply()` now takes a `number` (subtotal) instead of the whole `Cart`
- Classes renamed from `BOGO` and `TotalDiscount` to match actual class names in code
 