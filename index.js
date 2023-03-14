//create an server using node js framework express

const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({ legacyMode: true });
client.connect().then(() => console.log("redis connected sucessfully"));
const app = express();
let getUser = async (req, res, next) => {
  try {
    console.log("set");
    const { id } = req.params;
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    const data = await response.json();
    const final_resp = data.username;
    client.set(id, final_resp);
    res.send(final_resp);
  } catch (err) {
    res.send(err.message);
  }
};

function cache(req, res, next) {
  const { id } = req.params;
  console.log("get");
  // await client.connect();
  client.get(id, (err, data) => {
    if (err) {
      console.log(err.message);
    } else if (data != null) {
      res.send(`Username for ${id} is ${data}`);
    } else {
      next();
    }
  });
}
app.get("/post/:id", cache, getUser);
const port = 3000;
app.listen(port, () => console.log(`server started on port:${port}`));
module.exports = app;
