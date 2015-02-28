Utils = {};

Utils.connect = function(client, callback) {
  client.send('{"msg": "connect", "version": "1", "support": ["1"]}')
  client.onmessage = function (e) {
    var msg = JSON.parse(e.data);
    if(msg.msg === 'connected') {
      callback();
    }
  }
};
