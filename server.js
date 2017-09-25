var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var port = process.argv[2] || 3000;
var mysql = require("mysql");
var qs = require("querystring");
var credentials = require("../credentials");

http.createServer(function(request, response) {
  try {
    if (request.headers["x-authentication-key"] !== credentials.authentication.key) {
      response.writeHead(401, {"Content-Type": "text/plain"});
      response.write("404 Unauthorized\n");
      response.end();
    }
    else {
      var uri = url.parse(request.url).pathname;
      var filename = path.join(process.cwd(), uri);
      fs.exists(filename, function(exists) {
        if (!exists) {
          console.log("uri: " + uri);
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
          else if (uri === "/cancel-order.json") {
            cancelOrderJson(request, response);
          }
          else {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
          }
          return;
        }
        
        if (fs.statSync(filename).isDirectory()) {
          filename += "/index.html";
        }
        
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
    }
  }
  catch (e) {
    try {
      console.log("ERROR(500): " + e);
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write("500 Internal Server error\n");
      response.end();
    }
    catch (e) {
      console.log("ERROR(^^^): " + e);
    }
  }
}).listen(parseInt(port, 10));
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");


/*SELECT `ORDER`.STUDENT_ID, `ORDER`.DATE, INVENTORY.FoodGroup, INVENTORY.FoodName
FROM `ORDER`, ORDER_ITEM, INVENTORY
WHERE `ORDER`.ID = ORDER_ITEM.ORDER_ID AND ORDER_ITEM.INVENTORY_ID = INVENTORY.ID;*/
function joinOrderJson(request, response) {
  // TODO: load inventory from database
  var connection = mysql.createConnection(credentials.connection);
  connection.connect();
  connection.query("SELECT `ORDER`.ID, `ORDER`.STUDENT_ID, `ORDER`.EMAIL, `ORDER`.DATE, `ORDER`.VETERAN, `ORDER`.DISABLED, `ORDER`.SNAP, `ORDER`.HOUSEHOLD, `ORDER`.PACKAGED, `ORDER`.PICKEDUP, `ORDER`.CANCELED, INVENTORY.FoodGroup, INVENTORY.FoodName FROM `ORDER`, ORDER_ITEM, INVENTORY WHERE `ORDER`.ID = ORDER_ITEM.ORDER_ID AND ORDER_ITEM.INVENTORY_ID = INVENTORY.ID ORDER BY `ORDER`.ID DESC", function(err, rows, fields) {
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
  var connection = mysql.createConnection(credentials.connection);
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
      console.log(JSON.stringify(json));
      var connection = mysql.createConnection(credentials.connection);
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
  var connection = mysql.createConnection(credentials.connection);
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
      console.log(JSON.stringify(json));
      var connection = mysql.createConnection(credentials.connection);
      connection.connect();
      var studentId = json["studentId"];
      var orderDate = json["orderDate"];
      var phone = json["phone"];
      var email = json["email"];
      var veteran = (typeof json["veteran"] === "boolean" && json["veteran"]) || json["veteran"] === "true" ? 1 : 0;
      var disabled = (typeof json["disabled"] === "boolean" && json["disabled"]) || json["disabled"] === "true" ? 1 : 0;
      var snap = (typeof json["snap"] === "boolean" && json["snap"]) || json["snap"] === "true" ? 1 : 0;
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
      connection.query("INSERT INTO foodpantry.ORDER (STUDENT_ID, DATE, PHONE, EMAIL, VETERAN, DISABLED, SNAP, HOUSEHOLD) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [studentId, orderDate, phone, email, veteran, disabled, snap, household], function(err, rows, fields) {
        var json = {};
        if (err) {
          console.log(err);
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
              if (err) {
                console.log(err);
              }
              ncomplete++;
              if (ncomplete === itemIDs.length*2) {
                connection.end();
                response.writeHead(200, {"Content-Type": "text/json"});
                response.write(JSON.stringify(json));
                response.end();
              }
            });
            connection.query("UPDATE foodpantry.INVENTORY SET Count = Count - 1 WHERE ID = ?", [itemIDs[i]], function(err, rows, fields) {
              if (err) {
                console.log(err);
              }
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
  var connection = mysql.createConnection(credentials.connection);
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
      console.log(JSON.stringify(json));
      var connection = mysql.createConnection(credentials.connection);
      connection.connect();
      var orderID = json["ID"];
      var itemID = json["itemIDs"];
      if (!Array.isArray(itemIDs)) {
        itemIDs = [itemIDs];
      }
      console.log("orderDate: " + orderDate);
      console.log("itemIDs: " + JSON.stringify(itemIDs));
      connection.query("INSERT INTO foodpantry.ORDER_ITEM (STUDENT_ID, DATE) VALUES (?, ?)", [json["studentId"], json["ID"]], function(err, rows, fields) {
        var json = {};
        if (err) {
          console.log(err);
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
      console.log(JSON.stringify(json));
      var connection = mysql.createConnection(credentials.connection);
      connection.connect();
      connection.query("DELETE FROM foodpantry.INVENTORY WHERE ID=?", [json["ID"]], function(err, rows, fields) {
        var json = {};
        if (err) {
          console.log(err);
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
      console.log(JSON.stringify(json));
      var connection = mysql.createConnection(credentials.connection);
      connection.connect();
      connection.query("UPDATE foodpantry.`ORDER` SET PACKAGED=? WHERE ID=?", [json["Packaged"]==="true"?1:0, json["OrderID"]], function(err, rows, fields) {
        var json = {};
        if (err) {
          console.log(err);
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
      console.log(JSON.stringify(json));
      var connection = mysql.createConnection(credentials.connection);
      connection.connect();
      connection.query("UPDATE foodpantry.`ORDER` SET PICKEDUP=? WHERE ID=?", [json["Pickedup"]==="true"?1:0, json["OrderID"]], function(err, rows, fields) {
        var json = {};
        if (err) {
          console.log(err);
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


function returnErrorResponse(req, res, message) {
  console.log("ERROR: " + message);
  var json = {
    "success": false,
    "message": message
  };
  res.writeHead(200, {"Content-Type": "text/json"});
  res.write(JSON.stringify(json));
  res.end();
}


function returnSuccessResponse(req, res, message) {
  console.log("SUCCESS: " + message);
  var json = {
    "success": true,
    "message": message
  };
  res.writeHead(200, {"Content-Type": "text/json"});
  res.write(JSON.stringify(json));
  res.end();
}


function checkNextStep(req, res, connection, err, nquery) {
  if (!nquery) {
    if (err) {
      console.log("Rollback");
      connection.rollback(function() {
        connection.end();
        returnErrorResponse(req, res, "Query failed: " + err);
      });
    }
    else {
      // commit
      console.log("Commit");
      connection.commit(function() {
        connection.end();
        returnSuccessResponse(req, res, "Query successful");
      });
    }
  }
}


// Cancel Order
function cancelOrderJson(req, res) {
  if (req.method === "POST") {
    var body = "";
    req.on("data", function (data) {
      body += data;
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) {
        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
        req.connection.destroy();
      }
    });
    req.on("end", function () {
      var json = qs.parse(body);
      console.log(JSON.stringify(json));
      var connection = mysql.createConnection(credentials.connection);
      connection.connect();
      connection.beginTransaction(function(err) {
        if (err) {
          returnErrorResponse(req, res, "Query failed: " + err);
        }
        else {
          // get inventory items
          connection.query("SELECT INVENTORY_ID FROM ORDER_ITEM WHERE ORDER_ITEM.ORDER_ID = ?", [json["ORDER_ID"]], function(err, rows, fields) {
            if (err) {
              connection.rollback(function() {
                connection.end();
                returnErrorResponse(req, res, "Query failed: " + err);
              });
            }
            else {
              // update the canceled field
              var nquery = 1;
              connection.query("UPDATE foodpantry.`ORDER` SET CANCELED=1 WHERE ID=?", [json["ORDER_ID"]], function(err, rows, fields) {
                nquery--;
                checkNextStep(req, res, connection, err, nquery);
              });
              // increment values in inventory table
              for (var i = 0; i < rows.length; i++) {
                if (typeof rows[i]["INVENTORY_ID"] === "number") {
                  nquery++;
                  connection.query("UPDATE INVENTORY SET Count = Count + 1 WHERE ID = ?", [rows[i]["INVENTORY_ID"]], function(err, rows, fields) {
                    nquery--;
                    checkNextStep(req, res, connection, err, nquery);
                  });
                }
              }
            }
          });
        }
      });
    });
  }
}

