const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const keys = require(__dirname + '/keys.js');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
var con1 = mongoose.createConnection('mongodb+srv://admin-Priyanshu:' + keys.key + '@basic0.fqp9b.mongodb.net/usersDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var con2 = mongoose.createConnection('mongodb+srv://admin-Priyanshu:' + keys.key + '@basic0.fqp9b.mongodb.net/transactionsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const usersSchema = {
    Customer_ID: Number,
    Name: String,
    Email: String,
    Current_Balance: Number
};
const transactionsSchema = {
    Customer_ID1: Number,
    Name1: String,
    Customer_ID2: Number,
    Name2: String,
    Debit: Number,
    Status: String,
    Time: String
};
const User = con1.model("User", usersSchema);
const Transaction = con2.model("Transaction", transactionsSchema);
let user1 = new User({
    Customer_ID: 1,
    Name: "Abhi Verma",
    Email: "abhiverma21@gmail.com",
    Current_Balance: 5800
});
let user2 = new User({
    Customer_ID: 2,
    Name: "Aarav Tiwari",
    Email: "aaravtiw11@gmail.com",
    Current_Balance: 7200
});
let user3 = new User({
    Customer_ID: 3,
    Name: "Chinmay Nigam",
    Email: "nigam_chinm2354@gmail.com",
    Current_Balance: 2670
});
let user4 = new User({
    Customer_ID: 4,
    Name: "Deepshika Mathur",
    Email: "mathurs43deep@gmail.com",
    Current_Balance: 9800
});
let user5 = new User({
    Customer_ID: 5,
    Name: "Jatin Singh",
    Email: "jat_sar123@gmail.com",
    Current_Balance: 5805
});
let user6 = new User({
    Customer_ID: 6,
    Name: "Kunal Maurya",
    Email: "maurykunal23@gmail.com",
    Current_Balance: 5780
});
let user7 = new User({
    Customer_ID: 7,
    Name: "Simram Kaur",
    Email: "man_kaur911@gmail.com",
    Current_Balance: 7000
});
let user8 = new User({
    Customer_ID: 8,
    Name: "Pranveer Rastogi",
    Email: "pranveer323@gmail.com",
    Current_Balance: 5600
});
let user9 = new User({
    Customer_ID: 9,
    Name: "Vikram Bhatt",
    Email: "vikkbhatt120@gmail.com",
    Current_Balance: 5000
});
let user10 = new User({
    Customer_ID: 10,
    Name: "Yuvraj Singh",
    Email: "yuvisingh232@gmail.com",
    Current_Balance: 4500
});
let defaultUsers = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];
app.get("/", function (req, res) {
    res.render("index");
});
let id = 0;
app.post("/transfer.html", function (req, res) {
    id = Number(req.query.id);
    var newid;
    User.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            data.forEach(function (cid) {
                if (cid.Customer_ID === id)
                    newid = cid;
            });
        }
    });
    User.find({}, function (err, debitUser) {
        if (err) {
            console.log(err);
        } else {
            res.render("transfer", {
                TransferUserDetail: newid,
                TransferUserTo: debitUser,
                showId: id
            });
        }
    });
});
var message = "";
var setter = 0;
app.post("/customer.html", function (req, res) {
    let debit = Number(req.body.name);
    var dd2 = req.body.chat1;
    let dd = req.body.touser;
    var result = dd.match(/[0-9]/g);
    var id4 = '';
    var d = new Date();
    var time2 = d.toUTCString();
    var time = new Date(time2 + " UTC-5:30");
    var time3 = time.toUTCString().replace("GMT", "IST");
    result.forEach(function (res) {
        id4 = id4 + res;
    });
    let id2 = Number(id4);
    var result2 = dd2.match(/[0-9]/g);
    var id5 = '';
    result2.forEach(function (res) {
        id5 = id5 + res;
    });
    let amount1 = Number(id5);
    var status = "Failed";
    if (debit > 0) {
        if (id > 0) {
            if (amount1 >= debit) {
                status = "Success";
                var amount3 = amount1 - debit;
                User.updateOne({
                    Customer_ID: id
                }, {
                    Current_Balance: amount3
                }, function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Updated Docs : ", docs);
                    }
                });
                User.updateOne({
                    Customer_ID: id2
                }, {
                    $inc: {
                        Current_Balance: debit
                    }
                }, function (err, docs) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Updated Docs : ", docs);
                    }
                });
                message = "Transaction Successful!";
                setter = 1;
            } else {
                message = "Insufficient Balance!";
                setter = 2;
            }
            Transaction.insertMany([{
                Customer_ID1: id,
                Name1: defaultUsers[id - 1].Name,
                Customer_ID2: id2,
                Name2: defaultUsers[id2 - 1].Name,
                Debit: debit,
                Status: status,
                Time: time3
            }], function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("Success");
            });
        }
    } else {
        message = "Please enter a valid amount to transfer!";
        setter = 3;
    }
    res.redirect("/customer.html");
    id = 0;
});
app.get("/customer.html", function (req, res) {
    User.find({}, function (err, foundUsers) {
        if (foundUsers.length === 0) {
            User.insertMany([user1, user2, user3, user4, user5, user6, user7, user8, user9, user10], function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("Success");
            });
            res.redirect("/customer.html");
        } else {

            res.render("customer", {
                newList: foundUsers,
                success: message,
                term: setter
            });
            setter = 0;
        }
    });
});
app.get("/history.html", function (req, res) {
    Transaction.find({}, function (err, foundTransaction) {
        if (err) {
            console.log(err);
        } else {
            res.render("history", {
                newTransaction: foundTransaction
            });
        }
    });
});
app.listen(process.env.PORT || 3000, function () {
    console.log("Server has started successfully.")
});