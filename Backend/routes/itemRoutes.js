const express = require("express");
const router = express.Router();
const {
    addItem,
    getItems,
    updateItem,
    deleteItem,
    searchItemByName
} = require("../controllers/itemController");
const AuditLog = require('../models/AuditLog');

// Main CRUD routes
router.post("/", addItem);
router.get("/", getItems);
router.get("/search", searchItemByName);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

// ✅ Return only today's logs
router.get("/logs", async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const logs = await AuditLog.find({
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        }).sort({ timestamp: -1 });

        res.json(logs);
    } catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).json({ error: "Failed to fetch audit logs" });
    }
});

module.exports = router;
