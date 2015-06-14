/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### checkError (err, assertionargs)
 *
 * Checks that an error conforms to a given set of criteria
 *
 * TBC
 *
 * @param {Error} error value to be checked
 * @param {Object} name of property to add
 * @name checkError
 * @api public
 */

 var flag = require('./flag');
 var type = require('type-detect');
 var Assertion = require('../assertion');

module.exports = function checkError (err, assertionargs) {
	var foundErrors = [],
		constructor = assertionargs && assertionargs.constructor,
		errMsg = assertionargs && assertionargs.errMsg;

	var thrown = false
	  , desiredError = null
	  , name = null
	  , thrownError = null;

	if (arguments.length === 0) {
	  errMsg = null;
	  constructor = null;
	} else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
	  errMsg = constructor;
	  constructor = null;
	} else if (constructor && constructor instanceof Error) {
	  desiredError = constructor;
	  constructor = null;
	  errMsg = null;
	} else if (typeof constructor === 'function') {
	  name = constructor.prototype.name || constructor.name;
	  if (name === 'Error' && constructor !== Error) {
	    name = (new constructor()).name;
	  }
	} else {
	  constructor = null;
	}

	if (err) {
      // first, check desired error
		 if (desiredError) {
		    foundErrors.push({
		        result: err === desiredError
		      , failType: 'differentErrorInstance'
		      , expected: desiredError
		      , actual: err
		      , nextObject: err
		    });

		    return foundErrors;
		  }

		  // next, check constructor
		  if (constructor) {
              var nextError = {
	            result: err instanceof constructor
	          , failType: 'differentErrorType'
	          , expected: name
	          , actual: err
	        };

		    if (!errMsg) {
		      nextError.nextObject = err;
		      foundErrors.push(nextError);
		      return foundErrors;
		    } else {
		      foundErrors.push(nextError);
		    }
		  }

		  // next, check message
		  var message = 'error' === type(err) && "message" in err
		    ? err.message
		    : '' + err;

		  if ((message != null) && errMsg && errMsg instanceof RegExp) {
		    foundErrors.push({
		        result: errMsg.exec(message) != null
		      , failType: 'errorMessageDoesNotMatch'
		      , expected: errMsg
		      , actual: message
		      , nextObject: err
		    });

		    return foundErrors;
		  } else if ((message != null) && errMsg && 'string' === typeof errMsg) {

		    foundErrors.push({
		        result: !!(~message.indexOf(errMsg))
		      , failType: 'errorMessageDoesInclude'
		      , expected: errMsg
		      , actual: message
		      , nextObject: err
		    });

		    return foundErrors;
		  } else {
		    thrown = true;
		    thrownError = err;
		  }
	}

	var myError = {
	    result: thrown === true
	  , expected: desiredError
	  , actual: err
	  , nextObject: thrownError
	};

	if (thrown) {
	  myError.failType =  'differentErrorInstance'
	} else {
	  myError.failType = 'noErrorThrown';
	}

	if (!desiredError) {
		if (!!constructor) {
			myError.expected = constructor;
		} else if (!!errMsg) {
			myError.expected = errMsg;
			if ('string' === typeof errMsg) {
				myError.failType =  'errorMessageDoesInclude';
			} else if (errMsg instanceof RegExp) {
				myError.failType = 'errorMessageDoesNotMatch';
			}
		}
	}

	if (name !== null) {
		myError.expected = name;
	 }

	foundErrors.push(myError);

	return foundErrors;
};
