/*
    Custom LogUI Event Handler

    Captures the composed path of the captured event. 

    @module: Bubble Click Handler
    @author: Alex Ianta
    @date: 2022-11-07
*/

import RequiredFeatures from '../required'
import { _dom_properties } from '../sharedUtils';
import { _dom_properties_ext } from '../sharedUtils';
import { _root_dom_properties } from '../sharedUtils';
import { getElementTreeXPath } from '../sharedUtils';

export default (function(root){
    var _handler = {};

    _handler.browserEvents = ['click'] //This doesn't seem to matter...

    _handler.init = function(){
        return
    }

    /**
     * Returns a filtered snapshot of the DOM 
     */
        const captureDOMSnapshot = function(){
            const fullHtml = document.documentElement.outerHTML
            const scriptRegex = /<script[\s\S]*?>[\s\S]*?<\/script>/gi //https://stackoverflow.com/questions/16585635/how-to-find-script-tag-from-the-string-with-javascript-regular-expression
            const noScripts = fullHtml.replaceAll(scriptRegex, "") //Clear all scripts.
            const xmlCharacterDataRegex = /<!\[CDATA[\s\S]*\]\]>/gi 
            const noXMLCDATA = noScripts.replaceAll(xmlCharacterDataRegex, "") //Clear all XML character data
            const styleRegex = /<style[\s\S]*?>[\s\S]*?<\/style>/gi
            const noStyle = noXMLCDATA.replaceAll(styleRegex, "") //Clear all css styles
            const svgPathsRegex = /<path[\s\S]*?>[\s\S]*?<\/path>/gi
            const noSvgPaths = noStyle.replaceAll(svgPathsRegex, "") //Clear all paths inside SVGs
    
            let result = {
                outerHTML: noSvgPaths, 
                outerText: document.documentElement.outerText
            }
    
            return JSON.stringify(result)
    
        }

    // Handle the click event
    _handler.logUIEventCallback = function(eventContext, browserEvent, trackingConfig){
        
        // get elements whose listeners will be invoked from the browser event as it bubbles
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath
        let eventPath = browserEvent.composedPath()
        //Let's compute xpaths for each element
        for (let element of eventPath){
            let element_xpath = getElementTreeXPath(element)
            if (element_xpath !== null){ //Don't bother inserting the field in elements without an xpath
                element['xpath'] = getElementTreeXPath(element)
            }
        }

        // Get the last element on the eventPath (which should be the html tag)
        // and include its outerHTML as a snapshot of the DOM at this time. 
        let rootElement = eventPath.find(e=>e.localName === 'html')

        let returnObject = {
            type: browserEvent.type,
            xpath: getElementTreeXPath(browserEvent.target),
            element: JSON.stringify(eventPath[0], _dom_properties_ext),
            domSnapshot: captureDOMSnapshot(),
        };
        
        if(trackingConfig.hasOwnProperty('name')){
            returnObject.name = trackingConfig.name;
        }

        return returnObject;
    }

    return _handler;
})(window);