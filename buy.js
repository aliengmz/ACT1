async function fetchAndDisplayCategories() {
    // Define categories and their groups
    const categories = {
        "Cases & Accessories": ["case", "case-accessory", "case-fan"],
        "Storage Devices": ["external-hard-drive", "internal-hard-drive"],
        "Cooling Solutions": ["cpu-cooler", "fan-controller", "thermal-paste"],
        "Input Devices": ["keyboard", "mouse"],
        "Output Devices": ["monitor", "headphones", "speakers"],
        "Core Components": ["cpu", "memory", "motherboard", "power-supply", "video-card"],
        "Network Devices": ["wired-network-card", "wireless-network-card"],
        "Other Devices": ["optical-drive", "os", "webcam", "ups", "sound-card"]
    };

    // Initialize cart total and items
    let cartTotal = 0;
    let cart = [];

    const container = document.getElementById('categories');
    let expandedGroup = null;

    // Add CSS styles for the cart
    const style = document.createElement('style');
    style.textContent = `
        #cartListContainer {
            position: fixed;
            top: 0;
            right: 0;
            width: 300px;
            height: 100vh;
            background: white;
            display: none;
            z-index: 1000;
        }

        #cartHeader {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
        }

        #cartItemsList {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 15px;
            max-height: calc(100vh - 150px);
            overflow-y: auto;
        }

        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #ddd;

        }

        .cart-item-details {
            flex-grow: 1;
            padding-right: 10px;
        }

        .remove-btn {
            padding: 5px 10px;
            background-color: #ff4444;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .remove-btn:hover {
            background-color: #cc0000;
        }

        #cartTotal {
            padding: 15px;
            border-top: 1px solid #ddd;
            font-weight: bold;
            text-align: right;
        }

        .cart-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border-radius: 4px;
            z-index: 1001;
            animation: fadeInOut 3s ease-in-out;
        }

        @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Create cart structure
    const cartHTML = `
        <div id="cartListContainer">
            <div id="cartHeader">
                <h2>Shopping Cart</h2>
                <button id="closeCartButton" style="padding: 5px 10px; cursor: pointer;">✕</button>
            </div>
            <div id="cartItemsList"></div>
            <div id="cartTotal">Total: 0 OMR</div>
            <button onclick="checkout" style="margin: 15px;">Checkout</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cartHTML);

    // Loop through each category and create HTML elements
    for (let [category, groups] of Object.entries(categories)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        const categoryHeader = document.createElement('h1');
        categoryHeader.classList.add('category-name');
        categoryHeader.textContent = category;
        categoryDiv.appendChild(categoryHeader);

        const categoryContent = document.createElement('div');
        categoryContent.classList.add('category-content');
        categoryContent.style.display = 'none';
        categoryDiv.appendChild(categoryContent);

        // Toggle display of category content on header click
        categoryHeader.addEventListener('click', () => {
            categoryContent.style.display = categoryContent.style.display === 'none' ? 'flex' : 'none';
        });

        // Loop through each group within the category
        for (let group of groups) {
            const groupDiv = document.createElement('div');
            groupDiv.classList.add('product-group');
            groupDiv.innerHTML = `<h2 class="group-name">${group.replace(/-/g, ' ').toUpperCase()}</h2>`;

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search products...';
            searchInput.classList.add('search-input');
            searchInput.style.display = 'none';
            groupDiv.appendChild(searchInput);

            const productListDiv = document.createElement('div');
            productListDiv.classList.add('product-list');
            groupDiv.appendChild(productListDiv);

            let isOpen = false;
            groupDiv.querySelector('.group-name').addEventListener('click', async () => {
                // Toggle the display of product list and search input
                if (expandedGroup === groupDiv) {
                    groupDiv.style.width = '';
                    groupDiv.style.margin = '';
                    groupDiv.style.transform = '';
                    groupDiv.style.zIndex = '';
                    Array.from(categoryContent.children).forEach(child => {
                        if (child !== groupDiv) child.style.display = 'flex';
                    });
                    expandedGroup = null;
                } else {
                    groupDiv.style.width = '90%';
                    groupDiv.style.margin = '0 auto';
                    groupDiv.style.transform = 'scale(1.05)';
                    groupDiv.style.zIndex = '10';
                    Array.from(categoryContent.children).forEach(child => {
                        if (child !== groupDiv) child.style.display = 'none';
                    });
                    expandedGroup = groupDiv;
                }

                // Fetch product data if the group is opened
                if (isOpen) {
                    productListDiv.innerHTML = '';
                    searchInput.style.display = 'none';
                } else {
                    try {
                        const response = await fetch(`json/${group}.json`);
                        const data = await response.json();

                        // Loop through each product and create HTML elements
                        data.forEach(product => {
                            const price = Math.round(product.price * 0.38);
                            if (price > 0) {
                                const productDiv = document.createElement('div');
                                productDiv.classList.add('product-item');
                                productDiv.innerHTML = `
                                    <h3>${product.name}</h3>
                                    <p>Price: ${price} OMR</p>
                                    <button class="buy-btn">Add to Cart</button>
                                `;
                                productListDiv.appendChild(productDiv);

                                const buyBtn = productDiv.querySelector('.buy-btn');
                                buyBtn.addEventListener('click', async () => {
                                    // Notification for added product
                                    const notification = document.createElement('div');
                                    notification.classList.add('cart-notification');
                                    notification.textContent = `${product.name} added to cart`;
                                    document.body.appendChild(notification);
                                    setTimeout(() => notification.remove(), 3000);

                                    const cartCount = document.querySelector('.cart-count');
                                    if (cartCount) {
                                        cartCount.textContent = parseInt(cartCount.textContent) + 1;
                                    }

                                    const cartList = document.getElementById('cartItemsList');
                                    const cartItemDiv = document.createElement('div');
                                    cartItemDiv.classList.add('cart-item');
                                    cartItemDiv.innerHTML = `
                                        <div class="cart-item-details">
                                            <p style="margin: 0;">${product.name}</p>
                                            <p style="margin: 0; color: #666;">${price} OMR</p>
                                        </div>
                                        <button class="remove-btn">Remove</button>
                                    `;

                                    cartList.appendChild(cartItemDiv);
                                    addItemToCart({ name: product.name, price: price }); // Add to cart array

                                    cartTotal += price;
                                    document.getElementById('cartTotal').textContent = `Total: ${cartTotal} OMR`;

                                    document.getElementById('cartListContainer').style.display = 'block';

                                    // Save item to database
                                    await saveCartToDatabase();

                                    // Remove item from cart
                                    cartItemDiv.querySelector('.remove-btn').addEventListener('click', () => {
                                        cartItemDiv.remove();
                                        if (cartCount) {
                                            cartCount.textContent = parseInt(cartCount.textContent) - 1;
                                        }
                                        cartTotal -= price;
                                        document.getElementById('cartTotal').textContent = `Total: ${cartTotal} OMR`;
                                        cart = cart.filter(item => item.name !== product.name); // Remove from cart array
                                    });
                                });
                            }
                        });

                        searchInput.style.display = 'inline-block';
                    } catch (error) {
                        console.error(`Failed to load ${group} data:`, error);
                    }
                }
                isOpen = !isOpen;
            });

            // Filter products based on search input
            searchInput.addEventListener('keyup', () => {
                const filter = searchInput.value.toLowerCase();
                const productItems = productListDiv.getElementsByClassName('product-item');
                Array.from(productItems).forEach(item => {
                    const productName = item.querySelector('h3').textContent.toLowerCase();
                    item.style.display = productName.includes(filter) ? '' : 'none';
                });
            });

            categoryContent.appendChild(groupDiv);
        }

        container.appendChild(categoryDiv);
    }
}

// Save cart data to the backend
async function saveCartToDatabase() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    const payload = {
        userId: localStorage.getItem('userId'), // Replace with the actual logged-in user's ID
        cartItems: cart
    };

    console.log('Payload:', payload); // Log the payload for debugging

    const response = await fetch('http://localhost:3000/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for the session
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.error('Failed to save cart to database', await response.text()); // Log the server's error message
    } else {
        console.log('Cart saved successfully');
    }
}

function addItemToCart(product) {     
    // Check if the product already exists in the cart     
    const isProductInCart = cart.some(item => item.name === product.name);      
    if (isProductInCart) {         
        alert(`${product.name} is already in the cart!`);         
        return; // Exit if the item already exists     
    }      
    // Add the product to the cart if it doesn't exist     
    cart.push(product);     
    console.log('Updated cart:', cart); // Debugging     
    updateCartSidebar(); 
}

function updateCartSidebar() {     
    const cartList = document.getElementById('cartItemsList');     
    const cartTotal = document.querySelector('#cartTotal'); // Locate the <strong> tag inside #cartTotal     

    if (!cartList || !cartTotal) {         
        console.error('Cart elements not found in the DOM.');         
        return;     
    }     

    cartList.innerHTML = ''; // Clear current cart list     

    // Loop through each item in the cart and display it in the sidebar     
    cart.forEach((item, index) => {         
        const cartItem = document.createElement('div');         
        cartItem.classList.add('cart-item');         
        cartItem.innerHTML = `             
            <p>${item.name} - ${item.price}</p>             
            <button class="remove-btn" data-index="${index}">Remove</button>         
        `;         
        cartList.appendChild(cartItem);          

        // Add event listener to remove button         
        cartItem.querySelector('.remove-btn').addEventListener('click', (event) => {             
            const index = event.target.getAttribute('data-index');             
            removeItemFromCart(index);         
        });     
    });     

    // Update total price     
    const total = cart.reduce((sum, item) => sum + item.price, 0);     
    cartTotal.textContent = `Total: ${total.toFixed(2)} OMR`; 
}

function removeItemFromCart(index) {
    cart.splice(index, 1);
    updateCartSidebar();
}

document.addEventListener('DOMContentLoaded', function() {
    // Toggle cart display on cart icon click
    document.querySelector('.cart-icon').addEventListener('click', function(event) {
        event.preventDefault();
        const cartSidebar = document.getElementById('cartListContainer');
        cartSidebar.style.display = cartSidebar.style.display === 'none' || cartSidebar.style.display === '' ? 'block' : 'none';
    });

    // Close cart on close button click
    document.getElementById('closeCartButton').addEventListener('click', function() {
        document.getElementById('cartListContainer').style.display = 'none';
    });

    // Checkout button event listener
    // document.querySelector('button[onclick*="checkout"]').addEventListener('click', saveCartToDatabase);

    // Fetch and display categories on page load
    fetchAndDisplayCategories();
});
