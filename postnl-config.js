var axios = require('axios');

module.exports = function(RED) {
  function PostNLConfigurationNode(n) {
    RED.nodes.createNode(this, n);
    this.username = n.username;
    this.password = n.password;

    var node = this;

    this.axios = axios.create({
      baseURL: 'https://jouw.postnl.nl',
      timeout: 10000
    });

    node.axios.defaults.headers.common['Api-Version'] = '4.7'
    node.axios.defaults.headers.common['User-Agent'] = 'PostNL/1 CFNetwork/889.3 Darwin/17.2.0'


    if (this.username && this.password) {
      var body = "grant_type=password&client_id=pwIOSApp&username=" + encodeURIComponent(node.username) + "&password=" + encodeURIComponent(node.password)
      node.axios.post('/mobile/token', body).then(function (data) {
        node.axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.data.access_token
        node.accessToken = data.data.access_token
        node.refreshToken = data.data.refresh_token

        setTimeout(refreshToken, data.data.expires_in * 1000, node)
      })
      .catch(function (data) {
        node.error("Login failed: " + data)
      })
    }
  }

  function refreshToken(node) {
    var body = "grant_type=refresh_token&client_id=pwIOSApp&refresh_token=" + encodeURIComponent(node.refreshToken)
    node.axios.post('/mobile/token', body).then(function (data) {
      node.axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.data.access_token
      node.refreshToken = data.data.refresh_token
      setTimeout(refreshToken, data.data.expires_in * 1000, node)
    })
    .catch(function (data) {
      node.error("Refresh failed: " + data.error)
    })
  }
  RED.nodes.registerType("postnl-config", PostNLConfigurationNode);
}
