# Qdash
## What is Qdash?
Qdash is an environment for developing web pages that display Home Assistant entities as boxes.

Qdash is based on:
- HA web server 
- HA automation blueprint
- Mosquitto MQTT add-on  
- Nginx Manager add-on
- one short CSS file
- one pretty simple JavaScript file
- external CSS for material design icons 
- external JavaScript MQTT client library 

## Simple HTML

    <body onload="onLoad();"> 
       <div class="page">
          <div class="box" id="sensor.outdoor_temperature"></div>
          <div class="box" id="sensor.bedroom_temperature"></div>
          <div class="box" id="sensor.garage_temperature"></div>
          <div class="box" id="switch.garage_radiator"></div>
          <div class="box" id="light.outdoor_lamp"></div>
          <div class="box" id="script.all_lamps_off"></div>
       </div>
    </body>

## Front-end
A Qdash web application is set up as a simple HTML page defining a set of boxes.

Communication with HA is based on MQTT. 

Access rules are implemented using Nginx and MQTT user/password options.

## Back-end
To serve the web application there must be an automation to send state changes to the web application and receive requests from the web application. This automation is based on a blueprint. The automation also provides information about the entities, such as name, area and unit of measurements. When the web application is started, it requests this information. 

## The boxes
Each box has a title and a value reflecting the current entity state. By default 
- for a sensor, the value is numeric and followed by a unit of measure.
- for a binary_sensor, the value is replaced by an icon that can change color.
- for switches, lights and scripts, the value is a clickable icon. 

A box may also be customized by adding options to the HTML element, e.g.:

`<div class="box" id="sensor.bedroom_temperature" 
 name="Bed room" fill="darkgreen"></div>`

The following options are available:
| option |  meaning |
|--------|----------|
| fill="COLOR"  |         	where COLOR sets the color of the box   |  
| name="NAME"    |       	where NAME is overriding the entity's friendly_name  |   
| uom="UOM"  |             	where UOM is overriding the entity's unit_of_measurement |
| prec="PREC"    |         	where PREC is overriding the entity's number of decimals (0..) |
| icon="ICON"    |          	where mdi:ICON is overriding the entity's icon |
| domain="DOMAIN" |  	where DOMAIN is overriding domain in entity_id |
| dcls="DCLS"   |          	where DCLS is overriding the entity's device_class  |
| area="AREA"   |         	where AREA is overriding the entity's area name |
| arid="AREAID"    |      	where AREAID is overriding the entity's area id |


## HTML page structure
### Mandatory elements
    <body onload="onLoad();"> 
      <div class="page">
        <div class="box"></div>
      </div>
    </body>


 | element | meaning |
 |--------|--------|
 | body  | When the page is loaded, `onLoad()` is called to set up config parameters that are applied to the boxes and then start the communication.  |
 |  class="page" | Mandatory element to contain a set of boxes. Multiple elements may be provided, see #multiple pages.  |  
 | class="box" | The box elements. |

### Multiple pages
It is possible to define several pages, each with a set of boxes. Only one page will be visible at a time.
    
    <div class="page" id="upstairs">
       <div class="box" id=...></box>
       …
       <div class="box" id=...></box>
    </div>
    <div class="page" id="downstairs">
       <div class="box" id=...></box>
       …
       <div class="box" id=...></box>
    </div>

Use the function `onShowPage( page_id )` to switch between pages. 


### Optional elements

Other elements may be placed 
- above the pages
- above the boxes in a page
- below the boxes in a page
- below the pages

    <body onload="onLoad();"> 
        <div class="nobox"></div>   
        <div class="page">
          <div class="nobox"></div>   
          <div class="box"></div>
          <div class="nobox"></div>   
        </div>
        <div class="nobox"></div>
     </body>

Text should be inserted in `<div class="nobox"></div>` as elements, for example just before `</body>`:

    <div class="nobox">
       <h2>Guest dashboard</h2>
       <p>Welcome to control my home. Use the buttons below to switch between views.</p>
       <button onclick="onShowPage('upstairs'  )">Upstairs</button> 
       <button onclick="onShowPage('downstairs')">Downtairs</button> 
       <button onclick="onShowPage('outdoors'  )">Outdoors</button> 
    </div>
    

The default styling of some common element types are:

       h1     { color: blue;  font-size: 300%; }
       h2     { color: blue;  font-size: 250%; }
       p      { color: black; font-size: 100%; }
       button { color: white; background-color: darkblue; font-size: 100%; width: 6em; }

You can change this own styling, for example:

     <style>
       /* user styles */
       h3     { color: blue;  font-size: 200%; }
       p      { color: green; }
     </style>

 
Add this style element in <head> element.

## Config parameters
The config parameters are set in the onLoad function.
### config.userName, config.password
MQTT user name and password to give access to HA MQTT broker. User name/password pairs are defined in Mosquitto add-on configuration. 
Mandatory.
### config.host, config.port, config.useSSL
Web address and port to be used to connect to MQTT broker.
When config.useSSL is set to true, secure websocket protocol is used. This is strongly recommended when accessing the MQTT broker from internet.
Mandatory.
### config.client
Name of the MQTT client.
To make a unique name the following expression may be used:
    'qdash_'+ Math.floor(Date.now() / 1000); 
### config.timeout
Timeout in ms for MQTT connection retrial. Mandatory.
### config.stateTopic
MQTT topic for updating entity state. Sent from HA to the web application. Mandatory. 
### config.buttonTopic
MQTT topic to be used for telling HA that a clickable icon was clicked. Mandatory. 
### config.requestTopic
MQTT topic for requesting HA for entity information. Mandatory. 
### config.responseTopic
MQTT topic for providing entity information. Sent from HA to the web application. Mandatory. 
### config.columns
Number of box columns.
Default is 2.
### config.width
Percent of the total width to be used for the box columns. 
Default is 100.
### config.consoleLog
When true, debug information is sent to console.log. Default.
config.divLog
When set to an HTML element id in the HTML code, the debug information is also put in that element. 
Default is that no such logging is done.
### config.areacolor
Definition of fill colors to be used for HA areas. An area is referred to as the HA area_id.
Optional.
Example:

    config.areacolor = {
       livingroom = 'navy',
       kitchen    = 'purple',
       bedroom    = '#34AB34'
    }

Config parameters may be set from url request parameters, for example:
`config.columns = getUrlParam('columns', '2' );`

## Other boxes

### Entity boxes
As mentioned there are entity boxes. But there are also other types of boxes.
   
### Simple boxes
A box can be just a colored box, optionally with some text in it. There must be no id. An example:
    
      <div class="box" fill="green">
          <p>A simple box</p>
      </div>
    
### HTML coded boxes
A box may contain more complex HTML code. The example shows a title and a clickable icon. Note that `class="mdi mdi-home"` is the method for addressing the icon. The styles are specified as argument.
    
      <div class="box" fill="grey" >
          <p style="color:blue;">Downstairs</p>
          <span class="mdi mdi-home" style="color:blue; font-size:300%;" onclick="onShowPage( 'downstairs' )"></span>
      </div>
    
### HTML coded entity boxes
Entity boxes are pretty simple showing a reported state and/or clickable for requesting a state change.
    But if you want to affect brightness of a lamp, you need more than that.
    
    box may contain more complex HTML code. The example shows a title and a clickable icon. Note that `class="mdi mdi-home"` is the method for addressing the icon. The    

    
    
    
    
    
    
## MQTT sequence

          User       Browser                            Home Assistant 
                                    
          URL ------------------------- GET ----------> web server
                     onLoad()      <--- page ---------- web server
                     onConfigDone()
                     mqttConnect() ----> MQTT broker    
                     onConnect()   <---- MQTT broker           
                     nextRequest() -----/request -----> automation                       
                     onMessage()   <----/response ----- automation         
                     nextRequest() -----/request  ----> automation                       
                     onMessage()   <----/response ----- automation         
                     ...
                     onMessage()   <----/state -------- automation <--- state change event
                     onMessage()   <----/state -------- automation <--- state change event
                     ...
           click --> onClick()     -----/button ------> automation ---> state change request
                     onMessage()   <----/state -------- automation <--- state change event
                     
 ## Security
 
 - HTTPS is used 
 - Nginx is set up to limit access to other pages 
 - Nginx user/password is required to get page
 - MQTT broker is accessed via Nginx using Web Sockets Secure
 - MQTT user/password is required 
 - MQTT access control list is used to restrict allowed topics 
 - Automation restricts the set of entities to be accessed
 
 

