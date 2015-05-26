/***************************************************************
 * @license Copyright Â© 2007-2013 Livescribe, Inc. All rights reserved.
 **************************************************************/
/***********************************************************************
 * This code manages the server URL state for the player
 * If DYNAMICSERVER setting is enabled it will also retry connection of
 * the possible hosts by reloading page until either all has been attempted or data has been found
 *
 */
 

var gLS_Environments = [
		'https://' + location.host.replace("www","services") + '/services/',
		'https://services-test.livescribe.com/services/',
		'https://services-qa.livescribe.com/services/',
		'https://services-stage.livescribe.com/services/',
		'https://services.livescribe.com/services/'
		];
		
var gLS_Playback = [
	'lsshareservice/',
	'lsplaybackservice/'
	];

var gLS_CurrentEnv = -1;
var gLS_CurrentService = 1;
var gLS_CurrentServerIndexKey = "LS_EnvironmentIndex";
var gLS_EnvironmentRetryCounterKey = "LS_EnvironmentRetryStatus";
var gLS_CurrentEnvValid = false;


function EnvManagerInitialize() {
	HelpAdd2Topic("Environments", "The player can be run against different server environments. By default it will pick a server host that is on the same domain as the current player URL. The player can be configured to retry environments until it gets valid data response. This is done by enabling the DYNAMICSERVER debug mask");
	DebugRegisterMask("DYNAMICSERVER", "Setting: Enables or disables dynamic server picking by retrying");
	DebugRegisterMask("SERVICESELECTOR", "Setting: Change service to use when selecting Env");

	gLS_CurrentEnv = parseInt(LocalStorageGet( gLS_CurrentServerIndexKey,  0));
	if( DebugIsMaskOn("SERVICESELECTOR") ) {
		gLS_CurrentService = 0;
	}
	
	if( gLS_CurrentEnv < 0 || gLS_CurrentEnv >= gLS_Environments.length ) {
		gLS_CurrentEnv = 0;
	}

	if( DebugIsMaskOn("DYNAMICSERVER") ) {
		var tNumRetries = LocalStorageGet( gLS_EnvironmentRetryCounterKey,  -1);
		if( tNumRetries == 1 ) {
			ChangeText('Server Error',"Failed trying to locate any server \nenvironment with data that matches the \nURL Breaking program execution",'');
			ToggleLogo();
			HandleWarning("Failed trying to locate any server environment with data that matches the URL\nBreaking program execution");
			EnvManagerReset();
			return false;
		}
	} else {
		EnvManagerReset();
	}

	Debug("Server URL: '" + EnvManagerGetServerURL() + "'");
	return true;
}

function EnvManagerGetServerURL() {
	if( gLS_CurrentEnv == -1 ) {
		HandleWarning("Please call EnvManagerInitialize() before this function");
	}

	return gLS_Environments[gLS_CurrentEnv] + gLS_Playback[gLS_CurrentService];
}

function EnvCurrentEnvironmentValid() {
	if( !gLS_CurrentEnvValid ) {
		gLS_CurrentEnvValid = true;
		LocalStorageSet( gLS_EnvironmentRetryCounterKey, 0 );
	}
}

function EnvManagerReset() {
	LocalStorageSet( gLS_CurrentServerIndexKey, 0 );
	LocalStorageSet( gLS_EnvironmentRetryCounterKey, 0);
}

function EnvSetEnviroment(aiIndex) {
	LocalStorageSet( gLS_CurrentServerIndexKey, aiIndex );
	gLS_CurrentEnv = parseInt(LocalStorageGet( gLS_CurrentServerIndexKey,  0));
	window.location.reload();
}

function EnvPrintEnviroment() {
	gLS_Environments.forEach(
		function logArrayElements(element, index, array) {
			console.log("a[" + index + "] = " + element);
		});
}

function EnvRetryNextEnvironment() {
	if( !gLS_CurrentEnvValid && IsLocalStorageSupported() ) {
		if( DebugIsMaskOn("DYNAMICSERVER")  ) {
			var tNumRetries = LocalStorageGet( gLS_EnvironmentRetryCounterKey, 0)-1;
			if( tNumRetries == -1 ) {
				tNumRetries = gLS_Environments.length ;
			}

			LocalStorageSet( gLS_EnvironmentRetryCounterKey, tNumRetries );

			var tNewEnv = gLS_CurrentEnv + 1;
			tNewEnv %= gLS_Environments.length ;        // make it wrap

			LocalStorageSet( gLS_CurrentServerIndexKey, tNewEnv );

			Debug("Reloading page...");
			window.location.reload();
			// End program execution (unless above line is removed)
			gLS_CurrentEnvValid = true;
			return;
		} else {
			Debug("Failed to load data and dynamic server selection is turned off");
			Help("DYNAMICSERVER");
		}
	}
}
