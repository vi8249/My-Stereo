const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    // supplier_id: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'supplier'
    // },
    item_id: String,
    item_name: String,
    price: String,
});

module.exports = mongoose.model('item', ItemSchema);