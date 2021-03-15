const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema

const PurchaseSchema = new Schema({
    orderId: {
        type: Number,
        default: 1
    },
    orderTo: String,
    orderItem: [{
        type: Schema.Types.ObjectId,
        ref: 'item'
    }],
    orderInfo: [{
        _id : false,
        itemQuan: String,
        totalPrice: String
    }],
    payment: String,
    date: String,
    status: String
})

PurchaseSchema.plugin(AutoIncrement, {inc_field: 'orderId'});
module.exports = mongoose.model('Purchase', PurchaseSchema);