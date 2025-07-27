
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Path to your Product model

// Load environment variables
dotenv.config();

// Connect to the database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const products = [
  {
    name: "Luxury Leather Wallet",
    price: 75.00,
    description: "Hand-crafted from genuine leather with multiple card slots and a coin pouch. Durable and stylish.",
    image: "http://localhost:5000/images/wallet.jpg"
  },
  {
    name: "Ergonomic Office Chair",
    price: 250.00,
    description: "Adjustable chair with lumbar support for maximum comfort during long working hours.",
    image: "http://localhost:5000/images/chair.png"
  },
  {
    name: "Bluetooth Speaker",
    price: 49.99,
    description: "Portable wireless speaker with deep bass and clear highs. Up to 12 hours of playtime.",
    image: "http://localhost:5000/images/speaker.webp"
  },
  {
    name: "Designer Coffee Mug",
    price: 15.99,
    description: "High-quality ceramic coffee mug with an aesthetic design. Dishwasher and microwave safe.",
    image: "http://localhost:5000/images/coffee_mug.jpeg"
  },
  {
    name: "Smart Fitness Watch",
    price: 129.99,
    description: "Track your health and fitness goals with heart rate monitoring and GPS.",
    image: "http://localhost:5000/images/watch.jpeg"
  },
  {
    name: "USB-C Fast Charger",
    price: 29.99,
    description: "Compact and powerful 65W charger for laptops, tablets, and smartphones.",
    image: "http://localhost:5000/images/charger.jpg"
  }
];

const importData = async () => {
  try {
    await connectDB(); // Ensure database is connected

    await Product.deleteMany(); // Optional: Clear existing products before importing
    console.log('Existing products cleared!');

    await Product.insertMany(products); // Insert all products from the array
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB(); // Ensure database is connected
    await Product.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

// Check command-line arguments to decide action
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}