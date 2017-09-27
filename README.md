# json-table-lite
Simple JSON storage facility for Node.js.

## Reason
Often in need of fast, easy and lightweight, but still reliable way of storing JSON at back- end.

## What didn't work
* Storing plain JSON files.
   * To slow.
   * Not easy to use.
   * Inefficient.
   * To much data in memory.
* SQL.
   * Not compatible with json data without extention.
   * Overkill.
   * To centralized.
* Mongodb.
   * Tested several versions / years, but keeps eating to much cpu when idle.
   * Overkill.
   * To centralized.
* nedb, nedb-core, etc.
   * Unreliable.
   * Not maintained.
   * To much data in memory.

## Solution
A simple one dimentional JSON parser wrapper around SQLite.

## Why
* SQLite and it's Node.js client are fast, lightweight and reliable.
* SQLite can be used decentralized.
* Don't often need to search deeper than one level anyway.

