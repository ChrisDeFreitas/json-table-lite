const jst = require(".");
jst.init("test.db").then(()=>{
   console.log("initiated");

   jst.getColumns().then(clms=>{
      console.log("columns", clms);
   });

   jst.get().then(rows => {
      console.log("should match all rows", rows);
   });
});

