/* eslint no-global-assign: "off", no-console: "off" */

const module_name = __filename.slice(__dirname.length + 1, -3);

app_path = __dirname;
app_name = 'bmwcd';
app_type = 'client';
app_intf = app_type;

process.title = app_name;

// node-bmw libraries
bitmask    = require('bitmask');
hex        = require('hex');
json       = require('json');
log        = require('log-output');
obc_values = require('obc-values');
os         = require('os');
socket     = require('socket');
update     = require('update');

bus = {
	arbids   : require('bus-arbids'),
	data     : null,
	commands : require('bus-commands'),
	modules  : require('bus-modules'),
};


// Configure term event listeners
function term_config(pass) {
	process.on('SIGTERM', () => {
		console.log('');
		log.msg({ src : module_name, msg : 'Caught SIGTERM' });
		term();
	});

	process.on('SIGINT', () => {
		console.log('');
		log.msg({ src : module_name, msg : 'Caught SIGINT' });
		term();
	});

	process.on('exit', () => {
		log.msg({
			src : module_name,
			msg : 'Terminated',
		});
	});

	pass();
}

// Function to load modules that require data from config object,
// AFTER the config object is loaded
function load_modules(pass) {
	// DBUS/KBUS/IBUS modules
	ABG  = require('ABG');
	AHL  = require('AHL');
	ANZV = require('ANZV');
	ASC  = require('ASC');
	ASST = require('ASST');
	BMBT = require('BMBT');
	CCM  = require('CCM');
	CDC  = require('CDC');
	CDCD = require('CDCD');
	CID  = require('CID');
	CSU  = require('CSU');
	CVM  = require('CVM');
	DIA  = require('DIA');
	DME  = require('DME');
	DSP  = require('DSP');
	DSPC = require('DSPC');
	EGS  = require('EGS');
	EHC  = require('EHC');
	EKM  = require('EKM');
	EKP  = require('EKP');
	EWS  = require('EWS');
	FBZV = require('FBZV');
	FHK  = require('FHK');
	FID  = require('FID');
	FMBT = require('FMBT');
	GM   = require('GM');
	GR   = require('GR');
	GT   = require('GT');
	GTF  = require('GTF');
	HAC  = require('HAC');
	HKM  = require('HKM');
	IHKA = require('IHKA');
	IKE  = require('IKE');
	IRIS = require('IRIS');
	LCM  = require('LCM');
	LWS  = require('LWS');
	MFL  = require('MFL');
	MID  = require('MID');
	MID1 = require('MID1');
	MM3  = require('MM3');
	MML  = require('MML');
	MMR  = require('MMR');
	NAV  = require('NAV');
	NAVC = require('NAVC');
	NAVE = require('NAVE');
	NAVJ = require('NAVJ');
	PDC  = require('PDC');
	PIC  = require('PIC');
	RAD  = require('RAD');
	RCC  = require('RCC');
	RCSC = require('RCSC');
	RDC  = require('RDC');
	RLS  = require('RLS');
	SDRS = require('SDRS');
	SES  = require('SES');
	SHD  = require('SHD');
	SM   = require('SM');
	SMAD = require('SMAD');
	SOR  = require('SOR');
	STH  = require('STH');
	TCU  = require('TCU');
	TEL  = require('TEL');
	VID  = require('VID');

	// CANBUS modules
	ASC1 = require('ASC1');
	CON1 = require('CON1');
	DME1 = require('DME1');

	// Custom libraries
	BT   = require('BT');
	HDMI = require('HDMI');
	kodi = require('kodi');

	// Data handler/router
	bus.data = require('bus-data');

	// Host data object (CPU, memory, etc.)
	host_data = require('host-data');

	// GPIO library
	gpio = require('gpio');

	// Push notification library
	if (config.notification.method !== null) notify = require('notify');

	log.module({
		src : module_name,
		msg : 'Loaded modules',
	});

	pass();
	return true;
}


// Global init
function init() {
	log.msg({ src : module_name, msg : 'Initializing' });

	json.read(() => { // Read JSON config and status files
		load_modules(() => { // Load IBUS module node modules
			host_data.init(() => { // Initialize host data object
				kodi.init(); // Start Kodi zeroMQ client
				BT.init(); // Start Linux D-Bus Bluetooth handler

				gpio.init(() => { // Initialize GPIO relays

					HDMI.init(() => { // Open HDMI-CEC
						socket.init(() => { // Start zeroMQ client

							log.msg({ src : module_name, msg : 'Initialized' });

							// notify.notify('Started');

							IKE.text_warning('     bmwcd restart', 3000);

							setTimeout(() => {
								socket.lcd_text_tx({
									upper : app_name+' '+status.system.host.short,
									lower : 'restarted',
								});
							}, 250);

						}, term);
					}, term);
				}, term);
			}, term);
		}, term);
	}, term);
}

// Save-N-Exit
function bail() {
	json.write(() => { // Write JSON config and status files
		process.exit();
	});
}

// Global term
function term() {
	log.msg({ src : module_name, msg : 'Terminating' });

	gpio.term(() => { // Terminate GPIO relays
		host_data.term(() => { // Terminate host data timeout
			socket.term(() => { // Stop zeroMQ client
				HDMI.term(() => { // Close HDMI-CEC
					kodi.term(bail); // Stop Kodi zeroMQ client
				}, bail);
			}, bail);
		}, bail);
	}, bail);
}


// FASTEN SEATBELTS
term_config(() => {
	init();
});
