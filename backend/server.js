const express = require("express");
const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const { ATLANTIC_APIKEY, BASE_URL, MIN_DEPOSIT } = require("./setting");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const USERS = "./backend/users.json";
const loadUsers = () => JSON.parse(fs.readFileSync(USERS));
const saveUsers = (d) => fs.writeFileSync(USERS, JSON.stringify(d, null, 2));

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  if (!users[username] || users[username].password !== password)
    return res.json({ status: false });
  res.json({ status: true });
});

app.get("/api/user/:u", (req, res) => {
  const users = loadUsers();
  res.json(users[req.params.u] || {});
});

app.post("/api/deposit/create", async (req, res) => {
  const { username, nominal } = req.body;
  if (nominal < MIN_DEPOSIT) return res.json({ status: false });

  const fee = Math.floor(Math.random() * 200) + 200;
  const total = nominal + fee;

  const data = qs.stringify({
    api_key: ATLANTIC_APIKEY,
    reff_id: "TOPUP-" + Date.now(),
    nominal: total,
    type: "ewallet",
    metode: "qris"
  });

  const r = await axios.post(`${BASE_URL}/deposit/create`, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  res.json({
    status: true,
    data: {
      id: r.data.data.id,
      qr_string: r.data.data.qr_string,
      nominal
    }
  });
});

app.post("/api/deposit/status", async (req, res) => {
  const { id, username, nominal } = req.body;
  const data = qs.stringify({ api_key: ATLANTIC_APIKEY, id });

  const r = await axios.post(`${BASE_URL}/deposit/status`, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  if (r.data.data?.status === "success") {
    const users = loadUsers();
    users[username].saldo += nominal;
    saveUsers(users);
  }

  res.json(r.data);
});

app.listen(3000, () => console.log("Server running http://localhost:3000"));
