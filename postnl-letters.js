module.exports = function(RED) {
  function PostNLLettersNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;
    node.api = RED.nodes.getNode(n.api);
    node.on('input', function(msg) {
      node.api.axios.get('/mobile/api/letters')
      .then(function (data) {
        var first = data.data[0];
        var barcode = first.barcode.split('^')
        first.id = parseInt(barcode[barcode.length-1])
        msg.payload = first;
        node.send(msg)
      }).catch(function (data) {
        node.error(data)
      })
    });
  }
  RED.nodes.registerType('postnl-letters', PostNLLettersNode);
}
