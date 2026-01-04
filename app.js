require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const constants = require("mongodb/lib/constants");
const app = express();

app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
const username = encodeURIComponent(process.env.DB_USER);
const password = encodeURIComponent(process.env.DB_PASS);
const dbName1 = process.env.DB_NAME1;
const dbName2 = process.env.DB_NAME2;
const cluster = process.env.DB_CLUSTER;
const usersUri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbName1}?retryWrites=true&w=majority`;
var con1 = mongoose.createConnection(usersUri);
con1.on("connected", () => console.log("DB1 connected"));
con1.on("error", (err) => console.error("DB1 connection error:", err));
const transactionsUri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbName2}?retryWrites=true&w=majority`;
var con2 = mongoose.createConnection(transactionsUri);
con2.on("connected", () => console.log("DB2 connected"));
con2.on("error", (err) => console.error("DB2 connection error:", err));

const usersSchema = {
  Customer_ID: Number,
  Name: String,
  Email: String,
  Current_Balance: Number,
};
const transactionsSchema = {
  Customer_ID1: Number,
  Name1: String,
  Customer_ID2: Number,
  Name2: String,
  Debit: Number,
  Status: String,
  Time: String,
};
const User = con1.model("User", usersSchema);
const Transaction = con2.model("Transaction", transactionsSchema);
let user1 = new User({
  Customer_ID: 1,
  Name: "Abhi Verma",
  Email: "abhiverma21@gmail.com",
  Current_Balance: 5800,
});
let user2 = new User({
  Customer_ID: 2,
  Name: "Aarav Tiwari",
  Email: "aaravtiw11@gmail.com",
  Current_Balance: 7200,
});
let user3 = new User({
  Customer_ID: 3,
  Name: "Chinmay Nigam",
  Email: "nigam_chinm2354@gmail.com",
  Current_Balance: 2670,
});
let user4 = new User({
  Customer_ID: 4,
  Name: "Deepshika Mathur",
  Email: "mathurs43deep@gmail.com",
  Current_Balance: 9800,
});
let user5 = new User({
  Customer_ID: 5,
  Name: "Jatin Singh",
  Email: "jat_sar123@gmail.com",
  Current_Balance: 5805,
});
let user6 = new User({
  Customer_ID: 6,
  Name: "Kunal Maurya",
  Email: "maurykunal23@gmail.com",
  Current_Balance: 5780,
});
let user7 = new User({
  Customer_ID: 7,
  Name: "Simram Kaur",
  Email: "man_kaur911@gmail.com",
  Current_Balance: 7000,
});
let user8 = new User({
  Customer_ID: 8,
  Name: "Pranveer Rastogi",
  Email: "pranveer323@gmail.com",
  Current_Balance: 5600,
});
let user9 = new User({
  Customer_ID: 9,
  Name: "Vikram Bhatt",
  Email: "vikkbhatt120@gmail.com",
  Current_Balance: 5000,
});
let user10 = new User({
  Customer_ID: 10,
  Name: "Yuvraj Singh",
  Email: "yuvisingh232@gmail.com",
  Current_Balance: 4500,
});
let defaultUsers = [
  user1,
  user2,
  user3,
  user4,
  user5,
  user6,
  user7,
  user8,
  user9,
  user10,
];
app.get("/", function (req, res) {
  res.render("index");
});
let id = 0;
app.post("/transfer.html", async (req, res) => {
  try {
    id = Number(req.query.id);
    const TransferUserDetail = await User.findOne({ Customer_ID: id });
    if (!TransferUserDetail) {
      return res.status(404).send("User not found");
    }
    const TransferUserTo = await User.find({});
    res.render("transfer", {
      TransferUserDetail,
      TransferUserTo,
      showId: id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

var message = "";
var setter = 0;
app.post("/customer.html", async (req, res) => {
  let debit = Number(req.body.name);
  var dd2 = req.body.chat1;
  let dd = req.body.touser;
  var result = dd.match(/[0-9]/g);
  var id4 = "";
  var d = new Date();
  var time2 = d.toUTCString();
  var time = new Date(time2 + " UTC-5:30");
  var time3 = time.toUTCString().replace("GMT", "IST");
  result.forEach(function (res) {
    id4 = id4 + res;
  });
  let id2 = Number(id4);
  var result2 = dd2.match(/[0-9]/g);
  var id5 = "";
  result2.forEach(function (res) {
    id5 = id5 + res;
  });
  let amount1 = Number(id5);
  var status = "Failed";
  if (debit > 0) {
    if (id > 0) {
      if (amount1 >= debit) {
        status = "Success";
        const amount3 = amount1 - debit;

        try {
          // Update sender
          await User.updateOne(
            { Customer_ID: id },
            { Current_Balance: amount3 }
          );

          // Update recipient
          await User.updateOne(
            { Customer_ID: id2 },
            { $inc: { Current_Balance: debit } }
          );

          message = "Transaction Successful!";
          setter = 1;

          // Insert transaction record
          await Transaction.create([
            {
              Customer_ID1: id,
              Name1: defaultUsers[id - 1].Name,
              Customer_ID2: id2,
              Name2: defaultUsers[id2 - 1].Name,
              Debit: debit,
              Status: status,
              Time: time3,
            },
          ]);
        } catch (err) {
          console.error("Transaction Error:", err);
          message = "Transaction Failed!";
          setter = 2;
        }
      } else {
        message = "Insufficient Balance!";
        setter = 2;
      }
    }
  } else {
    message = "Please enter a valid amount to transfer!";
    setter = 3;
  }
  res.redirect("/customer.html");
  id = 0;
});

app.get("/customer.html", async (req, res) => {
  try {
    // 1️⃣ Fetch all users
    const foundUsers = await User.find({});

    if (foundUsers.length === 0) {
      // 2️⃣ Insert initial users
      await User.insertMany([
        user1,
        user2,
        user3,
        user4,
        user5,
        user6,
        user7,
        user8,
        user9,
        user10,
      ]);
      console.log("Success");
      return res.redirect("/customer.html"); // redirect after insert
    }

    // 3️⃣ Render page if users exist
    res.render("customer", {
      newList: foundUsers,
      success: message,
      term: setter,
    });

    setter = 0;
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/history.html", async (req, res) => {
  try {
    const foundTransaction = await Transaction.find({});
    res.render("history", {
      newTransaction: foundTransaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.listen(process.env.PORT || 3000, function () {
  console.log("Server has started successfully.");
});
