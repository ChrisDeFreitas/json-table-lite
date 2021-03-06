/*!
 * json-table-lite
 * Copyright(c) 2017 Jesse Tijnagel (Guilala)
 * MIT Licensed
 */

/*jslint node: true */

"use strict";

const jtl = require(".");
const fs = require("fs");

const testFile1 = "./test1.db";
const testFile2 = "./test2.db";

// delete old test files
if(fs.existsSync(testFile1)) fs.unlinkSync(testFile1);
if(fs.existsSync(testFile2)) fs.unlinkSync(testFile2);

// context for two JSON tables
const store1 = new jtl();
const store2 = new jtl();

// load or create, and prepare first JSON table
store1.init(testFile1)

.then(() => {

   // store an object
   return store1.set({
      name: "Jane",
      surname: "Doe",
      age: 30
   });

})

.then(() => {

   // properties
   return store1.getProperties();

})

.then(properties => {
   console.log(properties);

   // store second object
   return store1.set({
      name: "John",
      surname: "Doe",
      age: 36,
      town: "Brussels"
   });

})

.then(() => {

   // get properties again
   return store1.getProperties();

})

.then(properties => {
   console.log(properties);

   // retreive Jane's record
   return store1.get({
      name: "Jane"
   });

})

.then(records => {
   console.log(records);

   // update Jane's record
   return store1.set({
      age: 31
   }, {
      name: "Jane"
   });
})

.then(() => {

   // retreive all records
   return store1.get();

})

.then(records => {
   console.log(records);

   // delete John's record
   return store1.remove({
      name: "John"
   });
})

.then(() => {

   // retreive all records again
   return store1.get();

})

.then(records => {
   console.log(records);
});


// load or create, and prepare a second JSON table in parallel
store2.init(testFile2)

.then(() => {

   // store an object
   return store2.set({
      furniture: ["chair", "table"],
      chars: "Quote's"
   });

})

.then(() => {

   // properties
   return store2.getProperties();

})

.then(properties => {
   console.log(properties);
});

