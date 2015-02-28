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

  describe('connect', function() {

    // test whether we receive a connected message and a session ID
    it('should connect to the server (without session id)', function(done) {
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
    it('should connect to the server (with session id)', function(done) {
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
    it('should send error when version not supported (without session id)', function(done) {
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
    it('should send error when version not supported (with session id)', function(done) {
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

    // test whether we receive an error message when no connected
    it('should send error message if not connected (without id)', function(done) {
      client.send('{"msg": "ping"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'error') {
          chai.assert.equal(msg.reason, 'Must connect first')
          done();
        }
      }
    });

    // test whether we receive an error message when no connected
    it('should send error message if not connected (with id)', function(done) {
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
    it('should send pong message if connected (without id)', function(done) {
      Utils.connect(client, function () {
        client.send('{"msg": "ping"}')
        client.onmessage = function (e) {
          var msg = JSON.parse(e.data);
          if(msg.msg === 'pong') {
            done();
          }
        }
      })
    });

    // test whether we receive a pong message
    it('should send pong message if connected (with id)', function(done) {
      var rand = Random.id();
      Utils.connect(client, function () {
        client.send('{"msg": "ping", "id": "'+ rand +'"}')
        client.onmessage = function (e) {
          var msg = JSON.parse(e.data);
          if(msg.msg === 'pong') {
            chai.assert.equal(msg.id, rand);
            done();
          }
        }
      })
    });

  }); // ping

}); // DDP
