const jst = require(".");
const fs = require('fs');

const testFile = "./test.db"; 
fs.unlinkSync(testFile);

jst.init(testFile).then(()=>{
   console.log("initiated");

   jst.getColumns().then(clms=>{
      console.log("\nShould only have an id column", clms);
   
      Promise.all([
         jst.set({
            aap: 5,
            noot: "A nice string",
            mies: {
               is: "object"
            }
         }),
         jst.set({
            newColumn: "added",
            noot: "Also nice string",
            mies: {
               is: "Another object"
            }
         })
      ]).then(()=>{
         jst.get().then(rows => {
            console.log("\nShould match all rows", rows);
         });

         jst.get({
            mies: { is: "Another object" }
         }).then(rows => {
            console.log("\nShould get single row where 'newColumn' equals 'added'", rows);
            jst.remove(rows.pop()).then(()=>{
               jst.get().then(rows => {
                  console.log("\nShould be one row left, where 'aap' equals 5", rows);
               });
            });
         });

         jst.getColumns().then(clms=>{
            console.log("\nShould now have five columns", clms);
         });
      });
   });
});

