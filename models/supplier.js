const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupplierSchema = new Schema({
    name: String,
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'item'
    }]
});

module.exports = mongoose.model('supplier', SupplierSchema)

// module.exports = [{
//         name: "誠億電子",
//         items: [{
//                 item_id: "R121",
//                 item_name: "1K電阻",
//                 price: "0.2"
//             }, {

//                 item_id: "R123",
//                 item_name: "5K電阻",
//                 price: "0.4"
//             },
//             {

//                 item_id: "C221",
//                 item_name: "1C電容",
//                 price: "1.5"
//             }
//         ]
//     },
//     {
//         name: "瓏記電子",
//         items: [{
//             item_id: "T110",
//             item_name: "變壓器A",
//             price: "0.2"
//         }, {

//             item_id: "T112",
//             item_name: "變壓器B",
//             price: "0.4"
//         }]
//     }
// ]