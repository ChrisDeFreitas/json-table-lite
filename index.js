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

         // console.log("new columns", newColumnNames);
         const addColumn = () => {
            var newColumn = newColumnNames.pop();
            if(newColumn) {
               db.run("ALTER TABLE jst ADD COLUMN " + newColumn + " BLOB", () => {
                  // don't throw errors here: can be used parallel but cannot use IF NOT EXISTS
                  addColumn();
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
      // console.log("setting", "UPDATE jst SET " + setting + " WHERE ID = " + row.id);

      db.run("UPDATE jst SET " + setting + " WHERE ID = " + row.id, err => {
         if(err) console.log("Update", err);
         else resolve();
      });
   });
};

const getMatch = function(json) {
   return new Promise((resolve, reject) => {
      var match = "";
      if(
         json &&
         Object.keys(json).length
      ) {
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

const setMatch = function(jsonToSet, jsonToMatch) {
   return new Promise((resolve, reject) => {

      // set new records
      const newRecord = () => {
         insert(jsonToSet).then(resolve, reject);
      };

      if (
         jsonToMatch &&
         Object.keys(jsonToMatch).length
      ) {
         getMatch(jsonToMatch).then(matches => {
            if(matches.length) {
               const updates = [];
               matches.forEach(match => {
                  updates.push(update(match, jsonToSet));
               });

               Promise.all(updates).then(resolve, reject);
            } else {
               // no match
               newRecord();
            }
         }, ()=>{
            // column mismatch
            newRecord();
         });
      }

      else {
         // set without match
         newRecord();
      }
   });
};

const removeMatch = function(json) {
   return new Promise((resolve, reject) => {
      getMatch(json).then((matches) => {
         const deletions = [];

         matches.forEach(match => {
            deletions.push(new Promise((resolve, reject) => {
               db.run("DELETE FROM jst WHERE ID = " + match.id, err => {
                  if(err) reject(err);
                  else resolve();
               });
            }));
         });

         Promise.all(deletions).then(resolve, reject);
      });
   });
};

module.exports = {
   close: closeDb,
   get: getMatchParsed,
   getProperties: getColumns,
   init: initDb,
   remove: removeMatch,
   set: setMatch
};

