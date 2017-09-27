const jst = require(".");
const fs = require('fs');

const testFile = "./test.db"; 
fs.unlinkSync(testFile);

jst.init(testFile).then(()=>{
   console.log("initiated");

   jst.getColumns().then(clms=>{
      console.log("columns", clms);
   });

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
         noot: "A nice string",
         mies: {
            is: "Another object"
         }
      })
   ]).then(()=>{
      jst.get().then(rows => {
         console.log("should match all rows", rows);
      });
   });
});

