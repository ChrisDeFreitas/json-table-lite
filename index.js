var sqlite3 = require("sqlite3").verbose();

// global db
var db;

// connect db and create table
const initDb = (dbFile) => {
   db = new sqlite3.Database(dbFile);

   return new Promise((resolve, reject) => {
      db.run("CREATE TABLE IF NOT EXISTS jst (id INTEGER PRIMARY KEY UNIQUE)", err => {
         if(err) reject(err);
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
const addNewColumns = (json) => {
   return new Promise((resolve) => {
      getColumns().then((existingColumns)=>{
         const newColumnNames = [];

         Object.keys(json).forEach(key => {
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
   });
};

const parseToTable = function(json) {
   const result = {
      keys: [],
      values: []
   };

   Object.keys(json).forEach(key => {
      result.keys.push(key);
      var val = json[key];

      if(val.constructor === Number) {
         result.values.push(val);
      } else if(val.constructor === String) {
         result.values.push("'" + val + "'");
      } else if(val.constructor === Object) {
         result.values.push("'JSN" + JSON.stringify(val) + "'");
      } else {
         result.values.push("null");
      }
   });

   return result;
};

const parseFromTable = function(row) {
   const result = {};

   Object.keys(row).forEach(key => {
      var val = row[key];

      // parse json strings
      if(
         val &&
         val.constructor === String &&
         val.indexOf("JSN") === 0
      ) {
         val = JSON.parse(val.substring(3));
      }

      result[key] = val;
   });

   return result;
};

const insertNewRow = (json) => {
   return new Promise((resolve) => {
      const parsed = parseToTable(json);

      db.run("INSERT INTO jst (" + parsed.keys.join(",") + ") values (" + parsed.values.join() + ")", err => {
         if(err) console.log("Insert row", err);
         else resolve();
      });
   });
};

const closeDb = function() {
   return new Promise((resolve, reject) => {
      // close db
      db.close((err)=> {
         if(err) reject(err);
         else {
            resolve();
            console.log("Close");
         }
      });
   });
};

const insert = function(json) {
   return new Promise((resolve, reject) => {
      addNewColumns(json)
      .then(()=> { return insertNewRow(json); })
      .then(resolve, reject);
   });
};

const update = function(row, json) {
   return new Promise((resolve, reject) => {
      const parsed = parseToTable(json);
      var setting = [];

      parsed.keys.forEach((key, index) => {
         setting.push(key + " = " + parsed.values[index]);
      });
      setting = setting.join(", ");
      console.log("setting", setting);

      db.run("UPDATE jst SET " + setting + " WHERE ID = " + row.id, err => {
         if(err) console.log("Insert row", err);
         else resolve();
      });
   });
};

const getMatch = function(json) {
   return new Promise((resolve, reject) => {
      var match = "";
      if(json && json.constructor === Object) {
         const parsed = parseToTable(json);
         match = [];
         parsed.keys.forEach((key, index) => {
            match.push(key + " = " + parsed.values[index]);
         });
         match = " WHERE " + match.join(" AND ");
         // console.log("match", match);
      }

      db.all("SELECT * FROM jst" + match, function(err, rows) {
         // console.log(JSON.stringify(rows));
         if(err) reject(err);
         else resolve(rows);
      });
   });
};

const getMatchParsed = function(json) {
   return new Promise((resolve, reject) => {
      getMatch(json).then(rows => {
         resolve(rows.map(row => {
            return parseFromTable(row);
         }));
      }, reject);
   });
};

const setMatch = function(json) {
   return new Promise((resolve, reject) => {
      getMatch(json).then(rows => {
         if(rows.length) {
            const updates = [];
            rows.forEach(row => {
               updates.push(update(row, json));
            });
            Promise.all(updates).then(resolve, reject);
         } else {
            // insert
            insert(json).then(resolve, reject);
         }
      });
   });
};

const removeById = function(json) {
   return new Promise((resolve, reject) => {
      var id = json;
      if(json.constructor === Object && json.id) {
         id = json.id;
      }

      if(id.constructor === String) {
         db.run("DELETE FROM jst WHERE ID = " + id, err => {
            if(err) reject(err);
            else resolve();
         });
      } else reject("json.id or id string expected");
   });
};

module.exports = {
   close: closeDb,
   getColumns: getColumns,
   get: getMatchParsed,
   init: initDb,
   set: setMatch,
   remove: removeById
};

