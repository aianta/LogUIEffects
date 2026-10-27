/*
    LogUI Client Library
    DOM Handler Module

    An IIFE function containing key functionality for traversing the DOM, and binding event listeners to elements within the page.

    @module: DOM Handler
    @author: David Maxwell
    @date: 2020-03-02
*/

import Binder from './binder';
import DOMHandlerHelpers from './helpers';
import BrowserEventsController from './browserEventsController';
import MutationObserverController from './mutationObserverController';

export default (function(root) {
    var _public = {};

    /* For diagnostics: what runElementInitialisation got that wasn't an element, see recordAnomaly. */
    var _anomalies = [];
    /* For diagnostics: the error that stopped runElementInitialisation, if one did. */
    var _initialisationError = null;

    _public.initialisationError = function() {
        return _initialisationError;
    };

    _public.anomalies = function() {
        return _anomalies.slice();
    };

    /**
     * Describe a non-element runElementInitialisation is about to process: the key the for...in loop produced, where
     * that key is defined (the keys array itself, Array.prototype or Object.prototype), whether it is enumerable there,
     * and the start of the source of what it holds, which names the library that added it.
     */
    var recordAnomaly = function(groupObject, key, element, keys) {
        if (_anomalies.length >= 20) {
            return;
        }
        var owner = Object.prototype.hasOwnProperty.call(keys, key) ? 'keys array'
            : Object.prototype.hasOwnProperty.call(Array.prototype, key) ? 'Array.prototype'
            : Object.prototype.hasOwnProperty.call(Object.prototype, key) ? 'Object.prototype'
            : 'elsewhere on the prototype chain';
        var holder = owner === 'Array.prototype' ? Array.prototype : owner === 'Object.prototype' ? Object.prototype : keys;
        var descriptor = Object.getOwnPropertyDescriptor(holder, key);
        var value = holder[key];
        var arrayForIn = [];
        for (var k in []) {
            arrayForIn.push(k);
        }
        _anomalies.push({
            at: Date.now(),
            group: groupObject.name,
            selector: groupObject.selector,
            key: String(key),
            elementType: typeof element,
            owner: owner,
            enumerable: descriptor ? descriptor.enumerable : null,
            valueType: typeof value,
            valueSource: typeof value === 'function' ? String(value).slice(0, 300) : String(value).slice(0, 120),
            arrayForIn: arrayForIn.slice(0, 50),
            selectedElements: groupObject.selectedElements.length,
            keysLength: keys.length,
        });
    };

    _public.init = function() {
        //An element that can't be initialised costs that element, not the page: binding and the mutation observer
        //still start. The error is kept for diagnostics.
        _initialisationError = null;
        try {
            runElementInitialisation();
        } catch (err) {
            _initialisationError = String(err && err.stack ? err.stack : err);
            console.error('LogUI could not initialise every element; binding the rest.', err);
        }
        BrowserEventsController.init();
        Binder.init();
        MutationObserverController.init();

        return true;
    };

    _public.stop = function() {
        MutationObserverController.stop();
        BrowserEventsController.stop();
        Binder.stop();
    };

    /**
     * Process every element each tracking group selects. The elements are visited by index: a for...in loop would also
     * visit what a page adds to Array.prototype as enumerable properties (Prototype.js adds 'each', 'collect', ... on
     * Magento's admin pages), and process undefined for each of them.
     */
    var runElementInitialisation = function() {
        for (let groupObject of DOMHandlerHelpers.generators.trackingConfig()) {
            let elements = groupObject.selectedElements;
            for (let i = 0; i < elements.length; i++) {
                let element = elements[i];

                if (!(element instanceof root.Element)) {
                    recordAnomaly(groupObject, i, element, Object.keys(elements));
                    continue;
                }

                DOMHandlerHelpers.processElement(element, groupObject);
            }
        }
    }

    return _public;
})(window);