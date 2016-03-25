'use strict';

var Q = require('q')

const Boom = require('boom');
const Joi = require('joi');
const AuthPlugin = require('../../auth');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Tweet = server.plugins['hapi-mongo-models'].Tweet;

    server.route({
        method: 'GET',
        path: '/dbTest',
        config: {},
        handler: getTweetsByUserName
    });


    function getTweetsByUserName (request, reply) {

        const query = {};
        const fields = request.query.fields;
        const sort = request.query.sort;
        const limit = request.query.limit;
        const page = request.query.page;

        console.log('----', query, fields, sort, limit, page)

        Tweet
            .findByUsername('dan_abramov')
            .then( data => {
                reply(data)
            })
            .catch( data => {
                console.log('---- ERROR', data)
                reply(data)
            })
    }

    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'tweet'
};
