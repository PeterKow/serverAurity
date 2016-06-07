const qs = require('querystring')
const Boom = require('boom')
//const Wreck = require('wreck')
const requestExternal = require('request')
const Joi = require('joi')
const AuthPlugin = require('../../auth')

const internals = {};

exports.checkGet = checkGet

internals.applyRoutes = function (server, next) {

  const Tweet = server.plugins['hapi-mongo-models'].Tweet;

  server.route({
    method: 'GET',
    path: '/username',
    config: {},
    handler: getTweetsByUserName
  })

  server.route({
    method: 'GET',
    path: '/check',
    config: {},
    handler: checkGet
  });

  function getTweetsByUserName (request, reply) {
    //console.log('request', request.url)
    //console.log('sss', qs.parse('{%22limit%22:50,%22sort%22:{%22favorite_count%22:1},%22userName%22:%22dan_abramov%22,%22favorite_count%22:10,%22retweet_count%22:10}'))

    const query = request.query
    const fields = query.fields;
    const sort = query.sort;
    const limit = parseInt(query.limit,10) || 10;
    const page = query.page;

    //console.log('query', query)

    //console.log('query', qs.parse(query))

    // TODO hepijs validation!!!
    const newQuery = {
      "user.screen_name": query.userName.toLowerCase(),
      "completed": {
        "$ne": true
      },
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

function checkGet (request, reply) {
  const Tweet = require('../../models/tweet');
  const oauth = getAuth(request);
  const params = {
    q: request.query,
    count: 100,
  };
  let url = 'https://api.twitter.com/1.1/search/tweets.json?';
  url += qs.stringify(params);

  requestExternal.get({
    url: url,
    oauth: oauth,
    json: true
  }, function(e, r, result) {

    if(result.errors){
      console.log("result error", result.errors[0].code);
      if (result.errors[0].code === 32) {
        errorHandling(reply, result)
      }
    }
    if(reply){
      return reply(result)
    } else {
      // CRONE
      console.log('CRONE: Syncing new tweets - length: ', result.statuses.length)

      result.statuses.map(function(tweet){
        Tweet.upsert(tweet)
          .then((result, error)=> {
            if(error){
              console.log('NO OK - save tweet!', error)
            } else {
              console.log('OK - save tweet!', !!result)
            }
          })
      })
    }
  });
}

function errorHandling(reply, result){
  if(reply) {
    return reply(Boom.badGateway(result.errors[0].message))
  } else {
    // FOR CRONE
    console.log('CRONE failed ', result)
  };
}

function getAuth(req = {}){
  const auth = {
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret:  process.env.TWITTER_SECRET,
    token: req.token || process.env.TW_ACCESS_TOKEN,
    token_secret: req.secret || process.env.TW_ACCESS_TOKEN_SECRET,
  }
  console.log('!!!!!!!!!!!!!auth', auth)
  return auth
}


exports.register = function (server, options, next) {

  server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

  next();
};


exports.register.attributes = {
  name: 'tweet'
}
