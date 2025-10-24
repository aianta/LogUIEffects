/*
    Custom LogUI Event Handler

    Captures input interaction events from tinyMCE components on the page. 

    @author: Alex Ianta
    @date: 2025-10-20
*/
import EventPackager from './eventPackager'
import { _dom_properties_ext, getElementTreeXPath } from './sharedUtils';

export default(function(root){

    var _handler = {};

    _handler.init = function(){

        // Detect presense of TinyMCE 
        if (typeof tinymce != "undefined"){
            console.log("Detected TinyMCE, instrumenting...")

            //Attach event handlers to any editors that will be created for this instance of tinymce
            tinymce.on('AddEditor', (event)=>{
                console.log(`Instrumented tinyMCE editor with id: ${event.editor.id}`)
                event.editor.on('input', inputEvent=>handleTinyMCEInput(inputEvent, event.editor))
                event.editor.on('SetContent', contentEvent=>handleTinyMCEInput(contentEvent, event.editor))
            })

            // Attach event handlers to all available editors.
            tinymce.editors.forEach(editor=>{
                console.log(`Instrumented tinyMCE editor with id: ${editor.id}`)
                editor.on('input', event=>handleTinyMCEInput(event, editor))
                editor.on('SetContent', contentEvent=>handleTinyMCEInput(contentEvent, editor))
            })
        }

    }

    _handler.stop = function(){
        if (typeof tinymce != "undefined"){
            console.log("Unregistering tinyMCE listeners")

            tinymce.off('AddEditor', (event)=>{
                console.log(`Instrumented tinyMCE editor with id: ${event.editor.id}`)
                event.editor.off('input', inputEvent=>handleTinyMCEInput(inputEvent, event.editor))
                event.editor.off('SetContent', contentEvent=>handleTinyMCEInput(contentEvent, event.editor))
            })

            // Unregister event handlers on all available editors. 
            tinymce.editors.forEach(editor=>{
                editor.off('input', event=>handleTinyMCEInput(event, editor))
                editor.off('SetContent', contentEvent=>handleTinyMCEInput(contentEvent, editor))
            })


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
            element: JSON.stringify(editor.getContentAreaContainer(), _dom_properties_ext),
            inputType: event.inputType !== undefined?event.inputType:'insertText',
            xpath: iframeXpath, 
            domSnapshot: captureDOMSnapshot(),
            value: event.data !== undefined?event.data:event.content,
            editorContent: editor.getContent({format: 'text'})
        }

        //Don't fire the event if the value/editor content is empty.
        //TODO: Conceivably, this would prevent us from capturing interactions where SetContent is used to 'clear' the text box. 
        //Will have to think of ways to account for this, possibly by only capturing SetContent during OdoBot's execution mode?
        //Anyways, for now, let's just clean it up.
        
        if (eventData.editorContent){
            EventPackager.packageCustomEvent(eventData)
        }

        
    }


    return _handler;

})(window);