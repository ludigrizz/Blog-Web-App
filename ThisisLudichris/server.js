const express = require("express");
const http = require("http");
var path = require('path');
const https = require("https");

//let API_KEY = 'AIzaSyAwv2w0ndQF_se6j6wZduH3pWQE0FPhNRQ';
const port = process.env.PORT || 3000;

const routes = require('./routes/index')
const indexAliases = ["/index.html", "/", "/index", "/myblog", "/myblog.html"];

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// static server
app.use(express.static(__dirname + "/public"));
app.use(routes.authenticate); //authenticate user

// routes
// indexs
app.get(indexAliases, (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const bloggerApiUrl='https://www.googleapis.com/blogger/v3/blogs/8839810470144706822/posts?key=AIzaSyAwv2w0ndQF_se6j6wZduH3pWQE0FPhNRQ';

// Make a request to the Blogger API
https.get(bloggerApiUrl, bloggerApiResponse => {
    let data = '';

    bloggerApiResponse.on('data', chunk => {
        data += chunk;
    });

    bloggerApiResponse.on('end', () => {
        const blogData = JSON.parse(data);
        console.log('Blog Data:', blogData);

        // for (const post of blogData.items) {
        //     content += `<h3>${post.title}</h3><p>${post.content}</p>`;
        // }

        // // Set the content in the 'content' div
        // document.getElementById('content').innerHTML = content;
    });
});

// start server
app.listen(port, err => {
  if (err) console.log(err);
  else {
    console.log(`Server listening on port: ${port}`);
    console.log(`To Test:`);
    console.log(`http://localhost:3000/myblog.html`);
    console.log(`http://localhost:3000/myblog`);
    console.log(`http://localhost:3000/index.html`);
    console.log(`http://localhost:3000/index`);
    console.log(`http://localhost:3000/`);
    console.log(`http://localhost:3000`);
  }
})
