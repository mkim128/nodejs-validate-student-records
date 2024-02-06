var jsforce = require("jsforce");
const express = require("express");

const app = express();
app.use(express.json());

// contains password/sensitive values
require("dotenv").config();

ex_rec = {
    First_Name: "Pragadeesh",
    Last_Name: "Raj",
    Employee_ID: "",
    Student_ID: 921126636,
    UC_Davis_Email_Address: "prgraj@ucdavis.edu",
    Handshake_Number: 23654566,
    Title_Code: 123456,
    Position_Number: 456855,
    Funding_Transaction_No: "",
    Funding_Account: "K30PCR4D84-TASK01-APPA002-770000-K324D84-27420",
    Timesheet_Identifier: "",
    Appt_Percentage: 35,
    Department_Code: 888888,
    Pay_Rate: 15,
    Differential_Amount: 0.35,
    Differential_Reason: "text",
    Start_Date: "10/30/2023",
    End_Date: "6/30/2024",
    Background_Check_Clearance: "",
    Physical_TB_Clearance: "",
    DMV_Completed: "",
    HRC_Comments: "",
    OB_Date_Time: "6/30/2024",
    Reports_To: "first last",
    Supervisor: "",
    Backup_Supervisor: "",
    Optional_Supervisor: "",
    Location: "loc",
    Cubicle: "cubicle12345678",
};

case_mappings = {
    // field mappings
    Origin: "Community",
    // Employee_UCPATH_ID__c: Employee_ID,
    // Employee_UCPATH_ID__c: 12345678,
    RecordTypeId: "01215000000X7hlAAC",
    RecordType_Name__c: "Recruitment_Direct_Hire",
    Submitter_Name__c: ex_rec["First_Name"] + " " + ex_rec["Last_Name"],
    Submitter_Email__c: ex_rec["UC_Davis_Email_Address"], // different from spreadsheet
    X1_Student_ID__c: ex_rec["Student_ID"],
    Appointment_Percentage__c: ex_rec["Appt_Percentage"],
    Department_Code1__c: ex_rec["888888"],
    Salary__c: ex_rec["Pay_Rate"],
    Handshake_Number__c: ex_rec["Handshake_Number"],
    Title_Code__c: ex_rec["Title_Code"],
    PA_Position_Number__c: ex_rec["Position_Number"],
    Chart_of_Accounts__c: ex_rec["Funding_Account"], // different from spreadsheet
    New_Timesheet_Supervisor__c: ex_rec["Supervisor"],
    Backup_Timesheet_Supervisor__c: ex_rec["Backup_Supervisor"],
    Optional_Timesheet_Supervisor__c: ex_rec["Optional_Supervisor"],
    Start_Date__c: new Date(ex_rec["Start_Date"]),
    End_Date__c: new Date(ex_rec["End_Date"]),
    Job_Location__c: ex_rec["Location"],
    Cubicle__c: ex_rec["Cubicle"],
    Identifier__c: ex_rec["Timesheet_Identifier"],
    // Differential__c: ex_rec["Differential_Amount"],
    Description: ex_rec["Differential_Reason"],
    Background_Check_Complete__c: ex_rec["Background_Check_Clearance"],
    TB_Test_Complete__c: ex_rec["Physical_TB_Clearance"],
    Added_to_DMV_Spreadsheet__c: ex_rec["DMV_Completed"],
    Internal_Comments_ONLY__c: ex_rec["HRC_Comments"],
};

// TODO: look into access token uses later
// var conn = new jsforce.Connection({
//     instanceUrl: "https://aggieservice--mijkim.sandbox.my.salesforce.com",
//     accessToken:
//         "00D7h000000H41e!AQkAQCKCFmQR1im0ghaRFhRsRRUIA9reD.3l0tzoFOc1NnGfo4RCPaqcpFU9.QwxEMU_5IZhpoc2JljIQOE.2pzVTRELc4We",
// });
// conn.sobject("Case").create(case_mappings, function (err, ret) {
//     if (err || !ret.success) {
//         return console.error(err, ret);
//     }
//     console.log("Created record id : " + ret.id);
//     // ...
// });

// Connection with username and password
// var conn = new jsforce.Connection({
//     // you can change loginUrl to connect to sandbox or prerelease env.
//     loginUrl: "https://aggieservice--mijkim.sandbox.my.salesforce.com/",
// });

// var username = "aggiesrv_api@aggieservice.ucdavis.edu.mijkim";
// var password = process.env.salesforce_pw + process.env.salesforce_st;
// // var username = "mijkim@aggieservice.ucdavis.edu.mijkim";

// conn.login(username, password, async function (err, userInfo) {
//     if (err) {
//         return console.error(err);
//     }
//     // Now you can get the access token and instance URL information.
//     // Save them to establish connection next time.
//     console.log(conn.accessToken);
//     console.log(conn.instanceUrl);
//     // logged in user property
//     console.log("User ID: " + userInfo.id);
//     console.log("Org ID: " + userInfo.organizationId);

//     // Single record creation
//     await conn.sobject("Case").create(case_mappings, function (err, ret) {
//         if (err || !ret.success) {
//             return console.error(err, ret);
//         }
//         console.log("Created record id : " + ret.id);
//         // ...
//     });

//     console.log("hello, running more stuff");
// });

// Connection with accesstoken
// var conn = new jsforce.Connection({
//     instanceUrl: "https://aggieservice--mijkim.sandbox.my.salesforce.com",
//     accessToken:
//         "00D7h000000H41e!AQkAQCKCFmQR1im0ghaRFhRsRRUIA9reD.3l0tzoFOc1NnGfo4RCPaqcpFU9.QwxEMU_5IZhpoc2JljIQOE.2pzVTRELc4We",
// });

// fails = [];
// successes = [];

// for (let i = 0; i < 2; i++) {
//     // todo: change 1 to recordList.length
//     case_mapping = {
//         // field mappings
//         Origin: "Community", // TODO: change from hardcoded value
//         // Employee_UCPATH_ID__c: Employee_ID,
//         // Employee_UCPATH_ID__c: 12345678,
//         Action__c: "Student", // Student, Staff, or Academic

//         RecordTypeId: "01215000000X7hlAAC", // TODO: change from hardcoded value
//         // RecordType_Name__c: "Recruitment_Direct_Hire",
//         Submitter_Name__c:
//             recordList[i]["First_Name"] + " " + recordList[i]["Last_Name"],
//         Submitter_Email__c: recordList[i]["UC_Davis_Email_Address"], // different from spreadsheet
//         // ContactEmail: recordList[i]["UC_Davis_Email_Address"],
//         X1_Student_ID__c: recordList[i]["Student_ID"],
//         Appointment_Percentage__c: recordList[i]["Appt_Percentage"],
//         Department_Code1__c: recordList[i]["888888"],
//         Salary__c: recordList[i]["Pay_Rate"],
//         Handshake_Number__c: recordList[i]["Handshake_Number"],
//         Title_Code__c: recordList[i]["Title_Code"],
//         PA_Position_Number__c: recordList[i]["Position_Number"],
//         Chart_of_Accounts__c: recordList[i]["Funding_Account"], // different from spreadsheet
//         New_Timesheet_Supervisor__c: recordList[i]["Supervisor"],
//         Backup_Timesheet_Supervisor__c: recordList[i]["Backup_Supervisor"],
//         Optional_Timesheet_Supervisor__c: recordList[i]["Optional_Supervisor"],
//         Start_Date__c: new Date(recordList[i]["Start_Date"]),
//         End_Date__c: new Date(recordList[i]["End_Date"]),
//         Job_Location__c: recordList[i]["Location"],
//         Cubicle__c: recordList[i]["Cubicle"],
//         Identifier__c: recordList[i]["Timesheet_Identifier"],
//         // Differential__c: recordList[i]["Differential_Amount"],
//         Description: recordList[i]["Differential_Reason"],
//         Background_Check_Complete__c:
//             recordList[i]["Background_Check_Clearance"],
//         TB_Test_Complete__c: recordList[i]["Physical_TB_Clearance"],
//         Added_to_DMV_Spreadsheet__c: recordList[i]["DMV_Completed"],
//         Internal_Comments_ONLY__c: recordList[i]["HRC_Comments"],
//         Anything_else_you_d_like_us_to_know_del__c: "test",
//     };
//     try {
//         const ret = conn.sobject("Case").create(case_mapping);
//         console.log("Created record id : " + ret.id);
//         console.log(ret);
//         successes.push(case_mapping);
//     } catch (err) {
//         console.log("Failed to create record. Error: " + err);
//         fails.push(case_mapping);
//     }
// }

// authentication with oath2 (WIP) ///////////////////////////////////////////////////////
var conn = new jsforce.Connection({
    oauth2: {
        clientId: process.env.salesforce_consumer_key,
        clientSecret: process.env.salesforce_consumer_secret,
        redirectUri: "http://localhost:3000/redirect", // may be wrong
    },
    instanceUrl: "https://aggieservice--mijkim.sandbox.my.salesforce.com",
    accessToken:
        "00D7h000000H41e!AQkAQGfwCezkhrSjj1_yfu.P.Ro.NCa0BZFaHFR21ErFhjx4159izZqun9LMXnqeOUWNouRdk3oxRq_CaD42uKnmKcAwh9v9",
    refreshToken: "",
});
conn.on("refresh", function (accessToken, res) {
    // Refresh event will be fired when renewed access token
    // to store it in your storage for next request
    console.log("Refreshing");
});

// Single record creation
conn.sobject("Case").create(case_mappings, function (err, ret) {
    if (err || !ret.success) {
        return console.error(err, ret);
    }
    console.log("Created record id : " + ret.id);
    // ...
});

console.log("hello, running more stuff");
/////////////////////////////////////////////////////////////////////////
//
// OAuth2 client information can be shared with multiple connections.
//
// var oauth2 = new jsforce.OAuth2({
//     // you can change loginUrl to connect to sandbox or prerelease env.
//     loginUrl: "https://aggieservice--mijkim.sandbox.my.salesforce.com",
//     clientId: process.env.salesforce_consumer_key,
//     clientSecret: process.env.salesforce_consumer_secret,
//     // redirectUri: "http://localhost:3000/redirect", // may be wrong
// });
// console.log(oauth2.getAuthorizationUrl({ scope: "api id web refresh_token" }));
//
// Get authorization url and redirect to it.

// app.get("/oauth2/auth", function (req, res) {
//     console.log("hello");
//     res.redirect(oauth2.getAuthorizationUrl({ scope: "api id web" }));
// });

// Define a port for the server to listen on
// const PORT = process.env.PORT || 3000;

// Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
console.log();
