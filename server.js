/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
   o part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Saetbyeol Lim Student ID: 149814212  Date: 3rd Dec 2022
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
//ass6
const authData = require("./auth-service.js");
const clientSessions = require("client-sessions");



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
      },
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }
  }
}));
//call app.set() to specify the 'view engine'
app.set('view engine', '.hbs');

//ass5 middleware
app.use(express.urlencoded({extended: true}));


app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

//ass6client-sessions middleware
app.use(clientSessions({
  cookieName : "session",
  secret :"assignment6_web322",// this should be a long un-guessable string.
  duration : 2 * 60 * 1000,
  activeDuration: 1000 * 60 
}));
//ass6 middleware
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});
//ass6
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

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

//ass6 get/login
app.get("/login",(req,res)=>{
  res.render("login");
})
//ass6 get/register
app.get("/register",(req,res)=>{
  res.render("register");
})
//ass6 post/register
app.post("/register",(req,res)=>{
  authData.registerUser(req.body)
  .then(()=>{
      res.render("register",{successMessage: "User created"});})
      .catch((err)=>{
      res.render("register",{errorMessage: err, userName: req.body.userName});
  })
})
//ass6 post/login
app.post("/login",(req,res)=>{

  req.body.userAgent = req.get('User-Agent');
  
  authData.checkUser(req.body).then((user) => {
      req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory
      }
      res.redirect('/posts');
  }).catch((err)=>{
      res.render("login",{errorMessage: err, userName: req.body.userName})
  })
})
//ass6 get/logout
app.get("/logout",(req,res)=>{
  req.session.reset();
  res.redirect("/");
})
//ass6 get/userHistory
app.get("/userHistory",ensureLogin ,(req,res)=>{
  res.render('userHistory')
})







app.get('/posts', ensureLogin, (req, res) => {

      let queryPromise = null;
      if (req.query.category) {
          queryPromise = blogService.getPostsByCategory(req.query.category);
      } else if (req.query.minDate) {
          queryPromise = blogService.getPostsByMinDate(req.query.minDate);
      } else {
          queryPromise = blogService.getAllPosts()
      }

      queryPromise.then((data) => {
        if(data.length > 0) {
            res.render('posts',{ posts: data });
        } else {
            res.render("posts", {message: "no results"});
        }
    }).catch(() => {
        res.render("posts", {message: "no results"});
    })

});


app.get('/post/:id', ensureLogin, (req,res)=>{
  blogService.getPostById(req.params.id).then(data=>{
      res.json(data);
  }).catch(err=>{
      res.json({message: err});
  });
});

//Adding a routes in server.js to support the new view
app.get('/posts/add', ensureLogin, (req, res) => {
  blogService.getCategories().then((data)=>{
    res.render("addPost", {categories: data});
  }).catch(()=>{
    res.render("addPost", {categories: []}); 
  })
}); 

//Adding the "Post" route 
app.post("/posts/add", upload.single("featureImage"),ensureLogin, (req, res) => {
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

app.get("/categories", ensureLogin, (req, res) => {
  blogService.getCategories().then((data) => {
    if(data.length > 0) {
      res.render('categories',{ categories: data });
    } else {
      res.render("categories", {message: "no results"});
    }
  }).catch(() => {
    res.render("categories", {message: "no results"});
  });
});

//ass5
app.get("/categories/add", ensureLogin, (req,res)=>{
  res.render("addCategory");
})

app.post("/categories/add", ensureLogin, (req, res) => {
  blogService.addCategory(req.body).then(category => {
      res.redirect('/categories');
    })
    .catch(err=>{
      res.status(500).send(err);
    })
});

app.get("/categories/delete/:id", ensureLogin, (req,res)=> {
  blogService.deleteCategoryById(req.params.id).then((category) => {
    res.redirect("/categories");
  }).catch(err => {
    res.status(500).send("Unable to Remove Category / Category not found");
  });
});

app.get("/posts/delete/:id", ensureLogin, (req,res)=>{
  blogService.deletePostById(req.params.id).then(() => {
    res.redirect("/posts");
  }).catch((err) =>{
    res.status(500).send("Unable to Remove Post / Post not found");
  });
});


//no matching route 
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

//ass6 update(authData.initialize)
blogService.initialize().then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});















