const express = require('express')
const app = express()
const port = process.env.PORT || 4000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// middleware
require('dotenv').config()
app.use(cors());
app.use(express.json());

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
    await client.connect();


    const database = client.db("carDoctor");
    const servicesCollection = database.collection("services");
    const bookingCollection = client.db('carDoctor').collection('booking')


    // app get 
    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find()
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
    app.get('/bookings', async (req, res) => {

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