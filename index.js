const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 4000;

const uri = "mongodb+srv://kashyap:kashyap@cluster0.75zot.mongodb.net";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function connectDB() {
    try {
      await client.connect();
      console.log('Connected to MongoDB Atlas');
    } catch (err) {
      console.error(err);
    }
  }
  
  connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
