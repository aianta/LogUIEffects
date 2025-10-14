/*
 Custom LogUI Event Handler

 Captures additional dom details when a change event is triggered

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

    _handler.browserEvents = ['change']

    _handler.init = function(){return}

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

    //handle the change event
    _handler.logUIEventCallback = function(eventContext, browserEvent, trackingConfig){

        let returnObject = {
            type: browserEvent.type,
            xpath: getElementTreeXPath(browserEvent.target),
            element: JSON.stringify(browserEvent.target, _dom_properties_ext),
            domSnapshot: captureDOMSnapshot()
        }


        if (browserEvent.target.tagName == 'SELECT'){
            let options = []
            for(let child of browserEvent.target.children){
                options.push({
                    xpath: getElementTreeXPath(child),
                    element: JSON.stringify(child, _dom_properties_ext)
                })
            }
            returnObject.options = options
        }


        

        return returnObject;
    }

    return _handler

})(window)