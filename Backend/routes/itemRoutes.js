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

// ✅ IMPORTANT: Specific routes MUST come before parameterized routes (:id)

// ✅ GET search - MUST be before /:id route
router.get("/search", searchItemByName);

// ✅ GET today's logs - MUST be before /:id route
router.get("/logs", async (req, res) => {
    try {
        console.log('📊 Fetching today\'s audit logs...');

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const logs = await AuditLog.find({
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        }).sort({ timestamp: -1 });

        console.log(`✅ Retrieved ${logs.length} audit logs for today`);
        res.status(200).json(logs);
    } catch (err) {
        console.error("❌ Error fetching logs:", err);
        res.status(500).json({
            error: "Failed to fetch audit logs",
            message: err.message
        });
    }
});

// ✅ GET all logs (for debugging/admin) - MUST be before /:id route
router.get("/logs/all", async (req, res) => {
    try {
        console.log('📊 Fetching all audit logs...');

        const logs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(100); // Limit to prevent huge responses

        console.log(`✅ Retrieved ${logs.length} total audit logs`);
        res.status(200).json(logs);
    } catch (err) {
        console.error("❌ Error fetching all logs:", err);
        res.status(500).json({
            error: "Failed to fetch all audit logs",
            message: err.message
        });
    }
});

// ✅ Main CRUD routes
router.post("/", addItem);           // CREATE
router.get("/", getItems);           // READ all
router.put("/:id", updateItem);      // UPDATE
router.delete("/:id", deleteItem);   // DELETE

// ✅ GET single item by ID - MUST come after specific routes
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📖 Fetching single item:', id);

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Invalid item ID format',
                received: id
            });
        }

        const Item = require('../models/Item');
        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        console.log('✅ Item found:', item.name);
        res.status(200).json(item);
    } catch (error) {
        console.error('❌ GET /api/items/:id error:', error);
        res.status(500).json({
            error: 'Failed to fetch item',
            message: error.message
        });
    }
});

module.exports = router;