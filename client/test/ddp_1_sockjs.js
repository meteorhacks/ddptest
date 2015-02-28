describe('DDP 1 (sockjs)', function() {
  var client;
  var options = {
    devel: true,
    debug: true,
    protocols_whitelist: [
      'websocket',
      'xdr-streaming',
      'xhr-streaming',
      'iframe-eventsource',
      'iframe-htmlfile',
      'xdr-polling',
      'xhr-polling',
      'iframe-xhr-polling',
      'jsonp-polling'
    ]
  };

  beforeEach(function (done) {
    var url = window.Target + '/sockjs';
    client = new SockJS(url, null, options);
    client.onmessage = function (e) {
      done()
    }
  })

  afterEach(function (done) {
    client.close();
    client.onclose = function () {
      done();
    };
  })

  // required field
  it('should receive an error if `msg` field is missing', function (done) {
    client.send('{"foo": "bar"}')
    client.onmessage = function (e) {
      var msg = JSON.parse(e.data);
      if(msg.msg === 'error') {
        chai.assert.equal(msg.reason, 'Bad request')
        done();
      }
    }
  });

  describe('connect', function() {

    // required field
    it('should receive an error if `version` field is missing', function (done) {
      client.send('{"msg": "connect", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'failed') {
          chai.assert.equal(msg.version, '1')
          done();
        }
      }
    });

    // required field
    it('should receive an error if `support` field is missing', function (done) {
      client.send('{"msg": "connect", "version": "1"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'failed') {
          chai.assert.equal(msg.version, '1')
          done();
        }
      }
    });

    // test whether we receive a connected message and a session ID
    it('should connect to the server (new session)', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          chai.assert.isString(msg.session);
          chai.assert.equal(msg.session.length, 17);
          done();
        }
      }
    });

    // test whether we receive a connected message and a session ID
    it('should connect to the server (existing session)', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"], "session": "'+ Random.id() +'"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          chai.assert.isString(msg.session);
          chai.assert.equal(msg.session.length, 17);
          done();
        }
      }
    });

    // test whether we receive a failed message and supported version
    // assuming "_" is not a valid DDP version
    it('should not connect when version is not supported (new session)', function(done) {
      client.send('{"msg": "connect", "version": "_", "support": ["_"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'failed') {
          chai.assert.isString(msg.version)
          done();
        }
      }
    });

    // test whether we receive a failed message and supported version
    // assuming "_" is not a valid DDP version
    it('should not connect when version is not supported (existing session)', function(done) {
      client.send('{"msg": "connect", "version": "_", "support": ["_"], "session": "'+ Random.id() +'"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'failed') {
          chai.assert.isString(msg.version)
          done();
        }
      }
    });

  }); // connect

  describe('ping', function() {

    // test whether we receive an error message if we send a ping message before a connect
    it('should not receive heartbeat response if not connected (without id)', function(done) {
      client.send('{"msg": "ping"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'error') {
          chai.assert.equal(msg.reason, 'Must connect first')
          done();
        }
      }
    });

    // test whether we receive an error message if we send a ping message before a connect
    it('should not receive heartbeat response if not connected (with id)', function(done) {
      var rand = Random.id();
      client.send('{"msg": "ping", "id": "'+ rand +'"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'error') {
          chai.assert.equal(msg.reason, 'Must connect first')
          done();
        }
      }
    });

    // test whether we receive a pong message
    it('should receive a heatbeat response (without id)', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          client.send('{"msg": "ping"}')
          client.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            if(msg.msg === 'pong') {
              done();
            }
          }
        }
      }
    });

    // test whether we receive a pong message
    it('should receive a heatbeat response (with id)', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          var rand = Random.id();
          client.send('{"msg": "ping", "id": "'+ rand +'"}')
          client.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            if(msg.msg === 'pong') {
              chai.assert.equal(msg.id, rand);
              done();
            }
          }
        }
      }
    });

  }); // ping

  describe('method', function() {
    // test whether we receive an error message if we send a method message before a connect
    it('should not receive method response if not connected', function(done) {
      var rand = Random.id();
      client.send('{"msg": "method", "method": "hello", "id": "'+ rand +'"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'error') {
          chai.assert.equal(msg.reason, 'Must connect first')
          done();
        }
      }
    });

    // required field
    it('should receive an error if `method` field is missing', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          var rand = Random.id();
          // client.send('{"msg": "method", "method": "hello", "id": "'+ rand +'"}')
          client.send('{"msg": "method", "id": "'+ rand +'"}')
          client.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            if(msg.msg === 'error') {
              chai.assert.equal(msg.reason, 'Malformed method invocation')
              done();
            }
          }
        }
      }
    });

    // required field
    it('should receive an error if `id` field is missing', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          client.send('{"msg": "method", "method": "hello"}')
          client.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            if(msg.msg === 'error') {
              chai.assert.equal(msg.reason, 'Malformed method invocation')
              done();
            }
          }
        }
      }
    });

  }); // method

  describe('sub', function() {
    // test whether we receive an error message if we send a sub message before a connect
    it('should not receive sub response if not connected', function(done) {
      var rand = Random.id();
      client.send('{"msg": "sub", "name": "hello", "id": "'+ rand +'"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'error') {
          chai.assert.equal(msg.reason, 'Must connect first')
          done();
        }
      }
    });

    // required field
    it('should receive an error if `id` field is missing', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          client.send('{"msg": "sub", "name": "hello"}')
          client.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            if(msg.msg === 'error') {
              chai.assert.equal(msg.reason, 'Malformed subscription')
              done();
            }
          }
        }
      }
    });

    // required field
    it('should receive an error if `name` field is missing', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          var rand = Random.id();
          client.send('{"msg": "sub", "id": "'+ rand +'"}')
          client.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            if(msg.msg === 'error') {
              chai.assert.equal(msg.reason, 'Malformed subscription')
              done();
            }
          }
        }
      }
    });

  }); // sub

  describe('unsub', function() {
    // test whether we receive an error message if we send a unsub message before a connect
    it('should not receive unsub response if not connected', function(done) {
      var rand = Random.id();
      client.send('{"msg": "unsub", "name": "hello", "id": "'+ rand +'"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'error') {
          chai.assert.equal(msg.reason, 'Must connect first')
          done();
        }
      }
    });

    // required field
    it('should receive an error if `id` field is missing', function(done) {
      client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          client.send('{"msg": "unsub"}')
          client.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            if(msg.msg === 'nosub') {
              done();
            }
          }
        }
      }
    });

  }); // unsub

}); // DDP
