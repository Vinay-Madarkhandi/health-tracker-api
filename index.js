const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Daily Record Schema
const DailyRecordSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 20, // Minimum realistic weight
      max: 300, // Maximum realistic weight
    },
    meal: {
      type: {
        type: String,
        enum: ["breakfast", "lunch", "dinner"],
        required: true,
      },
      description: {
        type: String,
        trim: true,
        maxlength: 500, // Limit description length
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
const DailyRecord = mongoose.model("DailyRecord", DailyRecordSchema);

// API Routes
// Create a new daily record
app.post("/api/daily-record", async (req, res) => {
  try {
    const newRecord = new DailyRecord(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch daily records
app.get("/api/daily-records", async (req, res) => {
  try {
    const records = await DailyRecord.find()
      .sort({ date: -1 }) // Most recent first
      .limit(30); // Limit to last 30 records
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
