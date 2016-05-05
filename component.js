Polymer({
    is: 'web-cli',

    properties: {
      pluginsUrl: String
    },

    ready: function () {
      
      var self = this;
      console.log(this.localName + '#' + this.id + ' ready called');

      (function () {
        var cliInitialized = false;

        var bridgeEvents = {};
        function emitBridgeEvent(event, data) {
          $(bridgeEvents).trigger(event, data);
        }

        var pluginsUrl = self.getAttribute('pluginsUrl'),
          plugins = [],
          cli;

        // disable global ajax caching
        $.ajaxSetup({ cache: false });

        // invoked by the client to initialize the console
        function init(opts) {

           if (cliInitialized) return console.warn('cli already initialized');

          opts = opts || {};
          opts.plugins = opts.plugins || [];
          addPlugins(opts.plugins);
          
          console.log('initializing console');

          getPlugins(function (err) {
            if (err) return console.error('error loading plugins', err);

            opts.plugins = plugins;
            opts.welcomeMessage = opts.welcomeMessage || "Welcome! Type <b>help</b> to start exploring the commands currently supported!";

            cli = $(self).cli(opts);

            // get environment events broker
            var ebEnv = cli.cli('envEventsBroker');

            // bind to environment change events
            // proxy internal cli state change to client envChanged listener 
            $(ebEnv).bind({
              state: function (e, state) {
                emitBridgeEvent('env', state);
              }
            });

            $(bridgeEvents).bind({
              env: function (e, data) {
                self.fire('envChanged', data);
              }
            });

            cliInitialized = true;
          });

          function addPlugins(plgins) {
            for (var i = 0; i < plgins.length; i++) {
              var api = plgins[i];
              if (api.console && api.console.autoLoad) {
                plugins.push({ url: api.route + '/!!' });
              }
            }
          }

          function getPlugins(cb) {
            if (!pluginsUrl) return cb();
            getJson(pluginsUrl, function (err, response) {
              if (err) return cb(err);
              addPlugins(response.apis);
              return cb();
            });
          }
        }

        function getJson(url, cb) {
          console.log('getting json from url:', url);
          $.getJSON(url, function (data, success, xhr) {
            if (xhr.status != 200) return cb(new Error('got status code:' + xhr.status + '; response:' + xhr.responseText));
            if (!data) return cb(new Error('response without data: status:' + xhr.statusText));
            return cb(null, data);
          })
            .fail(function (xhr) {
              return cb(new Error('error: status code:' + xhr.status + ' status text:' + xhr.statusText + ' response text:' + xhr.responseText));
            });
        }

        // proxy method for accessing cli env
        function cli_env(setting, val, appOriginated, setEmpty) {
          return cli.cli('env', setting, val, appOriginated, setEmpty);
        }

        // proxy method for accessing cli prompt
        function cli_prompt(val) {
          return cli.cli('prompt', val);
        }

        // proxy to the cli's addPluginHandler method
        function addPluginHandler(name, handler) {
          cli.cli('addPluginHandler', name, handler);
        }

        // proxy to the cli's loadCss method
        function loadCss(url) {
          cli.cli('loadCss', url);
        }

        // proxy to the cli's addCss method
        function addCss(css) {
          cli.cli('addCss', css);
        }
        
        self.init = init;
        self.env = cli_env;
        self.prompt = cli_prompt;
        self.addPluginHandler = addPluginHandler;
        self.loadCss = loadCss;
        self.addCss = addCss;

        var interval = setInterval(function () {
          console.log('checking onReady handler');
          if (typeof self.onReady === 'function') {
            console.log('running onReady callback');
            clearInterval(interval);
            return self.onReady();
          };
        }, 100);
        
      })();
      
      console.log(self.localName + '#' + self.id + ' ready ended');
    }
  });
