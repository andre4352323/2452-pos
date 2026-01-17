---
title: Domain model for my cool project!
author: me (me@myumanitoba.ca)
date: Winter 2026
---

# Domain model

:::mermaid

    classDiagram

        class Product{
            <<record>>

            -string name
            -number price

            +getPrice() number
            +getName() price
            
    
        }

        note for Product "Invariant properties:
        * name.length >= 1
        * price >= 1"

    
        class Receipt {
            -Cart cart

            +print() void
            
        }

        class Cart {
            -List~Product~ items

            +addToCart(Product p) void
            +removeFromCart(Product p) void
            +checkout() Receipt
        
        }

        Cart --o Product
        Cart --* Receipt

:::


