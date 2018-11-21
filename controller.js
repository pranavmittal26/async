const Promise = require("bluebird");
const async = require("async");

exports.coroutinesignUp = coroutinesignUp;
exports.signupWaterfall = signupWaterfall;
exports.Auto = Auto;
exports.Awaitsignup = Awaitsignup;
exports.promise = promise;
exports.setImmediate = setImmediate;

function coroutinesignUp(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phone = req.body.phone;

  Promise.coroutine(function*() {
    let result = yield findUser(email);
    if (result && result.length > 0) {
      let response = {
        message: "User Already exist",
        status: 400
      };
      res.send(JSON.stringify(response));
    }
    let Obj = {
      email: email,
      password: password,
      name: name,
      phone: phone
    };
    let insert = yield insertIntoTable(Obj);
    let response = {
      message: "User Registered Successfully",
      status: 200
    };
    res.send(JSON.stringify(response));
  })().then(
    result => {
      console.log("done");
    },
    error => {
      console.log(error);
      let response = {
        message: "Something went wrong",
        status: 400
      };
      res.send(JSON.stringify(response));
    }
  );
}

function signupWaterfall(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  async.waterfall(
    [
      function(cb) {
        let sql = "SELECT email from users where email= ?";
        connection.query(sql, email, function(err, result) {
          if (err) {
            cb(err);
          } else if (result && result.length > 0) {
            let response = {
              message: "User Already exist",
              status: 400
            };
            res.send(JSON.stringify(response));
          } else {
            cb(null, result);
          }
        });
      },
      function(cb) {
        let Obj = [email, password, name, phone];
        let insert = "INSERT into users (email,password,name,phone) values ?";
        connection.query(insert, Obj, function(err, data) {
          if (err) {
            cb(err);
          }
          cb(null, data);
        });
      }
    ],
    function(err, result) {
      if (err) {
        console.log("error", err);
        let response = {
          message: "Something went wrong",
          status: 400
        };
        res.send(JSON.stringify(response));
      } else {
        let response = {
          message: "User Registered Successfully",
          status: 200
        };
        res.send(JSON.stringify(response));
      }
    }
  );
}

function Auto(req, res) {
  async.auto(
    {
      f1: function(cb) {
        setTimeout(function() {
          console.log("Takes 3 seconds");
          cb(null, 1);
        }, 3000);
      },
      f2: function(cb) {
        // independent  will execute in parallel
        setTimeout(function() {
          console.log("Takes 2 seconds");
          cb(null, 2);
        }, 2000);
      },
      f3: ["f1","f2",function(results, cb) {
          //dependent on other function
          setTimeout(function() {
            console.log("1st func. value is " + JSON.stringify(results.f1)
            ); //1
            cb(null, 3);
          }, 0);
        }
      ]
    },
    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
}

async function Awaitsignup(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    let fetch = await fetchData(email, password);
    if (fetch) {
      let response = {
        message: "Email Already exist",
        status: 400
      };
      res.send(JSON.stringify(response));
    }
    let Obj = {
      name: name,
      email: email,
      password: password
    };
    let insert = await insertIntoTable(obj);
    if (insert.affectedRows == 1) {
      let response = {
        message: "Successfully inserted",
        status: 200
      };
      res.send(JSON.stringify(response));
    }
  } catch (error) {
    console.log(error);
    let response = {
      message: "something went wrong",
      status: 400
    };
    res.send(JSON.stringify(response));
  }
}

function promise(req, res) {
  const promise = new Promise((resolve, reject) => {
    const collection = db.collection("user");
    let data = collection.find({}).sort({ id: 1 }).limit(5).toArray();
    if (data.length != 5) {
      resolve(data);
    } else {
      reject(data);
    }
  });

  promise
    .then(function(results) {
      res.send(result);
    })
    .catch(function(err) {
      console.log("error");
      res.send(err);
    });
}

/*
  
  setImmediate solves the  problem i.e.  when nextTick fn is called at the end of 
  the current operation and then calling it recursively can lead to blocking the
  event loop from continuing so, by firing it in the check phase of the event loop, 
  allowing event loop to continue normally.
  */

function setImmediate() {
  function set(iteration) {
    if (iteration === 10) {
      return res.send(JSON.stringify({
        message: Success,
        status: 200,
        data: []
      }));
    }
    setImmediate(() => {
      console.log(`setImmediate iteration: ${iteration}`);
      set(iteration + 1); // Recursive call
    });
    process.nextTick(() => {
      console.log(`nextTick iteration: ${iteration}`);
    });
  }
  set(0);
}

function insertIntoTable(Obj) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO user values ?`;
    connection.query(sql, [Obj], function(error, result) {
      //console.log(">>>>>>>>>>>>>>>> ", error, result);
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

function findUser(email) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM user WHERE email = ?`;
    connection.query(sql, email, function(error, result) {
      //console.log(">>>>>>>>>>>>>>>> ", error, result);
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

function fetchData(email, password) {
  return new Promise((resolve, reject) => {
    let sql = ` SELECT * FROM users WHERE email = ? AND password = ? `;
    connection.query(sql, [email, password], function(error, result) {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}
