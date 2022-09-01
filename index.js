const path = require("path"); //절대경로 내장모듈
const express = require("express");
const { read } = require("fs");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
app.use(cors());
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");
// mongodb 관련 모듈
const MongoClient = require("mongodb").MongoClient;

let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  console.log("연결");
  if (err) {
    console.log(err);
  } else {
    console.log("voca-app연결");
  }
  db = client.db("voca-app");
});
//post방식으로 날아온 데이터 받을때
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  // res.send("hello crud :)");
  res.send("hello voca-app");
});
app.post("/day/add", (req, res) => {
  // 여기에 day로 들어오는 값을 받아서 db에 밀어넣기.
  db.collection("counter").findOne({ name: "count" }, (err, result) => {
    const insertData = {
      day: req.body.day,
      id: result.daysTotal,
    };
    db.collection("days").insertOne(insertData, (err, result) => {
      db.collection("counter").updateOne({ name: "count" }, { $inc: { daysTotal: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.json({ insert: "ok" });
        // console.log("잘들어갔음");
        // res.send(`<script>alert("입력창띄우기"); location.href="/list"</script>`);
      });
    });
  });
  // console.log(req.body.day);
  // res.json({ test: "ok" });
});
app.post("/voca/add", (req, res) => {
  // 여기에 day로 들어오는 값을 받아서 db에 밀어넣기.
  db.collection("counter").findOne({ name: "count" }, (err, result) => {
    const insertData = {
      day: parseInt(req.body.day),
      eng: req.body.eng,
      kor: req.body.kor,
      isDone: Boolean(req.body.isDone),
      id: result.vocasTotal,
    };
    // console.log(insertData);
    db.collection("vocas").insertOne(insertData, (err, result) => {
      db.collection("counter").updateOne({ name: "count" }, { $inc: { vocasTotal: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.json({ insert: "ok" });
        // console.log("잘들어갔음");
        // res.send(`<script>alert("입력창띄우기"); location.href="/list"</script>`);
      });
    });
  });
  // console.log(req.body.day);
  // res.json({ test: "ok" });
});
app.get("/days", (req, res) => {
  db.collection("days")
    .find()
    .toArray((err, result) => {
      res.json(result);
    });
});
app.get("/voca/:day", (req, res) => {
  console.log(req.params.day); //parmas는 문자로 넘어온다.
  const _day = parseInt(req.params.day);
  db.collection("vocas")
    .find({ day: _day })
    .toArray((err, result) => {
      console.log(result);
      res.json(result);
    });
});
app.delete("/voca/:id", (req, res) => {
  // console.log("====", req.params.id);
  // res.send("delete");
  // db연결해서 지우기
  const _id = parseInt(req.params.id);
  db.collection("vocas").deleteOne({ id: _id }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json({ delete: "ok" });
    }
  });
});

app.put("/voca/:id", (req, res) => {
  const _id = parseInt(req.params.id);
  const _isDone = Boolean(req.body.isDone);
  //
  console.log(_isDone);
  db.collection("vocas").updateOne({ id: _id }, { $set: { isDone: _isDone } }, (err, result) => {
    res.json({ update: "ok" });
  });
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
