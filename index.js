var multivarka = require('./multivarka.js');
var queue = [];

const petr = {
    name: 'Пётр',
    nickname: 'Симонов',
    group: 'ПИ-303',
    mark: 3
};

queue.push(function () {
    multivarka
        .server('mongodb://localhost:27017/test')
        .collection('students')
        .insert(petr, function (err, result) {
            if (!err) {
                //console.log(result);
                queue.shift()();
            }
        });
});

queue.push(function () {
    multivarka
        .server('mongodb://localhost:27017/test')
        .collection('students')
        .where('group').equal('ПИ-303')
        .set('name', 'Андрей')
        .update(function (err, data) {
            if (!err) {
                //console.log(data);
                queue.shift()();
            }
        });
});

queue.push(function () {
    multivarka
        .server('mongodb://localhost:27017/test')
        .collection('students')
        .where('mark').lessThan(6)
        .where('mark').greaterThan(3)
        .where('name').equal('Полина')
        .find(function (err, data) {
            if (!err) {
                console.log(data);
                queue.shift()();
            }
        });
});

queue.push(function () {
    multivarka
        .server('mongodb://localhost:27017/test')
        .collection('students')
        .where('group').equal('ПИ-303')
        .remove(function (err, data) {
            if (!err) {
                //console.log(data);
                queue.shift()();
            }
        });
});

queue.push(function () {
    multivarka
        .server('mongodb://localhost:27017/test')
        .collection('students')
        .where('name').not().include(['Полина', 'Анна'])
        .find(function (err, data) {
            if (!err) {
                console.log(data);
            }
        });
});

queue.shift()();
