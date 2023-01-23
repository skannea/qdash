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
- external JavaScript mqtt client library 

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
    
    <div class="page" id="pg1">
       <div class="box" id=...></box>
       …
       <div class="box" id=...></box>
    </div>
    <div class="page" id="pg2">
       <div class="box" id=...></box>
       …
       <div class="box" id=...></box>
    </div>

Use the function `onShowPage( page_id )` to switch between pages. 
Example:
Put following code after the pages for switching between three pages with ids pg1, pg2 and pg3:

    <div class="nobox"> 
       <p onclick="onShowPage('pg1')">Page 1</p> 
       <p onclick="onShowPage('pg2')">Page 2</p> 
       <p onclick="onShowPage('pg3')">Page 3</p> 
    </div>


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
Definition of fill colors to be used for HA areas. An area are defined as the HA area_id.
Optional.
Example:

    config.areacolor = {
       livingroom = 'navy',
       kitchen    = 'purple',
       bedroom    = '#34AB34'
    }

Config parameters may be set from url request parameters, for example:
`config.columns = getUrlParam('columns', '2' );`


