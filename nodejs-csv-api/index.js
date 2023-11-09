const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const app = express();
const N = 10; // Maximum number of records to process

// Define a port for the server to listen on
const PORT = process.env.PORT || 3000;

var records_file = "data/Node.js Sample_Test_File.csv";

// Validate input file
function validateFileFormat(filePath) {
  // Check that the file exists.
  if (!fs.existsSync(filePath)) {
    return "File does not exist.";
  }

  // Check input file in correct format.
  const extname = path.extname(filePath);
  if (extname.toLowerCase() !== ".csv") {
    return "Invalid file format. Expected CSV.";
  }

  // Check if file is empty.
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    return "Blank/Empty file.";
  }

  return null;
}

// Validate the header columns of the CSV file
function validateCSVHeaders(headers) {
  const expectedHeaders = [
    "Student_Id",
    "First_Name",
    "Last_Name",
    "Email",
    "Upload_Date",
    "Title_Code",
    "Percentage",
  ];

  for (const header of expectedHeaders) {
    if (!headers.includes(header)) {
      return "Incorrect CSV headers.";
    }
  }

  return null;
}

// Validate row data
function validateRowData(row) {
  console.log(row);
}

app.post("/upload", (req, res) => {
  // Process the uploaded file
  const validationResult = validateFileFormat(records_file);

  if (validationResult) {
    return res.status(400).json({ error: validationResult });
  }

  const results = [];
  let processedRecords = 0;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("headers", (headers) => {
      // Validate the header columns
      const headerValidationResult = validateCSVHeaders(headers);

      if (headerValidationResult) {
        return res.status(400).json({ error: headerValidationResult });
      }
    })
    .on("data", (data) => {
      // Check that we do not have more than N records
      if (processedRecords >= N) {
        return res
          .status(400)
          .json({ error: `Only ${N} records are allowed.` });
      }

      // Validate row data
      validateRowData(data);

      results.push(data);
    })
    .on("end", () => {
      console.log(results);
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
