# Qdash
## What is Qdash?
Qdash is an environment for making web pages that display Home Assistant entities as boxes.
![ccc](./images/Qdash.png)
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

A Qdash web application is set up as a simple HTML page defining a set of **entity box**es, that reflects and/or controls an entity.
For example a box for a typical sensor shows a numeric followed by a unit of measure and a switch is a clickable icon that changes color.

    <body onload="start();"> 
       <div section>
          <div entity="sensor.outdoor_temperature"></div>
          <div entity="sensor.bedroom_temperature"></div>
          <div entity="sensor.garage_temperature"></div>
          <div entity="switch.garage_radiator"></div>
          <div entity="light.outdoor_lamp"></div>
          <div entity="script.all_lamps_off"></div>
       </div>
    </body>


A box may also be customized by adding options to the HTML element, e.g.:

`<div entity="sensor.bedroom_temperature" name="Bedroom" fill="darkgreen"></div>`

The Qdash web application communicatates with HA using MQTT. 
Access rules are implemented using Nginx and MQTT user/password options.
MQTT configuration and page layout is set up as a few lines of JavaScript code.  

## Back-end
To serve the web application there must be an automation to send state changes to the web application and receive requests from the web application. This automation is based on a blueprint. The automation also provides information about the entities, such as name, area and unit of measurements. When the web application is started, it requests this information. 

# Boxes

## Behavior
The table below describes how entities of a domain may be visulized and controlled using an entity box. The box behavior is set up directly in the HTML element for the box. The options to put as element arguments are described in [Options](#options).

|domain       |  options        | box behavior  |
|-------------|-----------------|---------------|
|binary_sensor||show state as colored icon|
|binary_sensor|show|show state as colored icon|
|input_boolean||show state as colored icon, click to toggle on/off|
|input_boolean|set|show state as colored icon, turn on or off|
|input_boolean|show|show state as colored icon|
|input_button||show state as colored icon, click to trig|
|input_datetime||pick a time and confirm|
|input_datetime| date|pick a date and confirm|
|input_datetime| show|show time as text|
|input_datetime| show date|show date as text|
|input_number |show|show numeric value (optionally with prec and uom) |
|input_number||toggle states using up/down buttons|
|input_number| prec show dict| lookup state, show alias as text |
|input_number|range|select state and confirm|
|input_select||toggle states using up/down buttons|
|input_select |set color |show state as colored icon, click to trig|
|input_select |show color|show state as colored icon| 
|input_select |show dict|lookup state, show as text |
|input_select| dict|select alias for state and confirm|
|input_select| list|select state and confirm|
|input_select| show|show state as text|
|input_text||enter state as text| 
|input_text |set color|show state as colored icon, click to trig|
|input_text |show color|show state as colored icon|    
|input_text |show dict|   lookup state, show as alias |
|input_text |show |show state as text |
|input_text| dict| select alias for state and confirm|
|input_text| list |select state and confirm|
|light |    |show state as colored icon, click to toggle on/off|
|light |bright|change brightness using up/down buttons|
|light |set |show state as colored icon, turn on or off|
|light |show|show on/off state as colored icon|
|script|    |show as icon, click to run|
|script|set |show as icon, click to run script with arguments|
|script|list|select arguments, click to run script with arguments|
|script|dict|select alias for arguments, click to run script with arguments|
|sensor|    |show numeric value (optionally with prec and uom) |
|sensor|dict|lookup state, show as alias |
|sensor|    |show state as text|
|switch|    |show state as colored icon, click to toggle on/off|
|switch|set |show state as colored icon, turn on or off|
|switch|show|show state as colored icon|

Sensors are regarded as numeric if there is *uom* or *prec* specified for it. 

## Options 

The following options are available, but have no meaning if not relevant for the domain:
| option |  meaning | example |
|--------|----------|---------|
| fill="COLOR"  |         	COLOR gives the color of the box. A CSS color name or a code may be used.   |  `<div entity="sensor.outdoor_temp" fill="blue">` |  
| name="NAME"    |       	NAME is overriding the entity's friendly_name presented in the box name line. |  `<div entity="light.x47sw" name="Entrance">` |
| uom="UOM"  |             	UOM is overriding the entity's unit_of_measurement. An empty string may be used to tell that this is not a numeric. A space may be used to tell this is a numeric without unit. | `<div entity="input_number.alarm_wind" uom="m/s">` |
|  prec="PREC"    |         	PREC (precision) is the number of decimals (0..) to be used for a numeric state. Without this option the state is presented without any change. |  `<div entity="sensor.room_humidity" prec="0">` |
| icon="ICON"    |          For boxes that use an icon, the icon may be set. Note that HA front-end uses default icons but such an icon is not regarded as an entity attribute. However, if an icon is explicitly choosen in HA, this icon becomes an entity attribute. Providing icon="ICON" means that mdi:ICON is to be used. If there is no icon defined, a square (mdi:square) will be used. | `<div entity="light.entrance" icon="home" >` |
| show         |            For entities that normally may be changed, the show option means the entity state can't be changed.  | `<div entity="switch.heat" show >` | 
| range="MN,MX,STEP"  |       MN and MX are min and max values and STEP is step value for domain input_number | `<div entity="input_number.level" range="0,100,10">` |
| list="LIST"         |     LIST is a set of options for selectable items (input_text and input_select). The box will  | `<div entity="input_text.lift" list="Stop,Up,Down,Manual" >`  |
| dict="DICT"         |     DICT is a set of key:value pairs of format a:A,b:B,c:C,d:D. It is used for selectable items  (input_text and input_select). |  `<div entity="input_text.lift" dict="0:Stop,1:Up,2:Down,m:Manual">`|
| set="VALUE"         |     VALUE is a value to be set for the entity when clicking.  |  `<div entity="input_text.command" set="reset">` |
| color="COLOR"         |   COLOR is a coloring scheme with a set of key:color pairs. Assigning an asterik (\*) as key, defines the color for all other options. |  `<div entity="input_text.mode" show icon="cog" color="0:red,1:green,2:blue,m:grey,*:black">` |
| color="COLOR"         |   COLOR may also be used as a coloring scheme (key:color pairs) for numercal values. The key is the lowest value for the color.  | `<div entity="sensor.level" color="-1000:white,0:green,5:yellow,15:red">` |
| look="STYLE"  |           A box's state is by default presented with a specific font and font color. STYLE may override this whith a CSS style string.  |  `<div entity="input_text.warning" look="color:red;font-size:50%">` |
| bright    |       	Entities of domain light are by default presented as a clickable icon that toggles the light. The `bright` option instead gives the possibility to change the light's brightness. |  `<div entity="light.hall" bright>` |
| date    |       	Boxes for entityies of domain datetime are by default handling hours and minutes. The `date` option makes the box handle a date. |  `<div entity="datetime.startdate" date>` |

## Other boxes

### Empty box 
Empty boxes are for structuring the page. An empty box is just a colored box, but it may have a name. 
The **empty** attribute is mandatory.
Optional attributes are 
- fill
- name

An example: `<div empty fill="indigo" name="Lights"></div> `

### View box
A view box is used for turning on and off sections, see [Sections](sections). 
The **view** attribute is mandatory. The format is `view="Y:X,Y,Z"` with meaning: hide sections X, Y and Z and then unhide Y.  
By default the box has a clickable square icon.

Optional attributes are 
- name 
- fill 
- icon 
- look

An example:  `<div view="up:up,down" name="Upstairs" fill="blue" icon="cog" look="color:white"></div>`

### Custom box
A custom box is intended for any kind of content, within the limits of what can be visualized.
The **custom** attribute is mandatory.
Optional attributes are 
- fill
- name 

An example: 

    <div custom fill="grey" >
       <p style="color:blue">Do some magic</p>
       <span style="color:red" class="mdi mdi-home" onclick="doMagic()"></span>
    </div>  

## HTML page structure

A Qdash HTML page includes (with *first.html* as an example):
- title element `<title>Qdash First</title>` for the name of the application
- favicon link `<link rel="icon" href="qdashfavicon.ico" type="image/x-icon" />`
- inclusion of JavaScript files
  - MQTT client library
  - qdash.js   
- inclusion of CSS files
  - material design icons
  - qdash.css
- JavaScript code
  - function to be called when the page is loaded, in the examples named `start()` 
  - optional functions 
- body element,  `<body onload="start()">...</body>` containing one or more section elements
- section elements  `<div section... >...</div>`, each containing one or more box elements
  - entity box elements `<div entity=... ></div>`, each containing HTML code for viewing the box's name and current state and for changing state. 
  - optional empty box elements `<div empty ... ></div>`
  - optional view box elements `div view=... ></div>`
  - optional custom box elements `div custom... >...</div>`
- extra elements inside or outside the sections

## Sections

A section is a set of boxes and may have a name. 
Boxes in an unnamed section are always visible. 
The visibilty of boxes in a named section can be controlled:
- If the section has a `show` option it will be unhidden from start.
- Calling the function `qd.showSection` will hide and unhide sections.
- A box with option `view` will provide a clickable button that unhides one of a set of sections.

For section, the following options are available:
| option |  meaning | example |
|--------|----------|---------|
| section        |Tells that it is an unnamed section. Boxes of unnamed sections are always visible.  |  `<div section>` |
| section="NAME" |NAME is the name of an named section. |  `<div section="Climate">` |
| show           |Boxes of the sections are visible from start.  | `<div section="Climate" show >` | 
| fill="COLOR"   |COLOR gives the color round the boxes of the section. A CSS color name or a code may be used.   |  `<div section fill="black">` |  
| columns="N"    |N is the number of boxes on each row in the section.  |  `<div section columns="4">` |  

## Multiple sections and section groups

It is possible to define multiple sections, each with a set of boxes. 
    
    <div section="upstairs" show>
       <div entity="light.hall"></div>
       <div entity="light.studio"></div>
       <div entity="sensor.studiotemp"></div>
       <div view="downstairs:upstairs,downstairs" ></div>
    </div>
    <div section="downstairs">
       <div entity="light.bedroom"></div>
       <div entity="light.lobby"></div>
       <div entity="sensor.lobbytemp"></div>
       <div view="upstairs:upstairs,downstairs" ></div>
    </div>

At start, only the upstairs entities are visible. The last box of each section  Call the function `qd.showSection( "upstairs:upstairs,downstairs" )` to switch between sections. 
Also the sections may be divided into groups. In such a group, only one section will be visible at a time. In the example below there is a last section with four boxes for controlling the two groups.
    
    <!-- upstairs/downstairs group --> 
    <div section="up" show>...</div>
    <div section="down">...</div>
    <!-- climate group --> 
    <div section="temp" show>...</div>
    <div section="hum">...</div>
    <!-- navigation section, always visible --> 
    <div section>
       <div name="Upstairs"    view="up:up,down"   ></div>
       <div name="Downstairs"  view="down:up,down" ></div>
       <div name="Temperature" view="temp:temp,hum"></div>
       <div name="Humidity"    view="hum:temp,hum" ></div>
    </div>

## Adding extra elements

Extra `<div>` elements for text, buttons, images etcetera, may be added 
- above the sections
- above the boxes in a section
- below the boxes in a section
- below the sections

Such elements must be of `class="nobox"`.

    <body onload="start();"> 
        <div class="nobox">Above sections</div>   
        <div section="sec01">
          <div class="nobox">In section</div>   
          <div empty></div>
          <div class="nobox">In section</div>   
        </div>
        <div class="nobox">After section</div>
    </body>

The styling of extra element is dependent on the section. 
A section with only extra elements may be added, for example.

    <div section="header" fill="yellow" columns="3">      
      <div class="nobox">
          <h1>Qdash</h1>
          <p>This is a web application</p> 
      </div>   
    </div>   

The default styling of some common element types are:

       h1     { color: blue;  font-size: 100%; }
       h2     { color: blue;  font-size:  80%; }
       p      { color: black; font-size:  50%; }

To change or add styling, add a <style> element in the <head> element of the page file.
For example:    
    
     <style>
       h3     { color: blue;  font-size: 200%; }
       p      { color: green; }
     </style>

## Configuration
Configuration items are set up when the page is loaded, see [Start function](#start_function).    

There are two types of configuration:
- MQTT configuration, in object mqtt.config
- application configuration, in object qd.config

A configuration item may be mandatory (M) or optional (O).

### The mqtt.config object  

item       |  M/O  | description  
-----------|-------|---------------|
userName |M| MQTT user name. User name/password pairs are defined in Mosquitto add-on configuration.
password  |M| MQTT password to give access to HA MQTT broker.  
host |M| Web address to be used to connect to MQTT broker.
port |M|Port to be used to connect to MQTT broker.
useSSL |M| When set to true, secure websocket protocol is used. This is strongly recommended when accessing the MQTT broker from internet.
client |M| Name of the MQTT client. To make a unique name the following expression may be used: `'qdash_'+ Math.floor(Date.now() / 1000);`. 
timeout |O| Timeout in ms for MQTT connection retrial. Default is 2000. 
log |O| Function( TEXT ) to be called when MQTT errors happen. 
debug |O| Function( TEXT ) to be called with MQTT progress information. 
onSuccess |O| Hook function( ) to be called when MQTT connection is established. 
onFailure |O| Hook function( CAUSE ) to be called when MQTT connection fails or is disconnected. CAUSE is an error message text. 
onMessage |O| Hook function( TOPIC, DATA ) to be called when a MQTT message is received. Topic is the MQTT topic of the message. DATA is an object created from the received JSON coded MQTT payload. 


### The qd.config object  

item       |  M/O  | description  
-----------|-------|---------------|
stateTopic |M| MQTT topic for updating entity state. Sent from HA to the web application. 
buttonTopic |M| MQTT topic to be used for telling HA that a clickable icon was clicked. 
requestTopic|M| MQTT topic for requesting HA for entity information. 
responseTopic|M|MQTT topic for providing entity information. Sent from HA to the web application.  
columns|O| Number of box columns.This value may be overridden for each section. Default is 2.
width|O| Percent of the total width to be used for the box columns. Default is 100.
consoleLog|O| When true, debug information is sent to console.log. This is default.
divLog|O|When set to an HTML element id in the HTML code, the debug information is also put in that element. Default is that no such logging is done.
onConfigBox|O|Hook function that is called for each entity response. 
onUpdateBox|O|Hook function that is called for each state update. 
defaultonoffcolor|O| Colors to be used for on/off state indication. Default is "on:gold,off:grey,*:red".
lookup |O| Pre-defined color schemes. See [Lookup strings](#lookup_strings).
log |O| Hook function( TEXT ) to be called with errors and warnings. 
debug |O| Hook function( TEXT ) to be called with debug information. 

# Start function
    
    
### URL request parameters
Config parameters may be set from url request parameters, for example:
`config.columns = getUrlParam('columns', '2' );`

# Hook functions
A hook function is a function that, if it is defined, will be called at certain events. 

## onConfigBox
When the app is started, a request is sent to HA for each defined box. When the corresponding response is received and the `qd.config.onConfigBox` is assigned a function, this function is called. It has one argument: an object `data` that contains the response. This is input to the function, but may also be updated by the function.

input       |  description  
-----------|--------------
data.ent|entity id
data.name|friendly name
data.uom|unit of measure
data.icon|icon for entity
data.scls|class
data.dcls|device class
data.area|area name
data.arid|area id
data.status |found or not found 
data.ix| box number 0..
data.key|unique key for client

The app may use these data as input and change the data object and/or add any of the items that normally is added as options for the data.
All data values are strings. Note that a value `'None'` or an empty string means that the value is absent.
    
Example:
    
    function myBoxConfig( data ) {
       if ( data.arid  == 'lounge' )  data.fill = 'purple';
       if ( data.arid  == 'bedroom' ) data.fill = 'navy';

       // rule: set number of decimals (prec) depending on device_class
       if ( data.dcls  == 'temperature' ) data.prec = '1';
       if ( data.dcls  == 'humidity' )    data.prec = '0';
       if ( data.dcls  == 'voltage' )     data.prec = '2';
    }

## onUpdateBox
When an entity is changed, or after a request, a message is sent from HA to the Qdash application. When received and the `qd.config.onUpdateBox` is assigned a function, this function is called. It takes one argument: an object that `data` that contains the following items:
input       |  description  
-----------|--------------
data.ent|entity id
data.state|current entity state value 
data.bright|brightness value, for light domain only
data.trig| `init` if this was caused by a request or `change` if it was caused by a state change

The app may use these data as input and change the data object. All data values are strings. 
    
Example:
    
    function myBoxUpdate( data ) {
     // in HTML code there is a <div class="nobox"><p id="messageline"></p></div>
        if ( data.ent  == 'input_text.message' )  {
           document.getElementById( 'messageline' ).innerHTML = 'Important: ' + data.state;
        }
        
        if ( data.ent  == 'sensor.quality' ) {
           var v = parseInt( data.state );
           if (v < 5) data.state = 'bad';
           else           
           if (v < 10) data.state = 'OK';
           else        data.state = 'excellent';
     }     
    
# First application

Note that this application is intended to run on your local network only. 

### Preparations

- Mosquitto 
  - add-on must be installed and configured 
  - port 1884 for MQTT over web sockets must be enabled
  - a username and password must be set
- File editor
  - add-on must be installed (or you must have some other way to edit files) 
- HA web server
  - must be configured to host files in /config/www/
- Qdash blueprint
  - must be installed
- Qdash files
  - must be put in /config/www/qdash/ :
    - qdash.js
    - qdash.css
    - qdash.html

To make a first try with Qdash, follow the steps below:
1. make an automation based on the blueprint
2. select mqtt topics
3. choose the entities you would like to have in the application
4. save the automation
5. edit first.html
6. change configuration in start function
7. set up your entity boxes 
8. save
9. in a browser, enter address to the page http://homeassistant.local:8123/local/qdash/first.html


Tips and tricks
..a good idea is to open in yaml mode and copy the list of entities
..paste the list of entities,  




   
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
 

 # Operations
When an entity box icon is clicked, an operation is carried out as a HA service call. Operations and services are listed in the table below:
    
| operation  |  description | service |  
|------------|--------------|---------|
| toggle| toggle binary entity state | homeassistant.toggle| 
| run| run script with up to 3 space separated arguments | script.turn_on| 
| press| activate| input_button.press| 
| bright| add value in percent to brightness | light.turn_on, brightness_step_pct| 
| settext| update with text value | input_text.set_value| 
| setnumber| update with numeric value | input_number.set_value| 
| increment | make predefined step up| input_number.increment| 
| decrement | make predefined step down| input_number.decrement| 
| next  | select next predefined option| input_select.select_next| 
| previous  | select previous predefined option| input_select.select_previous| 
| select| select option by value| input_select.select_option| 
| settime| update time with value hh:mm:ss | input_datetime.set_datetime|  
| setdate| update date with value YYYY:MM:DD| input_datetime.set_datetime| 
              
It is possible to simulate a click by calling function `qd.onClick( ENTITY, OPERATION, VALUE )` where 
- ENTITY is the entity_id
- OPERATION is the operation
- VALUE is the value, if this is required for the operation
    
Examples:
    
    qd.onClick( 'light.mylight', 'toggle' );
    qd.onClick( 'script.runmotor', 'run', 'start 500' );
    qd.onClick( 'input_select.bedroom_mode', 'cosy' );

    
    
  # Security and access control

## Recommended installation and set-up

A standard HA installation is used:
 - HA OS is installed
 - HA's ip address is known (eg. 192.168.0.111)
 - HA web server uses standard port 8123 
 - web pages are put under *config/www/qdash* and accessed with */local/qdash* (eg. 192.168.0.111:8123/local/qdash/apps/myapp.html)
 - Mosquitto add-on (MQTT broker) is installed
 - Duck DNS add-on is installed
 - Nginx Proxy Manager add-on (**NPM**) is installed
 
## Set up your router to forward ports 443 and 80 to NPM

NPM add-on is a server with the same ip as HA but it listens on port 443 (HTTPS) and port 80 (required for certificate handling).

Router port forwarding functionality is often found under *virtual servers*.
- External port 443 shall be routed to 192.168.0.111:443 
- External port  80 shall be routed to 192.168.0.111:80 

## Get a DuckDNS domain

At *duckdns.org* you can register a Duck DNS domain ( eg. myduckname.duckdns.org ).  

Configure Duck DNS add-on with your domain. Now the add-on will tell duckdns.org the internet ip of your router. 

All traffic to your Duck DNS domain will be forwarded to your router. 

If the internet ip changes, the add-on will update duckdns.org.

In addition to your Duck DNS domain, like myduckname.duckdns.org, addresses like alpha.myduckname.duckdns.org, beta.myduckname.duckdns.org and mqtt.myduckname.duckdns will be forwarded to your router. Such addresses may be used in your NPM configuration.

## Set up NPM proxy hosts 
 
### Host 1 - HTTPS access to HA user interface and web server

An address like https://ha.myduckname.duckdns.org is used to access HA. For web pages located at config/www addresses like https://ha.myduckname.duckdns.org/local/mypage.html are used.
 
 - Details
   -  Domain Names: ha.myduckname.duckdns.org
   -  Scheme: http 
   -  Forward IP: 192.168.0.111
   -  Forward Port: 8123
   -  Websockets Support: on
   -  Access List: Publically Avaiable (*but access control is handled by HA*)
  - SSL
    - SSL Certificate: (*request a new SSL certificate, will result in ha.myduckname.duckdns.org*)
    - Force SSL: on

### Host 2 - Secure Websocket access to MQTT broker 

An address like wss://mqtt.myduckname.duckdns.org:443 is used.

Note that the standard port 8884 is not used. To use port 8884, the router has to forward it to port 443.  
 
 - Details
   -  Domain Names: mqtt.myduckname.duckdns.org
   -  Scheme: http 
   -  Forward IP: 192.168.0.111
   -  Forward Port: 1884 (*Websocket port*)
   -  Websockets Support: on
   -  Access List: Publically Avaiable (*but access control is handled by MQTT broker*)
 
 - SSL
   - SSL Certificate: request a new SSL certificate, will result in mqtt.myduckname.duckdns.org
   - Force SSL: on

This set-up will work for Qdash if MQTT password is entered by the user or provided in the URL. 

In such case the application is accessed like https://ha.myduckname.duckdns.org/local/qdash/apps/myapp.html 

If you want to explicitly include MQTT credentials in the code, also access to the application must be restricted. To achieve this and still have unrestricted access to custom web pages under /config/www like https://ha.myduckname.duckdns.org/local/somepage.html, you have to add another proxy host and use some tricks:  

### Host 3 - for HTTPS access to Qdash application

 using https://qd.myduckname.duckdns.org/qdash/apps/myapp.html

- Details
   - Domain Names: qd.myduckname.duckdns.org
   - Scheme: http 
   - Forward IP: 192.168.0.111
   - Forward Port: 8124 (*trick - an illegal port, access attempts result in code 502*)
   - Websockets Support: on
   - Access List: myuserlist (*you have to add a NPM user/password list for this*)
 - Custom locations
   - (*forward addresses like qd.myduckname.duckdns.org/qdash/apps/myapp.html*)
   - Define location: /qdash/apps (*location for your apps*)
   - Scheme: http 
   - Forward IP: 192.168.0.111/local/qdash/apps
   - Forward Port: 8123  
- SSL
   - SSL Certificate: (*request a new SSL certificate, will result in qd.myduckname.duckdns.org*)
   - Force SSL: on

### Host 1 modification - block all access to ha.myduckname.duckdns.org/local/qdash/apps
- Custom locations: 
  - Define location: /local/qdash/apps *location for your apps*
  - Scheme: http 
  - Forward IP: 192.168.0.111
  - Forward Port: 8124  (*trick - an illegal port, access attempts result in code 404*)

The recommendation is to complete all steps.

If you want to have unrestricted access to pages under config/www/qdash you can change Access list no Publicly Accessible.

## Configure MQTT

Access to MQTT should be restricted. This is done by setting up a set of username/password pairs. Under *Login*, for example:

    - username: "ha"
      password: "e34fG239"
    - username: "qdash01"
      password: "zx47567hq"

You can also restrict allowed topics for each username/password pair:
Enable this option under *Customize*

    active: true
    folder: mosquitto

Create a file */share/mosquitto/acl.conf* with content: 

    acl_file /share/mosquitto/accesscontrollist
    sys_interval 10


Create a file */share/mosquitto/accesscontrollist* with content like:

    # HA - access to any topic
    user ha
    topic readwrite #

    # Qdash - access to Qdash topics
    user qdash01
    topic readwrite fromweb/#
    topic readwrite toweb/#

Under *Network*, configure your MQTT broker to listen for *MQTT over Websockets* on the standard port *1884*. 

## Access restrictions 
There are two possible types of access restrictions:
- for page access, where username and password entered by the user give access to the web pages. The page access control is implemented in NPM.
- for MQTT access, where username and password give the right to send and/or receive MQTT messages of specific topics. The MQTT access control is implemented in the MQTT broker.

A Qdash application is basically a static page that is hosed by the ordinary HA web server. The page itself contains and refers to HTML code, Javascript code and CSS code. 

In order to connect to the MQTT broker, the MQTT username and password have to be known to the Javascript code. 

In Qdash there is support for providing username and/or password in three ways:

1. they are entered by the user when starting the application
2. they are provided as URL arguments
3. they are defined in the page code

A function provides the functionality:

`mqtt.getUsernamePassword( username, password )` 

- username - a username or an empty string
- password - a password or an empty string

The function returns an object with members username and password, or empty strings if not provided.

- If argument *username* is provided, it will be returned. 
- Else, if URL argument *username* is provided, it will be returned.
- Else, the user will be prompted for the username, and it will be returned.

- If argument *password* is provided, it will be returned. 
- Else, if URL argument *password* is provided, it will be returned.
- Else, the user will be prompted for the username, and it will be returned.

Examples:

    var s;
    // result is in s.username and s.password
    s = mqtt.getUsernamePassword( "qdash01", "zx47567hq" );
    s = mqtt.getUsernamePassword( "qdash01", "" );
    s = mqtt.getUsernamePassword( "", "" );

## Multiple applications with different access restrictions

It is possible to have applications where only certain users have access. 
However, to be secure, the different users should have dedicated automations and MQTT topics.

An example:
User A - can control bedroom lights.
User B - can control all lights.

One automation (with defind MQTT topics) handles all lights. 
A's application only controls bedroom lights.
B's application controls all lights.
However, suppose A is evil. If A knows the entity ids of other lights, it is possible to control them using a MQTT tool. This is because A's and B's applications uses the same MQTT topics.

To avoid this, they should have separated automations with different MQTT topics.

    
