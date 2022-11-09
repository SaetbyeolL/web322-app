/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
   o part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Saetbyeol Lim Student ID: 149814212  Date:  8 Nov 2022
*
*  Cyclic Web App URL: https://amused-teal-seal.cyclic.app
*
*  GitHub Repository URL: https://github.com/SaetbyeolL/web322-app
*
********************************************************************************/ 
//ass2
const express = require("express");
const app = express();
const path = require("path");
const blogService = require('./blog-service');
const HTTP_PORT = process.env.PORT || 8080;
//ass3
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
//ass4
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');


cloudinary.config({
  cloud_name: "dnggatqhx",
  api_key: "514918811584914",
  api_secret: "UpJTzsjjD9FURHOhsffdhI8Mn4M",
  secure: true
})
const upload = multer();// no { storage: storage } 
app.use(express.static('public'));

/////////ass4
//add the app.engine() code using exphbs.engine({ … }) and the "extname" property as ".hbs
app.engine(".hbs", exphbs.engine({
  extname: ".hbs",
  helpers: {
      navLink: function(url, options){
          return '<li' + 
              ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
              '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function (lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      },
      safeHTML: function(context){
          return stripJs(context);
      }
  }
}));
//call app.set() to specify the 'view engine'
app.set('view engine', '.hbs');

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


//// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// Route for pages
app.get('/', (req, res) => {
  res.redirect("/blog");
});

app.get("/about", (req,res)=> {
    res.render('about');
});


app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

app.get("/categories", (req, res) => {
  blogService.getCategories().then((data) => {
    res.render("categories", {categories: data});
  }).catch((err) => {
    res.render("categories", {message: "no results"});
  })
});


app.get('/posts', (req, res) => {

  let queryPromise = null;
  if (req.query.category) {
      queryPromise = blogService.getPostsByCategory(req.query.category);
  } else if (req.query.minDate) {
      queryPromise = blogService.getPostsByMinDate(req.query.minDate);
  } else {
      queryPromise = blogService.getAllPosts()
  }

  queryPromise.then(data => {
      res.render("posts", {posts: data});
  }).catch(err => {
      res.render("posts", {message: "no results"});
  })

});


//Adding the "Post" route 
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if(req.file){
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded)=>{
        processPost(uploaded.url);
    });
  }else {
    processPost("");
  }
 
  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    blogService.addPost(req.body).then(post => {
      res.redirect("/posts")
    }).catch(err=>{
      res.status(500).send(err);
    })
  } 
});

app.get('/post/:id', (req,res)=>{
  blogService.getPostById(req.params.id).then(data=>{
      res.json(data);
  }).catch(err=>{
      res.json({message: err});
  });
});

//Adding a routes in server.js to support the new view
app.get('/posts/add', (req, res) => {
  res.render("addPost");
}); 


//Add the "/post/value" route 
app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogService.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

//no matching route 
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});


blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart)
}).catch((err) => {
  console.log(err);
})

















