const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., ADD_ITEM, UPDATE_ITEM, DELETE_ITEM
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    itemName: { type: String },
    performedBy: { type: String, default: 'system' },
    timestamp: { type: Date, default: Date.now },
    details: { type: Object },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
