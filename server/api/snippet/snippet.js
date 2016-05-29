'use strict';

const Boom = require('boom');
const Joi = require('joi');
//const AuthPlugin = require('../../auth');
const Q = require('q')

const internals = {};


internals.applyRoutes = function (server, next) {

  const Tweet = server.plugins['hapi-mongo-models'].Tweet;

  //TODO change this to PUT !!! =  ask miron?!
  server.route({
    method: 'POST',
    path: '/snippet/{id}',
    config: {},
    handler: updateSnippet
  })


  function updateSnippet(request, reply) {
    const id = request.params.id;
    let update = {}
    try {
      update = getFieldsToUpdate(request.query)
    } catch (error) {
      return reply(Boom.badRequest(error));
    }

    Tweet
      .updateByIdStr(id, update)
      .then(successHandling)
      .catch(errorHandling)

    function successHandling(snippet) {
      console.log('SUCCESS - update snippet', !!snippet)

      if (!snippet) {
        return reply(Boom.notFound('Document not found.'));
      }

      reply(snippet);
    }

    function errorHandling(error){
      console.log('FAILED ---', error)
      reply(error)
    }
  }

  next()
};


exports.register = function (server, options, next) {

  server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

  next();
};


exports.register.attributes = {
  name: 'snippet'
}

function getFieldsToUpdate(query = {}) {
  if (query.completed !== undefined) {
    const fields = {
      completed: JSON.parse(query.completed),
    }
    return createUpdateQuery(fields)

  } else if (query.thumbDown !== undefined && query.thumbUp !== undefined) {
    const fields = {
      thumbDown: JSON.parse(query.thumbDown),
      thumbUp: JSON.parse(query.thumbUp),
    }
    return createUpdateQuery(fields)

  } else if (query.stared !== undefined)  {
    const fields = {
      stared: JSON.parse(query.stared),
    }
    return createUpdateQuery(fields)
  } else if (query['tags[0]'] !== undefined)  {
    const fields = {
      tags: Object.keys(query).map(key => query[key]),
    }
    return createUpdateQuery(fields)
  }

  throw new Error('no fileds to update')
}

function createUpdateQuery(fields = {}) {
  return {
    $set: fields
  }
}