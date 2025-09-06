const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', ``], 
  credentials: true
}));
app.use(express.json());


// mongodb url

const uri = process.env.MONGODB_URI;

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
    await client.connect();

    let groupCollection = client.db("SportZone").collection("events");
    let eventsCollection = client.db("SportZone").collection("events");

    // Routes
    app.get('/', (req, res) => {
      res.send('Server is Running!');
    });

    app.get('/events', async (req, res) => {
      try {
        const events = await eventsCollection.find({}).toArray();
        res.status(200).send(events);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to fetch events' });
      }
    });

    app.get('/events/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
        if (event) {
          res.status(200).send(event);
        } else {
          res.status(404).send({ message: 'Event not found' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to fetch event' });
      }
    });

    app.post('/events', async (req, res) => {
      try {
        const eventData = req.body;
        const result = await eventsCollection.insertOne(eventData);
        res.status(201).send({ message: 'Event created successfully', insertedId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to create event' });
      }
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
 
  process.exit(0);
});

