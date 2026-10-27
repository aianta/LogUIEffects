/*
    LogUI Client Library
    DOM Handler Binder Module

    IIFE function that provides functionality to bind event listeners to elements.

    @module: DOM Handler Binder
    @author: David Maxwell
    @date: 2020-03-02
*/

import Config from '../config';
import DOMHandlerHelpers from './helpers';
import EventCallbackHandler from '../eventCallbackHandler';

export default (function(root) {
    var _public = {};
    var _bound = 0; //How many elements have LogUI listeners, for diagnostics.

    _public.init = function() {
        for (let element of DOMHandlerHelpers.generators.uniqueElements()) {
            _public.bind(element);
        }
    };

    _public.stop = function() {
        for (let element of DOMHandlerHelpers.generators.uniqueElements()) {
            _public.unbind(element);
        }
        _bound = 0;
    };

    /**
     * @returns how many elements LogUI bound listeners to since it started, for diagnostics.
     */
    _public.boundCount = function() {
        return _bound;
    };

    _public.bind = function(element) {
        let elementDOMProperties = Config.DOMProperties.get(element);

        let events = 0;
        for (let eventName of elementDOMProperties.getEventList()) {

            element.addEventListener(eventName, EventCallbackHandler.logUIEventCallback, true);
            events++;

            
        }
        if (events > 0) {
            _bound++;
        }
    };

    _public.unbind = function(element) {
        let elementDOMProperties = Config.DOMProperties.get(element);

        for (let eventName of elementDOMProperties.getEventList()) {
            element.removeEventListener(eventName, EventCallbackHandler.logUIEventCallback);
        }
    };

    return _public;
})(window);