/*
 Custom LogUI Event Handler

 Captures additional dom details when an input event is triggered

 @module: Input Event Handler
 @author: Alex Ianta
 @date: 2023-02-06
*/

import RequiredFeatures from '../required'
import { _dom_properties } from '../sharedUtils'
import { _dom_properties_ext } from '../sharedUtils'
import { _root_dom_properties } from '../sharedUtils'
import { getElementTreeXPath } from '../sharedUtils'

export default (function(root){
    var _handler = {};

    _handler.browserEvents = ['input']

    _handler.init = function(){return}

    //Handle the input event
    _handler.logUIEventCallback = function(eventContext, browserEvent, trackingConfig){

        //Get the root element
        let rootElement = browserEvent.composedPath().find(e=>e.localName === 'html')

        //Get the ValidityState object
        //https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
        let validityState = browserEvent.target.validity 


        let returnObject = {
            type: browserEvent.type,
            xpath: getElementTreeXPath(browserEvent.target),
            element: JSON.stringify(browserEvent.target, _dom_properties_ext), //The actual input element should include extended properties.
            domSnapshot: JSON.stringify(rootElement, _root_dom_properties),
            validity_badInput: validityState.badInput,
            validity_customError: validityState.customError,
            validity_patternMismatch: validityState.patternMismatch,
            validity_rangeOverflow: validityState.rangeOverflow,
            validity_rangeUnderflow: validityState.rangeUnderflow,
            validity_stepMismatch: validityState.stepMismatch,
            validity_tooLong: validityState.tooLong,
            validity_tooShort: validityState.tooShort,
            validity_typeMismatch: validityState.typeMismatch,
            validity_valid: validityState.valid,
            validity_valueMissing: validityState.valueMissing,
        }

        if(trackingConfig.hasOwnProperty('name')){
            returnObject.name = trackingConfig.name
        }

        return returnObject;

    }

    return _handler;
})(window)