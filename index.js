// https://cars-doctors-server-rho.vercel.app/

const express = require('express')
const app = express()
const port = process.env.PORT || 4000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')

// middleware
require('dotenv').config()
app.use(cors());
app.use(express.json());


// token related
const verifyJwT = (req, res, next) => {
  console.log('hitting verify jwt')
  // console.log(req.headers.authorization)
  const authorization = req.headers.authorization
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' })
  }
  const token = authorization.split(' ')[1]
  console.log('token inside verify jwt', token)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded
    next()
  })
}




// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.uwuwq9x.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const database = client.db("carDoctor");
    const servicesCollection = database.collection("services");
    const bookingCollection = client.db('carDoctor').collection('booking')


    // app get 
    /* app.get('/services', async (req, res) => {
      // nicher 64 line theke 67 line hocche sort er jonno
      const query = {}
      const options = {
        // sort returned documents in ascending order by title (A->Z)
        sort: { "price": -1 },
      };
      const cursor = servicesCollection.find(query, options)
      const result = await cursor.toArray()
      res.send(result)
    })
 */
    app.get('/services', async (req, res) => {
      // nicher 76 line theke 87 line hocche sort er jonno
      const sort = req.query.sort
      // const query = {}
      // upor query sobar jonno

      // const query = { price: { $lte: 150 } };
      const query = { price: { $gte: 50 , $lte:80} };
    
      const options = {
        // sort returned documents in ascending order by title (A->Z)
        sort: { "price": sort ==='ase'? 1: -1 },
      };
      const cursor = servicesCollection.find(query, options)
      const result = await cursor.toArray()
      res.send(result)
    })





    // app get dhara id
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }

      const options = {
        // sort matched documents in descending order by rating
        // sort: { "imdb.rating": -1 },
        // Include only the `title` and `imdb` fields in the returned document
        projection: {
          title: 1, price: 1, service_id: 1, img: 1
        },
      };

      const service = await servicesCollection.findOne(query, options)
      res.send(service)
    })



    // app post
    app.post('/bookings', async (req, res) => {
      const newBooking = req.body
      // console.log(newBooking)
      const result = await bookingCollection.insertOne(newBooking)
      res.send(result)
    })


    // app get
    app.get('/bookings', verifyJwT, async (req, res) => {

      const decoded = req.decoded
      console.log('decode paichi', decoded)

      if (decoded.email !== req.query.email) {
        return res.status(403).send({ error: 1, message: 'forbidden access' })
      }
      console.log('cameback after verify')



      // console.log(req.headers)
      // console.log(req.headers.authorization)


      // console.log(req.query)
      console.log(req.query.email)
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      // const result=await bookingCollection.find().toArray()
      const result = await bookingCollection.find(query).toArray()
      res.send(result)
    })

    // get delete
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })

    // app get put mane update
    app.patch('/bookings/:id', async (req, res) => {
      const id = req.params.id
      const updatedBooking = req.body
      console.log(updatedBooking)
      const filter = { _id: new ObjectId(id) }
      // const option = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedBooking.status
        }
      }

      const result = await bookingCollection.updateOne(filter, updateDoc)
      res.send(result)
    })


    // jwt
    app.post('/jwt', (req, res) => {
      const user = req.body
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' });
      console.log(token)
      res.send({ token });
    })















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
  res.send('Doctor is running')
})

app.listen(port, () => {
  console.log(`Doctor server is running on port ${port}`)
})