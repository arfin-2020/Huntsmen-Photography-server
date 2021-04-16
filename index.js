const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express()
const fs = require('fs-extra')
const port = 5000
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r5j5a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());

app.use(express.static('reviewimg'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('Hello Mongodb is working')
  })

  client.connect(err => {
    const reviewCollection = client.db("huntsmenPhotography").collection("reviews")

    app.post('/addreview',(req, res) => {
      const file = req.files.file;
      const name = req. body.name;
      const position = req.body.position;
      const filePath = `${__dirname}/reviewImg/${file.name}`
      console.log(name, position,file)
      file.mv(filePath,err =>{
        if(err){
          console.log(err)
          res.status(500).send({msg:'failed to upload Image'})
        }

        const newImg  = fs.readFileSync(filePath)
        const encImg = newImg.toString('base64')

        var image = {
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer(encImg, 'base64')
        };  
          reviewCollection.insertOne({name,position,image})
          .then(result =>{
            fs.remove(filePath,error =>{
                if(error){
                  console.log(error)
                  res.status(500).send({msg:'failed to upload Image'})
                }
                res.send(result.insertedCount > 0)
            })
          })
      })
    })

    app.get('/reviews', (req, res) => {
      reviewCollection.find({})
          .toArray((err, documents) => {
              res.send(documents);
          })
  });

    app.post('/isAdmin', (req, res)=>{
      const email = req.body.email;
      reviewCollection.find({email:email})
      .toArray((error,admin)=>{
          res.send(admin.length > 0)
      })
  })
  });

  app.listen(process.env.PORT||port)