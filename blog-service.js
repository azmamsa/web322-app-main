var posts= new Array();

var categories= new Array();

var path = require('path');

var fs = require("fs");


module.exports.initialize = () => {
     return new Promise(function(resolve, reject) {
        fs.readFile(path.join(__dirname,"./data/posts.json"), 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read file.");
                
            }
            else{
            posts = JSON.parse(data);
            }
        
        });

        fs.readFile(path.join(__dirname,"./data/categories.json"), 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read file.");
                
            }
            else{
            categories = JSON.parse(data);
            }
        
        }); 
        resolve();

    });        
}


// promise 



 module.exports.getAllPosts = (() => {
     return new Promise((resolve, reject) => {
      if (posts.length == 0) {
        reject("no results returned")
      }
      else{
        resolve(posts)      
      }
    });
  });
 

  module.exports.getCategories = () => {
    return new Promise((resolve,reject) => {
        if (categories.length == 0) {
            reject ('no results returned');
        }
        else {
            resolve (categories);
        }
    })
};
 
 
module.exports.getPublishedPosts = (() => new Promise((resolve, reject) => {
    let p_post = [];

    posts.forEach((post) => {
        if (post.published == true) {
            p_post.push(post);
        }
    });
    if (p_post.length != 0) {
        resolve(p_post);
    }
    else {
        reject("no results returned");
    }
}));
  

