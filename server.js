
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve website files
app.use(express.static(__dirname));

// Temporary order storage
const orders = [];
let nextOrderId = 1;

// Homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Server health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Milky Taste Eatery server is running"
    });
});

// Get all orders
app.get("/api/admin/orders", (req, res) => {
    const adminKey = req.headers["x-admin-api-key"];

    if (!process.env.ADMIN_API_KEY ||
        adminKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({
            error: "That admin key was not accepted."
        });
    }

    res.json({
        success: true,
        count: orders.length,
        orders: orders
    });
});

// Create a customer order
app.post("/api/orders", (req, res) => {
    const {
        customerName,
        name,
        email,
        phone,
        items,
        total,
        address
    } = req.body;

    const finalName = customerName || name;

    if (!finalName || !phone) {
        return res.status(400).json({
            success: false,
            message: "Customer name and phone number are required."
        });
    }

    const order = {
        id: nextOrderId++,
        customerName: finalName,
        email: email || "",
        phone: phone,
        items: items || [],
        total: Number(total) || 0,
        address: address || "",
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.status(201).json({
        success: true,
        message: "Order received successfully!",
        order: order
    });
});

// Update order status
app.patch("/api/orders/:id/status", (req, res) => {
    const order = orders.find(
        item => item.id === Number(req.params.id)
    );

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found."
        });
    }

    const allowedStatuses = [
        "Pending",
        "Preparing",
        "Ready",
        "Delivered",
        "Cancelled"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order status."
        });
    }

    order.status = status;

    res.json({
        success: true,
        message: "Order status updated.",
        order: order
    });
});

// Handle unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(
        `Milky Taste Eatery running at http://localhost:${PORT}`
    );
});
