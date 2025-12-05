/**
 * Zigbee2mqtt Homebridge-MQTTThing Codec (encoder/decoder)
 * Codecs allow custom logic to be applied to accessories in mqttthing, rather like apply() functions, 
 * but in the convenience of a stand-alone JavaScript file.
 */

 'use strict';
 const t = require("./tools");
 const a = require("./automations");

/**
 * Initialise codec for accessory
 */
function init( params ) {
    // extract parameters for convenience
    let { log, config, publish, notify } = params;
    let msg = `--> zigbee2mqtt.js. ${config._ ? config._ : ''}`;
    log( msg );
    config.url = config.url ? config.url : "http://localhost:1883";
    // log(config)
    let state = {}
    
    /**
     * Encode message before sending.
     * The output function may be called to deliver an encoded value for the property later.
     */
     function encode( message, info, output ) {
        t.log_en(log, message, info, message);
        output( message );
    }

    /**
     * Decode received message, and optionally return decoded value.
     * The output function may be called to deliver a decoded value for the property later.
     */
    function decode( message, info, output ) { // eslint-disable-line no-unused-vars
        t.log_de(log, message, info, message)
        output( message );
    }

    function decode_Switch( message, info, output ) {
        t.log_de(log, message, info, message)
        msg = JSON.parse(message)
        //log(msg)
        //console.log(msg)
        //log("in decode_Switch for topic "+info.topic+" action "+msg.action)
        //log("in decode_Switch for topic "+info.topic+" msg "+JSON.stringify(msg))

        if (info.topic == "zigbee2mqtt/ShellyBLURemote") {
            if (["on"].includes(msg.action) && (msg.action_group == 4)) {
                publish("shelly1pmminig3-ecda3bc405dc/rpc",
                    JSON.stringify({
                        method: "Switch.Set", 
                        params: {
                            id: 0,
                            on: true
                        }}));                
            };
            if (["off"].includes(msg.action) && (msg.action_group == 4)) {
                publish("shelly1pmminig3-ecda3bc405dc/rpc",
                    JSON.stringify({
                        method: "Switch.Set", 
                        params: {
                            id: 0,
                            on: false
                        }}));                
            };
            if (["brightness_step_up"].includes(msg.action) && (msg.action_group != 3)) {
                publish("zigbee2mqtt/Esstisch/set",JSON.stringify({"brightness_step":msg.action_step_size}));      //Gruppe Esstisch          
            };
            if (["brightness_step_down"].includes(msg.action) && (msg.action_group != 3)) {
                publish("zigbee2mqtt/Esstisch/set",JSON.stringify({"brightness_step":-msg.action_step_size}));      //Gruppe Esstisch          
            };

            // Esstisch, der Dimmer arbeitet direkt über Zigbee2mqtt
            // hier schalten wir nur die Shelly Plus 2PM Wandmodule
            if (["on"].includes(msg.action) && (msg.action_group == 3)) {
                publish("shellyplus2pm-5443b23e53b8/rpc",
                    JSON.stringify({
                        method: "Switch.Set", 
                        params: {
                            id: 1,
                            on: true
                        }}));                
            };
            if (["off"].includes(msg.action) && (msg.action_group == 3)) {
                publish("shellyplus2pm-5443b23e53b8/rpc",
                    JSON.stringify({
                        method: "Switch.Set", 
                        params: {
                            id: 1,
                            on: false
                        }}));                
            };

            // Küche Deckenlicht
            if (["on"].includes(msg.action) && (msg.action_group == 2)) {
                publish("shellyplus2pm-5443b23e53b8/rpc",
                    JSON.stringify({
                        method: "Switch.Set", 
                        params: {
                            id: 0,
                            on: true
                        }}));                
            };
            if (["off"].includes(msg.action) && (msg.action_group == 2)) {
                publish("shellyplus2pm-5443b23e53b8/rpc",
                    JSON.stringify({
                        method: "Switch.Set", 
                        params: {
                            id: 0,
                            on: false
                        }}));                
            };
            // Gang Deckenlicht            
            if (["on","off"].includes(msg.action) && (msg.action_group == 1)) {
                publish("shelly1minig3-5432046a92fc/rpc",
                    JSON.stringify({
                        method: "Switch.Set", 
                        params: {
                            id: 0,
                            on: true
                        }}));                
            };            
        }

    }

    function encode_on( message, info, output ) {
        t.log_en(log, message, info, message);
        output( message );
    }

    function decode_on( message, info, output ) {
        t.log_de(log, message, info, message)
        output( message );
    }

    function encode_HSV( message, info ) {
        let params=message.split(",")
        let b=Math.round(2.54*params[2]);
        let result = {brightness:b,color:{hue:params[0],saturation:params[1]}}
        t.log_en(log, message, info, JSON.stringify(result));
        return JSON.stringify(result)
    }

    function decode_HSV( message ) {
        let params=message.split(",")
        let result = {brightness:params[2],color:{hue:params[0],saturation:params[1]}}
        t.log_de(log, message, info, JSON.stringify(result));
        return JSON.stringify(result)
    }

    function encode_ColorTemperature( message, info ) {
        let retval = {"color_temp": t.scale_to(140,250,500,454,message)};
        t.log_en(log, message, info, JSON.stringify(retval));
        return JSON.stringify(retval)
    }

    function decode_ColorTemperature( message, info ) {
        let retval = {"color_temp": t.scale_to(250,140,454,500,message)};
        t.log_de(log, message, info, JSON.stringify(retval));
        return JSON.stringify(retval)
    }

    function encode_brightness( message, info ) {
        // scale up to 0-255 range
        let retval = {"brightness":t.scale_to(0,0,100,255,message)};
        t.log_en(log, message, info, JSON.stringify(retval));
        return JSON.stringify(retval)
    }

    function decode_brightness( message, info ) {
        // scale down to 0-100 range
        let retval = {"brightness":t.scale_to(0,0,255,100,message)};
        t.log_de(log, message, info, JSON.stringify(retval));
        return JSON.stringify(retval)
    }

    function encode_motionDetected(message, info) {
        msg = JSON.parse(message);
        log("in encode_motionDetected for topic "+info.topic+" msg "+JSON.stringify(msg))
    }

    function decode_motionDetected(message, info) {
        msg = JSON.parse(message);
        log("in decode_motionDetected for topic "+info.topic+" msg "+JSON.stringify(msg))
    }

    // return encode and decode functions
    return { 
        encode, decode, // default encode/decode functions
        properties: {
            on: { 
                encode: encode_on,
                decode: decode_on
            },
            brightness: { // encode/decode functions for brightness property
                encode: encode_brightness,
                decode: decode_brightness
            },
            HSV: {
                encode: encode_HSV,
                decode: decode_HSV
            },
            colorTemperature: {
                encode: encode_ColorTemperature,
                decode: decode_ColorTemperature
            },
            switch0: {
                decode: decode_Switch                
            },
            motionDetected: {
                encode: encode_motionDetected,
                decode: decode_motionDetected
            }
        }
    };
}

// export initialisation function
module.exports = {
    init
};
