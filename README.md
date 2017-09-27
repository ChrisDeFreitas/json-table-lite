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
A simple one dimentional JSON parser wrapper around SQLite.

## Why
* SQLite and it's Node.js client are fast, lightweight and reliable.
* SQLite can be used decentralized.
* Don't often need to search deeper than one level anyway.

## Example
Clone source code from Github and run example.
```bash
git clone git@github.com:guilala/json-table-lite.git
cd json-table-lite
node example.js
```

The output should be something like this.
```javascript
[ 'id', 'age', 'surname', 'name' ]
[ 'id', 'age', 'surname', 'name', 'town' ]
[ { id: 1, age: 30, surname: 'Doe', name: 'Jane', town: null } ]
[ { id: 1, age: 31, surname: 'Doe', name: 'Jane', town: null },
  { id: 2, age: 36, surname: 'Doe', name: 'John', town: 'Brussels' } ]
[ { id: 1, age: 31, surname: 'Doe', name: 'Jane', town: null } ]
```

A getProperties will at least return 'id'. This is the unique identifier index column of SQLite.
The first output shows four properties because a first record has been stored with 'name', 'surname' and 'age'. You could also set a custom id as long as it's a unique integer.
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

Look into example.js to see how this has been achieved.

