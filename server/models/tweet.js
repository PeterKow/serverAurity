'use strict';

const Q = require('q')
const Joi = require('joi');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;

const Tweet = BaseModel.extend({
    constructor: function (attrs) {

        ObjectAssign(this, attrs);
    }
});


Tweet._collection = 'tweets';


Tweet._idClass = String;


Tweet.schema = Joi.object().keys({
    _id: Joi.string(),
    id: Joi.number().required(),
    id_str: Joi.string().required(),
    creationDate: Joi.date().default(Date.now, 'time of creation'),
    updateDate: Joi.date().default(Date.now, 'time of update'),
    text: Joi.string(),
    user: Joi.array(),
    source: Joi.string(),
    truncated: Joi.boolean(),
    in_reply_to_status_id: Joi.number(),
    in_reply_to_status_id_str: Joi.string(),
    in_reply_to_user_id: Joi.number(),
    in_reply_to_user_id_str: Joi.string(),
    in_reply_to_screen_name: Joi.string(),
    geo: Joi.any(),
    coordinates: Joi.any(),
    place: Joi.any(),
    contributors: Joi.any(),
    is_quote_status:  Joi.boolean(),
    retweet_count:  Joi.number(),
    favorite_count: Joi.number(),
    entities: Joi.object().keys({
        hashtags: Joi.array(),
        symbols: Joi.array(),
        user_mentions: Joi.array(),
        urls: Joi.array(),
    }),
    favorited: Joi.boolean(),
    retweeted: Joi.boolean(),
    lang: Joi.string(),
    created_at: Joi.string(),
    completed: Joi.boolean()
});


Tweet.indexes = [
    { key: { id: 1 } },
    { key: { id_str: 1 } },
    { key: { user: { screen_name: 1 } } }
];


Tweet.create = function (tweet, callback) {

    const document = tweet;

    this.insertOne(document, (err, docs) => {

        if (err) {
            return callback(err);
        }

        callback(null, docs[0]);
    });
};

Tweet.findByUsername = function (username) {

    const query = { 'user.screen_name': username.toLowerCase() };

    var promise = Q.nbind(Tweet.find, Tweet);
    return promise(query)
};

Tweet.findByIdStr = function (idStr) {
    const query = { 'id_str': idStr }
    const promise = Q.nbind(Tweet.find, Tweet)

    return promise(query)
}

/*
   UPDATE
 */
Tweet.updateByIdStr = function (idStr, document) {
    const query = { 'id_str': idStr.toString() }
    const promise = Q.nbind(Tweet.findOneAndUpdate, Tweet)

    return promise(query, document)
}

Tweet.upsert = function(tweet) {
  const query = { 'id_str': tweet.id_str }
  const promise = Q.nbind(Tweet.findOneAndUpdate, Tweet)
  const document = tweet

  return promise(query, document,  { upsert: true })
}


module.exports = Tweet;
