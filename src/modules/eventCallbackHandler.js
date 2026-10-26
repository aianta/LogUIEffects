/*
    LogUI Client Library
    Event Callback Handler Module

    An IIFE function returning functions for handling event callbacks associated with elements/events tracked under LogUI.

    @module: Event Callback Handler Module
    @author: David Maxwell
    @date: 2020-02-25
*/

import Config from './config';
import EventPackager from './eventPackager';
import EventHandlerController from './eventHandlerController';

export default (function(root) {
    var _public = {};

    /**
     * @author Alexandru Ianta
     * Maps each browser event to the innermost element on its path that LogUI tracks for that event type.
     * Listeners are bound on every tracked element in the capture phase, so a click on <li><a><span> reaches
     * three LogUI listeners. Only the listener on the innermost tracked element logs the event; the others
     * return without touching the event, so application listeners still see it as before.
     *
     * Known gap: if the page has a capture listener on an ancestor of the innermost tracked element that calls
     * stopPropagation(), the event never reaches that element and is not logged at all. Before this check the
     * tracked ancestors above that point would still have logged it. Odo Sight's handlerMagic.js puts LogUI's
     * listener first on each element, so a page listener on the innermost tracked element itself does not cause this.
     */
    var _eventOwners = new WeakMap();

    var _getEventOwner = function(browserEvent) {
        if (!_eventOwners.has(browserEvent)) {
            let owner = browserEvent.composedPath().find(element => {
                let properties = Config.DOMProperties.get(element);
                return properties && properties.getEventGroupName(browserEvent.type);
            });

            _eventOwners.set(browserEvent, owner || null);
        }

        return _eventOwners.get(browserEvent);
    };

    _public.logUIEventCallback = function(browserEvent) {
        if (_getEventOwner(browserEvent) !== browserEvent.currentTarget) {
            return;  // A deeper tracked element on this event's path logs it instead.
        }

        browserEvent._eventTime = performance.now()
        console.log('EVENT TIME: ', browserEvent.timeStamp)
        let elementDOMProperties = Config.DOMProperties.get(browserEvent.currentTarget);

        // console.log("Event happened");
        // console.log(browserEvent.target);
        // console.log(browserEvent.currentTarget); // This may be the correct thing to use instead of .target - need to test this some more.
        // console.log(browserEvent.eventPhase);
        // console.log(elementDOMProperties);
        // console.log('=====');

        // This stops event propogation, preventing multiple events being fired.
        // After testing, this doesn't seem to break hovering over children where a listener is present...
        // browserEvent.stopPropagation();

        // stopPropogation() unfortunately also stops other bound event listeners not related to LogUI from firing.
        // Instead, we can check the eventPhase property of the event -- if we're at the target element (2), we can proceed.
        // If we are not at the target event (!=2) we do not proceed further with the logging process.
        // This should no longer be required (as of 2022-02-02) as we use currentTarget instead, alongside the check below to ensure that the object considered is covered by LogUI.
        // if (browserEvent.eventPhase != 2) {
        //     return;
        // }

        // Can we work out what the call is for, and check?
        // like if we have a click on green, and a click on body, the element itself takes precedence?
        // So if there are multiple ones, can we use CSS specificty to work out what one to take forward?

        if (!elementDOMProperties) {
            return;  // In this scenario, there is no matching DOMProperties object for the element.
        }

        let groupName = elementDOMProperties.getEventGroupName(browserEvent.type);
        let trackingConfig = Config.elementTrackingConfig.getElementGroup(groupName);

        // A group with ignore: true keeps its elements tracked, so they own their events, but logs nothing for them.
        // Odo Sight uses this to exclude clicks on elements whose interaction it captures as another event.
        if (trackingConfig.ignore) {
            return;
        }

        let eventHandler = EventHandlerController.getEventHandler(trackingConfig.event);
        let packageEvent = false;

        if (eventHandler) {
            packageEvent = eventHandler.logUIEventCallback(this, browserEvent, trackingConfig);
        }
        else {
            packageEvent = _defaultEventCallbackHandler(this, browserEvent, trackingConfig);
        }

        if (packageEvent) {
            EventPackager.packageInteractionEvent(this, packageEvent, trackingConfig);
        }
    };

    var _defaultEventCallbackHandler = function(eventContext, browserEvent, trackingConfig) {
        let returnObject = {
            type: browserEvent.type,
        };

        if (trackingConfig.hasOwnProperty('name')) {
            returnObject.name = trackingConfig.name;
        }

        return returnObject;
    };

    return _public;
})(window);