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

    let eventsCollection = client.db("SportZone").collection("events");
    let bookingsCollection = client.db("SportZone").collection("myBookings");

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

        // Check if the ID is a valid ObjectId (24 hex chars)
        let query;
        if (ObjectId.isValid(id) && id.length === 24) {
          query = { _id: new ObjectId(id) };
        } else {
          // For simple string IDs like "001", "002", etc.
          query = { _id: id };
        }

        const event = await eventsCollection.findOne(query);
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

    app.put('/events/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        // Remove creatorEmail from update to prevent ownership change
        delete updatedData.creatorEmail;

        // Check if the ID is a valid ObjectId
        let query;
        if (ObjectId.isValid(id) && id.length === 24) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id };
        }

        const result = await eventsCollection.updateOne(query, { $set: updatedData });
        res.status(200).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to update event' });
      }
    });

    // My Bookings routes
    app.get('/myBookings', async (req, res) => {
      try {
        const email = req.query.email;
        const bookings = await bookingsCollection.find({ userEmail: email }).toArray();
        res.status(200).send(bookings);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to fetch bookings' });
      }
    });

    app.post('/myBookings', async (req, res) => {
      try {
        const bookingData = req.body;
        const result = await bookingsCollection.insertOne(bookingData);
        res.status(201).send({ message: 'Booking created successfully', insertedId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to create booking' });
      }
    });

    app.delete('/myBookings/:id', async (req, res) => {
      try {
        const id = req.params.id;

        // Check if the ID is a valid ObjectId
        let query;
        if (ObjectId.isValid(id) && id.length === 24) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id };
        }

        const result = await bookingsCollection.deleteOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to delete booking' });
      }
    });

    // Manage Events routes
    app.get('/manageEvents', async (req, res) => {
      try {
        const email = req.query.email;
        const events = await eventsCollection.find({ creatorEmail: email }).toArray();
        // Map to expected format
        const formattedEvents = events.map(event => ({
          _id: event._id,
          event_name: event.eventName,
          event_date: event.eventDate,
          location: event.description || "Location not specified"
        }));
        res.status(200).send(formattedEvents);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to fetch events' });
      }
    });

    app.delete('/manageEvents/:id', async (req, res) => {
      try {
        const id = req.params.id;

        // Check if the ID is a valid ObjectId
        let query;
        if (ObjectId.isValid(id) && id.length === 24) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id };
        }

        const result = await eventsCollection.deleteOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to delete event' });
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

