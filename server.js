/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
   o part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Saetbyeol Lim Student ID: 149814212  Date:  21 Oct 2022
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

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// cloudinary.config({
//   cloud_name: dnggatqhx,
//   api_key: 514918811584914,
//   api_secret: UpJTzsjjD9FURHOhsffdhI8Mn4M,
//   secure: true
// })
cloudinary.config({
  cloud_name: 'Cloud Name',
  api_key: 'API Key',
  api_secret: 'API Secret',
  secure: true
});

const upload = multer();// no { storage: storage } 

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
  const { category, minDate } = req.query;

    if (category) {
      blogService.getPostByCategory(category).then((posts) => {
          res.send(posts);
      }
      ).catch((err) => {
          res.json({ message: err });
      }
      );
  } else if (minDate) {
      blogService.getPostsByMinDate(minDate).then((posts) => {
          res.send(posts);
      }
      ).catch((err) => {
          res.json({ message: err });
      }
      );
  } else {
      blogService.getAllPosts().then((posts) => {
          res.send(posts);
      }
      ).catch((err) => {
          res.json({ message: err });
      }
      );
  }
});

app.get("/categories", (req, res) => {
  blogService.getCategories().then((data) => {
      res.json({data});
  }).catch((err) => {
      res.json({message: err});
  })
});

//Adding a routes in server.js to support the new view
app.get('/posts/add', (req,res)=>{
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
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

//Add the "/post/value" route 
app.get('/posts/:id', (req, res) => {
  blogService.getPostsById(req.params.id).then((data) => {
      res.json(data)
  })
      .catch((err) => {
          res.json({message: err});
      })
})

//no matching route 
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});


blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart)
}).catch((err) => {
  console.log(err);
})



















