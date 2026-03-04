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

    subgraph LOGIN_SCREEN

        start[[Login Screen]]

        start == Enter user name and password ==> Exist
        Exist{Valid Credentials} -. Invalid credentials .-> start
        Exist -. Login succesfull .-> complete[[Go to products screen]]
        start == Press sign up button ==> signUp[[Go to sign up screen]]


    end

:::

:::mermaid
flowchart
    
    subgraph SIGN_UP_SCREEN

        start[[Sign up screen]]
        start == enter new username and password ==> valid
        valid{user name already exists} -. no .-> complete
        valid -. yes .-> start
        complete[[Go to login screen]]

    end


:::

:::mermaid
flowchart

    subgraph ADDING_PRODUCTS

        start[[Products Screen]]

        start == Press product image ==> productView[View Product Information]

        productView == Enter how much to buy ==> viewUpdated[Product view updated]
        viewUpdated == Close/Go back button ==> start
        viewUpdated == Enter how much to buy ==> viewUpdated
        viewUpdated == press add to cart button ==> updateCart{Enough stock and quantity is not 0?}
        updateCart -. added to cart and view updated .-> start
        updateCart -. not enough stock .-> viewUpdated
        
        productView == Close/Go Back button ==> start
        
        start == Press checkout button<br/>(only visible if cart has items) ==> complete[[Go to checkout screen]]
        complete -. cart cleared .-> start
    end
:::

:::mermaid
flowchart

    subgraph CHECKOUT_SCREEN
        
        start[[Checkout screen]] == press 2x1 coupon button==> valid
        valid{does the cart has an item that appears twice or more}
        valid -. yes .- select[Choose item to apply coupon]
        valid -. please select other coupon .- start
        select == item chosen ==> update{update total cost of the cart} 
        update -. show receipt with total cost  .-> pay[Pay cart]
        start == press 10% discount coupon ==> update

        pay == press pay button ==> complete[[Go to products screen]]
    
    end
:::

