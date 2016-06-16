const Composer = require('./index');

Composer((err, server) => {

  if (err) {
    throw err;
  }

  server.register({
    register: require('rollbar-hapi'),
    options: {
      accessToken: 'ee2a260bdbff4d1c903de9c1166add01',
      environment: 'staging', // optional, defaults to process.env.NODE_ENV
      exitOnUncaughtException: true // optional, defaults to true
    }
  }, function (err) {
    if (err) throw err;
  })

  server.start(() => {
    console.log('Started the plot device on port ' + server.info.port);
  })
})
