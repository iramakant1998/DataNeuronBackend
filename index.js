// index.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(bodyParser.json());

const DataSchema = new mongoose.Schema({
  name: String,
  count: { type: Number, default: 0 }, // Count field to store API hits count
  description: String,
});

const Data = mongoose.model("Data", DataSchema);

// Middleware to update count before handling requests
app.use("/api/data", async (req, res, next) => {
  try {
    const data = await Data.findOne(); // Assuming you only have one data entry
    if (data) {
      data.count++; // Increment count for each API hit
      await data.save();
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API to add or update data
app.post("/api/data/add", async (req, res) => {
  try {
    const newData = await Data.create(req.body);
    res
      .status(200)
      .json({ success: true, message: "Data added successfully", newData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/data/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedData = await Data.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    if (!updatedData) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });
    }
    res.status(200).json({
      success: true,
      message: "Data updated successfully",
      updatedData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API to get count
app.get("/api/data/count", async (req, res) => {
  try {
    const data = await Data.findOne(); // Assuming you only have one data entry
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });
    }
    res.status(200).json({ success: true, count: data.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
