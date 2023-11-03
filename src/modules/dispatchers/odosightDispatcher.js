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
        _initWindowConnection();
        


        _isActive = true;
        

        return true;
    };

    _public.stop = async function(){

        _isActive = false;

    }

    _public.isActive = function (){
        return _isActive;
    } 

    _public.sendObject = function(objectToSend){
        if(_isActive){

            Helpers.console(objectToSend, 'Dispatcher', false);
            
            let data = JSON.parse(JSON.stringify(objectToSend))


            _windowConnection.send(
                {
                    type: 'LOGUI_EVENT',
                    payload: data
                },
                function(response){
                    console.log('Event dispatch acknowledged by odo-sight.')
                },
                function(error){
                    console.error('Error dispatching event to odo-sight!', JSON.stringify(error, null, 4))
                }
            )

            return;

        }

        throw Error('You cannot send a message when LogUI is not active.')
    }

    function handleSessionConfig(_sessionData){
        Config.sessionData.setID(_sessionData.sessionID)
        Config.sessionData.setTimestamps(new Date(_sessionData['sessionStartTimestamp']), new Date(_sessionData['libraryStartTimestamp']))

        root.dispatchEvent(new Event('logUIStarted'))
    }

    var _initWindowConnection = function(){
        _windowConnection = new WindowConnection('logui.bundle.js', 'main.js')


        _windowConnection.on('DISPATCHER_CONNECTION_SUCCESS', function(request){
            return new Promise((resolve,reject)=>{
                handleSessionConfig(request.sessionData)
                resolve('got session config details.')
            })
        })


        _windowConnection.on('LOGUI_HANDSHAKE_SUCCESS', function(request){
            return new Promise((resolve,reject)=>{
                handleSessionConfig(request.sessionData)
                resolve('got session config details.')
            })
        })

        _windowConnection.on('LOGUI_CACHE_OVERFLOW', function(request){
            return new Promise((resolve,reject)=>{
                root.dispatchEvent(new Event('logUIShutdownRequest'))
                resolve('dispatched DOM Event logUIShutdownRequest')

            })
        })

        _windowConnection.send({
            type: 'CONNECT_DISPATCHER',
            authToken: Config.getConfigProperty('authorisationToken'),
            endpoint: Config.getConfigProperty('endpoint')
        })
    }

    return _public;

})(window);
