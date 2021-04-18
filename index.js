const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
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
    const orderCollection = client.db("huntsmenPhotography").collection("order")
    const selectedordersCollection = client.db("huntsmenPhotography").collection("selectedorders")

    app.post('/addreview',(req, res) => {
      const file = req.files.file;
      const name = req. body.name;
      const position = req.body.position;
      console.log(name, position,file)
      const newImg  = req.files.file.data
      const encImg = newImg.toString('base64')
        var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
        };  
          reviewCollection.insertOne({name,position,image})
          .then(result =>{
            res.send(result.insertedCount > 0)
      })
    })

    app.get('/reviews', (req, res) => {
      reviewCollection.find({})
          .toArray((err, documents) => {
              res.send(documents);
          })
      });

    app.post('/addorder', (req, res) => {
      const file = req.files.file;
      const category = req. body.category ;
      const price = req.body.price;
      console.log(category,price,file)
      const newlastImg  =  req.files.file.data
      const encoImg = newlastImg.toString('base64')
        var image1 =  {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encoImg, 'base64')
        };
        orderCollection.insertOne({category,price,image1})
        .then(success => {
            res.send(success.insertedCount > 0)
        })
    })

     app.get('/orders', (req, res) => {
      orderCollection.find({})
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

   app.get('/order/:id',(req, res)=>{
    orderCollection.find({ _id: ObjectId(req.params.id) })
    .toArray((err,items)=>{
     const result= res.send(items[0]);
       })
   })

  app.post('/selectedorder', (req, res)=>{
    const name=req.body.name;
    const email=req.body.email;
    const address=req.body.address;
    const category=req.body.category;
    const phone = req.body.phone;
    console.log(name,email,address,phone,category);
    selectedordersCollection.insertOne({name,email,address,category,phone})
    .then(alset =>{
      res.send(alset.insertedCount > 0)
    })
  })

  app.get('/selectedorders', (req, res)=>{
    selectedordersCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents);
        })
     })
  });

  app.listen(process.env.PORT||port)