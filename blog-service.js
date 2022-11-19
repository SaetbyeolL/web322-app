
const Sequelize = require('sequelize');

//ass5 setting sequlize
const sequelize = new Sequelize('drnbugun', 'drnbugun', 'FR5mALFZLcat19hiRyH0EnJNm4VmBXkY', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});
sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

//ass5 Creating Data Model
var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});
var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});
Post.belongsTo(Category, {foreignKey: 'category'});




// initialize()- update A5
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            resolve("Success!");
        }).catch(()=>{
            reject("unable to sync the database");
        })
    });
}

// getAllPosts()- update A5
module.exports.getAllPosts =() =>{
    return new Promise((resolve, reject) => {
        Post.findAll().then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned - getAllPosts()");
        })
    });
}

//getPublishedPosts()- update A5
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published: true
            }
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned - getPublishedPosts()");
        });
    });
}

//getCategories()- update A5
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned - getCategories()");
        })
    });
}

//addPost - update A5
  module.exports.addPost = (postData)=> {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for(let i in postData){
            if(postData[i]===""){
                postData[i] =null;
            }
        }
        postData.postDate = new Date();

        Post.create(postData)
        .then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("unable to create post - addPost()");
        })
    });
}

//Add the getPostsByCategory(category) Function  - update A5
module.exports.getPostsByCategory = (category)=>{
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                category: category
            }
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned - getPostsByCategory()")
        })
        
    });

}

//Add the getPostsByMinDate(minDateStr) Function  - update A5
module.exports.getPostsByMinDate = (minDateStr)=> {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned - getPostsByMinDate()");
        })
    });
}

//Add the getPostById(id) Function  - update A5
module.exports.getPostById = function(id){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                id: id
            }
        }).then((data)=>{
            resolve(data[0]);
        }).catch(()=>{
            reject("no results returned - getPostById()");
        });
    });
}

//ass4 - update A5
module.exports.getPublishedPostsByCategory = (category)=>{
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned - getPublishedPostsByCategory()");
        })
    });
}

//ass5 - addCategory
module.exports.addCategory = (categoryData)=> {
    return new Promise((resolve, reject) => {
        for(let i in categoryData){
            if(categoryData[i]===""){
                categoryData[i] =null;
            }
        }
        Category.create(categoryData)
        .then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("unable to create category - addCategory()");
        })
    });
}

module.exports.deleteCategoryById = (id)=> {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve("Category was deleted");
        }).catch(() => {
            reject("Category was NOT deleted - deleteCategoryById()");
        });
    });
}

module.exports.deletePostById = (id)=> {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve("Post was deleted");
        }).catch(() => {
            reject("Post was NOT delete - deletePostById()");
        });
    });
}