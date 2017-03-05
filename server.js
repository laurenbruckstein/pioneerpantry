var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var port = process.argv[2] || 3000;
var mysql = require("mysql");
var qs = require("querystring");

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd(), uri);

  fs.exists(filename, function(exists) {
    if(!exists) {
      if (uri === "/inventory.json") {
        inventoryJson(request, response);
      }
      else if (uri === "/update-inventory.json") {
        updateInventoryJson(request, response);
      }
      else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
      }
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += "/index.html";

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

function inventoryJson(request, response) {
  // TODO: load inventory from database
  var connection = mysql.createConnection({
    host     : "db.it.pointpark.edu",
    user     : "foodpantry",
    password : "f5gkaHeUXqTzL8kq",
    database : "foodpantry"
  });
  connection.connect();
  connection.query("SELECT * FROM INVENTORY", function(err, rows, fields) {
    var json = {};
    if (err) {
      json["success"] = false;
      json["message"] = "Query failed: " + err;
    }
    else {
      //UNCOMMENT TO SEE ON WEBPAG
      json["success"] = true;
      json["message"] = "Query successful";
      json["data"] = rows;
    }
    response.writeHead(200, {"Content-Type": "text/json"});
    response.write(JSON.stringify(json));
    response.end();
  });
  connection.end();
}

function updateInventoryJson(request, response) {
  if (request.method === "POST") {
    var body = "";
    request.on("data", function (data) {
      body += data;
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) {
        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
        request.connection.destroy();
      }
    });
    request.on("end", function () {
      var json = qs.parse(body);
      var connection = mysql.createConnection({
        host     : "db.it.pointpark.edu",
        user     : "foodpantry",
        password : "f5gkaHeUXqTzL8kq",
        database : "foodpantry"
      });
      connection.connect();
      connection.query("INSERT INTO INVENTORY (FoodName, Count, FoodGroup, FoodType, Description, Donor, OrderDate, AdditonalNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [json["FoodName"], json["Count"], json["FoodGroup"], json["FoodType"], json["Description"], json["Donor"], json["OrderDate"], json["AdditonalNotes"]], function(err, rows, fields) {
        var json = {};
        if (err) {
          json["success"] = false;
          json["message"] = "Query failed: " + err;
        }
        else {
          json["success"] = true;
          json["message"] = "Query successful";
        }
        response.writeHead(200, {"Content-Type": "text/json"});
        response.write(JSON.stringify(json));
        response.end();
      });
      connection.end();
    });
  }
}

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
