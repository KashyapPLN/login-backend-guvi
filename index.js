const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 4000;
app.use(cors());
dotenv.config();
app.use(bodyParser.json());
const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

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

app.post('/signup', async (req, res) => {
    console.log(req.body);
    const { emailId, password } = req.body;
    console.log(req.body);
    if (!emailId || !password) {
      return res.status(400).send({"msg":'Username and password are required!'});
    }
  
    try {
         const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const database = client.db('login-guvi');
      const collection = database.collection('userData');
  
      const user = { _id: emailId, password: hashedPassword };
      await collection.insertOne(user);
  
      res.status(201).send({"msg":'User signed up successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.post('/login', async (req, res) => {
    const { emailId, password } = req.body;
    
    if (!emailId || !password) {
      return res.status(400).send('Email and password are required');
    }
  
    try {
      const database = client.db('login-guvi');
      const collection = database.collection('userData');
  
      const user = await collection.findOne({ _id: emailId });
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).send('Invalid password');
      }
  
      const token = jwt.sign({ emailId: user._id }, 'your_secret_key', { expiresIn: '1h' });
  
      res.status(200).send({msg:"Login Successful",token:token,emailId});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  app.get('/user-data/:emailId', async (req, res) => {
    const emailId = req.params.emailId;
  console.log("emai lis",emailId);
    try {
      const database = client.db('login-guvi');
      const collection = database.collection('userData');
  
      const user = await collection.findOne({ _id: emailId });
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      res.status(200).json({
        name: user.name || '',
        age: user.age || '',
        mobile: user.mobile || '',
        dob: user.dob || '',
        gender: user.gender || ''
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.put('/user-data', async (req, res) => {
       const { name, age, mobile, dob, gender,emailId } = req.body;
  
    try {
      const database = client.db('login-guvi');
      const collection = database.collection('userData');
  
      const updateFields = {};
      if (name) updateFields.name = name;
      if (age) updateFields.age = age;
      if (mobile) updateFields.mobile = mobile;
      if (dob) updateFields.dob = dob;
      if (gender) updateFields.gender = gender;
  
      await collection.updateOne({ _id: emailId }, { $set: updateFields });
  
      res.status(200).send({msg:'User data updated successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
