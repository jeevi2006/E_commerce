const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { name, price, description, image } = req.body;

    const product = new Product({
      name,
      price,
      description,
      image,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.remove();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;