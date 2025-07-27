const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public (for simplicity, typically restricted to authenticated users)
router.post("/", async (req, res) => {
  try {
    const { cartItems, shippingAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No items in cart to place an order." });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country) {
        return res.status(400).json({ message: "Shipping information is incomplete." });
    }

    // You might want to do more validation here, e.g., check if product IDs are valid
    // and if prices match current database prices to prevent client-side manipulation.

    const newOrder = new Order({
      orderItems: cartItems.map(item => ({
        productId: item._id, // Renamed from _id to productId for clarity in schema
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress,
      totalAmount,
      // user: req.user._id // In a real app, if authenticated
    });

    const createdOrder = await newOrder.save();
    res.status(201).json({
        message: "Order placed successfully!",
        orderId: createdOrder._id,
        order: createdOrder
    });
  } catch (error) {
    console.error("Error placing order:", error);
    // Handle validation errors (e.g., from Mongoose required fields)
    if (error.name === 'ValidationError') {
        let errors = {};
        Object.keys(error.errors).forEach((key) => {
            errors[key] = error.errors[key].message;
        });
        return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Get all orders (for admin or user's own orders)
// @route   GET /api/orders
// @access  Public (for simplicity, typically restricted)
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server Error" });
    }
});


module.exports = router;