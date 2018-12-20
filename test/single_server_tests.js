'use strict';

var co = require('co'),
  f = require('util').format,
  assert = require('assert');

describe('Server', function() {
  describe('manager', function() {
    it('establish server version', function() {
      this.timeout(50000);

      return co(function*() {
        var Server = require('../').Server;
        // Create new instance
        var server = new Server();
        // Perform discovery
        var version = yield server.discover();
        // Expect 3 integers
        assert.ok(typeof version.version[0] === 'number');
        assert.ok(typeof version.version[1] === 'number');
        assert.ok(typeof version.version[2] === 'number');
      });
    });

    it('start server instance', function() {
      this.timeout(50000);

      return co(function*() {
        var Server = require('../').Server;

        // Create dbpath
        var dbpath = f('%s/../db', __dirname);

        // Create new instance
        var server = new Server('mongod', {
          dbpath: dbpath
        });

        // Purge the directory
        yield server.purge();

        // Start process
        yield server.start();

        // Stop the process
        yield server.stop();
      });
    });

    it('restart server instance', function() {
      this.timeout(50000);

      return co(function*() {
        var Server = require('../').Server;

        // Create dbpath
        var dbpath = f('%s/../db', __dirname);

        // Create new instance
        var server = new Server('mongod', {
          dbpath: dbpath
        });

        // Start process
        yield server.start();

        // Get current pid
        var pid1 = server.process.pid;

        // Restart
        yield server.restart();

        // Get new pid
        var pid2 = server.process.pid;

        // Stop the process
        yield server.stop();

        // Assert we had different processes
        assert.ok(pid1 !== pid2);
      });
    });

    it('call ismaster on server instance', function() {
      this.timeout(50000);

      return co(function*() {
        var Server = require('../').Server;

        // Create dbpath
        var dbpath = f('%s/../db', __dirname);

        // Create new instance
        var server = new Server('mongod', {
          dbpath: dbpath
        });

        // Start process
        yield server.start();

        // Call ismaster
        var ismaster = yield server.ismaster();
        assert.equal(true, ismaster.ismaster);

        // Stop the process
        yield server.stop();
      });
    });

    it('start up authenticated server', function() {
      this.timeout(50000);

      return co(function*() {
        var Server = require('../').Server;

        // Create dbpath
        var dbpath = f('%s/../db', __dirname);

        // Create new instance
        var server = new Server('mongod', {
          dbpath: dbpath,
          auth: null
        });

        // Start process
        yield server.start();

        // Call ismaster
        var ismaster = yield server.ismaster();
        assert.equal(true, ismaster.ismaster);

        // Stop the process
        yield server.stop();
      });
    });

    it('start up ssl server server', function() {
      this.timeout(50000);

      return co(function*() {
        var Server = require('../').Server;

        // Create dbpath
        var dbpath = f('%s/../db', __dirname);

        // Create new instance
        var server = new Server(
          'mongod',
          {
            dbpath: dbpath,
            sslOnNormalPorts: null,
            sslPEMKeyFile: f('%s/ssl/server.pem', __dirname),
            sslAllowInvalidCertificates: null
          },
          {
            ssl: true,
            rejectUnauthorized: false
          }
        );

        // Perform discovery
        var result = yield server.discover();
        // Skip ssl test
        if (!result.ssl) return;

        // Start process
        yield server.start();

        // Call ismaster
        var ismaster = yield server.ismaster();
        assert.equal(true, ismaster.ismaster);

        // Stop the process
        yield server.stop();
      });
    });
  });
});
