var express = require("express");
var app = express();
var http = require("http").createServer(app);
var path = require("path");

app.use(express.static(path.join(__dirname,"dist")));
app.use(express.static(path.join(__dirname,"images")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.get("/media/*", function (req, res) {
  res.sendFile(path.join(__dirname, "media", req.params[0]));
});

http.listen(process.env.PORT || 3000, () => { console.log("[SERVER]: I am started") });
