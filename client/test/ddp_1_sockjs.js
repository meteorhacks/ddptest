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
      client.send('{"msg": "connect", "version": "1", "support": ["1"], "session": "p7WNSmY6QvjSsoGmS"}')
      client.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if(msg.msg === 'connected') {
          chai.assert.isString(msg.session);
          chai.assert.equal(msg.session.length, 17);
          done();
        }
      }
    });

  }); // connect

}); // DDP
