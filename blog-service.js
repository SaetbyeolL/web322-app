const fs = require("fs");
const { resolve } = require('path');
let posts = [];
let categories = [];


// initialize()
module.exports.initialize = () => {
    return new Promise((resolve, reject)=> {
        fs.readFile("./data/posts.json", "utf8", (err, data)=>{ 
            if(err) {
                reject("unable to read file");
            } else {
                posts = JSON.parse(data)
            }
        })
        fs.readFile("./data/categories.json", "utf8", (err, data)=>{ 
            if(err) {
                reject("unable to read file");
            } else {
                categories = JSON.parse(data)
            }
        })
        resolve("Success!!");
    })
}

// getAllPosts()
module.exports.getAllPosts =() =>{
    return new Promise((resolve, reject) => {
        if(posts.length == 0) {
            reject("no results returned");
        } else {
            resolve(posts);
        }
    })
}

//getPublishedPosts()
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        let published = [];
        for(let i = 0; i < posts.length; i++) {
            if(posts[i].published == true){
                published[i] = posts[i];
            }
        }
        if(posts.length == 0) {
            reject("no results returned");
        } 
        resolve(published);
    })
}

//getCategories()
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if(categories.length == 0){
            reject("no results returned");
        } else {
            resolve(categories);
        }
    })
}

//Adding an "addPost" function within blog-service.js
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {

        postData.published=postData.published ? false : true;
        postData.id = posts.length + 1;
        posts.push(postData);
        resolve();
    })
  }


//Add the getPostsByCategory(category) Function  
module.exports.getPostsByCategory = (category)=>{
    return new Promise((resolve,reject)=>{
        var categoryPosts=[]
        for(let i=0;i<posts.length;i++){
            if(posts[i].categories ==category){
                categoryPosts.push(posts[i])
            }
        }
    if(categoryPosts){
        resolve(categoryPosts)
    } else {
        reject("Posts not found for this category!")
    }
    })
}

//Add the getPostsByMinDate(minDateStr) Function  
module.exports.getPostsByMinDate = (minDateStr)=> {
    return new Promise((resolve, reject) => {

        let postDateCheck=posts.filter(post => (new Date(post.postDate)) >= (new Date(minDateStr)))
        if (postDateCheck.length == 0) {
            reject("no results returned")
        } else {
            resolve(postDateCheck);
        }
    });
}

//Add the getPostById(id) Function  
module.exports.getPostById = (id)=>{
    return new Promise((resolve,reject)=>{
        for(let i=0; i<posts.length;i++){
            var post;
            if(posts[i].id == id) {
                album=albums[i]
            }
        }
        if(album){
            resolve(album);
        }else{
            reject("no result returned");
        }
    });
}
