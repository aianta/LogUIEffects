/**
 * Odo Sight Dispatcher for LogUI Client Library
 * 
 * A Runtime Port based dispatcher that communicates with a persistent websocket
 * dispatcher sitting in the odo-sight extension context. 
 * 
 * See link below for more on extension runtime ports:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port  
 * 
 * @author Alexandru Ianta
 * @date 2023-24-10
 * 
 * Does not feature a cache. 
 */

import Config from '../config'
import Helpers from '../helpers'
import Defaults from '../defaults'
import RequiredFeatures from '../required'
import ValidationSchemas from '../validationSchemas'

Defaults.dispatcher = {
    endpoint: null,
    authorizationToken: null
}

//TODO: Odosight does not register the WindowConnection API for this to work. Maybe fix this one day.
//RequiredFeatures.addFeature('WindowConnection') //Requires the WindowConnection API provided by the odo-sight extension.  

export default (function(root){

    var _public = {};
    var _isActive = false;
    var _windowConnection = null;
    var _libraryLoadTimestamp = null;  // The time at which the dispatcher loads -- for measuring the beginning of a session more accurately.


    _public.dispatcherType = 'odo-sight';

    _public.init = function(){
        if (!_isActive){
            root.addEventListener('message', handleMessage)
    
            root.postMessage({
                origin: 'logui.bundle.js',
                type: 'GET_SESSION_INFO'
            })
        }

        


        _isActive = true;
        

        return true;
    };


    function handleMessage(event){
        if(event.source === root &&
            event?.data?.origin === 'main.js'){
                console.log(`odosightDispatcher got ${event.data.type} message.`)
                switch(event.data.type){
                    case "LOGUI_CACHE_OVERFLOW":
                        root.dispatchEvent(new Event('logUIShutdownRequest'))
                        break;
                    case "SESSION_INFO":
                        console.log(`got session info! ${JSON.stringify(event.data.sessionData,null,4)}`)
                        handleSessionConfig(event.data.sessionData)
                        break;
                }
            }
    }

    _public.stop = async function(){

        root.removeEventListener('message', handleMessage)

        _isActive = false;

    }

    _public.isActive = function (){
        return _isActive;
    } 

    _public.sendObject = function(objectToSend){
        if(_isActive){

            Helpers.console(objectToSend, 'Dispatcher', false);
            
            let data = JSON.parse(JSON.stringify(objectToSend))

            window.postMessage({
                origin: 'logui.bundle.js',
                type: 'LOGUI_EVENT',
                payload: data
            })

            return;

        }

        throw Error('You cannot send a message when LogUI is not active.')
    }

    function handleSessionConfig(_sessionData){
        Config.sessionData.setID(_sessionData.sessionID)
        Config.sessionData.setTimestamps(new Date(_sessionData['sessionStartTimestamp']), new Date(_sessionData['libraryStartTimestamp']))
        console.log('sessionData')
        console.log(_sessionData)
        if(_sessionData.fresh){
            root.dispatchEvent(new Event('logUIStarted'))
        }

    }


    return _public;

})(window);
