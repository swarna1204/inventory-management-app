const AuditLog = require('../models/AuditLog');
const mongoose = require("mongoose");
const Item = require("../models/Item");

// ✅ CREATE - Add Item
const addItem = async (req, res) => {
    try {
        console.log('🔄 Adding new item:', req.body);

        const { name, price, quantity, expiryDate, category } = req.body;

        // ✅ Validation
        if (!name || !price || !quantity || !expiryDate || !category) {
            console.log('❌ Missing required fields:', { name: !!name, price: !!price, quantity: !!quantity, expiryDate: !!expiryDate, category: !!category });
            return res.status(400).json({
                error: "All fields are required",
                received: { name, price, quantity, expiryDate, category }
            });
        }

        const validCategories = ["fruit", "vegetable"];
        const normalizedCategory = category.toLowerCase().trim();

        if (!validCategories.includes(normalizedCategory)) {
            console.log('❌ Invalid category:', category);
            return res.status(400).json({
                error: "Category must be either 'fruit' or 'vegetable'",
                received: category,
                valid: validCategories
            });
        }

        // ✅ Create item with proper data types
        const itemData = {
            name: name.trim(),
            price: parseFloat(price),
            quantity: parseInt(quantity, 10),
            expiryDate: new Date(expiryDate),
            category: normalizedCategory
        };

        console.log('📝 Creating item with clean data:', itemData);

        const newItem = new Item(itemData);
        const savedItem = await newItem.save();

        // ✅ Create audit log
        try {
            await AuditLog.create({
                action: 'ADD_ITEM',
                itemId: savedItem._id,
                itemName: savedItem.name,
                performedBy: 'system',
                details: {
                    addedData: itemData,
                    timestamp: new Date()
                }
            });
            console.log('✅ Audit log created for ADD_ITEM');
        } catch (auditError) {
            console.error('⚠️ Failed to create audit log:', auditError);
            // Don't fail the main operation if audit logging fails
        }

        console.log('✅ Item added successfully:', savedItem.name);
        res.status(201).json(savedItem);

    } catch (err) {
        console.error('❌ Add item error:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: Object.values(err.errors).map(e => e.message)
            });
        }

        res.status(400).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// ✅ READ - Get Items
const getItems = async (req, res) => {
    try {
        console.log('📖 Fetching all items...');
        const items = await Item.find().sort({ createdAt: -1 });
        console.log(`✅ Retrieved ${items.length} items`);
        res.status(200).json(items);
    } catch (err) {
        console.error('❌ Get items error:', err);
        res.status(500).json({
            error: err.message,
            message: 'Failed to fetch items'
        });
    }
};

// ✅ SEARCH - Search Item by Name
const searchItemByName = async (req, res) => {
    try {
        const { name } = req.query;
        console.log('🔍 Searching for item with name:', name);

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Item name is required for search",
                usage: "GET /api/items/search?name=itemname"
            });
        }

        // ✅ Case-insensitive search
        const item = await Item.findOne({
            name: new RegExp(name.trim(), "i")
        });

        if (!item) {
            console.log('❌ Item not found for search term:', name);
            return res.status(404).json({
                error: "Item not found",
                searchTerm: name
            });
        }

        console.log('✅ Item found:', item.name);
        res.status(200).json(item);

    } catch (err) {
        console.error('❌ Search item error:', err);
        res.status(500).json({
            error: err.message,
            message: 'Failed to search for item'
        });
    }
};

// ✅ UPDATE - Update Item
const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const updateData = req.body;

        console.log('🔄 Updating item:', itemId, 'with data:', updateData);

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                error: "Invalid item ID format",
                received: itemId
            });
        }

        // ✅ Get original item for audit logging
        const originalItem = await Item.findById(itemId);
        if (!originalItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        // ✅ Prepare clean update data
        const cleanUpdateData = {};

        if (updateData.name !== undefined) {
            cleanUpdateData.name = updateData.name.trim();
        }
        if (updateData.price !== undefined) {
            cleanUpdateData.price = parseFloat(updateData.price);
        }
        if (updateData.quantity !== undefined) {
            cleanUpdateData.quantity = parseInt(updateData.quantity, 10);
        }
        if (updateData.expiryDate !== undefined) {
            cleanUpdateData.expiryDate = new Date(updateData.expiryDate);
        }
        if (updateData.category !== undefined) {
            const validCategories = ["fruit", "vegetable"];
            const normalizedCategory = updateData.category.toLowerCase().trim();
            if (!validCategories.includes(normalizedCategory)) {
                return res.status(400).json({
                    error: "Category must be either 'fruit' or 'vegetable'",
                    received: updateData.category
                });
            }
            cleanUpdateData.category = normalizedCategory;
        }

        console.log('📝 Clean update data:', cleanUpdateData);

        const updatedItem = await Item.findByIdAndUpdate(
            itemId,
            cleanUpdateData,
            { new: true, runValidators: true }
        );

        // ✅ Create audit log
        try {
            await AuditLog.create({
                action: 'UPDATE_ITEM',
                itemId: updatedItem._id,
                itemName: updatedItem.name,
                performedBy: 'system',
                details: {
                    originalData: originalItem.toObject(),
                    updatedFields: cleanUpdateData,
                    timestamp: new Date()
                }
            });
            console.log('✅ Audit log created for UPDATE_ITEM');
        } catch (auditError) {
            console.error('⚠️ Failed to create audit log:', auditError);
        }

        console.log('✅ Item updated successfully:', updatedItem.name);
        res.status(200).json(updatedItem);

    } catch (err) {
        console.error('❌ Update item error:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: Object.values(err.errors).map(e => e.message)
            });
        }

        res.status(400).json({
            error: err.message,
            message: 'Failed to update item'
        });
    }
};

// ✅ DELETE - Delete Item
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Deleting item with ID:', id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid item ID format",
                received: id
            });
        }

        const item = await Item.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({
                error: "Item not found",
                id: id
            });
        }

        // ✅ Create audit log
        try {
            await AuditLog.create({
                action: 'DELETE_ITEM',
                itemId: item._id,
                itemName: item.name,
                performedBy: 'system',
                details: {
                    deletedData: item.toObject(),
                    timestamp: new Date()
                }
            });
            console.log('✅ Audit log created for DELETE_ITEM');
        } catch (auditError) {
            console.error('⚠️ Failed to create audit log:', auditError);
        }

        console.log('✅ Item deleted successfully:', item.name);
        res.status(200).json({
            message: "Item deleted successfully",
            deletedItem: {
                id: item._id,
                name: item.name
            }
        });

    } catch (err) {
        console.error('❌ Delete item error:', err);
        res.status(500).json({
            error: err.message,
            message: 'Failed to delete item'
        });
    }
};

module.exports = {
    addItem,
    getItems,
    updateItem,
    deleteItem,
    searchItemByName,
};