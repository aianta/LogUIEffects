import Config from './modules/config';
import Dispatcher from '__dispatcherImport__';
import DOMHandler from './modules/DOMHandler/handler';
import EventPackager from './modules/eventPackager';
import MetadataHandler from './modules/metadataHandler';
import SpecificFrameworkEvents from './modules/specificFrameworkEvents';
import EventHandlerController from './modules/eventHandlerController';
import TinyMCEHandler from './modules/tinyMCE'

export default (function(root) {
    var _public = {};

    /* Public build variables */
    _public.buildVersion = '__buildVersion__';
    _public.buildEnvironment = '__buildEnvironment__';
    _public.buildDate = '__buildDate__';

    _public.Config = Config;

    root.addEventListener('message', handleWindowMessages)

    console.log(`Hello from LogUI inside ${root.location}!`)

    /* API calls */
    _public.init = async function(suppliedConfigObject) {
        root.addEventListener('logUIShutdownRequest', _public.stop);

        if (!suppliedConfigObject) {
            throw Error('LogUI requires a configuration object to be passed to the init() function.');
        }

        if (!Config.init(suppliedConfigObject)) {
            throw Error('The LogUI configuration component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!MetadataHandler.init()) {
            throw Error('The LogUI metadata handler component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!EventPackager.init()) {
            throw Error('The LogUI event packaging component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!SpecificFrameworkEvents.init()) {
            throw Error('The LogUI events component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!await Dispatcher.init(suppliedConfigObject)) {
            throw Error('The LogUI dispatcher component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!DOMHandler.init()) {
            throw Error('The LogUI DOMHandler component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!EventHandlerController.init()) {
            throw Error('The LogUI event handler controller component failed to initialise. Check console warnings to see what went wrong.');
        }
        
        document.addEventListener('loguiEvent', function(event){
            console.log("Relaying event from child iframe! ")
            console.log(event)
            console.log(event.detail)
            Dispatcher.sendObject(event.detail)
        })

        TinyMCEHandler.init()

        //root.addEventListener('unload', _public.stop);



    };

    /* Author: Alex Ianta
    * Date: October 10, 2025
    * Adding support for capturing interaction events inside iframes of the parent document.
    * 
    * Inside an iframe we want to bind to elements and events using the same configuration as LogUI on the parent document.
    * However, the eventhandlers here will not invoke a dispatcher but rather simply report their events 
    * to LogUI in the parent document. 
    * 
    * In effect, there is no direct LogUI stop/start inside the iframe, that logic is invoked from the parent window LogUI.
    */
   _public.iframeInit = async function(suppliedConfigObject){
        suppliedConfigObject = JSON.parse(suppliedConfigObject) //Pass config via string to avoid permissionn issues?
        console.log("Initalizing LogUI inside IFrame!")

        if (!suppliedConfigObject){
            throw Error('LogUI requires a configuration object to be passed to the init() function.')
        }

        if(!Config.init(suppliedConfigObject)){
            throw Error('The LogUI configuration component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!MetadataHandler.init()) {
            throw Error('The LogUI metadata handler component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!SpecificFrameworkEvents.init()) {
            throw Error('The LogUI events component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!DOMHandler.init()) {
            throw Error('The LogUI DOMHandler component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!EventHandlerController.init()) {
            throw Error('The LogUI event handler controller component failed to initialise. Check console warnings to see what went wrong.');
        }

        Dispatcher.iframeInit()

        console.log("Finished iframeInit!")
   }


    function handleWindowMessages(event){
        if(event.source === window &&
            event?.data?.origin === 'main.js'){
                console.log(`Got ${event.data.type} msg from 'main.js'`)
                switch(event.data.type){
                    case 'START_LOGUI':

                        console.log(`Starting LogUI, Dispatcher.isInIframe: ${Dispatcher.isInIframe?Dispatcher.isInIframe():'undefined'}`)
                        _public.init(event.data.config)
                        
                        break;
                    case 'STOP_LOGUI':
                        console.log(`Stopping LogUI, Dispatcher.isInIframe: ${Dispatcher.isInIframe?Dispatcher.isInIframe():'undefined'}`)
                        _public.stop()
                        break;
                }

            }
    }

    _public.isActive = function() {
        return (
            Config.isActive() &&
            Dispatcher.isActive());
    }

    _public.stop = async function() {
        if (!_public.isActive()) {
            throw Error('LogUI may only be stopped if it is currently running.');
        }

        //root.removeEventListener('unload', _public.stop);
        root.removeEventListener('logUIShutdownRequest', _public.stop);

        // https://stackoverflow.com/questions/42304996/javascript-using-promises-on-websocket
        DOMHandler.stop();
        EventHandlerController.stop();
        SpecificFrameworkEvents.stop();
        EventPackager.stop();
        MetadataHandler.stop();
        TinyMCEHandler.stop();
        await Dispatcher.stop();
        Config.reset();
        root.dispatchEvent(new Event('logUIStopped'));
    };

    _public.logCustomMessage = function(messageObject) {
        if (!_public.isActive()) {
            throw Error('Custom messages may only be logged when the LogUI client is active.');
        }
        
        EventPackager.packageCustomEvent(messageObject);
    };

    _public.updateApplicationSpecificData = function(updatedObject) {
        if (!_public.isActive()) {
            throw Error('Application specific data can only be updated when the LogUI client is active.');
        }

        Config.applicationSpecificData.update(updatedObject);
        SpecificFrameworkEvents.logUIUpdatedApplicationSpecificData();
    };

    _public.deleteApplicationSpecificDataKey = function(key) {
        Config.applicationSpecificData.deleteKey(key);
        SpecificFrameworkEvents.logUIUpdatedApplicationSpecificData();
    }

    _public.clearSessionID = function() {
        if (_public.isActive()) {
            throw Error('The session ID can only be reset when the LogUI client is inactive.');
        }

        Config.sessionData.clearSessionIDKey();
    };

    //Setup TinyMCE event capturing
    root.addEventListener('load', ()=>{
        
        if (_public.isActive()){
            TinyMCEHandler.init()
        }
    })

    

    return _public;
})(window);