const express = require("express");
const path = require("path");
const csv = require("csv-parse");
const fetch = require("node-fetch");
const multer = require("multer");
const nodemailer = require("nodemailer");

// contains password/sensitive values
require("dotenv").config();

const app = express();
app.use(express.json());

const N = 10; // Maximum number of records to process

// Transporter for sending email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mijkim@ucdavis.edu",
    pass: process.env.password,
  },
});

// Define a port for the server to listen on
const PORT = process.env.PORT || 3000;

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
function isValidRow(row) {
  // console.log(".................isvalidRow.................");
  // console.log("row:");
  // console.log(row);

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
  return true;
}

// Post data to endpoint at url
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

// Send Error Notification to a system admin email upon successful completion.
// Generate & send an error notification email to system admin for any failed records if any.
async function sendEmail(errorMessage) {
  const mailOptions = {
    from: "mijkim@ucdavis.edu",
    to: "pi.jihwank93@gmail.com", // TODO: replace with system admin
    subject: "Sending Email using Node.js",
    text: "Error information:\n" + errorMessage,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// This is a test endpoint that prints out the received json data
app.post("/receive", (req, res) => {
  console.log("received");
  console.log(req.body);
  return res;
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("csvFile"), (req, res) => {
  let csvFile = req["file"];
  console.log(csvFile);
  // Process the uploaded file
  const validationResult = validateFileFormat(csvFile["originalname"]);

  if (validationResult) {
    console.log(validationResult);
    return res.status(400).json({ error: validationResult });
  }

  let processedRecords = 0;
  let buffer = csvFile["buffer"];
  let successes = [];
  let fails = [];
  let headers = [];
  let errorMessage;

  const parser = csv.parse({
    // columns: true,
    // bom needed for the first key to be parsed properly
    bom: true,
  });
  parser.on("readable", function () {
    // console.log("headers:", headers);

    // Parse first row (headers)
    if ((columns = parser.read()) !== null) {
      headers = columns;
      let headerMessage = validateCSVHeaders(headers);
      if (headerMessage !== null) {
        errorMessage = headerMessage;
        return;
      }
    } else if (headers.length === 0) {
      // This has to be an else if statement, because the parser goes through readable twice
      errorMessage = "Blank/unreadable file";
      return;
    }

    // Parse records
    while ((record = parser.read()) !== null) {
      console.log(record);

      // Convert the row array to an object using columns
      let rowData = columns.reduce((obj, header, index) => {
        obj[header] = record[index];
        return obj;
      }, {});

      // Assert that we have not parsed more than what we should
      if (processedRecords >= N) {
        fails.push(rowData);
        continue;
      }

      // If row is valid, add to successes; otherwise add to fails
      if (isValidRow(rowData)) {
        successes.push(rowData);
      } else {
        fails.push(rowData);
      }
      processedRecords += 1;
    }
  });
  parser.on("error", function (err) {
    console.error(err.message);
  });
  parser.on("end", function () {
    // Return error if problem with the file was found
    if (errorMessage !== undefined) {
      console.log("Error:");
      console.log(errorMessage);
      return res.status(400).json({ error: errorMessage });
    }

    let records = {
      success: successes,
      fail: fails,
    };

    postRecordData((url = "http://127.0.0.1:3000/receive"), records); // TODO: Change to actual endpoint

    // Error message to email
    let emailMessage = "";
    if (fails.length > 0) {
      if (successes.length >= 0) {
        emailMessage = "partial success";
      } else {
        emailMessage = "no successes";
      }
    } else {
      emailMessage = "full success";
    }
    // console.log(emailMessage);
    sendEmail(emailMessage);
    // console.log();

    return res.status(200).json({ records });
  });
  parser.write(buffer);
  parser.end();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
