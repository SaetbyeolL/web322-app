/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
   o part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Saetbyeol Lim Student ID: 149814212  Date:  30 Sep 2022
*
*  Cyclic Web App URL: https://amused-teal-seal.cyclic.app
*
*  GitHub Repository URL: https://github.com/SaetbyeolL/web322-app
*
********************************************************************************/ 
const express = require("express");
const app = express();
const path = require("path");
const blogService = require('./blog-service');
const HTTP_PORT = process.env.PORT || 8080;

//// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public'));

// Route for pages
app.get("/", (req,res)=> {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/blog", (req, res) => {
  blogService.getPublishedPosts().then((data) => {
      res.json({data});
  }).catch((err) => {
      res.json({message: err});
  })
});

app.get("/posts", (req, res) => {
  blogService.getAllPosts().then((data) => {
      res.json({data});
  }).catch((err) => {
      res.json({message: err});
  })
});

app.get("/categories", (req, res) => {
  blogService.getCategories().then((data) => {
      res.json({data});
  }).catch((err) => {
      res.json({message: err});
  })
});

//no matching route 
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// setup http server to listen on HTTP_PORT
blogService.initialize().then(()=> {
  app.listen(HTTP_PORT, onHttpStart);}).
  catch((err) => { 
    console.log("ERROR: " + err);
  });







