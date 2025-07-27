document.addEventListener("DOMContentLoaded", () => {
  const productListDiv = document.getElementById("product-list");
  const cartItemsDiv = document.getElementById("cart-items");
  const cartItemCountSpan = document.getElementById("cart-item-count");
  const cartTotalAmountSpan = document.getElementById("cart-total-amount");
  const checkoutForm = document.getElementById("checkout-form");

  // Global array to hold cart items
  let cart = []; // Each item in cart will be { _id: productId, name: productName, price: productPrice, quantity: 1 }

  // Function to save cart to localStorage (for persistence)
  const saveCart = () => {
    localStorage.setItem('miniEcommerceCart', JSON.stringify(cart));
  };

  // Function to load cart from localStorage
  const loadCart = () => {
    const savedCart = localStorage.getItem('miniEcommerceCart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartUI(); // Update UI after loading
    }
  };


  // Function to update the cart display and total
  const updateCartUI = () => {
    cartItemsDiv.innerHTML = ""; // Clear existing cart items

    if (cart.length === 0) {
      cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
      cartItemCountSpan.textContent = "0";
      cartTotalAmountSpan.textContent = "0.00";
      return;
    }

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;

      const cartItemDiv = document.createElement("div");
      cartItemDiv.classList.add("cart-item");
      cartItemDiv.innerHTML = `
        <span>${item.name} (x${item.quantity})</span>
        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        <button class="remove-from-cart-btn" data-id="${item._id}">Remove</button>
      `;
      cartItemsDiv.appendChild(cartItemDiv);
    });

    cartItemCountSpan.textContent = totalItems;
    cartTotalAmountSpan.textContent = totalPrice.toFixed(2);
    saveCart(); // Save cart whenever UI is updated
  };

  // Function to add a product to the cart
  const addToCart = (product) => {
    const existingItemIndex = cart.findIndex(item => item._id === product._id);

    if (existingItemIndex > -1) {
      // If item already exists, just increase quantity
      cart[existingItemIndex].quantity += 1;
    } else {
      // If new item, add to cart with quantity 1
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }
    updateCartUI();
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId) => {
    const existingItemIndex = cart.findIndex(item => item._id === productId);

    if (existingItemIndex > -1) {
      if (cart[existingItemIndex].quantity > 1) {
        cart[existingItemIndex].quantity -= 1; // Decrease quantity
      } else {
        cart.splice(existingItemIndex, 1); // Remove item completely if quantity is 1
      }
    }
    updateCartUI();
  };


  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();

      if (products.length === 0) {
        productListDiv.innerHTML = "<p>No products found. Please add some from the backend.</p>";
        return;
      }

      productListDiv.innerHTML = ""; // Clear "Loading products..."
      products.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product-item");
        productDiv.innerHTML = `
          <h3>${product.name}</h3>
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <p class="product-description">${product.description}</p>
          <p class="product-price">₹${product.price.toFixed(2)}</p>
          <button class="add-to-cart-btn" data-product-id="${product._id}"
                  data-product-name="${product.name}"
                  data-product-price="${product.price}">Add to Cart</button>
          <hr>
        `;
        productListDiv.appendChild(productDiv);
      });

      // Attach event listeners to newly created "Add to Cart" buttons
      document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", (event) => {
          const productId = event.target.dataset.productId;
          const productName = event.target.dataset.productName;
          const productPrice = parseFloat(event.target.dataset.productPrice);
          addToCart({ _id: productId, name: productName, price: productPrice });
        });
      });

    } catch (error) {
      console.error("Error fetching products:", error);
      productListDiv.innerHTML = `<p style="color: red;">Failed to load products. Server might be down or there's a network issue. ${error.message}</p>`;
    }
  };

  // Event listener for removing items from cart
  cartItemsDiv.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-from-cart-btn')) {
      const productId = event.target.dataset.id;
      removeFromCart(productId);
    }
  });


  // Handle checkout form submission
  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (cart.length === 0) {
      alert("Your cart is empty. Please add items before placing an order.");
      return;
    }

    const shippingAddress = {
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      zipCode: document.getElementById("zipCode").value,
      country: document.getElementById("country").value,
    };

    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country) {
      alert("Please fill in all shipping information fields.");
      return;
    }

    try {
      const orderData = {
        cartItems: cart,
        shippingAddress: shippingAddress,
        totalAmount: parseFloat(cartTotalAmountSpan.textContent) // Get current total from UI
      };

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert("Order placed successfully! Order ID: " + result.orderId);

      // Clear the cart and update UI after successful order
      cart = [];
      saveCart(); // Clear local storage cart
      updateCartUI();
      checkoutForm.reset(); // Clear form fields
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order: " + error.message);
    }
  });

  // Initial load: Fetch products and load cart from local storage
  fetchProducts();
  loadCart();
});