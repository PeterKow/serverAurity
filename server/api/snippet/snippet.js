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
    const update = getFieldsToUpdate(request)

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

function getFieldsToUpdate(request){



  const query = {
    $set: {
      completed: JSON.parse(request.query.completed),
    }
  }
}