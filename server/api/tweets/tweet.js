'use strict';

const qs = require('querystring');

const Boom = require('boom');
const Joi = require('joi');
const AuthPlugin = require('../../auth');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Tweet = server.plugins['hapi-mongo-models'].Tweet;

    server.route({
        method: 'GET',
        path: '/username',
        config: {},
        handler: getTweetsByUserName
    });


    function getTweetsByUserName (request, reply) {
        //console.log('request', request.url)
        //console.log('sss', qs.parse('{%22limit%22:50,%22sort%22:{%22favorite_count%22:1},%22userName%22:%22dan_abramov%22,%22favorite_count%22:10,%22retweet_count%22:10}'))

        const query = request.query
        const fields = query.fields;
        const sort = query.sort;
        const limit = parseInt(query.limit,10) || 10;
        const page = query.page;

        console.log('query', query)

        //console.log('query', qs.parse(query))

        // TODO hepijs validation!!!
        const newQuery = {
            'user.screen_name': query.userName.toLowerCase(),
            "favorite_count": {
                "$gt": parseInt(query.favoriteCount,10),
            },
            "retweet_count": {
                "$gt": parseInt(query.retweetCount,10),
            },
        }


//         {
//    "_id": null, 
//   "favorite_count": { $stdDevSamp: "$favorite_count" },
//   "retweet_count": { $stdDevSamp: "$retweet_count" },
  
//   "favorite_count_avg": { $avg: "$favorite_count" },
//   "retweet_count_avg": { $avg: "$retweet_count" }
// }


// agregate .aggregate({    $project: {        item: 1,        comparisonResult: {            $strcasecmp: [                "$text",                "react"             ]        }    }})


// { "text": { $in: [/^react.*redux/i] } }


        //console.log('query', qs.parse(query))
        //console.log('querynewww', qs.parse('foo[bar][baz]=foobarbaz')))
        //console.log('querynewww', qs.parse('sort%5B0%5D%5Bfavorite_count%5D=1&userName=dan_abramov&favorite_count=10&retweet_count=10',  { allowPrototypes: true } ))
        console.log('new query', newQuery)
        //console.log('sort', sort)
        Tweet
            .pagedFind(newQuery, fields, sort, limit, page, function (err, results) {

                if (err) {
                    return reply(Boom.badGateway(err))
                }

                reply(results)
            })

    //    Tweet
    //        .findByUsername('dan_abramov')
    //        .then( data => {
    //            reply(data)
    //        })
    //        .catch( data => {
    //            console.log('---- ERROR', data)
    //            reply(data)
    //        })
    }

    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'tweet'
}
