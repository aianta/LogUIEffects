
import EventPackager from './../eventPackager'
import { getElementTreeXPath } from '../sharedUtils';

export default(function(root){

    var _handler = {};

    _handler.init = function(){

        // Detect presense of TinyMCE 
        if (typeof tinymce != "undefined"){
            console.log("Detected TinyMCE, instrumenting...")
            // Attach event handlers to all available editors.
            tinymce.editors.forEach(editor=>editor.on('input', event=>handleTinyMCEInput(event, editor)))
        }

    }

    _handler.stop = function(){
        if (typeof tinymce != "undefined"){
            console.log("Unregistering tinyMCE listeners")

            // Unregister event handlers on all available editors. 
            tinymce.editors.forEach(editor=>editor.off('input', event=>handleTinyMCEInput(event, editor)))


        }
    }

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

    var handleTinyMCEInput = function (event, editor){
        //Package and send object

        const iframeXpath = getElementTreeXPath(editor.getContentAreaContainer().children[0])

        console.log("tinyMCE Event Handler Invoked!")

        let eventData = {
            name: 'INPUT_CHANGE',
            source: 'tinyMCE',
            editorId: editor.id,
            inputType: event.inputType,
            xpath: iframeXpath, 
            domSnapshot: captureDOMSnapshot(),
            value: event.data,
            editorContent: editor.getContent({format: 'text'})
        }

        EventPackager.packageCustomEvent(eventData)
    }


    return _handler;

})(window);