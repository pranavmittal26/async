var Promise = require("bluebird");
var async = require("async");


exports.coroutinesignUp = coroutinesignUp;
exports.signupWaterfall = signupWaterfall;
exports.Auto = Auto;
exports.Awaitsignup = Awaitsignup;
exports.promise = promise;

function coroutinesignUp(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var phone = req.body.phone;

  Promise.coroutine(function*() {
      var result = yield findUser(email);
      if(result && result.length > 0){
          var response = {
              message: "User Already exist",
              status: 400
            };
            res.send(JSON.stringify(response));
        }   
        var Obj = {
          email: email,
          password: password,
          name: name,
          phone: phone
        };
   var insert = yield insertIntoTable(Obj);
    var response = {
        message: "User Registered Successfully",
        status: 200
      };
      res.send(JSON.stringify(response));
  })().then((result) => {
    console.log("done");
    },(error) => {
      console.log(error);
      var response = {
        message: "Something went wrong",
        status: 400
      };
      res.send(JSON.stringify(response));
    });
}

function signupWaterfall(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  async.waterfall([
      function(cb) {
        var sql = "SELECT email from users where email= ?";
        connection.query(sql,email,function(err, result) {
            if (err) {
                cb(err);
            }
            cb(null, result);
          });
      },
      function(result, cb) {
        if(result && result.length > 0){
            console.log("Email already exits...");
            var response = {
                message: "User Already exist",
                status: 400
              };
          res.send(JSON.stringify(response));   
        } else {
          cb(null);
        }
      },
      function(cb) {
        var Obj =[email,password,name,phone];
        var insert = "INSERT into users (email,password,name,phone) values ?";
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
        var response = {
            message: "Something went wrong",
            status: 400
          };
          res.send(JSON.stringify(response));
      }else {
      var response = {
        message: "User Registered Successfully",
        status: 200
      };
      res.send(JSON.stringify(response));
    }
    }
  );
}

function Auto(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var flag =0, data;
  async.auto({
    f1: function(cb) {
      var sql = "SELECT * FROM users WHERE email = ? AND password = ? ";
      connection.query(sql, [email, password], function(error,result) {
        if (error) {
          var response = {
            message: "Something went wrong",
            status: 400
          };
          res.send(JSON.stringify(response));
        }else if(result && result.length > 0){
          flag =1;
          cb(flag)
        }
        else{
          flag =0;
          cb(flag)
        }
      });
    },
    f2:['f1',function(cb, result) {
      if(result.f1 ==1){
        data =[];
        cb();
      }
      var response = {
        "message": "Email exists",
        "status": 201,
    };
    res.send(JSON.stringify(response)); 
}]
},function (err,response){
    if(err){
        res.send(JSON.stringify(err))
    }else {
        res.send(JSON.stringify({
            "message": "successfull",    
            "status":200,
            "data": data  
        }))
    }
})
}

async function Awaitsignup(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  try {
    var fetch = await fetchData(email, password);
    if (fetch) {
      var response = {
        "message": "Email Already exist",
        "status": 400,
    };
    res.send(JSON.stringify(response));
    }
    var Obj = {
      name: name,
      email: email,
      password: password
    };
    var insert = await insertIntoTable(obj);
    if (insert.affectedRows == 1) {
      var response = {
        "message": "Successfully inserted",
        "status": 200,
    };
    res.send(JSON.stringify(response)); 
    }
  } catch (error) {
    console.log(error);
    var response = {
      "message": "something went wrong",
      "status": 400,
  };
  res.send(JSON.stringify(response));
  }
}

function promise(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var name = req.body.name;
  var phone = req.body.phone;
 var flag =0;
  async.series([
      function(cb) {
          Promise.coroutine(function*() {
            var fetch = yield fetchData(email,password);
            if (fetch && fetch.length> 0) {
              return flag ==1;
            }
          })().then((result)=> {
            console.log("done")
            },(error)=>{
              cb(null, error);
            });
      },
      function(cb) {
        if(flag == 0){
        Promise.coroutine(function*() {
          var data = {
            email: email,
            password: password,
            name : name,
            phone : phone
        };
      var insert = yield insertIntoTable(data);
      cb();
        })().then((result)=> {
          console.log("done")
        },(error)=>{
          cb(null, error);
        });
    }
    else{
      cb();
    }
  }],
    function(error, results) {
      if (error) {
        var response = {
          "message": "something went wrong",
          "status": 400,
      };
      res.send(JSON.stringify(response));
      }
      else {
      var response = {
        "message": "Successfully",
        "status": 200,
    };
    res.send(JSON.stringify(response));
    }
  })
}




function insertIntoTable(Obj) {
  return new Promise((resolve, reject) => {
    var sql = `INSERT INTO user values ?`;
    connection.query(sql, [Obj], function(error, result) {
      console.log(">>>>>>>>>>>>>>>> ", error, result);
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

function findUser(email) {
    return new Promise((resolve, reject) => {
      var sql = `SELECT * FROM user WHERE email = ?`;
      connection.query(sql, email, function(error, result) {
        console.log(">>>>>>>>>>>>>>>> ", error, result);
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
    });
  }

  function fetchData(email, password) {
    return new Promise((resolve, reject) => {
        var sql = ` SELECT * FROM users WHERE email = ? AND password = ? `;
      connection.query(sql, [email, password], function(error,result) {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
    });
  }