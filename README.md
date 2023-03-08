# Qdash
## What is Qdash?
Qdash is an environment for makeing web pages that display Home Assistant entities as boxes.

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

## Front-end
A Qdash web application is set up as a simple HTML page defining a set of boxes.

Communication with HA is based on MQTT. 

Access rules are implemented using Nginx and MQTT user/password options.

## Back-end
To serve the web application there must be an automation to send state changes to the web application and receive requests from the web application. This automation is based on a blueprint. The automation also provides information about the entities, such as name, area and unit of measurements. When the web application is started, it requests this information. 

## The boxes
A box shows a name and a state of an entity. By default
- the name is the entity friendly name.
- the state is visualized in a way that is based on the entity domain.
- when relevant, input is based on the entity domain. 

For example a box for a typical sensor shows a numeric followed by a unit of measure and a switch is a clickable icon that changes color.

A box may also be customized by adding options to the HTML element, e.g.:

`<div entity="sensor.bedroom_temperature" 
 name="Bedroom" fill="darkgreen"></div>`

The following options are available, but have no meaning if not relevant for the domain:
| option |  meaning | example |
|--------|----------|---------|
| fill="COLOR"  |         	COLOR gives the color of the box. A CSS color name or a code may be used.   |  fill="blue", fill="#1AF5" |  
| name="NAME"    |       	NAME is overriding the entity's friendly_name presented in the box name line. |  name="Entrance" |
| uom="UOM"  |             	UOM is overriding the entity's unit_of_measurement. An empty string may be used to tell that this is not a numeric. A space may be used to tell this is a numeric without unit. | uom="m/s", uom="" |
| prec="PREC"    |         	PREC (precision) is the number of decimals (0..) to be used for a numeric state. Without this option the state is presented without any change. | prec="0" |
| icon="ICON"    |          For boxes that use an icon, the icon may be set. Note that HA front-end uses default icons but such an icon is not regarded as an entity attribute. However, if an icon is explicitly choosen in HA, this icon becomes an entity attribute. Providing icon="ICON" means that mdi:ICON is to be used. If there is no icon defined, a square (mdi:square) will be used. | entity="switch.xyz" icon="home" |
| show         |            For entities that normally may be changed, the show option means the entity state can't be changed.  | entity="switch.xyz" show | 
| view="SECTIONS"  |        SECTIONS describes how to show and hide named sections. The format is "Y:X,Y,Z" meaning: hide sections X, Y and Z and then unhide Y.  | view="first:first,second,third"  | 
| range="MN,MX,STEP"  |       MN and MX are min and max values and STEP is step value for domain input_number | range="0,100,10" |
| list="LIST"         |     LIST is a set of options for selectable items (input_text and input_select). The box will  | list="Stop,Up,Down,Manual" |
| dict="DICT"         |     DICT is a set of key:value pairs of format a:A,b:B,c:C,d:D. It is used for selectable items  (input_text and input_select). |  dict="0:Stop,1:Up,2:Down,m:Manual" |
| set="VALUE"         |     VALUE is a value to be set for the entity when clicking.  |  set="reset" |
| color="COLOR"         |   COLOR is a coloring scheme with a set of key:color pairs. Assigning an asterik (\*) as key, defines the color for all other options. |  color="0:red,1:green,2:blue,m:grey,\*:black" |
| color="COLOR"         |   COLOR may also be used as a coloring scheme (key:color pairs) for numercal values. The key is the lowest value for the color.  | color="-1000:white,0:green,5:yellow,15:red" |
| look="STYLE"  |           A box's state is by default presented with a specific font and font color. STYLE may override this whith a CSS style string.  |  look="color:red;font-size:50%" |


## HTML page structure
### Mandatory elements
Mandatory parts of a Qdash HTML page are:
- one JavaScript function to be called when the page is loaded 
- body element,  `<body onload="... >...</body>` containing one or more section elements.
- section elements  `<div section="... >...</div>`, each containing one or more box elements.
- box elements `<div entity="... ></div>`, each containing HTML code for viewing the box's name and current state and for changing state. 

### Multiple sections
It is possible to define multiple sections, each with a set of boxes. 
The sections may be divided into section groups. In such a group, only one section will be visible at a time.
    
    <div section="upstairs" show>
       <div entity="light.hall"></div>
       <div entity="light.studio"></div>
       <div entity="sensor.studiotemp"></div>
    </div>
    <div section="downstairs">
       <div entity="light.bedroom"></div>
       <div entity="light.lobby"></div>
       <div entity="sensor.lobbytemp"></div>
    </div>

At start, only the upstairs entities are visible. The function `onShowSection( upstairs )` to switch between pages. 


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

# Entities
## binary_sensor
### show (default)
An icon is changing color. 
## sensor
### numeric (d
A current numeric value is showed. 
Attributes prec and uom may be used. 
### text
Current text is showed. 
## script
### toggle (d
Click on the icon to send a toggle command.
### show
Icon color is reflecting current state. 
## switch
### toggle (d
Click on the icon to send a toggle command.
### show
Icon color is reflecting current state. 
## light
### toggle (d
Click on the icon to send a toggle command.
### show
Icon color is reflecting current state. 
### bright
Use up and down arrows to send command to change brightness in steps of 10%. Current percentage is showed.
## input_boolean
### toggle (d
Click on the icon to toggle.
### show
Icon color is reflecting current state.         
## input_number
Attributes prec and uom may be used. 
### nextset (d
Use up and down arrows to send command to change value in predefined steps. Current value is showed.
### show 
A current numeric value is showed. 

## input_select
### nextset (d
Use up and down arrows to send command to change state according to predefined options. Current option is showed.
### droplist  
Attribute options must be set, for example options="alpha,beta,gamma".
Select one of the texts to send it. A received text changes the selection if defined in options. If not, selection is blanked.
### dropdict 
Attribute options with key:text pairs must be set, for example options="1:One,2:Two,3:Three"
Select one of the texts to send corresponding key. A received key changes the selection if defined in options. If not, selection is blanked. 
### show
The current text is showed.
## input_text 
### show (d 
The current text is showed.
### field 
Enter the text from keyboard.
### droplist 
Attribute options must be set, for example options="alpha,beta,gamma".
Select one of the texts to send it. A received text changes the selection if defined in options. If not, selection is blanked.
### dropdict
Attribute options with key:text pairs must be set, for example options="1:One,2:Two,3:Three"
Select one of the texts to send corresponding key. A received key changes the selection if defined in options. If not, selection is blanked. 
## input_datetime
### settime (d
Select hours and minutes.
### showtime 
Show hours and minutes.
### setdate
Select year, month and day.
### showdate 
Show year, month and day.




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

## Discussion on access credentials 
There are two types of access credentials involved:
- **page access** - username and password required to get access to the web pages. The page access control is implemented in Nginx.
- **MQTT access* - username and password (**app MQTT user/pass**) required to send and receive MQTT messages of specific topics. The MQTT access control is implemented in the MQTT broker.

An **app target page** is a static page and the ordinary HA web server is used to host the page. That leads to a trade-off has to be made between safe password handling, a simple access administration and a good user experience. There are multiple ways to go:

### MQTT user/pass in the page code
In this case the page itself should not be accessable without a user login.
The page shall be put in a protected folder and Nginx shall be set up to ask the user for username and password. See xxx.  
While the browser's ability to remember a site's username and password can be used, this method is easy for the user.
To enable and disable users the admin changes the Nginx access list.    
It is however easy for a wicked user (with access) to inspect the code and steal the MQTT credentials. Without having access to the page these may be used to control entities the same way as the page. To avoid it, the admin also has to change the MQTT credentials (see xx) as well as the page code. 
On the other hand, if the user is trusted this should not be a problem at all.

### MQTT credentials as URL request parameters
The MQTT credentials are the access key to HA, so in this case the page itself may be accessable without a user login.   
The use of HTTPS protects the URL request parameters. With a browser bookmark including the MQTT credentials, this method is very simple to use.
A wicked user can easily steal the MQTT credentials but on the other hand the admin only have to add and delete the MQTT credentials to enable and disable access.
A drawback is also that when the page is shown in a normal browser, the address field will show also the credentials. For this reason, an option is provided for removing the requst parameters as well as the history.

### MQTT credentials as user input fields
If the user manually enters the MQTT credentials each time, there are no trace of them anywhere. However, if the browser don't remember them, this is cumbersome for the user. 

### MQTT credentials as autofill password fields
To make a browser remember a username and a password for a site, a HTML form has to be used, and a successful HTTP POST or GET has to be performed. There is a method provided for this:
When invoking the Qdash page, a form with input fields for MQTT credentials is showed. If there is a username and password stored in the browser, it should automatically be filled in and the user just clicks a login button to continue. If the user enters a new username and password, another button is clicked. In order to make the browser store the credentials, another page has to be opened. For Qdash this is qdashlogin.html which does nothing except waits for a button click to go back to the original Qdash page. Now the credentials should be stored and a normal login can be made.
However, tests have shown that all browser do not behave the same. This is the biggest problem with this solution.

# The app concepts
    
An **app** consists of:
- one **app target page**, which is a html page for the Qdash boxes 
- one or more **app automations** to exchange MQTT messages with the **app target page**
- optionally, one or more **app entry pages**, to assign **app MQTT user/pass** and load the **app target page**

MQTT characteristics of an **app**:
- it uses a set of **app MQTT topics** when sending to HA, for example *fromapp/app01/#*
- it uses a set of **app MQTT topics** when receiving from HA, for example *toapp/app01/#*
- it uses a specific **app MQTT user/pass** pair, for example *app01* and *zygr78p*
- **app MQTT topics** are assigned in the **app target page**
- **app MQTT topics** are assigned in the **app automations**
- **app MQTT user/pass** is linked to the **app MQTT topics** in the MQTT broker configuration

# Providing the app MQTT user/pass 

The **app MQTT user/pass** may be provided to the **app** in alternative ways:
- directly in the code of the **app target page** - **CODE**
- as URL request parameters *mqttuser* and *mqttpass* - **URL**
- using an **app entry page** that uses the browser *sessionStorage* - **STORE**
- prompting the user for input each time the **app** is started - **PROMPT**
- using the browser password manager - **AUTH**
    
# Nginx for security
    
Nginx Proxy Manager add-on (**NPM**) is used for secure communication over internet:
- **https** for web pages
- **wss** for MQTT
When required, NPM is also controlling page access by specifying access lists. An access list contains username and password pairs and is assigned a specific sub domain, like *iron.myduckname.duckdns.org*.

## DDNS   
    
For pages, a **base domain** is set up under *duckdns.org*, for example *myduckname.duckdns.org*.
It is maintained by the HA add-on *Duck DNS* to always point to the current HA internet ip address.
All traffic to the base domain and its subdomains, like *iron.myduckname.duckdns.org*, are redirected by *duckdns.org* service. 

## Routing 
    
- The router connecting the local network to the internet is set up to forward https port 443 to NPM.
- NPM forwards data to and from the HA web server locally accessed at HA's address and port, for example http://192.168.0.111:8123. 
- NPM is configured so specific locations of a sub domain are translated into locations managed by the HA web server. For example, *https://iron.myduckname.duckdns.org/qdash* could be translated to *http://192.168.0.111:8123/local/qdash*.
- NPM also translates MQTT traffic. For example *wss://mqtt.myduckname.duckdns.org:8884* could be translated to *ws://192.168.0.111:1884*.

    Example
Domain | Access list | Users
iron.myduckname.duckdns.org | iron group | Bob, Sue, Joe 
gold.myduckname.duckdns.org | gold group | Rob, Sue, Tom

Folders
| folder               |  subdomain       | content |
|----------------------|------------------|---------|    
|/config/www            |  no access      | root for HA web server pages |
|/config/www/qdash      | ...org/qdash    | qdash.js, qdash.css, qdash.ico, target pages: app01.html, app02.html, app03.html  |
|/config/www/qdash/iron | ...org/iron     | entry pages: app01c2.html, app01c4.html, app02c2.html|
|/config/www/qdash/gold | ...org/gold     | entry pages: app01c2.html, app01c4.html, app02c2.html   |

|entry page             |  target page     |
|.../iron/app01c2.html  |  qdash/app01.html?columns=2   |  app01 | -secret-              |






Domain names iron.skannea.duckdns.org
Point to wrong port
Set Access list


Location /iron
http   192.168.0.111/local/qdash/iron    8123

Common for all 
Location /qdash
http   192.168.0.111/local/qdash        8123



