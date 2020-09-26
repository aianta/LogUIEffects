/*
    LogUI Client Library
    JSON Schema Validation Library

    An IIFE module providing access to JSON validation functionality.
    Also provides the ability to add additional properties to be validated.
    Useful for the dispatcher architecture.

    @module: ValidationSchemas
    @author: David Maxwell
    @date: 2020-09-20
*/

import { Validator } from 'jsonschema';

const SCHEMA_SUPPLIED_CONFIG = {
    id: 'LogUI-suppliedConfig',
    type: 'object',
    properties: {
        applicationIdentifier: {'type': ['string', 'null']},
        applicationSpecificData: {'type': 'object'},
        logUIConfiguration: {'$ref': '/LogUI-logUIConfig'},
        trackingConfiguration: {'$ref': '/LogUI-trackingConfig'},
    },
    required: [
        'applicationIdentifier',
        'applicationSpecificData',
        'trackingConfiguration',
        'logUIConfiguration'
    ]
};

const SCHEMA_SUPPLIED_CONFIG_LOGUI = {
    id: 'LogUI-logUIConfig',
    type: 'object',
    properties: {
        verbose: {'type': 'boolean'},
        sessionUUID: {'type': ['string', 'null']},
    },
    required: [
        'verbose',
        'sessionUUID',
    ]
}

const SCHEMA_SUPPLIED_TRACKING_CONFIG = {
    id: 'LogUI-trackingConfig',
    type: 'object',
    properties: {

    },
    required: [

    ]
}

export default (function(root) {
    var _public = {};

    _public.addLogUIConfigProperty = function(propertyName, propertyType, isRequired=true) {
        SCHEMA_SUPPLIED_CONFIG_LOGUI.properties[propertyName] = {'type': propertyType};

        if (isRequired) {
            SCHEMA_SUPPLIED_CONFIG_LOGUI.required.push(propertyName);
        }
    }

    _public.validateSuppliedConfigObject = function(suppliedConfigObject) {
        var suppliedConfigValidator = new Validator();
        suppliedConfigValidator.addSchema(SCHEMA_SUPPLIED_CONFIG_LOGUI, '/LogUI-logUIConfig');
        suppliedConfigValidator.addSchema(SCHEMA_SUPPLIED_TRACKING_CONFIG, '/LogUI-trackingConfig');

        return suppliedConfigValidator.validate(suppliedConfigObject, SCHEMA_SUPPLIED_CONFIG);
    };

    return _public;
})(window);