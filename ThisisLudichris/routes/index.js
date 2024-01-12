const url = require('url')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose() //verbose provides more detailed stack trace
const db = new sqlite3.Database('data/db_ludichris')

//notice navigation to parent directory:
// const headerFilePath = __dirname + '/../views/header.html'
// const footerFilePath = __dirname + '/../views/footer.html'

// db.serialize(function() {
//   //make sure a couple of users exist in the database.
//   //user: christina password: secret
//   //user: user1 password: pass1
//   let sqlString = "CREATE TABLE IF NOT EXISTS users (userid TEXT PRIMARY KEY, password TEXT)"
//   db.run(sqlString)
//   sqlString = "INSERT OR REPLACE INTO users VALUES ('christina', 'secret')"
//   db.run(sqlString)
//   sqlString = "INSERT OR REPLACE INTO users VALUES ('user1', 'pass1')"
//   db.run(sqlString)
// })

exports.authenticate = function(request, response, next) {

  /*
	Middleware to do BASIC http 401 authentication
	*/
  let auth = request.headers.authorization
  // auth is a base64 representation of (username:password)
  //so we will need to decode the base64
  if (!auth) {
    //note here the setHeader must be before the writeHead
    response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
    response.writeHead(401, {
      'Content-Type': 'text/html'
    })
    console.log('No authorization found, send 401.')
    response.end();
  } else {
    console.log("Authorization Header: " + auth)
    //decode authorization header
    // Split on a space, the original auth
    //looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
    var tmp = auth.split(' ')

    // create a buffer and tell it the data coming in is base64
    var buf = Buffer.from(tmp[1], 'base64');

    // read it back out as a string
    //should look like 'ldnel:secret'
    var plain_auth = buf.toString()
    console.log("Decoded Authorization ", plain_auth)

    //extract the userid and password as separate strings
    var credentials = plain_auth.split(':') // split on a ':'
    var username = credentials[0]
    var password = credentials[1]
    console.log("User: ", username)
    console.log("Password: ", password)

    var authorized = false
    //check database users table for user
    db.all("SELECT userid, password, role FROM users", function(err, rows) {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].userid == username & rows[i].password == password) {
            authorized = true
            request.user_role = rows[i].role
          }
        }
        if (authorized == false) {
          //we had an authorization header by the user:password is not valid
          response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
          response.writeHead(401, {
            'Content-Type': 'text/html'
          })
          console.log('No authorization found, send 401.')
          response.end()
        } else
          next()
      })
  }

// Server-side route for sign-up
exports.signup = function(request, response) {
    if (request.method === 'GET') {
      // Render the sign-up form
      fs.readFile('signupFormFilePath', function(err, data) {
        if (err) {
          handleError(response, err);
          return;
        }
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
      });
    } else if (request.method === 'POST') {
      // Handle form submission for user registration
      let body = '';
      request.on('data', function(chunk) {
        body += chunk;
      });
      request.on('end', function() {
        // Parse form data
        const formData = new URLSearchParams(body);
        const username = formData.get('username');
        const password = formData.get('password');
  
        // Validate and insert user into the database
        // (Add your validation logic here)
  
        // For simplicity, let's assume no validation and insert the user
        const insertUserQuery = `INSERT INTO users (userid, password) VALUES (?, ?)`;
        db.run(insertUserQuery, [username, password], function(err) {
          if (err) {
            handleError(response, err);
            return;
          }
          // Redirect the user to the login page or another appropriate page
          next();
        //   response.writeHead(302, { 'Location': '/login' });
        //   response.end();
        });
      });
    }
  };
  

}

function handleError(response, err) {
  //report file reading error to console and client
  console.log('ERROR: ' + JSON.stringify(err))
  //respond with not found 404 to client
  response.writeHead(404)
  response.end(JSON.stringify(err))
}

function send_users(request, response, rows) {
  /*
  This code assembles the response from two partial .html files
  with the data placed between the two parts
  This CLUMSY approach is done here to motivivate the need for
  template rendering. Here we use basic node.js file reading to
  simulate placing data within a file.
  */
  fs.readFile(headerFilePath, function(err, data) {
    if (err) {
      handleError(response, err);
      return;
    }
    response.writeHead(200, {
      'Content-Type': 'text/html'
    })
    response.write(data)

    //INSERT DATA
    for (let row of rows) {
      console.log(row)
      response.write(`<p>user: ${row.userid} password: ${row.password}</p>`)
    }

    fs.readFile(footerFilePath, function(err, data) {
      if (err) {
        handleError(response, err);
        return;
      }
      response.write(data)
      response.end()
    })
  })
}


exports.index = function(request, response) {
  // index.html
  fs.readFile(headerFilePath, function(err, data) {
    if (err) {
      handleError(response, err);
      return;
    }
    response.writeHead(200, {
      'Content-Type': 'text/html'
    })
    response.write(data)

    //INSERT DATA -no data to insert

    fs.readFile(footerFilePath, function(err, data) {
      if (err) {
        handleError(response, err);
        return;
      }
      response.write(data)
      response.end()
    })
  })
}

function parseURL(request, response) {
  const PARSE_QUERY = true //parseQueryStringIfTrue
  const SLASH_HOST = true //slashDenoteHostIfTrue
  let urlObj = url.parse(request.url, PARSE_QUERY, SLASH_HOST)
  console.log('path:')
  console.log(urlObj.path)
  console.log('query:')
  console.log(urlObj.query)
  return urlObj

}

exports.users = function(request, response) {
    // /send_users
    console.log('USER ROLE: ' + request.user_role)
  
    if(request.user_role !== 'admin'){
      response.writeHead(200, {
        'Content-Type': 'text/html'
      })
      response.write('<h2>ERROR: Admin Privileges Required To See Users</h2>')
      response.end()
      return
    }
    db.all("SELECT userid, password FROM users", function(err, rows) {
      send_users(request, response, rows)
    })
  
  }

