const mongoose = require('mongoose');
const Purchase = require('./models/purchase');
const Supplier = require('./models/supplier');
const Item = require('./models/items');
const User = require('./models/user');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/my-stereo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

});

const supplier = [{
    name: "誠億電子",
    items: [{
        item_id: "R121",
        item_name: "1K電阻",
        price: "0.2"
    }, {

        item_id: "R123",
        item_name: "5K電阻",
        price: "0.4"
    },
    {

        item_id: "C221",
        item_name: "1C電容",
        price: "1.5"
    }
    ]
},
{
    name: "瓏記電子",
    items: [{
        item_id: "T110",
        item_name: "變壓器A",
        price: "225"
    }, {

        item_id: "T112",
        item_name: "變壓器B",
        price: "500"
    }]
}
]

const purchase = {
    finalOrder: [{
        supplierItemID: 'R121', //items
        supplierItem: '1K電阻', //items
        itemPrice: '0.2', //items
        itemQuan: '1000',
        totalPrice: '200'
    },
    {
        supplierItemID: 'R123',
        supplierItem: '5K電阻',
        itemPrice: '0.4',
        itemQuan: '2000',
        totalPrice: '800'
    }
    ],
    date: '2021-03-12',
    payMethod: '支票'
}


async function createSupplier(name, items) {
    const newSupplier = new Supplier({
        name: name
    })
    for (let i = 0; i < items.length; ++i) {
        const newItem = new Item(items[i])
        const res = await newItem.save()
        newSupplier.items.push(res._id)
    }
    await newSupplier.save()
}


// OrderId: Number,
//     Order: [{
//         type: Schema.Types.ObjectId,
//         ref: 'item'
//     }, {
//         itemQuan: Number,
//         totalPrice: Number
//     }],

//     payment: String,
//     date: Date,
//     status: String

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
    console.log('Database connected');

    // let orders = []
    // let orderInfos = []
    // for (let i = 0; i < purchase.finalOrder.length; ++i) {
    //     const found = await Item.find({
    //         // item_id: req.body.finalOrder[i].supplierItemID
    //         item_id: purchase.finalOrder[i].supplierItemID
    //     })
    //     orders.push(found[0]._id)
    //     orderInfos.push({
    //         itemQuan: purchase.finalOrder[i].itemQuan,
    //         totalPrice: purchase.finalOrder[i].totalPrice
    //     })
    // }

    // const newPurchase = new Purchase({
    //     order: orders,
    //     orderInfo: orderInfos,
    //     payment: purchase.finalOrder.payment,
    //     date: purchase.finalOrder.date,
    //     status: purchase.finalOrder.status
    // })

    // const found = await Item.find({
    //     item_id: 'R121'
    // })

    // const newPurchase = new Purchase({
    //     order: [found[0]._id],
    //     orderInfo: [{
    //         itemQuan: "100",
    //         totalPrice: "500"
    //     }],
    //     payment: 'cash',
    //     date: '2021-03-12',
    //     status: '採購中'
    // })

    // await newPurchase.save()

    // const newOrder = new Purchase({})


    // for (let i = 0; i < supplier.length; ++i)
    //     await createSupplier(supplier[i].name, supplier[i].items)

    // const saltRounds = 10;
    // const account = 'admin'
    // const myPassword = '12345';

    // const user = new User({
    //     account: account,
    //     password: bcrypt.hashSync(myPassword, saltRounds)
    // })
    // await user.save()
    // const myHash = await User.findOne({account:'admin'})
    // console.log(bcrypt.compareSync(myPassword, myHash.password));
});