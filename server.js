var express = require("express");

var app = express();

const multer = require("multer");

const cloudinary = require('cloudinary').v2;

const streamifier = require('streamifier');

var parse = require("body-parser")

var HTTP_PORT = process.env.PORT || 8080;

var path = require("path");

var dataService = require(path.join(__dirname, "./blog-service.js"));



function onHttpStart() {
    console.log("Http server listening on: " + HTTP_PORT);
}


//setting default to public 
app.use(express.static('public'));

app.use(parse.urlencoded({extended:true}));



//Set the cloudinary config to use your "Cloud Name", "API Key" and "API Secret" 
//values, ie: 
cloudinary.config({ 
    cloud_name: 'dkyqnxbfu', 
    api_key: '393151643552445', 
    api_secret: 'f2WmVJpUJ-qid269oJjdcz87RVI' 
  });

// no { storage: storage } 
const upload = multer();

app.get("/", function(req, res) {
   res.sendFile(path.join(__dirname, "/views/about.html"));
});


//the link to about page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});



// get the data from the file 
// if no data return the message

//people/add
app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPosts.html"));
});


app.post("/posts/add", upload.single("featureImage"), (req, res) => {
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

       upload(req).then((uploaded)=> {
        req.body.featureImage = uploaded.url;
        
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to 
        dataService.addPost(req.body).then(() => {
            res.redirect('/posts')
        }).catch(()=>{
            console.log('No results returned');
        })

       });
});


app.get("/posts", (req, res) => {

    if (req.query.category) {
        dataService.getPostsByCategory(req.query.category).then((data)=>{
            res.json(data)
        }).catch((err)=>{
            res.json({message: err});
        })
    }

    
   else if(req.query.minDate != null)
    {
        dataService.getPostByMinDate(req.query.minDate)     
        .then((data)=>{
            res.json(data)
        })
        .catch((err)=>{
            res.json({message: err});
        })
   }

  
    else
    {
        dataService.getAllPosts().then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    
});

app.use('/posts/:id', (req, res,next) => {
    
    dataService.getPostById(req.params.id).then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send({message: err})
    })

})


app.get("/blog", function(req, res){
    dataService.getPublishedPosts() 
    .then( function(data){{res.json(data);}})
    .catch( function(msg){{res.json({message: msg});}})
});


app.get("/categories", (req, res) => {
    dataService.getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});



 // the page not found send message with the status 404 and message
 

 app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
  });



 dataService.initialize()
 .then(() => {app.listen(HTTP_PORT, onHttpStart);})
 .catch(() => {console.log("error!")});

