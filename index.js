/*!
 * json-table-lite
 * Copyright(c) 2017 Jesse Tijnagel (Guilala)
 * MIT Licensed
 */

/*jslint node: true */

"use strict";

var sqlite3 = require("sqlite3").verbose();

// connect this.db.and create table
const initDb = function(dbFile) {
   this.db = new sqlite3.Database(dbFile);

   return new Promise((resolve, reject) => {
      this.db.run("CREATE TABLE IF NOT EXISTS jst (id INTEGER PRIMARY KEY UNIQUE)", err => {
         if(err) reject(err);
         else resolve();
      });
   });
};

// get existing columns
const getColumns = function() {
   return new Promise((resolve, reject) => {
      this.db.all("PRAGMA table_info(jst)", (err, columns) => {
            if(err) reject(err);
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
const addNewColumns = function(json) {
   return new Promise((resolve) => {
      getColumns.call(this).then((existingColumns)=>{
         const newColumnNames = [];

         Object.keys(json).forEach(key => {
            if(existingColumns.indexOf(key) === -1) {
               newColumnNames.push(key);
            }
         });

         const addColumn = () => {
            var newColumn = newColumnNames.pop();
            if(newColumn) {
               this.db.run("ALTER TABLE jst ADD COLUMN " + newColumn + " BLOB", () => {
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

const insertNewRow = function(json) {
   return new Promise((resolve) => {
      const parsed = parseToTable(json);

      this.db.run("INSERT INTO jst (" + parsed.keys.join(",") + ") values (" + parsed.values.join() + ")", err => {
         if(err) console.log("Insert row", err);
         else resolve();
      });
   });
};

const closeDb = function() {
   return new Promise((resolve, reject) => {
      // close db
      this.db.close((err)=> {
         if(err) reject(err);
         else {
            resolve();
         }
      });
   });
};

const insert = function(json) {
   return new Promise((resolve, reject) => {
      addNewColumns.call(this, json)
      .then(()=> { return insertNewRow.call(this, json); })
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

      this.db.run("UPDATE jst SET " + setting + " WHERE ID = " + row.id, err => {
         if(err) reject(err);
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
      }

      this.db.all("SELECT * FROM jst" + match, function(err, rows) {
         if(err) reject(err);
         else resolve(rows);
      });
   });
};

const getMatchParsed = function(json) {
   return new Promise((resolve, reject) => {
      getMatch.call(this, json).then(rows => {
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
         insert.call(this, jsonToSet).then(resolve, reject);
      };

      if (
         jsonToMatch &&
         Object.keys(jsonToMatch).length
      ) {
         getMatch.call(this, jsonToMatch).then(matches => {
            if(matches.length) {
               const updates = [];
               matches.forEach(match => {
                  updates.push(update.call(this, match, jsonToSet));
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
      getMatch.call(this, json).then((matches) => {
         const deletions = [];

         matches.forEach(match => {
            deletions.push(new Promise((resolve, reject) => {
               this.db.run("DELETE FROM jst WHERE ID = " + match.id, err => {
                  if(err) reject(err);
                  else resolve();
               });
            }));
         });

         Promise.all(deletions).then(resolve, reject);
      });
   });
};

module.exports = function() {
   const ctx = {};

   this.close = closeDb.bind(ctx);
   this.get = getMatchParsed.bind(ctx);
   this.getProperties = getColumns.bind(ctx);
   this.init = initDb.bind(ctx);
   this.remove = removeMatch.bind(ctx);
   this.set = setMatch.bind(ctx);
};

