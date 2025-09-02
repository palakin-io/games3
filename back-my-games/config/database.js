const mongoose = require('mongoose');

const uri = "mongodb+srv://polakitow:rasalgul32@gamecluster.emb1xpd.mongodb.net/games_db?retryWrites=true&w=majority&appName=GameCluster";
const clientOptions = { 
  serverApi: { 
    version: '1', 
    strict: true, 
    deprecationErrors: true 
  } 
};

const connectDB = async () => {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("✅ Successfully connected to MongoDB!");
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

module.exports = { connectDB };
