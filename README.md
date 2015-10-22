heighliner-expression-engine
============================

Sync data from EE's mySQL database to Apollos' MongoDB

Development
-----------

This is a node application that relies on a connection to a mySQL instance (with mySQL binlog configured) and a mongodb instance to store the data. In order to make local development easier, we have configured two database containers to connect to when working on the app. In production, you should use the correct settings to connect to your dbs.

To run locally you need docker-compose installed. Then run

```bash
$ npm install
$ docker-compose build
$ docker-compose up
```

Then connect to the mysql container using the tool of your choice (I use sequel pro) and import your db.

Everytime you save a file that effects the node app, it will restart so development should be straightforward.
