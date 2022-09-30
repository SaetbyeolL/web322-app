const fs = require("fs");
let posts = [];
let categories = [];

// initialize()
module.exports.initialize = () => {
    return new Promise((resolve, reject)=> {
        fs.readFile("./data/posts.json", "utf8", (err, data)=>{ 
            if(err) {
                reject("unable to read file");
            } else {
                console.log(data)
                posts = JSON.parse(data)
            }
        })

        fs.readFile("./data/categories.json", "utf8", (err, data)=>{ 
            if(err) {
                reject("unable to read file");
            } else {
                console.log(data)
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