const jtl = require(".");
const fs = require('fs');

const testFile = "./test.db"; 

// delete old test file
if(fs.existsSync(testFile)) fs.unlinkSync(testFile);

// load or create, and prepare SQLite file
jtl.init("test.db")

.then(() => {

   // store an object
   return jtl.set({
      name: "Jane",
      surname: "Doe",
      age: 30
   });

})

.then(() => {
   
   // get properties
   return jtl.getProperties();

})

.then(properties => {
   console.log(properties);

   // store second object
   return jtl.set({
      name: "John",
      surname: "Doe",
      age: 36,
      town: "Brussels"
   });

})

.then(() => {

   // get properties again
   return jtl.getProperties();

})

.then(properties => {
   console.log(properties);

   // retreive Jane's record
   return jtl.get({
      name: "Jane"
   });

})

.then(records => {
   console.log(records);

   // update Jane's record
   return jtl.set({
      age: 31
   }, {
      name: "Jane"
   });
})

.then(() => {

   // retreive all records
   return jtl.get();

})

.then(records => {
   console.log(records);

   // delete John's record
   return jtl.remove({
      name: "John"
   });
})

.then(() => {

   // retreive all records again
   return jtl.get();

})

.then(records => {
   console.log(records);
});

