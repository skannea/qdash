// qdash.js
//------------------------------------------------------------
// code is adapted to ES5 and iOS 9.3.5:
// no default args like function fun( x=17 )
// no let x=17; var and const are used



//------------------------------------------------------------
// qd object holds application specific data and functions

const qd = {
// qd variables
box:[], // array of entity boxes, where box[N] holds <div class="box" id="idN"
config:{},


// ====================================================================== qdFunctions 
// --------------------------------------------- 
debug: function ( s ) {
    if ( typeof( qd.config.debug ) === 'function' ) qd.config.debug( s );
}
, 
// --------------------------------------------- 
log: function ( s ) {
    if ( typeof( qd.config.log ) === 'function' ) qd.config.log( s );
}
, 
// --------------------------------------------- 
operation: function ( ent, op, value ) {
      // suppose value="x y z") --> 
      var v = value.split(' '); // space
      if (v.length < 2) v[1]='';      
      if (v.length < 3) v[2]='';
      mqtt.send( qd.config.buttonTopic, 
      `{ "ent":"${ent}","op":"${op}","value":"${value}", "arg0":"${v[0]}", "arg1":"${v[1]}", "arg2":"${v[2]}" }`) ; 
      qd.debug(`operation ent:${ent} op:${op}` );          
}
, 

// --------------------------------------------- 
onViewClick: function ( id, view ) {
         qd.debug(`onViewClick: ${id} ${view}`);
         qd.showSection( view );
}
, 
onSuccess: function () {
        // subscribe after MQTT connect 
        mqtt.subscribe( qd.config.stateTopic );
        mqtt.subscribe( qd.config.responseTopic );
        qd.requestNextBox(''); // start making requests 
      }
,
onMessage: function ( topic, data ){ 
    if (topic == qd.config.responseTopic) { 
       if (qd.requestNextBox( data )) qd.configBox( data );
    }
    if (topic == qd.config.stateTopic){ 
       qd.updateBox( data ); 
    }
  }    
, 
// --------------------------------------------- 
// to be called when page is loaded, and config variables are set
// defines what to do at connection success
// defines what to do whith received messages
// starts MQTT
// 
// calculates and sets styles for psges and boxes 

begin: function () { 
   
    if (qd.config.source == 'STORE') { //§§
       // spy defense: remove credentials */ 
       qd.config.userName = '';
       qd.config.password = '';
    }
    // if not assigned - use default values 
    // qd.config.columns ??= 2;
    // qd.config.width   ??= 100;
    // qd.config.defaultonoffcolor ??= "on:gold,off:grey,*:red";
    // qd.config.domainIcon ??= {};
    // qd.config.deviceIcon ??= {};
    
    qd.config.columns = 2;
    qd.config.width   = 100;
    qd.config.defaultonoffcolor = "on:gold,off:grey,*:red";
    qd.config.domainIcon = {};
    qd.config.deviceIcon = {};
    
    
    var n = qd.config.columns;
    var basesize = (qd.config.width/100)*(30/n)+ 'vw';  /* to be used as base value for all elements */
    document.querySelector('body').style.fontSize = basesize; 

    var pList = document.querySelectorAll('[section]');
    var ix = 0; // to create ids of entity boxes
    for ( var p=0;  p < pList.length; p++ ) { 
      var pe = pList[p];
      pe.classList.add('section'); 
      pe.style.width = qd.config.width + '%';
      var pFill = pe.getAttribute( 'fill','' );
      if (pFill) pe.style.backgroundColor = pFill;
      var pColumns = pe.getAttribute( 'columns','');
      if (pColumns) { 
          n = parseInt(pColumns);
          var psize = (qd.config.width/100)*(30/n)+ 'vw';  /* to be used as base value for all elements */
          pe.style.fontSize = psize; 
      }    
      // Default is that from start all sections are hidden. 
      // Unhide section if it is unnamed or if it has show attribute.
      if ( pe.hasAttribute('show'))    pe.style.display = 'block'; 
      if (!pe.getAttribute('section' ,'')) pe.style.display = 'block'; 

      // handle all boxes of this section          
      //§§var eList = pe.querySelectorAll('[entity]'); 
      var eList = pe.querySelectorAll('div'); 
      for ( var i=0;  i < eList.length; i++ ) { 
          var elem = eList[i];
          var ent = '';
          if ( elem.hasAttribute('entity')) {
              ent = elem.getAttribute('entity' ,'');
              elem.innerHTML = // temporary set content to detect mistakes
              `<p class="title">${ent}<br/>id${ix}</p>`; 
          }
          else if ( elem.hasAttribute('view')) ent='view';           
          else if ( elem.hasAttribute('empty'))ent='empty';           
          else if ( elem.hasAttribute('custom')) ent='custom';
          else continue; // not a box candidate
          elem.classList.add('box');
          elem.id = `id${ix}`;
          qd.box[ix] = 
            { 
             entity : ent,
             ix : ix
            };                 
          qd.debug(`qd.begin ent:${ent} ix:${ix}` );          
          ix++; 
          elem.style.margin = 1/n + '%';
          elem.style.padding = 1/n + '%';
          elem.style.width = 96/n + '%';
       } // boxes in section
     } // sections
 
    // box array now contains all entity boxes, box[N] (N=0..) contains entity, element has id="idN"   
    
}
,
// --------------------------------------------- 
// hide all in list but the first one
// From <div entity="" sections="yyy:xxx,yyy,zzz"   
showSection: function ( sections ){  
    var v = sections.split(':');
    var sList = v[1].split(',');
     
    for ( var i=0;  i < sList.length; i++ ) {
        if (v[0] == sList[i]) document.querySelector(`[section="${sList[i]}"]`).style.display = 'block'; 
        else                  document.querySelector(`[section="${sList[i]}"]`).style.display = 'none'; 
    } 
}       
,
// --------------------------------------------- 
// called when a response is received as an answer on a request
// issues next request to HA with entity id, box index and a key for checking request/response matching
// also called without data to send first request
// returns true if data is for further processing 
requestNextBox: function ( data ){ 
    var ix=0; 
    if (data) {
        ix = parseInt(data.ix) + 1; 
        if (data.key != qd.config.key) {
           qd.log(`requestNextBox - key mismatch: ix=${data.ix} key=${qd.config.key} err=${data.key}`); 
           qd.debug('qd.requestNextBox mismatch' );
           return false;
        }
    }
    
    if ( ix < qd.box.length ) {
       var ent = qd.box[ix].entity;
       //if (!ent) ent = 'no.entity';
       mqtt.send( qd.config.requestTopic, `{"ent":"${ent}","ix":"${ix}","key":"${qd.config.key}"}`);
       qd.debug('qd.requestNextBox for ' + ent );
    }
    else {
       mqtt.unsubscribe( qd.config.responseTopic );
    }
    return (ix>0); // not true for first request
}  
,
// --------------------------------------------- 
// called when a response is received as an answer on a request
// issues next request 
// also called without data to send first request
// sets up the box according to rules, domain and look
configBox: function ( data ){ 

    // --------------------------------------------- 
    // get elem attr, directly or indirectly: 
    // color="@nicecolors" : getAttr( 'color' ,'' ) gets qd.config.color.nicecolors
    // dict="@mydict" : getAttr( 'dict'  ,'') gets qd.config.dict.mydict
    function getAttr( attr, defau ){ 
         try {
             if (defau == 'None') defau='';
             if (!defau) defau='';
             var val = elem.getAttribute( attr );
             if (!val) return defau;
             if (val.startsWith('@')) return qd.config[ attr ][ val.slice(1)];
             return val;
         }  catch (error) {  qd.log(error); }     
    } 

    // --------------------------------------------- 
    function hasAttr( attr ){ 
       return elem.hasAttribute( attr );
    } 

    // --------------------------------------------- 
    // box.lookup --> create HTML code for <option>s 
     function getOptions( ){ 
         var html = '';
         for ( var v in box.lookup ) {
             html += `<option value="${v}">${ box.lookup[v]}</option>`;  
         }
         return html;
     }     

    // --------------------------------------------- 
    // stores color, list or dict as object box.lookup 
    function setBoxLookup( src ){
        if (!src) return; 
        box.lookup={};
        var pairs = src.split(',');
        for (var k=0; k<pairs.length;  k++) {
                p = pairs[k].split(':');
                if (p.length == 2) box.lookup[p[0]] = p[1]; //key:val,key:val,...
                else
                if (p.length == 1) box.lookup[p[0]] = p[0]; //val,val,val,... 
         }
    }             

    var elem;     // box element 
    var box = {}; // box config
    
    try {
          // call custom handler
          if ( typeof( qd.config.onConfigBox ) === 'function' ) qd.config.onConfigBox( data );
          var ent = data.ent;
          elem = document.getElementById( 'id' + data.ix );
          if (!elem) { 
              qd.debug('Skip - no such box: ' + ent ); 
              return;                                        // ==============>
          } 
          if (elem.querySelector('[val]')) { 
              qd.debug('Skip - box was already set up:' + ent );
              return;                                        // ==============>
          }
          if (data.status == 'not found') { 
          //    qd.debug('Skip - entity not found: ' + ent ); 
          //    return;                                        // ==============>
          } 
          
          box = qd.box[data.ix]; //box config data to be used by update
          
          // use data in element <div entity="...   
          var domain = getAttr('domain', ent.split('.')[0]);
          var name   = getAttr('name', data.name);
          var show   = hasAttr('show', data.show);
          var bright = hasAttr('bright', data.bright);
          var date   = hasAttr('date', data,date);
          var range  = getAttr('range', data.range);

          // set up box.lookup if any (at most one) of color, dict, list. 
          var list =  getAttr('list', data.list);     setBoxLookup( list );
          var color = getAttr('color', data.color);    setBoxLookup( color );    
          var dict =  getAttr('dict', data.dict);     setBoxLookup( dict );          
          var view =  getAttr('view',data.view);
          if (view) if (!name) name = view.split(':')[0]; // 
          
          var look =  getAttr('look', data.look);
          var style = '';
          if (look) style = ` style="${look}" `
          
          
          
          // priority - get icon from:  1.attr, 2.data.icon, 3.device class, 4.domain, 5.=square  
          box.icon = qd.config.deviceIcon[data.dcls]; 
          if (!box.icon) box.icon = qd.config.domainIcon[domain]; 
          if (!box.icon) box.icon = 'square';  
          if (data.icon) {
              var d = data.icon.split(':');  // search for mdi:xxxxx
              if (d.length == 2) box.icon = d[1];
          }    
          box.icon =  getAttr( 'icon', box.icon );

          box.uom  =  getAttr('uom',    data.uom  );  // unit of measure
          //box.dcls =  getAttr('dcls',   data.dcls );  // device class
          box.prec =  getAttr('prec',   data.prec );  // number of decimals 
          box.set  =  getAttr('set', data.set);                 // value for new state
          var fill = getAttr( 'fill', data.fill);
          if ( fill ) elem.style.backgroundColor = fill; 
          
          box.update = 'notset';

          // find out how to handle updates --> box.update
          // put html code in element --> elem.inner.HTML
          qd.debug(`qd.begin ent:${data.ent} ix:${data.ix}`);     
          var html =  `<p class="title">${name}</p>`;

          switch (domain) {
              // --------------------------------------------
              case 'empty': 
              case 'custom':
              box.update='';
              if (name) html += `<span val ${style}>${elem.innerHTML}</span>`;
              else      html  = `<span val ${style}>${elem.innerHTML}</span>`;
              break;
              
              // --------------------------------------------
              case 'view':  
              box.update='';
              html += `
                    <span val  class="mdi mdi-${box.icon}"  
                     onclick="qd.onViewClick( '${elem.id}','${view}' )"  ${style}></span>`;
              
              break;

              // --------------------------------------------
              case 'binary_sensor':
              box.update='onoff_icon';
              if (!color) setBoxLookup( qd.config.defaultonoffcolor );
              html += `<span val ${style}></span>`;
              break;

             // --------------------------------------------
              case 'switch':
              case 'input_boolean':
              box.update='onoff_icon';
              if (!color) setBoxLookup( qd.config.defaultonoffcolor ); 
              if ( show )  html += `<span val ${style}></span>`;
              else
              if (box.set) html += `<span val onclick="qd.operation( '${ent}','${box.set}','' )" ${style}></span>`; // on or off
              else         html += `<span val onclick="qd.operation( '${ent}','toggle','' )" ${style}></span>`; 
              break;

             // --------------------------------------------
              case 'script':
              {
                var opts = getOptions();
                if (opts) {
                  box.update = '';
                  html += `
                  <select val onchange = "qd.operation( '${ent}', 'run',  this.value  )"  ${style}>
                  ${opts}
                  </select>                           
                  ` ;
                  break;  
                }
              }
              box.update='onoff_icon';
              if (!color) setBoxLookup( qd.config.defaultonoffcolor ); 
              if ( show ) html += `<span val ${style}></span>`;
              else html += `<span val onclick="qd.operation( '${ent}','run','${box.set}' )" ${style}></span>`;
              break;

              // --------------------------------------------
              case 'input_button':
              box.update='';     // no updates             
              html += `<span val class="mdi mdi-${box.icon}" onclick="qd.operation( '${ent}', 'press', '${box.set}' )" ${style}></span>`;
              break;

              // --------------------------------------------
              case 'light':
              if ( bright ) { 
                  box.update='bright';
                  html += `
                  <span class="sidepart mdi mdi-arrow-down-box" onclick="qd.operation( '${ent}', 'bright', '-10' )"></span>
                  <span class="midpart" val ${style}></span>
                  <span class="sidepart mdi mdi-arrow-up-box"   onclick="qd.operation( '${ent}', 'bright',  '10' )" ></span>
                  `;
                  break;
              }
              box.update = 'onoff_icon';
              if (!color) setBoxLookup( qd.config.defaultonoffcolor ); 

              if ( show ) html += `<span val ${style}></span>`;
              else 
              if (box.set) html += `<span val onclick="qd.operation( '${ent}','turn${box.set}','' )" ${style}></span>`; // turnon or turnoff
              else         html += `<span val onclick="qd.operation( '${ent}','toggle','' )" ${style}></span>`; 
              break;
              
              // --------------------------------------------
              case 'sensor':
              if ( box.prec || box.uom ) { // this is a numeric sensor
                  if (color) box.update='numeric_icon';
                  else       box.update='state_numeric';
              }                    
              else   // this is a text sensor
              if ( dict ) box.update = 'state_text'; 
              else
              if ( color ) box.update = 'state_icon';             
              else  box.update = 'state_text';
              html += `<span val ${style}></span>`;
              break;
              
              // --------------------------------------------
              case 'input_number':
              if ( show ) {
                if ( color ) box.update='numeric_icon';
                else 
                if ( dict )  box.update='state_lookup';
                else         box.update='state_numeric';
                html += `<span val ${style}></span>`;
                break;
              }
              if ( box.set ) {
                box.update='state_set';
                if (!color) setBoxLookup( qd.config.defaultonoffcolor );                 
                html += `<span val onclick="qd.operation( '${ent}','setnumber','${box.set}')" ${style}></span>`;
                break;
              }              
              if ( range ) {      
                box.update = 'picker';
                var d=range.split(',');
                if ( d.length != 3) html += `<input val type="number" min="0" max="100" step="1" `;
                else html += `<input val type="number" min="${d[0]}" max="${d[1]}" step="${d[2]}" `;
                html += `onchange="qd.operation( '${ent}', 'setnumber', this.value )"  ${style} />`;
                break;
              }
              box.update='state_numeric';              
              html += `
              <span class="sidepart mdi mdi-arrow-down-box" onclick="qd.operation( '${ent}', 'decrement', '' )"></span>
              <span class="midpart" val  ${style}></span>
              <span class="sidepart mdi mdi-arrow-up-box"   onclick="qd.operation( '${ent}', 'increment',  '' )" ></span>
              `;
              break;
              
              // --------------------------------------------
              case 'input_text':
              if ( show ) {
                if ( color ) box.update='state_icon';              
                else
                if ( dict )  box.update='state_lookup';
                else         box.update='state_text';
                html += `<span val ${style}></span>`;
                break;
              }
              if ( box.set ) {
                box.update='state_set';
                if (!color) setBoxLookup( qd.config.defaultonoffcolor );                 
                html += `<span val onclick="qd.operation( '${ent}','settext','${box.set}')" ${style}></span>`;
                break;
              }
              {
                box.update = 'picker';
                var opts = getOptions();
                if (opts) {
                  html += `
                  <select val onchange = "qd.operation( '${ent}', 'settext',  this.value  )"  ${style}>
                  ${opts}
                  </select>                           
                  ` ;
                  break;  
                }
              }
              box.update = 'picker';
              html += `<input val type="text" size="10" onchange="qd.operation( '${ent}', 'settext', this.value )" ${style}/>`;                 
              break;

              // --------------------------------------------
              case 'input_select':
              if ( show ) {
                if ( color ) box.update='state_icon';              
                else
                if ( dict )  box.update='state_lookup';
                else         box.update='state_text';
                html += `<span val ${style}></span>`;
                break;
              }
              
              if ( box.set ) {
                box.update='state_set';
                if (!color) setBoxLookup( qd.config.defaultonoffcolor );                 
                html += `<span val onclick="qd.operation( '${ent}','select','${box.set}')" ${style}></span>`;
                break;
              }              
              
              box.update = 'picker';
              var optx = getOptions();
              html += `
              <select val onchange = "qd.operation( '${ent}', 'select',  this.value  )"  ${style}>
                ${optx}
              </select>                           
                ` ;
              break;

              // --------------------------------------------
              case 'input_datetime':
              if ( show ) {
                box.update='state_text';
                html += `<span  style="font-size:60%;"><span val  ${style}></span></span>`;
                break;
              }
              box.update = 'picker';
              var tord = (date)?'date':'time'
              html += `<span  style="font-size:40%;"><input val type="${tord}" onchange="qd.operation( '${ent}', 'set${tord}', this.value )"  ${style}/></span>`;
              break;

           
              // --------------------------------------------
              default:
              qd.log(`default?${ent}?`);
              html =  `<p class="title">?${ent}?</p>`;
              break;
             
         }
         elem.innerHTML = html;
      }  catch (error) {  qd.log(error); } 
}     
,
// --------------------------------------------- 
updateBox: function ( data ){ 
  var box;

  // -------------------------------------- 
  function lookup() {
    var v = box.lookup[data.state];
    if (v) return v;
    v = box.lookup['*'];
    if (v) return v;
    return '';
  }    


  try {
      if ( typeof( qd.config.onUpdateBox ) === 'function' ) qd.config.onUpdateBox( data );
      var ent = data.ent;
      
      var eList = document.querySelectorAll( `[entity="${ent}"]` );
      for ( var i=0;  i < eList.length; i++ ) {
         elem = eList[i];
         var ix = parseInt( elem.id.slice(2) );   // elem.id = 'idN' --> ix = N as integer
         box = qd.box[ix];

         // insert value according to state/prec/uom/icon
         ve = elem.querySelector('[val]');
         if (!ve) { qd.debug("not yet configured: " + ent ) ; return; }// skip if not yet configured

         var value = '?'; 
         
         switch( box.update ) {
             // ----------------------------------
             case 'onoff_icon':  // show state as colored on/off icon
             {                   // 
               ve.innerHTML = `<span class=" mdi mdi-${box.icon}" style="color:${lookup()}" ></span>`;  
               break;
             } 

            // ----------------------------------
            case 'state_icon': // state --> lookup color --> icon color 
            {                  // no match  --> change to *:color
               ve.innerHTML = `<span class=" mdi mdi-${box.icon}" style="color:${lookup()}"></span>`;  
            }
            break;

           // ----------------------------------
            case 'numeric_icon': // value --> find interval --> icon color 
            {                     // no match -> no change
               value = parseFloat( com.round( data.state, box.prec ) );
               var col = '';
               var small = -Infinity;  // find smallest x that is >= value
               for ( var x in box.lookup ) {
                   var y = parseFloat(x);
                   if ( value >= y) 
                       if (y > small) {
                         small=y; 
                         col = box.lookup[x];
                       }    
               }    
               if (col) ve.innerHTML = `<span class=" mdi mdi-${box.icon}" style="color:${col}" ></span>`;  
            }            
            break;
  
            // ----------------------------------
            case 'state_lookup': // state --> lookup text --> show text 
               ve.innerHTML = lookup();  
            break;
             
             // ----------------------------------
            case 'state_set':  // show state==x as colored on/off icon
               var col = ( data.state == box.set  ) ? box.lookup['on'] : box.lookup['off'];
               ve.innerHTML = `<span class=" mdi mdi-${box.icon}" style="color:${col}"></span>`;  
               break;
            
            // ----------------------------------
            case 'state_numeric': // show state as numeric value + uom
               value = com.round( data.state, box.prec); 
               ve.innerHTML = `${value}<span class="uom">&nbsp;${box.uom}</span>`;              
               break;
         
            // ----------------------------------
            case 'state_text': // just show state
               value = data.state;
               ve.innerHTML = value ;  
               break;
 
            // ----------------------------------
            case 'picker': // state (key) --> <select or input> key:value --> show value 
               value = com.round( data.state, box.prec); // does not change a non numeric
               ve.value = value;
               break;
            
            // ----------------------------------
            case 'bright': // show light:bright
                if (data.state == 'off' ) value='0';
                else value = com.round( (parseFloat( data.bright )*10/255).toFixed(2), '0')+'0';
                ve.innerHTML = `${value}<span class="uom">&nbsp;%</span>`; 
                break;
                
          }
      }  
   }  catch (error) {  qd.log(error); }
}
}// end of qd object     






