const AuditLog = require('../models/AuditLog');
const mongoose = require("mongoose");
const Item = require("../models/Item");


// CREATE
const addItem = async (req, res) => {
    try {
        const { name, price, quantity, expiryDate, category } = req.body;
        if (!name || !price || !quantity || !expiryDate || !category) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const validCategories = ["fruit", "vegetable"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: "Category must be either 'fruit' or 'vegetable'." });
        }

        const newItem = new Item(req.body);
        await newItem.save();

        // 🔥 Log  action
        await AuditLog.create({
            action: 'ADD_ITEM',
            itemId: newItem._id,
            itemName: newItem.name,
            details: { addedData: req.body }
        });

        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// READ
const getItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// SEARCH
const searchItemByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: "Item name is required" });

        const item = await Item.findOne({ name: new RegExp(name, "i") });
        if (!item) return res.status(404).json({ error: "Item not found" });

        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const { price, quantity, name, expiryDate, category } = req.body;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: "Invalid item ID" });
        }

        const updatedItem = await Item.findByIdAndUpdate(
            itemId,
            { price, quantity, name, expiryDate, category },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        // 🔥 Log  action
        await AuditLog.create({
            action: 'UPDATE_ITEM',
            itemId: updatedItem._id,
            itemName: updatedItem.name,
            details: { updatedFields: req.body }
        });

        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid item ID" });
        }

        const item = await Item.findByIdAndDelete(id);
        if (!item) return res.status(404).json({ error: "Item not found" });

        // 🔥 Log  action
        await AuditLog.create({
            action: 'DELETE_ITEM',
            itemId: item._id,
            itemName: item.name,
            details: { deletedData: item }
        });

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addItem,
    getItems,
    updateItem,
    deleteItem,
    searchItemByName,
};
