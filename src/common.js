// ====================================================================== Utility functions
const com = {
  config: {},

  // ---------------------------------------------
  log: function (s) {
    try {
      if (com.config.consoleLog) console.log(s);
      if (com.config.logline)
        document.getElementById(com.config.logline).innerHTML += s;
    } catch (e) {}
  },
  // ---------------------------------------------
  timelog: function (s) {
    const d = new Date();
    s = d.toLocaleTimeString() + ": " + s;
    try {
      if (com.config.consoleLog) console.log(s);
      if (com.config.logline)
        document.getElementById(com.config.logline).innerHTML += s;
    } catch (e) {}
  },
  // ---------------------------------------------
  statusline: function (s) {
    if (!com.config.statusline) return;
    if (!document.getElementById(com.config.statusline)) return;
    document.getElementById(com.config.statusline).innerHTML = s;
  },
  // ---------------------------------------------
  round: function (floatstr, precstr) {
    if (isNaN(floatstr)) return floatstr;
    if (isNaN(precstr)) return floatstr;
    return parseFloat(floatstr).toFixed(parseInt(precstr));
  },
  // ---------------------------------------------
  getUrlParam: function (parameter, defaultvalue) {
    // ---------------------------------------------
    function getUrlVars() {
      var vars = {};
      var parts = window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
          vars[key] = value;
        }
      );
      return vars;
    }

    var urlparameter = defaultvalue;
    var urlstring = window.location.href;
    if (urlstring.indexOf(parameter) > -1) {
      urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
  },
};
