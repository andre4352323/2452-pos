---
title: Domain model for my cool project!
author: Andre Lisandro Cruz Ibarra (cruzibal@myumanitoba.ca)
date: Winter 2026
---

# Flows of Interaction

## POS screen

this is the very first thing you will se when you start my app

:::mermaid
flowchart

    subgraph ADDING_PRODUCTS

        start[[Products Screen]]

        start == Press checkout button ==> validCart{Has at least one product}
        start == Press product image to view it ==> productView
        productView[Product Information] == Press add to cart button ==> updateCart[Update Cart]
        updateCart -. updated cart .-> start
        productView == Go Back button ==> start
    
        validCart -. Print receipt .-> complete
        validCart -. No .-> start
       
        complete[[Order complete]]        
    
    end
:::