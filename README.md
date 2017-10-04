# json-table-lite
Simple JSON storage facility for Node.js.

## Reason
Often in need of a fast, easy and lightweight, yet reliable way of storing data.

## What didn't work
* Storing plain JSON files
   * To slow.
   * Not easy to use.
   * Inefficient.
   * To much data in memory.
* SQL
   * Not compatible with json data without extention.
   * Overkill.
   * To centralized.
* Mongodb
   * Tested several versions / years, but keeps eating to much cpu when idle.
   * Overkill.
   * To centralized.
* nedb, nedb-core, etc
   * Unreliable.
   * Not maintained.
   * To much data in memory.

## Solution
A simple, one dimentional parser wrapper around sqlite3, for storing and retreiving JSON data.

## Why
* SQLite and it's Node.js client are fast, lightweight and reliable.
* SQLite can be used decentralized.
* Don't often need to search deeper than one level anyway.

## Faq
* Why are there no features for handling multiple tables in one SQLite file?
   * The idea behind this approach is storing a table of JSON data, not storing single values in relational tables.
   * You can still handle relations between tables with Javascript just as easy (easier).
   * SQLite seems to block subsequent queries while it is writing. By using a separate file for each table, writing tables is non-blocking for others.
   * No SQL statement syntax please, and Keep It Simple, Stupid.

## Todo
* Count.
* Operators.
* Tests.

## Example
Clone source code from Github and run the [example](example.js).
```bash
git clone git@github.com:guilala/json-table-lite.git
cd json-table-lite
npm i
node example.js
```

The output should be something like this.
```javascript
[ 'id', 'furniture' ]
[ 'id', 'age', 'surname', 'name' ]
[ 'id', 'age', 'surname', 'name', 'town' ]
[ { id: 1, age: 30, surname: 'Doe', name: 'Jane', town: null } ]
[ { id: 1, age: 31, surname: 'Doe', name: 'Jane', town: null },
  { id: 2, age: 36, surname: 'Doe', name: 'John', town: 'Brussels' } ]
[ { id: 1, age: 31, surname: 'Doe', name: 'Jane', town: null } ]
```

A getProperties will at least return 'id'. This is the unique identifier index column of SQLite.

The first output shows two properties because a first record with the property 'furniture' has been stored in a db with file name 'test2.db'. This action started last in example.js, and runs asynchronous in parallel with the first. It outputs first because the record that gets stored is smaller.
```javascript
[ 'id', 'furniture' ]
```

The second output shows four properties because a first record with 'name', 'surname' and 'age' has been stored in a db with file name 'test1.db'. You could also set a custom id as long as it's a unique integer.
```javascript
[ 'id', 'age', 'surname', 'name' ]
```

After a secound record has been stored, containing a new property, you can see that it's automatically added. In SQLite this adds a new column.
```javascript
[ 'id', 'age', 'surname', 'name', 'town' ]
```

The next output is from retreiving Jane's record only.
```javascript
[ { id: 1, age: 30, surname: 'Doe', name: 'Jane', town: null } ]
```

Following output is from getting all records after Jane's age has been updated.
```javascript
[ { id: 1, age: 31, surname: 'Doe', name: 'Jane', town: null },
  { id: 2, age: 36, surname: 'Doe', name: 'John', town: 'Brussels' } ]
```

Last output shows all records after John's record has been deleted.
```javascript
[ { id: 1, age: 31, surname: 'Doe', name: 'Jane', town: null } ]
```

Look into [example.js](example.js) to see how this has been achieved.

