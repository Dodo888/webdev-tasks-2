var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
module.exports = {
    serverUrl: 'mongodb://localhost:27017/test',
    currentCollection: 'students',
    currentAttribute: '',
    negation: false,
    attributeLimits: {},
    attributeUpdates: {},
    readyForQuery: true,
    server: function (url) {
        this.serverUrl = url;
        return this;
    },
    collection: function (collectionName) {
        this.currentCollection = collectionName;
        return this;
    },
    set: function (attribute, value) {
        this.attributeUpdates[attribute] = value;
        return this;
    },
    where: function (attribute) {
        this.currentAttribute = attribute;
        return this;
    },
    equal: function (value) {
        addLimit(this, {$ne: value}, value);
        this.negation = false;
        return this;
    },
    lessThan: function (value) {
        addLimit(this, {$gte: value}, {$lt: value});
        this.negation = false;
        return this;
    },
    greaterThan: function (value) {
        addLimit(this, {$lte: value}, {$gt: value});
        this.negation = false;
        return this;
    },
    include: function (value) {
        addLimit(this, {$nin: value}, {$in: value});
        this.negation = false;
        return this;
    },
    not: function () {
        this.negation = true;
        return this;
    },
    find: function (callback) {
        var query = function (err, db) {
            assert.equal(null, err);
            var collection = db.collection(this.currentCollection);
            collection.find(this.attributeLimits).toArray(function (err, items) {
                this.attributeLimits = {};
                assert.equal(null, err);
                db.close();
                callback(err, items);
            }.bind(this));
        }.bind(this);
        MongoClient.connect(this.serverUrl, query);
    },
    insert: function (object, callback) {
        var query = function (err, db) {
            assert.equal(null, err);
            var collection = db.collection(this.currentCollection);
            collection.insertOne(object, function (err, items) {
                assert.equal(null, err);
                db.close();
                callback(err, items);
            }.bind(this));
        }.bind(this);
        MongoClient.connect(this.serverUrl, query);
    },
    remove: function (callback) {
        var query = function (err, db) {
            assert.equal(null, err);
            var collection = db.collection(this.currentCollection);
            collection.deleteMany(this.attributeLimits, function (err, items) {
                this.attributeLimits = {};
                assert.equal(null, err);
                db.close();
                callback(err, items);
            }.bind(this));
        }.bind(this);
        MongoClient.connect(this.serverUrl, query);
    },
    update: function (callback) {
        var query = function (err, db) {
            assert.equal(null, err);
            var collection = db.collection(this.currentCollection);
            collection.updateMany(this.attributeLimits, {$set: this.attributeUpdates},
                function (err, items) {
                    this.attributeLimits = {};
                    this.attributeUpdates = {};
                    assert.equal(null, err);
                    db.close();
                    callback(err, items);
                }.bind(this));
        }.bind(this);
        MongoClient.connect(this.serverUrl, query);
    }
};

function addLimit(query, ifNegated, ifNotNegated) {
    if (query.attributeLimits[query.currentAttribute] && !query.attributeLimits['$and']) {
        query.attributeLimits = {$and: [copy(query.attributeLimits)]};
    }
    if (query.attributeLimits['$and']) {
        var limit = {};
        limit[query.currentAttribute] = query.negation ? ifNegated : ifNotNegated;
        query.attributeLimits['$and'].push(limit);
        return query;
    }
    query.attributeLimits[query.currentAttribute] = query.negation ? ifNegated : ifNotNegated;
    return query;
}

function copy(obj) {
    var newObj = {};
    for (var key in obj) {
        newObj[key] = obj[key];
    }
    return newObj;
}
