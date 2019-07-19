'use strict';

const lodash = require('lodash');
const util = require('../Util');
const pathRestConfig = `./config/${process.env.stage}-firebaseRestConfig`;
const restConfig = require(pathRestConfig);
const key = 'key=' + restConfig.key;
const urlBase = restConfig.urlBase;

const getUrlBaseWith = (url) => {
	let joker = (url.indexOf('?') == -1) ? '?' : '&';
	return urlBase + '/' + url + joker + key;
}

const getUrlBaseRunQuery = () => {
	return urlBase + ':runQuery' + '?' + key;
}

const firestoreMap = (data) => {
    return lodash.mapValues(data, (v) => {
        if (lodash.isString(v))
            return { "stringValue": v }

        if (lodash.isNumber(v)) {
            if (Number.isInteger()) {
                return { "integerValue": v }
            }

            return { "doubleValue": v }
        }

        if (lodash.isNull(v))
            return { "nullValue": v }

        if (lodash.isDate(v))
            return { "timestampValue": v }

        if (lodash.isBoolean(v))
            return { "booleanValue": v }

        if (lodash.isObject(v))
            return { "mapValue": { "fields": firestoreMap(v) } }

        if (lodash.isArray(v))
            return { "arrayValue": { "values": firestoreMap(v) } }

        return { "stringValue": "UNABLE TO MAP VALUE" }
    });
}

module.exports = {
	getUrlBaseWith,
	getUrlBaseRunQuery,
	firestoreMap
};