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
      else if (uri === "/order.json") {
        orderJson(request, response);
      }
      else if (uri === "/update-order.json") {
        updateOrderJson(request, response);
      }
      else if (uri === "/item.json") {
        itemJson(request, response);
      }
      else if (uri === "/update-item.json") {
        updateItemJson(request, response);
      }
      else if (uri === "/remove-inventory.json") {
        removeInventoryJson(request, response);
      }
      else if (uri === "/join-order.json") {
        joinOrderJson(request, response);
      }
      else if (uri === "/order-packaged.json") {
        orderPackagedJson(request, response);
      }
      else if (uri === "/order-pickedup.json") {
        orderPickedupJson(request, response);
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


/*SELECT `ORDER`.STUDENT_ID, `ORDER`.DATE, INVENTORY.FoodGroup, INVENTORY.FoodName
FROM `ORDER`, ORDER_ITEM, INVENTORY
WHERE `ORDER`.ID = ORDER_ITEM.ORDER_ID AND ORDER_ITEM.INVENTORY_ID = INVENTORY.ID;*/
function joinOrderJson(request, response) {
  // TODO: load inventory from database
  var connection = mysql.createConnection({
    host     : "db.it.pointpark.edu",
    user     : "foodpantry",
    password : "f5gkaHeUXqTzL8kq",
    database : "foodpantry"
  });
  connection.connect();
  connection.query("SELECT `ORDER`.ID, `ORDER`.STUDENT_ID, `ORDER`.DATE, `ORDER`.VETERAN, `ORDER`.DISABLED, `ORDER`.SNAP, `ORDER`.INCOME, `ORDER`.HOUSEHOLD, `ORDER`.PACKAGED, `ORDER`.PICKEDUP, INVENTORY.FoodGroup, INVENTORY.FoodName FROM `ORDER`, ORDER_ITEM, INVENTORY WHERE `ORDER`.ID = ORDER_ITEM.ORDER_ID AND ORDER_ITEM.INVENTORY_ID = INVENTORY.ID ORDER BY `ORDER`.ID DESC", function(err, rows, fields) {
    var json = {};
    if (err) {
      json["success"] = false;
      json["message"] = "Query failed: " + err;
    }
    else {
      //UNCOMMENT TO SEE ON WEBPAG
      json["success"] = true;
      json["message"] = "JOIN QUERY, Query successful";
      json["data"] = rows;
    }
    response.writeHead(200, {"Content-Type": "text/json"});
    response.write(JSON.stringify(json));
    response.end();
  });
  connection.end();
}

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
      // THIS IS LINE 95 FROM NOTES
      connection.query("INSERT INTO INVENTORY (FoodName, Count, FoodGroup, Description, DonorName, DonorOrganization, DonorPhone, DonorEmail, OrderDate, AdditonalNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [json["FoodName"], json["Count"], json["FoodGroup"], json["Description"], json["DonorName"], json["DonorOrganization"], json["DonorPhone"], json["DonorEmail"], json["OrderDate"], json["AdditonalNotes"]], function(err, rows, fields) {
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

// Order
function orderJson(request, response) {
  // TODO: load inventory from database
  var connection = mysql.createConnection({
    host     : "db.it.pointpark.edu",
    user     : "foodpantry",
    password : "f5gkaHeUXqTzL8kq",
    database : "foodpantry"
  });
  connection.connect();
  connection.query("SELECT * FROM foodpantry.ORDER", function(err, rows, fields) {
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

// Update Order
function updateOrderJson(request, response) {
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
      // THIS IS LINE 95 FROM NOTES
      console.log(JSON.stringify(json));
      var studentId = json["studentId"];
      var orderDate = json["orderDate"];
      var phone = json["phone"];
      var email = json["email"];
      var veteran = json["veteran"] ? 1 : 0;
      var disabled = json["disabled"] ? 1 : 0;
      var snap = json["snap"] ? 1 : 0;
      var income = json["income"];
      var household = json["household"];
      var itemIDs = json["itemIDs[]"];
      if (!Array.isArray(itemIDs)) {
        itemIDs = [itemIDs];
      }
      console.log("studentId: " + studentId);
      console.log("orderDate: " + orderDate);
      console.log("phone: " + phone);
      console.log("email: " + email);
      console.log("These are the items in the order: ")
      console.log("itemIDs: " + JSON.stringify(itemIDs));
      connection.query("INSERT INTO foodpantry.ORDER (STUDENT_ID, DATE, PHONE, EMAIL, VETERAN, DISABLED, SNAP, INCOME, HOUSEHOLD) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [studentId, orderDate, phone, email, veteran, disabled, snap, income, household], function(err, rows, fields) {
        console.log(err);
        var json = {};
        if (err) {
          json["success"] = false;
          json["message"] = "Query failed: " + err;
        }
        else {
          json["success"] = true;
          json["message"] = "Query successful";
          console.log("ORDER ID: " + rows.insertId);
          var ncomplete = 0;
          for (var i = 0; i < itemIDs.length; i++) {
            connection.query("INSERT INTO foodpantry.ORDER_ITEM (ORDER_ID, INVENTORY_ID) VALUES (?, ?)", [rows["insertId"], itemIDs[i]], function(err, rows, fields) {
              console.log(err);
              ncomplete++;
              if (ncomplete === itemIDs.length*2) {
                connection.end();
                response.writeHead(200, {"Content-Type": "text/json"});
                response.write(JSON.stringify(json));
                response.end();
              }
            });
            connection.query("UPDATE foodpantry.INVENTORY SET Count = Count - 1 WHERE ID = ?", [itemIDs[i]], function(err, rows, fields) {
              console.log(err);
              ncomplete++;
              if (ncomplete === itemIDs.length*2) {
                connection.end();
                response.writeHead(200, {"Content-Type": "text/json"});
                response.write(JSON.stringify(json));
                response.end();
              }
            });
          }
        }
      });
    });
  }
}


// Order Items
// Order
function itemJson(request, response) {
  var connection = mysql.createConnection({
    host     : "db.it.pointpark.edu",
    user     : "foodpantry",
    password : "f5gkaHeUXqTzL8kq",
    database : "foodpantry"
  });
  connection.connect();
  connection.query("SELECT * FROM foodpantry.ORDER_ITEM", function(err, rows, fields) {
    var json = {};
    if (err) {
      json["success"] = false;
      json["message"] = "Query failed: " + err;
    }
    else {
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

// Update Order_Item
function updateItemJson(request, response) {
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
      console.log(JSON.stringify(json));
      var orderID = json["ID"];
      var itemID = json["itemIDs"];
      if (!Array.isArray(itemIDs)) {
        itemIDs = [itemIDs];
      }
      console.log("orderDate: " + orderDate);
      console.log("itemIDs: " + JSON.stringify(itemIDs));
      connection.query("INSERT INTO foodpantry.ORDER_ITEM (STUDENT_ID, DATE) VALUES (?, ?)", [json["studentId"], json["ID"]], function(err, rows, fields) {
console.log(err);
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

function removeInventoryJson(request, response) {
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

      connection.query("DELETE FROM foodpantry.INVENTORY WHERE ID=?", [json["ID"]], function(err, rows, fields) {
        console.log(err);
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

function orderPackagedJson(request, response) {
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
      connection.query("UPDATE foodpantry.`ORDER` SET PACKAGED=? WHERE ID=?", [json["Packaged"]==="true"?1:0, json["OrderID"]], function(err, rows, fields) {
        console.log(err);
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

function orderPickedupJson(request, response) {
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
      connection.query("UPDATE foodpantry.`ORDER` SET PICKEDUP=? WHERE ID=?", [json["Pickedup"]==="true"?1:0, json["OrderID"]], function(err, rows, fields) {
        console.log(err);
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
