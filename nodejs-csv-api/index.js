const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parse");
const fetch = require("node-fetch");
const multer = require("multer");
const nodemailer = require("nodemailer");

require("dotenv").config();
console.log(process.env.password);

const app = express();
app.use(express.json());

const N = 10; // Maximum number of records to process

// Define a port for the server to listen on
const PORT = process.env.PORT || 3000;

// var records_file = "data/Node.js Sample_Test_File.csv";

// Validate input file
function validateFileFormat(csvFile) {
  // Check input file in correct format.
  const extname = path.extname(csvFile);
  if (extname.toLowerCase() !== ".csv") {
    return "Invalid file format. Expected CSV.";
  }

  // Check if file is empty.
  if (csvFile["size"] === 0) {
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
      return `Incorrect CSV headers. ${header} not in file.`;
    }
  }

  return null;
}

const validateEmail = (email) => {
  // Regex source: https://regexr.com/2rhq7
  return email.match(
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  );
};

// Validate row data
function isvalidRow(row) {
  console.log(".................isvalidRow.................");
  console.log("row:");
  console.log(row);

  // Check numbers
  if (
    isNaN(+row["Student_Id"]) ||
    isNaN(+row["Title_Code"]) ||
    isNaN(+row["Percentage"]) ||
    +row["Percentage"] > 1.0
  ) {
    return false;
  }

  // Names
  if (
    typeof row["First_Name"] !== "string" ||
    typeof row["Last_Name"] !== "string"
  ) {
    return false;
  }

  // Email
  if (!validateEmail(row["Email"])) {
    return false;
  }

  // Upload_Date
  let dateStr =
    row["Upload_Date"].substring(0, 5) + "20" + row["Upload_Date"].substring(5);
  if (isNaN(new Date(dateStr))) {
    return false;
  }
  console.log(dateStr);
  return true;
}

async function postRecordData(
  url = "https://ucdavis-iet.com/sample-endpoint-url",
  data
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

app.post("/receive", (req, res) => {
  // req will be the json
  // console log
  console.log("received");
  console.log(req.body);
  return res;
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("csvFile"), (req, res) => {
  console.log("in upload");
  let csvFile = req["file"];
  console.log(csvFile);
  // Process the uploaded file
  const validationResult = validateFileFormat(csvFile["originalname"]);

  if (validationResult) {
    console.log(validationResult);
    return res.status(400).json({ error: validationResult });
  }
  console.log("Valid file format");

  let processedRecords = 0;
  let buffer = csvFile["buffer"];
  const records = [];

  const parser = csv.parse({
    columns: true,
    // bom needed for the first key to be parsed properly
    bom: true,
  });

  parser.on("readable", function () {
    let record;
    while ((record = parser.read()) !== null) {
      console.log(record);
      records.push(record);
    }
    console.log("done parsing");
  });
  parser.on("error", function (err) {
    console.error(err.message);
  });
  parser.on("end", function () {
    console.log("end");
    console.log(records);
    console.log(records.at(0)["First_Name"]);
    console.log(records.at(0)["Student_Id"]);
    postRecordData((url = "http://127.0.0.1:3000/receive"), records);
    // TODO: Email stuff
    // return res.status(200).json({ successes: successes, fails: fails });
    return res.status(200).json({ records });
  });
  parser.write(buffer);
  parser.end();
});

// const parser = fs.createReadStream(records_file).pipe(
//   csv.parse({
//     columns: true,
//     bom: true,
//   })
// );

// const records = [];
// parser.on("headers", function () {
//   // Validate the header columns
//   console.log(headers);
//   const headerValidationResult = validateCSVHeaders(headers);

//   if (headerValidationResult) {
//     return res.status(400).json({ error: headerValidationResult });
//   }
// });
// parser.on("readable", function () {
//   let record;
//   while ((record = parser.read()) !== null) {
//     console.log(record);
//     isvalidRow(record);
//     records.push(record);
//   }
// });

// parser.on("error", function (err) {
//   console.error(err.message);
// });

// parser.on("end", function () {
//   // console.log(records);
//   // console.log(records.at(0)["First_Name"]);
//   // console.log(records.at(0)["Student_Id"]);
//   // console.log(Object.keys(records.at(0)));
// });

// postRecordData("/receive");

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
