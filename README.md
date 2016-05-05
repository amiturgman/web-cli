web-cli
=======
Web-cli is an extensible web-based command line interface component.
It's a [Polymer](https://www.polymer-project.org/1.0/) component wrapping the [aCLI](https://github.com/amiturgman/aCLI) project, making it easier to consume and use.

Features
--------
* Manages environment variables and use them as part of the command line.
* Supports plugins- remote commands integrated into the console, using [docRouter](https://github.com/anodejs/node-docrouter) metadata.  
	Supporting plugins with client side processing and styling.  
* Maintains command line history, installed plugins and environment variables.
* _Pin Panel_ which is kind of a dashboard for keeping command execution results on-screen.
* Html visualization for json results with collapsing feature.
* Supports working in parallel with few instances/tabs.

![Example](https://github.com/amiturgman/web-cli/raw/master/images/demo.jpg "web-cli demo")


![Animated Demo](https://github.com/amiturgman/web-cli/raw/master/images/web-cli-demo.gif "animated demo")


Installing
----------

  `bower install web-cli`


Getting Started
---------------
Follow the [sample app](https://github.com/amiturgman/web-cli-sample-app) for extended example of how to use this component. 
The sample app includes varaiety of plugins and examples for commands you can use as a reference.

The following is an example of how to quickly start using the component. 

	<!DOCTYPE HTML>
	<html>
	<head>
	  <title>corpus to graph admin console</title>
	  <script src="bower_components/webcomponentsjs/webcomponents.min.js"></script>
	  <link rel="import" href="bower_components/web-cli/web-cli.html">
	  <style>
		.promptImage {
			vertical-align: middle;
		}
	  </style>
	</head>
	<body>
		<web-cli id="webCli"></web-cli>
	</body>
	<script>
		$(function () {
		  
			// get plugins and user details from the server.
		  // we could have also provided the pluginsUrl property on the control itselft, and the control would have fetched this data.
		  // since we need to get the user details anyway, we're using the same request to get all the data at once and providing the plugins explicitely.
		  $.getJSON('pathToApi', function (cliData) { 
			var user = cliData.user;

			// environment variables to use by this console instance
			var environmentVars = {
			  app: { type: 'string', value: 'console', description: 'The current app name', userReadOnly: false },
			  username: { type: 'string', value: user.username, description: 'The current username', userReadOnly: true },
			  userImageUrl: { type: 'string', value: user.image, description: 'The current user image url', userReadOnly: true },
			};
			
			// get a reference to the control
			var webCli = $('web-cli')[0];

			// listen on envronment variables changes and update the console prompt string accordingly.
			// in this case, we'de like to reflect the change in the app name.
			webCli.addEventListener('envChanged', function(e) {
			  console.log('envChanged!', e.detail);
			  updatePrompt();
			});
			
			// webCli is ready to be initialized    
			webCli.onReady = function () {

				// init the console    
				webCli.init({
					environment: environmentVars,
					plugins: cliData.apis,
					commands: getLocalCommands()
				});
				
				updatePrompt();
			}
				
			// updates the prompt string    
			function updatePrompt() {
			  var app = webCli.env('app');
			  var image = user.image ? "<img src='" + user.image + "' class='promptImage' width='18px'/>" : '';
			  var prompt = image + ' [';
			  if (user.name) prompt += user.name + '\\';
			  if (app) prompt += '' + app + '';
			  prompt += ']>';
			  webCli.prompt(prompt);
			}
		});  


		// this is the place to extend the console
		// with more client-side commands
		function getLocalCommands() {
		
			var versionCommand = {
				name: 'version',
				description: "gets the version of this console",
				usage: 'version',
				example: 'version',
				params: [],
				exec: function (args, context) {
				return '1.0';
				}
			};

			var commands = [versionCommand];
			return commands;
		}
	});
	</script>
	</html>


Design
------
The web-cli internal design in addition to more documentation can be found in the original [aCLI repository docs folder](https://github.com/amiturgman/aCLI/tree/master/docs)

License
-------
[MIT](LICENSE)
