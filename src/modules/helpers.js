/*
    LogUI Client Library
    Helpers Module

    A IIFE function containing several helper methods used throughout the rest of the LogUI client library.

    @module: Helpers
    @author: David Maxwell
    @date: 2020-09-14
*/

export default (function(root) {
    var _helpers = {};

    _helpers.$ = root.document.querySelector.bind(root.document);
    _helpers.$$ = root.document.querySelectorAll.bind(root.document);

    _helpers.console = function(messageStr, currentState=null, isWarning=false) {

        let currentStateString = '';
        let consoleFunction = console.log;

        if (currentState) {
            currentStateString = ` (${currentState})`;
        }

        if (isWarning) {
            consoleFunction = console.warn;
        }

        if (root.LogUI.Config.getConfigProperty('verbose') || isWarning) {
            var timeDelta = new Date().getTime() - root.LogUI.Config.getInitTimestamp();

            if (typeof messageStr === 'object' && messageStr !== null) {
                consoleFunction(`LogUI${currentStateString} @ ${timeDelta}ms > Logged object below`);
                consoleFunction(messageStr);
                
                return;
            }

            consoleFunction(`LogUI${currentStateString} @ ${timeDelta}ms > ${messageStr}`);
        }
    };

    _helpers.getElementDescendant = function(rootObject, descendantString=null, separator='.') {
        if (!descendantString || descendantString == []) {
            return rootObject;
        }
        
        let descendantSplitArray = descendantString.split(separator);
        while (descendantSplitArray.length && (rootObject = rootObject[descendantSplitArray.shift()]));

        return rootObject;
    };

    _helpers.extendObject = function(objectA, objectB) {
        for (var key in objectB) {
            if (objectB.hasOwnProperty(key)) {
                objectA[key] = objectB[key];
            }
        }

        return objectA;
    };
    

    return _helpers;
})(window);