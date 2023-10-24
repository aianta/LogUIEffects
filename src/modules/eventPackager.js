/*
    LogUI Client Library
    Event Packager Module

    An IIFE function returning the predispatching phase of LogUI.
    Handles the collection of data from a variety of sources, packages it up into an object, and sends it to the dispatcher.

    @module: Event Packager Module
    @author: David Maxwell
    @date: 2021-02-24
*/

import Config from './config';
import MetadataHandler from './metadataHandler';
import Dispatcher from '__dispatcherImportInPackager__';

export default (function(root) {
    var _public = {};

    _public.init = function() {
        return true;
    };

    _public.stop = function() { };

    _public.packageInteractionEvent = function(element, eventDetails, trackingConfig) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'interactionEvent';
        packageObject.eventDetails = eventDetails;
        packageObject.metadata = MetadataHandler.getMetadata(element, trackingConfig);

        Dispatcher.sendObject(packageObject);
    };

    _public.packageCustomEvent = function(eventDetails) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'customEvent';
        packageObject.eventDetails = eventDetails;

        /**
         * @author Alexandru Ianta
         * For odo sight, when network events are captured as custom events, we want to make sure
         * the network event timestamp is the timestamp being used as the eventTimestamp. 
         * Ideally these would both be the same or very similar, but when something like
         * a POST request is made just before the page unloads, LogUI will lose that event
         * because it will unload from the page before the network request can be captured. 
         * Odo-sight will send the network event to LogUI again once it is re-loaded on the 
         * next page, but at this point sinificant amounts of time have passed. So to keep events
         * ordered properly, for network request events, we overwrite timestamps.eventTimestamp 
         * with the one provided in the eventDetails. 
         * 
         */
        if(eventDetails.name === 'NETWORK_EVENT' && eventDetails.timeStamp !== undefined){
            packageObject.timestamps.eventTimestamp = new Date(eventDetails.timeStamp)
        }

        Dispatcher.sendObject(packageObject);
    }

    _public.packageBrowserEvent = function(eventDetails) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'browserEvent';
        packageObject.eventDetails = eventDetails;

        Dispatcher.sendObject(packageObject);
    };

    _public.packageStatusEvent = function(eventDetails) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'statusEvent';
        packageObject.eventDetails = eventDetails;

        Dispatcher.sendObject(packageObject);
    };

    var getBasicPackageObject = function() {
        let currentTimestamp = new Date();
        let sessionStartTimestamp = Config.sessionData.getSessionStartTimestamp();
        let libraryStartTimestamp = Config.sessionData.getLibraryStartTimestamp();
        
        return {
            eventType: null,
            eventDetails: {},
            sessionID: Config.sessionData.getSessionIDKey(),
            timestamps: {
                eventTimestamp: currentTimestamp,
                sinceSessionStartMillis: currentTimestamp - sessionStartTimestamp,
                sinceLogUILoadMillis: currentTimestamp - libraryStartTimestamp,
            },
            applicationSpecificData: Config.applicationSpecificData.get(),
        }
    }

    return _public;
})(window);