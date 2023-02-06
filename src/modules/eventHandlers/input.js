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

        let returnObject = {
            type: browserEvent.type,
            xpath: getElementTreeXPath(browserEvent.target),
            element: JSON.stringify(browserEvent.target, _dom_properties_ext), //The actual input element should include extended properties.
            domSnapshot: JSON.stringify(rootElement, _root_dom_properties)
        }

        if(trackingConfig.hasOwnProperty('name')){
            returnObject.name = trackingConfig.name
        }

        return returnObject;

    }

    return _handler;
})(window)