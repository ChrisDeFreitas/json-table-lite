var sqlite3 = require("sqlite3").verbose();

// create db
var dbFile = "./test.db";
var db = new sqlite3.Database(dbFile);

// test obj
var obj = {
   aap: 1,
   noot: "A piece of text.",
   mies: {
      nog: "iets"
   }
};

// create table
const createTable = () => {
   return new Promise((resolve) => {
      db.run("CREATE TABLE IF NOT EXISTS jst (id INTEGER PRIMARY KEY AUTOINCREMENT)", err => {
         if(err) console.log("Create table", err);
         else resolve();
      });
   });
};

// get existing columns
const getColumns = () => {
   return new Promise((resolve) => {
      db.all("PRAGMA table_info(jst)", (err, columns) => {
            if(err) console.log("Column names", err);
            else {
               var columnNames = columns.map((column) => {
                  return column.name;
               });
               resolve(columnNames);
            }
      });
   });
};

// insert new columns
const addNewColumns = (existingColumns) => {
   return new Promise((resolve) => {
      const newColumnNames = [];
      Object.keys(obj).forEach(key => {
         if(existingColumns.indexOf(key) === -1) {
            newColumnNames.push(key);
         }
      });

      console.log("new columns", newColumnNames);

      const addColumn = () => {
         var newColumn = newColumnNames.pop();
         if(newColumn) {
            db.run("ALTER TABLE jst ADD COLUMN " + newColumn + " BLOB", err => {
               if(err) console.log("Add column", newColumn,  err);
               else addColumn();
            });
         } else {
            resolve();
         }
      };

      addColumn();
   });
};

const insertNewRow = () => {
   const columnNames = [];
   const columnValues = [];

   Object.keys(obj).forEach(key => {
      columnNames.push(key);
      var val = obj[key];

      if(val.constructor === Number) {
         columnValues.push(val);
      } else if(val.constructor === String) {
         columnValues.push("'" + val + "'");
      } else if(val.constructor === Object) {
         columnValues.push("'" + JSON.stringify(val) + "'");
      } else {
         columnValues.push("null");
      }
   });

   return new Promise((resolve) => {
      db.run("INSERT INTO jst (" + columnNames.join(",") + ") values (" + columnValues.join() + ")", err => {
         if(err) console.log("Insert row", err);
         else resolve();
      });
   });
};

const show = () => {
   console.log("show");

   // close db
   db.close();
};

createTable()
.then(getColumns)
.then(addNewColumns)
.then(insertNewRow)
.then(show)

