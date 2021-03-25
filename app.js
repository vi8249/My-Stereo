const express = require("express");
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
const app = express()
const bcrypt = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const flash = require('connect-flash');
require('dotenv').config()


const Purchase = require("./models/purchase")
const Supplier = require("./models/supplier")
const Item = require('./models/items');
const User = require('./models/user');

mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/my-stereo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: 'false',
    saveUninitialized: 'false',
}))

app.use(flash());

app.use(express.static("public"));
// app.use(express.static('models'));

app.set('view engine', 'ejs');

// app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))

// 初始化 Passport
app.use(passport.initialize())
// 如果要使用 login session 時需設定
app.use(passport.session())

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy({
    // 改以名為 email 的欄位資訊作為帳號
    usernameField: 'account',
    // 改以名為 passwd 的欄位資訊作為密碼
    passwordField: 'password',
    // 讓 varify callback 函式可以取得 req 物件
    passReqToCallback: true
},
    // 當請 passport 要驗證時，呼叫此 callback 函式，並帶入驗證資訊驗證
    function (req, username, password, done) {
        User.findOne({
            account: username
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, req.flash('fail', '錯誤的帳號或密碼'))
            }

            function validPassword(password, userPassword) {
                // console.log(password)
                // console.log(userPassword)
                return bcrypt.compareSync(password, userPassword)
            }
            if (!validPassword(password, user.password)) {
                console.log('Incorrect')
                return done(null, false, req.flash('fail', '錯誤的帳號或密碼'))
            }
            return done(null, user);
        })
    }
))

function ensureAuthenticated(req, res, next) {
    // 若使用者已通過驗證，則觸發 next()
    if (req.isAuthenticated()) {

        return next()
    }
    // 若使用者尚未通過驗證，則將使用者導向登入頁面

    req.flash('info', '請先登入系統')
    res.redirect('/login')
}

app.listen(3000, function () {
    console.log('Server started on port 3000')
})

app.get('/', ensureAuthenticated, function (req, res) {
    res.render('home', {
        messages: req.flash('success')
    })
})

app.get('/login', function (req, res) {
    res.render('login', {
        info: req.flash('info'),
        fail: req.flash('fail')
    })
})

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}),
    // 驗證成功時，將呼叫此函式，且 req.user 將帶有該使用者資訊
    function (req, res) {
        // 在這先執行一些動作 code...
        req.flash('success', '登入成功')
        res.redirect('/')
    }
)

app.get('/signout', function (req, res) {
    req.logout()
    res.redirect('/login')
})

app.get('/supplier', ensureAuthenticated, async function (req, res) {
    await Supplier
        .find({}).populate({
            path: 'items' // corresponding field
        })
        .then(data => {
            res.status(200).send({
                supplier: data
            })
        })
        .catch(err => {
            console.log(err)
        })
})

app.get('/purchase', ensureAuthenticated, async function (req, res) {
    // console.log(req.query.search)
    if (req.query.search) {
        await Purchase
            .find(req.query.option).populate({
                path: 'orderItem',
            })
            .then(queryPurchases => {
                res.status(200).send(queryPurchases)
            })
            .catch(err => {
                console.log(err)
            })
    } else {
        await Purchase
            .find({}).populate({
                path: 'orderItem',
            })
            .then(allPurchases => {
                if (!allPurchases)
                    return res.render('purchase')
                // console.log(allPurchases)
                res.render('purchase', {
                    allPurchases
                })
            })
            .catch(err => {
                console.log(err)
            })
    }
})

app.post('/purchase', ensureAuthenticated, async function (req, res) {
    console.log(req.body)
    let data = req.body

    let orders = []
    let orderInfos = []
    for (let i = 0; i < data.finalOrder.length; ++i) {
        const found = await Item.findOne({
            item_id: data.finalOrder[i].supplierItemID
        })
        orders.push(found._id)
        orderInfos.push({
            itemQuan: data.finalOrder[i].itemQuan,
            totalPrice: data.finalOrder[i].totalPrice
        })
    }

    const newPurchase = new Purchase({
        orderItem: orders,
        orderInfo: orderInfos,
        orderTo: data.orderTo,
        payment: data.payMethod,
        date: data.date,
        status: '採購中'
    })

    await newPurchase.save()
    res.status(200).send()
})

app.get('/purchase/:id', ensureAuthenticated, async function (req, res) {
    // console.log(req.query)
    await Purchase
        .findOne({
            _id: req.params.id
        }).populate({
            path: 'orderItem',
        })
        .then(purchase => {
            console.log('find:')
            console.log(purchase)
            res.status(200).send(purchase)
        })
        .catch(err => {
            console.log(err)
        })
})

app.patch('/purchase/:id', ensureAuthenticated, async function (req, res) {
    await Purchase.findByIdAndUpdate(req.params.id, req.body)
        .then(purchase => {
            console.log('update:' + purchase)
            res.status(200).send()
        })
        .catch(err => {
            console.log(err)
        })
})

app.delete('/purchase/:id', ensureAuthenticated, async function (req, res) {
    await Purchase.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(200).send()
        })
        .catch(err => {
            console.log(err)
        })
})

app.get('/sale', function (req, res) {
    res.render('sale')
})

app.get('/stock', function (req, res) {
    res.render('stock')
})