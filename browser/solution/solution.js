/**
 * Example of a local function which is not exported. You may use it internally in processFormData().
 * This function verifies the base URL (i.e., the URL prefix) and returns true if it is valid.
 * @param {*} url 
 */
function verifyBaseUrl(url)
{
	return Boolean(url.match(/^https:\/\/[-a-z0-9._]+([:][0-9]+)?(\/[-a-z0-9._/]*)?$/i));
}

/**
 * Example of a local function which is not exported. You may use it internally in processFormData().
 * This function verifies the relative URL (i.e., the URL suffix) and returns true if it is valid.
 * @param {*} url 
 */
function verifyRelativeUrl(url)
{
	return Boolean(url.match(/^[-a-z0-9_/]*([?]([-a-z0-9_\]\[]+=[^&=]*&)*([-a-z0-9_\]\[]+=[^&=?#]*)?)?$/i));
}

function verifyDateFormat(date, delimiterUsed) {

	/*
		if(Boolean(date.match( /^(\d|\d{2}):(\d|\d{2}):\d+$/))) {
			delimiterUsed.del = ':';
			return true;
		}
		else if(Boolean(date.match(/^(\d|\d{2})\/(\d|\d{2})\/\d+$/))) {
			delimiterUsed.del = '/';
			return true;
		}
		else if(Boolean(date.match(/^\d{4}-(\d|\d{2})-(\d|\d{2})+$/))) {
			delimiterUsed.del = '-';
			return true;
		}
	*/

	if(Boolean(date.match(/^(\d|\d{2})\.(\d|\d{2})\.\d{4}$/))) {
		delimiterUsed.del = '.';
		return true;
	}
	else if(Boolean(date.match(/^(\d|\d{2})\/(\d|\d{2})\/\d{4}$/))) {
		delimiterUsed.del = '/';
		return true;
	}
	else if(Boolean(date.match(/^\d{4}-\d{2}-\d{2}$/))) {
		delimiterUsed.del = '-';
		return true;
	}

	return false;
}	

//console.log(tryParseDate("1.2.2018"));

function getInputDateObject(date, dateDelimiter) {
	var dateObj = {};
	var dateParts = date.split(delimiterUsed.del);

	var stringOkDate = '';
	switch(dateDelimiter.del){
		case '-':
			dateObj.day = parseInt(dateParts[2], 10);
			dateObj.month = parseInt(dateParts[1], 10);
			dateObj.year = parseInt(dateParts[0], 10);
			stringOkDate =  date;
			break;
		case '/':
			dateObj.day = parseInt(dateParts[1], 10);
			dateObj.month = parseInt(dateParts[0], 10);
			dateObj.year = parseInt(dateParts[2], 10);
			stringOkDate = dateParts[2] + '-' + dateParts[0].padStart(2, '0') + '-' + dateParts[1].padStart(2, '0');
			break;
		case '.':
			dateObj.day = parseInt(dateParts[0], 10);
			dateObj.month = parseInt(dateParts[1], 10);
			dateObj.year = parseInt(dateParts[2], 10);
			stringOkDate = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
			break;
		}

		// UTC	timestamp
		dateObj.utc = (new Date((new Date(stringOkDate)).toUTCString()).getTime()) / 1000;

		return dateObj;
}

function tryParseDate(dateRaw){

	if (dateRaw == '')
		return null;

	delimiterUsed = {};
	if (!verifyDateFormat(dateRaw, delimiterUsed))
		return null;

	var dateParsedObj = getInputDateObject(dateRaw, delimiterUsed);
	
	if (dateParsedObj.year < 0 || dateParsedObj.day <= 0 || dateParsedObj.day > 31 || dateParsedObj.month <= 0 || dateParsedObj.month > 12)
		return null;

	return dateParsedObj;
}

function verifyTimeFormat(time){
	return Boolean(time.match(/^((\d|\d{2}):(\d|\d{2})|(\d|\d{2}):(\d|\d{2}):(\d|\d{2}))$/i));
}
/*console.log("interval: ");
console.log(verifyTimeInterval("         4:45 - 05:42"));*/
//console.log(getTimeInputObject("23:59:59"))
function getTimeInputObject(time){
	var timeParts = time.split(':');

	var timeObj = {};

	timeObj.hour = parseInt(timeParts[0], 10);
	timeObj.min = parseInt(timeParts[1], 10);

	timeObj.inSeconds = (timeObj.hour * 60 * 60) + (timeObj.min * 60);

	if(timeParts.length === 3){
		timeObj.sec = parseInt(timeParts[2], 10);
		timeObj.inSeconds += timeObj.sec;
	}
	
	return timeObj;
}

function verifyTimeInputData(timeObj) {

	if(timeObj.hour < 0 || timeObj.hour > 23 || 
		timeObj.min < 0 || timeObj.min > 59)
		return false;

	if ('sec' in timeObj) {
		return timeObj.min >= 0 && timeObj.min <= 59
	}

	return true;
}

function tryGetTimeObj(time){
	
	if(!verifyTimeFormat(time))
		return null;

	var timeObj = getTimeInputObject(time);

	if(!verifyTimeInputData(timeObj))
		return null;
	
	return timeObj


}

function tryParseTimeInterval(rawTime){
	
	if(rawTime == '')
	 	return [];

	var time = rawTime.replace(/ /g, '');
	
	var timeParts = time.split('-');

	if(timeParts.length != 2)
		return [];

	var firstTimeObj = tryParseTime(timeParts[0]);
	var secTimeObj = tryParseTime(timeParts[1]);

	if(firstTimeObj.inSeconds > secTimeObj.inSeconds)
		return [];
	
	if(firstTimeObj === null || secTimeObj === null)
		return [];

	return [firstTimeObj, secTimeObj];
}

function tryParseTime(rawTime) {
	if(rawTime == '')
	 	return null;

	var time = rawTime.replace(/ /g, '');
	
	return tryGetTimeObj(time);
}

function tryParseRepeat(data){
	
	if(data == '' || !Boolean(data.match(/^\d+$/i)))
		return -1;

	var repeat = parseInt(data, 10);

	if (repeat <= 0 || repeat > 100)
		return -1;

	return repeat;
}


function verifyMethod(method) {
	var validInputs = ['GET', 'POST', 'PUT', 'DELETE'];

	if (!validInputs.includes(method))
		return false;
	
	return true;
}


function tryGetBody(data) {
	if(data == '')
		return {}

	try{
		var result = JSON.parse(data);
		return result;
	}
	catch {
		return null;
	}
}

function SetError(errorRef, operationNum, propertyName, message){
	//var a = Object.keys(errorRef);
	if(errorRef[propertyName] === undefined)
		errorRef[propertyName] = {}

	errorRef[propertyName][operationNum] = message;
}

function tryToGetFormParsedData (currentOperation, baseUrl, formData, error) {
	var parsedData = {}

	var parsedDate = tryParseDate(formData.date);
	if(parsedDate === null){
		SetError(error, currentOperation, 'date', "Invalid date.");
	}
	else {
		parsedData.date = parsedDate.utc;
	}

	var parsedRepeat = tryParseRepeat(formData.repeat);

	if(parsedRepeat < 0)
		SetError(error, currentOperation, 'time', "Invalid repeat.");
		//error.repeat[currentOperation] = "Invalid repeat.";
	else {
		parsedData.repeat = parsedRepeat;
	}

	// time parsing

	if (formData.time.includes('-')){
		if (parsedRepeat <= 1)
			SetError(error, currentOperation, 'time', "Time interval is not allowed when there is only one repetition set.");
			//error.time[currentOperation] = "Time interval is not allowed when there is only one repetition set.";
		else{
			var parsedInterval = tryParseTimeInterval(formData.time);
			if(parsedInterval.length < 2)
				//error.time[currentOperation] = "Invalid time or time interval format. Time must be in h:mm or h:mm:ss format, time interval are two times separated by dash."
				SetError(error, currentOperation, 'time', "Invalid time or time interval format. Time must be in h:mm or h:mm:ss format, time interval are two times separated by dash.");
			else {
				parsedData.time.from = parsedInterval[0];
				parsedData.time.to = parsedInterval[1];
			}
		}
	} else {
		var parsedTime = tryParseTime(formData.time);
		if (parsedTime === null)
			SetError(error, currentOperation, 'time', "Invalid time or time interval format. Time must be in h:mm or h:mm:ss format, time interval are two times separated by dash.");
			//error.time[currentOperation] = "Invalid time or time interval format. Time must be in h:mm or h:mm:ss format, time interval are two times separated by dash."
		else
			parsedData.time = parsedTime.inSeconds;
	}

	// parsing url

	var relativeUrl = formData.url;
	if (!verifyRelativeUrl(relativeUrl)) {
		//error.url[currentOperation] = "Invalid URL suffix format.";
		SetError(error, currentOperation, 'url', "Invalid URL suffix format.");
	}
	else {
		parsedData.url = baseUrl + relativeUrl;
	}
	
	// parsing JSON body

	var parsedBody = tryGetBody(formData.body);

	if (parsedBody === null)
		SetError(error, currentOperation, 'body', "The body must be either valid JSON or empty.");
		//error.body[currentOperation] = "The body must be either valid JSON or empty.";
	else
		parsedData.body = parsedBody;

	// parsing request method

	var parsedMethod = verifyMethod(formData.method);

	if (!parsedMethod)
		SetError(error, currentOperation, 'method', "Invalid method used.");
		//error.method[currentOperation] = "Invalid method used.";
	else
		parsedData.body = formData.method;

	return parsedData;
}


/**
 * Main exported function that process the form and yields the sanitized data (or errors).
 * @param {*} formData Input data as FormData instance.
 * @param {*} errors Object which collects errors (if any).
 * @return Serialized JSON containing sanitized form data.
 */
function processFormData(formData, errors) {
	var resultOutput = [];

	var attrNames = ['url_base', 'date', 'repeat', 'time', 'url', 'method', 'body'];

	var baseUrl = '';

	attrNames.forEach( attr => {
		var entries = formData.getAll(attr);
		var ctr = 0;
		entries.forEach(value => {
			if (resultOutput.length < ctr + 1)
				resultOutput.push({});
			
			switch(attr) {
				case 'url_base':
					if (!verifyBaseUrl(value)) {
						errors.url_base = "Invalid URL format.";
					} else
						baseUrl = value;
				break;
				case 'date':
					var parsedDate = tryParseDate(value);
					if(parsedDate === null){
						SetError(errors, ctr, 'date', "Invalid date format. Allowed formats a are d.m.yyyy, m/d/yyyy, and yyyy-mm-dd.");
					}
					else {
						resultOutput[ctr].date = parsedDate.utc;
					}
				break;
				case 'repeat':
					var parsedRepeat = tryParseRepeat(value);
					
					if(parsedRepeat < 0)
						SetError(errors, ctr, 'repeat', "Invalid repeat.");
					else {
						resultOutput[ctr].repeat = parsedRepeat;
					}
				break;
				case 'time':
					if (value.includes('-')){
						if (resultOutput[ctr].repeat <= 1)
							SetError(errors, ctr, 'time', "Time interval is not allowed when there is only one repetition set.");
						else{
							var parsedInterval = tryParseTimeInterval(value);
							if(parsedInterval.length < 2)
								SetError(errors, ctr, 'time', "Invalid time or time interval format. Time must be in h:mm or h:mm:ss format, time interval are two times separated by dash.");
							else {
								resultOutput[ctr].time = {};
								resultOutput[ctr].time.from = parsedInterval[0].inSeconds;
								resultOutput[ctr].time.to = parsedInterval[1].inSeconds;
							}
						}
					} else {
						var parsedTime = tryParseTime(value);
						if (parsedTime === null)
							SetError(errors, ctr, 'time', "Invalid time or time interval format. Time must be in h:mm or h:mm:ss format, time interval are two times separated by dash.");
						else
							resultOutput[ctr].time = parsedTime.inSeconds;
					}
				break;
				case 'url': 
					var relativeUrl = value;
					if (!verifyRelativeUrl(relativeUrl)) {
						//error.url[currentOperation] = "Invalid URL suffix format.";
						SetError(errors, ctr, 'url', "Invalid URL suffix format.");
					}
					else {
						resultOutput[ctr].url = baseUrl + relativeUrl;
					}
				break;
				case 'method':
					var parsedMethod = verifyMethod(value);

					if (!parsedMethod)
						SetError(errors, ctr, 'method', "Invalid method used.");
					else
						resultOutput[ctr].method = value;
				break;
				case 'body':
					var parsedBody = tryGetBody(value);
				
					if (parsedBody === null)
						SetError(errors, ctr, 'body', "The body must be either valid JSON or empty.");
						//error.body[currentOperation] = "The body must be either valid JSON or empty.";
					else
						resultOutput[ctr].body = parsedBody;
				break;

			}
			
			ctr++;
		});

	});



/*	var resultOutput = []

	var ctr = -5;

	var entry = formData.getAll('body');
	var formEntries = formData.entries();

	var currentForm = {};
	var baseUrl = '';
	for (formInput of formEntries){
		
		var name = formInput[0];
		var value = formInput[1];
		
		
		if (name == 'url_base') {
			if (!verifyBaseUrl(value)) {
				errors.url_base = "Invalid URL format.";
			} else
				baseUrl = value;

			continue;
		}
		currentForm[name] = value;

		console.log(name);
		if (ctr % 6 == 0){
			// process current form
			/*var currentOptionForm = parseInt(((6+ctr) / 6), 10) - 1;
			var parsedFormData = tryToGetFormParsedData(currentOptionForm, baseUrl, currentForm, errors);
			resultOutput.push(parsedFormData);
			currentForm = {};*/
		/*}
		
		ctr++;
	}*/

	/*if (verifyBaseUrl(formData.get('url_base')))
		errors.url_base = "invalid base url...";*/

	

	if(Object.keys(errors).length === 0)
		return JSON.stringify(resultOutput);
	else{
		return null;
	}

}



// In nodejs, this is the way how export is performed.
// In browser, module has to be a global varibale object.
module.exports = { processFormData };
