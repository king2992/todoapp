const express = require("express");
const fs = require("fs");
const app = express();

const session = require("express-session");
// 세션 설정
app.use(
  session({
    secret: "my-secret-key", // 세션 데이터를 암호화하기 위한 비밀 키
    resave: false,
    saveUninitialized: true,
  })
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
//npm install ejs
app.set("view engine", "ejs"); // EJS 설정

app.listen(3000, () => {
  console.log(`Server is running on port 3000...`);
});

function readData() {
  const rawData = fs.readFileSync("data.json");
  return JSON.parse(rawData);
}

function writeData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data));
}

// app.get('/', (req, res) => {
//     res.send('Hello, Node.js!');
// });

// app.get('/index', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

// Get list of items and render EJS template
app.get("/", (req, res) => {
  console.log("유저 정보")
  console.log(req.session.user)

  res.render("main", {user : null});
});

app.get("/login", (req, res) => {
  res.render("login"); // login.ejs 템플릿 렌더링
});

const users = [
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
  // 다른 사용자 정보 추가
];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 간단한 더미 데이터를 사용한 로그인 검증
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    // 인증 성공: 세션 또는 토큰을 사용하여 로그인 상태를 유지할 수 있습니다.
    // 세션에 사용자 정보 저장
    req.session.user = user;
    res.render("main", { user: req.session.user });
  } else {
    // 인증 실패
    res.status(401).send("Authentication failed");
  }
});

app.get("/logout", (req, res) => {
  // 세션에서 사용자 정보 제거
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }

    // EJS 템플릿에 로그인 정보를 전달
    res.render("main", { user: null });
  });
});

app.get("/todoList", (req, res) => {
  const data = readData();
  res.render("todoList", { items: data });
});

// Insert a new item
app.post("/insert", (req, res) => {
  const newItem = req.body.item;

  const data = readData();
  const newItemId = Date.now(); // 현재 시간을 기반으로 고유 ID 생성

  const newItemObject = { id: newItemId, todo: newItem };
  data.push(newItemObject);
  writeData(data);
  res.redirect("/todoList");
});

// 클라이언트에서 수정된 항목을 처리하는 라우트
app.post("/edit", (req, res) => {
  const editedItem = req.body.editedItem;
  const itemId = req.body.id;

  const data = readData();

  const itemToUpdate = data.find((item) => item.id === Number(itemId));
  if (itemToUpdate) {
    itemToUpdate.todo = editedItem;
    writeData(data);
    res.redirect("/todoList");
  } else {
    res.status(404).send("Item not found");
  }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.id;

  const data = readData();

  const itemIndexToDelete = data.findIndex(
    (item) => item.id === Number(itemId)
  );
  if (itemIndexToDelete !== -1) {
    data.splice(itemIndexToDelete, 1);
    writeData(data);
    res.redirect("/todoList");
  } else {
    res.status(404).send("Item not found");
  }
});
