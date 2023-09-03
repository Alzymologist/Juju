empty=function(s) { return (!s || ( typeof(s)=='object' && Object.keys(s).length==0) ? 1 : 0); };

var www_design='/design/';
if(typeof(page_onstart)=='undefined') page_onstart=[];

// задать нужный дизайн всплывающих окон
wintempl="<div id='{id}_body'>{s}</div><i id='{id}_close' title='Close' class='can'></i>";
wintempl_cls='pop2 zoomIn animated';


var zindexstart=100; // начало отсчета слоев для окон
var activid=false; // id активного окна
var hid=1; // счетчик окон
var mHelps={}; // массив для окон: id:[hotkey,zindex]
var hotkey=[]; // [code,(ctrlKey,shiftKey,altKey,metaKey),func]
var hotkey_def=[]; // хоткеи главного окна

//========================================================
if(typeof(hotkey_default)!='function') hotkey_default=function(){
    hotkey=[];
    setkey('Escape','',function(e){ dom.del(isHelps())},true,1); // закрыть последнее окно
    setkey('Enter','ctrl',function(e){if(!isHelps()) helper_go()},true,1); // если не открыто окон - окно правки
    // setkey('Digit1','ctrl',function(e){keyalert=(keyalert?0:1);talert('Key scan '+(keyalert?'ON':'off'),1000);},false); // включение сканкодов
    // setkey('x','alt',function(e){alert('Scroll W/H='+getScrollW()+'/'+getScrollH()+'\ndocument.compatMode='+document.compatMode+'\nwindow.opera'+window.opera+'\ngetWin W/H='+getWinW()+'/'+getWinH()+'\ngetWin W0/H0='+getWinW0()+'/'+getWinH0()+'\ngetDoc W/H='+getDocW()+'/'+getDocH());},false);
    // setkey('KeyE','',function(e){majax('editor.php',{a:'editform',num:num,comments:(dom('commpresent')?1:0)})},false); // редактор заметки
    // setkey('KeyN','',function(e){majax('editor.php',{a:'newform',hid:++hid})},false); // новая заметка
    setkey('KeyU','',function(e){majax('login.php',{a:'getinfo'})},true); // личная карточка
};

page_onstart.push("hotkey_default()");

//========================================================

keykeys={ctrl:8,shift:4,alt:2,meta:1};

function setkey(k,v,f,o,nav){ nav=nav?1:0; if(typeof(k)!='object') k=[k];
 for(var i=0;i<k.length;i++) {
	    setkey0(k[i],v,f,o,nav);
	    if(mHelps[activid]) mHelps[activid][0]=hotkey.slice(); else hotkey_def=hotkey.slice(); // и запомнить в массиве
 }
}

function setkey0(k,v,f,o,nav){ // повесить функцию на нажатие клавиши
    var e=0; for(var i in keykeys) if(v.indexOf(i)==0) e+=keykeys[i]; // сетка всяких шифтов-контролов
    for(var i in hotkey) if(hotkey[i][0]==k && hotkey[i][1]==e){ // если уже есть - изменить
	if(!f || f=='') delete hotkey[i]; else hotkey[i]=[k,e,f,o,nav];
	return;
    }
    if(!f || f=='') return; // если нет, и не задана функция, - просто выйти
    if(e) hotkey.push([k,e,f,o,nav]); else hotkey.unshift([k,e,f,o,nav]); // иначе - задать с конца списк или с начала
}

// новые функции DOM чтоб не стыдно было за быдлоимена

dom=function(e){ return (typeof(e)=='object' ? e : ( document.getElementById(e) || false ) ) };

dom.s=function(e,text) {
    if(!(e=dom(e))) return '';
    if(text==undefined) return ( e.value!=undefined ? e.value : e.innerHTML );
    if(e.value!=undefined) e.value=text;
    else { e.innerHTML=text; init_tip(e); }
};

dom.add=function(e,s,ara) { newdiv(s,ara,dom(e),'last'); };

dom.add1=function(e,s,ara) { newdiv(s,ara,dom(e),'first'); };

dom.on=function(e){ if(e=dom(e)) e.style.display='block'; };

dom.off=function(e){ if(e=dom(e)) { e.style.display='none'; if(e.id!='tip') dom.off('tip'); } };

// (id,'zoomOut',function_on_end);
function noanim(e) { e.className=(e.className||'').replace(/ *[a-z0-9]+ animated/gi,''); };
dom.effect=function(e,effect,fn) {
    if(!e) return -1; // нет объекта
    // effect='i'+effect; // setTimeout("dier(document.styleSheets);",2000);
    noanim(e); var c=e.className; e.className=c+(c==''?'':' ')+effect+' animated';
    if( typeof(dom(e).onanimationend) != 'object' ) {
	if(!e.animate) { if(fn)fn(); return -3; } // совсем нет анимации
	setTimeout(function(){noanim(e);if(fn)fn();},1000); // если нет события конца анимации - то просто таймаут секунду
	return -4;
    }
    var fs=function(){ removeEvent(e,'animationend',fs); noanim(e); if(fn)fn(); };
    addEvent(e,'animationend',fs);
    return 0;
};

dom.del=function(e) {
    if(e===null||e===undefined) return;


    var id;
    if(typeof(e)=='object') {
        if(typeof(e.id)!='undefined'&&e.id!='') id=e.id; // если есть имя, то взять имя
        else { id='tmp_'+(hid++); e.id=id; } // иначе блять присвоить
    } else {
	id=e; e=dom(id);
    }

    if(typeof(mHelps[id])!='undefined') { // окно было
        delete(mHelps[id]); // удалить окно
        mHelps_sort(top); // пересортировать
        if(!isHelps()) { hotkey=hotkey_def.slice(); } // восстановить дефаулты
    }

    if(e) {
	var clen=function(){ if(e && e.parentNode) e.parentNode.removeChild(e); };
        if(typeof(e.onanimationend)!='object' || in_array(id,['tenek','ajaxgif'])) { dom.off(id); setTimeout(clen,40); }
        else dom.effect(e,'zoomOut',clen);
    } else if(typeof(idrename)!='undefined'&&typeof(idrename[id])!='undefined') { dom.del(idrename[id]); }

    dom.off('tip');
};

idd=dom;
zabil=vzyal=dom.s;
otkryl=dom.on;
zakryl=dom.off;
dobavil=dom.add;
dobavil1=dom.add1;
clean=dom.del;

///////// ЭТУ ВСЮ ХУЙНЮ ПЕРЕДЕЛАТЬ БЫ
function cphash(a) {
    var b={}; for(var i in a) {
    if(typeof(a[i])!='undefined'){
    if(typeof(a[i])=='object' && typeof(a[i]['innerHTML'])!='string') b[i]=cphash(a[i]); else b[i]=a[i];}
    }
    b.push=a.push; b.unshift=a.unshift; // йобаный патч!
    return b;
}

function cpmas(a) { var b=[]; for(var i=0;i<a.length;i++){
    if(typeof(a[i])!='undefined'){
    if(typeof(a[i])=='object' && typeof(a[i]['innerHTML'])!='string') b[i]=cphash(a[i]); else b[i]=a[i];}
} return b; }

function isHelps(){ var max=0,id=false; for(var k in mHelps){ if(mHelps[k][1]>=max){max=mHelps[k][1];id=k;} } return id; }// найти верхнее окно или false

var print_r_id=0;
var print_rid={};

function printr_f(ev,e,i){ ev.stopPropagation(); print_r(print_rid[i]);
    if(e.className!='ll') { e.innerHTML="[Object]"; e.className='ll'; return; }
    e.className=''; e.style.marginLeft='30px'; e.innerHTML=print_r(print_rid[i],0,1)+'\n';
}

function print_r(a,n,skoka) {
 if(skoka===0) return '@'; if(!skoka) skoka=10;
    var s='',t='',v,tp,vl,vv; if(!n)n=0; for(j=0;j<n*10;j++) t+=' ';
    if(typeof(a)!='object') return a;

    for(var j in a){
	if(typeof(j)=='undefined') { s='\nundefined'+s; continue; }
	tp=typeof(a[j]); v=a[j];
	try{ vv=''+v; } catch(x) { vv='(((Uncaught)))'; }

	if(tp=='function') {
	    // vl="<div style='color:orange;display:inline-table'>function</div>";
	    var z=(print_r_id++); print_rid[z]=v;
	    vl="<div style='color:orange;display:inline-table'>function(<div onclick=\"printr_f(event,this,'"+z+"')\" class='ll'>___</div>)</div>";
	}
	else if(tp=='number' || tp=='boolean') vl="<span style='color:lightgreen'>"+vv+'</span>';
	else if(tp=='undefined') vl="<span style='color:#ccc'>"+tp+"</span>";
	else if(tp=='string') vl="<div style='color:green;display:inline-table;'>"+vv+'</div>';
	else if(tp=='object' && !v) vl="<span style='color:#ccc'>null</span>";
	else if(tp=='object') {
	    var z=(print_r_id++); print_rid[z]=v; // cphash(v); // {}; Object.assign(print_rid[z],v);
	    vl = "<div onclick=\"printr_f(event,this,'"+z+"')\" class='ll'>"+vv+"</div>";
	}
	else vl='['+vv+"] <span style='color:green'>"+typeof(v)+'</span>';
	s='\n'+t+j+' = '+vl+s;
    }
    return s;
}

function in_array(s,a){ for(var l in a) if(a[l]==s) return l; return false; }


var JSload={};

function mHelps_sort(top) { // сортировка окон по слоям возрастания с предлежащим окном тени
    if(top=='salert') return;

    var mam=[],k=zindexstart,id=0; for(var i in mHelps) mam.push([i,mHelps[i][1]]);
    if(!mam.length){ // если нету распахнутых окошек
	dom.del('tenek');
	hotkey=hotkey_def.slice();
	activid=false;
	return;
    }
    mam.sort(function(i,j){return i[1]>j[1]?1:0});

    for(var i=0;i<mam.length;i++){
	id=mam[i][0];
	if(id==top || !top && (i+1)==mam.length) continue;
	mHelps[id][1]=k; dom(id).style.zIndex=k++;
    } if(top) id=top;

    if(!mHelps[id]) { dom.del('tenek'); return; }

    if(typeof(document.body.style.pointerEvents)=='string') {
	var T=dom('tenek'); if(!T) { newdiv('',{id:'tenek',cls:'tenek'}); T=dom('tenek'); }
	T.style.zIndex=k++;
    }

    mHelps[id][1]=k; dom(id).style.zIndex=k;
    hotkey=mHelps[id][0].slice();
    activid=id;
}

var LOADES={};

function urlajax(s,dir) { return ( s.indexOf('://')<0 && s.substring(0,1) != '/' ? (dir?dir:www_ajax)+s : s ); }

// умная подгрузка
// первый аргумент - имя файлы js или css или массив ['1.js','2.js','1.css']
// второй необязательный аргумент - фанкция, запускаемая по окончании удачной загрузке ВСЕХ перечисленных
// третий необязательный - функция при ошибке
function LOADS(u,f,err,sync) { if(typeof(u)=='string') u=[u];
    var s;
    for(var i in u) { if(LOADES[u[i]]) continue;
     if(/\.css($|\?.+?$)/.test(u[i])) {
        s=document.createElement('link');
        s.type='text/css';
        s.rel='stylesheet';
        s.href=u[i];
        s.media='screen';
     } else {
        s=document.createElement('script');
        s.type='text/javascript';
        s.src=u[i];
        s.defer = true;
     }
     s.setAttribute('orign',u[i]);
     if(sync) s.async=false;
     s.onerror=( typeof(err)=='function' ? err : function(e){ idie('Not found: '+e.src); } );
     s.onload=function(e){ e=e.target;
        var k=1; LOADES[e.getAttribute('orign')]=1; for(var i in u){ if(!LOADES[u[i]]){ k=0;break;}}
        if(k){ ajaxoff(); if(f) f(e.src); }
     };
     document.getElementsByTagName('head').item(0).appendChild(s);
    }
    if(s) ajaxon(); else if(f) f(1);
}
function LOADS_sync(u,f,err) { LOADS(u,f,err,1) }
// include('js/somefile.js').then(function(){ console.log('loaded'); },function(){ console.log('not loaded'); })
LOADS_promice=include=function(file,sync){
    return new Promise(function(resolve, reject) { LOADS(file,resolve,reject,sync); });
};


// создать новый <DIV class='cls' id='id'>s</div> в элементе paren (если не указан - то просто в документе)
// если указан relative - то следующим за relative
// если relative=='first'(или 0) - в начало
// если relative==['before',relative] - то перед relative
// иначе (рекомндуется писать 'last') - в конец
rootElement=false;
function mkdiv(id,s,cls,paren,relative,display){ if(dom(id)) { dom.s(id,s); dom(id).className=cls; return; }
    var div=document.createElement('DIV');
    if(cls) div.className=cls;
    if(id) div.id=id;
    if(s) div.innerHTML=s;
    if(!display) div.style.display='none';
    if(!paren) paren = document.body;

    if(relative===undefined) {
	try { paren.appendChild(div); } // paren.lastChild
	catch(u) { }
    }
    else if(relative===0||relative=='first') paren.insertBefore(div,paren.firstChild);
    else if(typeof(relative)=='object' && relative[0]=='before') paren.insertBefore(div,relative[1]);
    else paren.insertBefore(div,relative.nextSibling);
    return div;
}

function newdiv(s,ara,paren,relative,display){ if(typeof(ara)!='object') ara={};
    var div=mkdiv(ara.id,s,(ara.cls?ara.cls:ara.class),paren,relative,(display==undefined?1:display));
    if(ara.attr) for(var i in ara.attr) div.setAttribute(i,ara.attr[i]);
    return div;
}

function posdiv(id,x,y) { // позиционирование с проверкой на вылет, если аргумент '-1' - по центру экрана
    var e=dom(id),W,w,H,h,SW,SH,DW,DH;

    e.style.position='absolute';
    w=e.clientWidth; h=e.clientHeight;
    e.style.display='none'; // перед измерением убрать
    W=getWinW(); H=getWinH(); SW=getScrollW(); SH=getScrollH();
    e.style.display='block';
    var es=e.currentStyle||window.getComputedStyle(e);
    var mL=1*es.marginLeft.replace(/px/,''),mR=1*es.marginRight.replace(/px/,'');

    if(x==-1) x=(W-w)/2+SW+mL-mR;
    if(y==-1) y=(H-h)/2+SH;
    DW=W-10; if(w<DW && x+w>DW) x=DW-w; if(x<0) x=0;
    if(y<0) y=0;
    e.style.top=y+'px';
    e.style.left=(x-6)+'px';
}

function center(id) { dom.on(id); posdiv(id,-1,-1); }

function addEvent(e,evType,fn) {
    if(e.addEventListener) { e.addEventListener(evType,fn,false); return true; }
    if(e.attachEvent) { var r = e.attachEvent('on' + evType, fn); return r; }
    e['on' + evType] = fn;
}

function removeEvent(e,evType,fn){
    if(e.removeEventListener) { e.removeEventListener(evType,fn,false); return true; }
    if(e.detachEvent) { e.detachEvent('on'+evType, fn) };
}

function hel(s,t) { ohelpc('id_'+(++hid),(t==undefined?'':s),s); }
function helps_cancel(id,f) { dom(id).querySelector('.can').forEach((e)=>{e.onclick=f}); }
function helpc(id,s) { helps(id,s); center(id); setTimeout(function(x){center(id)},500); }
function ohelpc(id,z,s) { helpc(id,mk_helpbody(z,s)); }
function ohelp(id,z,s) { helps(id,mk_helpbody(z,s)); }
function mk_helpbody(z,s) { return (z==''?'':"<div class='legend'>"+z+"</div>")+"<div class='textbody'>"+s+"</div>"; }

function idie(s,t) {
    var e=typeof(s); if(e=='object') s="<pre style='max-width:"+(getWinW()-200)+"px'>"+print_r(s,0,3)+'</pre>';
    var header='';
    if(t!=undefined) { if(t.length < 120) header=h(''+t); else s=t+'<p>'+s; }
    var p=dom('idie'); if(p) { p=p.querySelector('.textbody'); if(p) return p.innerHTML=p.innerHTML+'<hr>'+s; }
    ohelpc('idie',header,s);
}
dier=idie;

// var wintempl="<div class='corners'><div class='inner'><div class='content' id='{id}_body' align=left>{text}</div></div></div>";
// var wintempl_cls='popup';
// var wintempl_cls='pop2';
// var wintempl="<div id='{id}_body'>{s}</div><i id='{id}_close' title='Close' class='can'></i>";
var addEventListenerSet=0;

function helps(id,s,pos,cls,wt) {
if(!dom(id)) {

    if(!wt) wt=wintempl;
    mkdiv(id,wt.replace(/\{id\}/g,id).replace(/\{s\}/g,s),wintempl_cls+(cls?' '+cls:''));

    if(dom(id+'_close')) dom(id+'_close').onclick=function(e){ dom.del(id); };

    init_tip(dom(id));

    onMoveObject(dom(id),false,
	function(e) {
	    if(e.className=='legend' || e.id==id+'_body') return dom(id);
	    return ( e.id==id ? e : false );
	}
    );


/*

// (c)mkm Вот рецепт локального счастья, проверенный в Опера10, ИЕ6, ИЕ8, FF3, Safari, Chrome.
// Таскать окно можно за 'рамку' - элементы от id до id+'_body', исключая body (и всех его детей).
var e_body=dom(id+'_body'); // За тело не таскаем
var hmov=false; // Предыдущие координаты мыши
// var hmov2=1; // тащим
var e=dom(id);
var pnt=e; while(pnt.parentNode) pnt=pnt.parentNode; //Ищем Адама

			var mmFunc=function(ev) { ev=ev||window.event; if(hmov) {
				e.style.left = parseFloat(e.style.left)+ev.clientX-hmov.x+'px';
				e.style.top = parseFloat(e.style.top)+ev.clientY-hmov.y+'px';
				hmov={ x:ev.clientX, y:ev.clientY };
				if(ev.preventDefault) ev.preventDefault();
				return false;
			    }
			};

			var muFunc=function(){ if(hmov){
			    hmov=false;
			    removeEvent(pnt,'mousemove',mmFunc);
			    removeEvent(pnt,'mouseup',muFunc);
			    e.style.cursor='auto';
			    }
			};

		addEvent(e,'mousedown', function(ev){ if(hmov) return;

			ev=ev||window.event;
			var lbtn=(window.addEventListener?0:1); //Если ИЕ, левая кнопка=1, иначе 0
			if(!ev.target) ev.target=ev.srcElement;
			if((lbtn!==ev.button)) return; //Это была не левая кнопка или 'тело' окна, ничего не делаем
			var tgt=ev.target;
			while(tgt){
			    if(tgt.className=='legend') { tgt=e; break; } // и за заголовок class='legend' можно тоже таскать
			    if(tgt==e_body) return;
			    if(tgt==e) break;
			    tgt=tgt.parentNode;
			};
			//Начинаем перетаскивать
			e.style.cursor='move';
			// hmov2=0;
			hmov={ x:ev.clientX, y:ev.clientY };

			addEvent(pnt,'mousemove',mmFunc);
			addEvent(pnt,'mouseup',muFunc);

			if(ev.preventDefault) ev.preventDefault();
			return false;
		});
*/
// ===========================================================================

++hid;

if(!pos) posdiv(id,mouse_x,mouse_y);

mHelps[id]=[hotkey.slice(),999999]; // сделать самым верхним
} else dom.s(id+'_body',s);

hotkey=hotkey_def.slice(); // обнулить для окна все шоткеи
setTimeout("mHelps_sort('"+id+"');",10); // пересортировать
addEvent(dom(id),'click',function(){ mHelps_sort(this.id); });
}

// координаты мыши
var mouse_x=mouse_y=0;
document.onmousemove = function(e){ e=e||window.event;
  if(e.pageX || e.pageY) { mouse_x=e.pageX; mouse_y=e.pageY; }
  else if(e.clientX || e.clientY) {
    mouse_x = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
    mouse_y = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
  }
try{e=dom('ajaxgif'); e.style.top=15+mouse_y+'px'; e.style.left=15+mouse_x+'px';}catch(e){}
};

function getScrollH(){ return document.documentElement.scrollTop || document.body.scrollTop; }
function getScrollW(){ return document.documentElement.scrollLeft || document.body.scrollLeft; }

function getWinW(){ return window.innerWidth || (document.compatMode=='CSS1Compat' && !window.opera ? document.documentElement.clientWidth : document.body.clientWidth); }
function getWinH(){ return window.innerHeight || (document.compatMode=='CSS1Compat' && !window.opera ? document.documentElement.clientHeight : document.body.clientHeight); }

function getDocH(){ return document.compatMode!='CSS1Compat' ? document.body.scrollHeight : document.documentElement.scrollHeight; }
function getDocW(){ return document.compatMode!='CSS1Compat' ? document.body.scrollWidth : document.documentElement.scrollWidth; }

var scrollTop=0;

function GetCaretPosition(e) { var p=0; // IE Support
    if(document.selection){ e.focus(); var s=document.selection.createRange(); s.moveStart('character',-e.value.length); p=s.text.length; } // Firefox support
    else if(e.selectionStart || e.selectionStart=='0') p=e.selectionStart;
    scrollTop=e.scrollTop; return p;
}

function setCaretPosition(e,p) {
    if(e.setSelectionRange){ e.focus(); e.setSelectionRange(p,p); }
    else if(e.createTextRange){ var r=e.createTextRange(); r.collapse(true); r.moveEnd('character',p); r.moveStart('character',p); r.select(); }
    e.scrollTop = scrollTop;
}

//======================================== jog

f_save=function(k,v){
    if(k.length>500 || v.length>20000) { idie('f_save error: k.length='+k.length+' v.length='+v.length); return false; }
    var cm='setItem'; try { return window.localStorage[cm](k,v); } catch(e) { return err_store(e,arguments.callee.name,cm); }
};

f_read=function(k){
    var cm='getItem'; try { return window.localStorage[cm](k); } catch(e) { return err_store(e,arguments.callee.name,cm); }
};

f_del=function(k){
    var cm='removeItem'; try { return window.localStorage[cm](k); } catch(e) { return err_store(e,arguments.callee.name,cm); }
};

err_store=function(e,fnam,cm) { // да блять, иногда даже они рушатся
    if(!window.localStorage || !window.localStorage[cm]) return false;

    if(e.name=='NS_ERROR_FILE_CORRUPTED') alert("\
Опс, да у вас ебанулось браузерное хранилище!\nУ меня такое было, когда я скопировал папку от старого Firefox в новый.\
\n\nНе думаю, что проблема ограничится лишь этим сайтом. Надо найти и ручками ёбнуть файлы типа:\
\n~/.mozilla/firefox/3t20ifl1.default/webappsstore.sqlite\
\n~/.mozilla/firefox/3t20ifl1.default/webappsstore.sqlite-wal");
    else alert('Error ['+cm+'] '+fnam+'(): '+e.name);
    return false;
}

time=function(){ return new Date().getTime(); };

// bigfoto - заебался отдельно пристыковывать
// BigLoadImg("http://lleo.aha.ru/tmp/img.php?text="+Math.random());
// Два варианта вызова: либо модулем для серии фоток, либо без второго параметра просто bigfoto('somepath/file.jpg')
// <img style='border:1px solid #ccc' onclick="return bigfoto('/backup/kniga_big.gif')" src="/backup/kniga_small.gif">

var BigImgMas={},bigtoti=0,bigtotp=0;
function bigfoto(i,p){ if(typeof(i)=='object') i=i.href;
var TDATA=(p!=undefined && isNaN(p) ? p : false); // переданы ли полезные слова вторым аргументом?

var Z=( p==undefined || TDATA!==false ); var n=Z?i:i+','+p;

if(typeof(BigImgMas[n])=='undefined'){
    if(!Z && !dom("bigfot"+p+"_"+i)) return false;
    // ajaxon();
    BigImgMas[n]=new Image();
    BigImgMas[n].src=Z?n:dom("bigfot"+p+"_"+i).href;
}

if(!Z) { bigtoti=i; bigtotp=p; }
if(BigImgMas[n].width*BigImgMas[n].height==0) { setTimeout('bigfoto('+(Z ? '"'+n+'"' : n)+')',200); return false; }
// ajaxoff();

if(Z) var tt="<div id='bigfostr' class=r>"+(TDATA===false?n:TDATA)+"</div>";
else {
var g=i; while(dom('bigfot'+p+'_'+g)) g++;
var tt=(g>1?(i+1)+" / "+g:'')+(dom('bigfott'+p+'_'+i)?"    <div style='display:inline;' title='nexпредыдущая/следующая: стрелки клавиатуры' id='bigfottxt'>"+dom.s('bigfott'+p+'_'+i)+'</div>':'');
if(tt!='') tt="<div id='bigfostr' class='r'>"+tt+"</div>";
}
var navl=Z?'':"<div id='bigfotol' style='position:absolute;top:0px;left:0px;'"+((!i)?'>':" title='prev' onclick='bigfoto(bigtoti-1,bigtotp)' onmouseover=\"dom.on('bigfotoli')\" onmouseout=\"dom.off('bigfotoli')\"><i id='bigfotoli' style='position:absolute;top:0px;left:3px;display:none;' class='e_DiKiJ_l'></i>")+"</div>";
var navr=Z?'':"<div id='bigfotor' style='position:absolute;top:0px;right:0px;'"+((g==i+1)?'>':" title='next' onclick='bigfoto(bigtoti+1,bigtotp)' onmouseover=\"dom.on('bigfotori')\" onmouseout=\"dom.off('bigfotori')\"><i id='bigfotori' style='position:absolute;right:3px;display:none;' class='e_DiKiJ_r'></i>")+"</div>";

helps('bigfoto',"<div style='position:relative'>"+navl+"<img id='bigfotoimg' src='"+BigImgMas[n].src+"' onclick=\"dom.del('bigfoto')\">"+navr+"</div>"+tt,1);

var w=BigImgMas[n].width,h=BigImgMas[n].height,e=dom('bigfotoimg');
var H=(getWinH()-20); if(h>H && H>480) { w=w*(H/h); h=H; e.style.height=H+'px'; }
var W=(getWinW()-50); if(w>W && W>640) { h=h*(W/w); w=W; e.style.width=W+'px'; }
if(dom('bigfostr')) dom('bigfostr').style.width=w+'px';

if(!Z){
    dom('bigfotol').style.width=dom('bigfotor').style.width=w/4+'px';
    dom('bigfotol').style.height=dom('bigfotor').style.height=h+'px';
    if(dom('bigfotoli')) dom('bigfotoli').style.top=(h-16)/2+'px';
    if(dom('bigfotori')) dom('bigfotori').style.top=(h-16)/2+'px';
    setkey(['ArrowLeft','4'],'',function(){bigfoto(bigtoti-1,bigtotp)},false);
    setkey(['ArrowRight','7'],'',function(){bigfoto(bigtoti+1,bigtotp)},false);
}
center('bigfoto');
return false;
}

// tip

function init_tip(w) { w=w||document; if(!dom('tip')) {
mkdiv('tip','','b-popup bubble-node b-popup-noclosecontrol');
dom.s('tip','<div class="b-popup-outer"><div class="b-popup-inner"><div id="rtip"></div><i class="i-popup-arr i-popup-arrtl"><i class="i-popup-arr-brdr-outer"><i class="i-popup-arr-brdr-inner"><i class="i-popup-arr-bg"></i></i></i></i><i class="i-popup-close"></i></div></div>');
}
    if(w.id=='tip') return;

var attr,j,i,a,s,e,t,el=['a','label','input','img','span','div','textarea','area','select','i','td'];
for(j=0;j<el.length;j++){ t=el[j]; e=w.getElementsByTagName(t); if(e){ for(i=0;i<e.length;i++){ a=e[i];

if(t=='img') { // для ошибки при загрузки картинок
    a.setAttribute('onerror','erimg(this)');
    a.setAttribute('src',a.getAttribute('src'));
} else if(t=='input'||t=='textarea'||t=='select') { // и отключить навигацию для INPUT и TEXTAREA
	attr=a.getAttribute('ramsave');
	if(attr!==null && !a.defaultValue) { // если указан атрибут ramsave='name', то сохранять в памяти браузера эту переменную и восстанавливать
		if(attr=='') {
		    attr=(a.id?a.id:(a.name?a.name:attr)); // если =1, то имя такое же, как id или name
		    a.setAttribute('ramsave',attr);
		}
		var vv=f_read(attr) || a.getAttribute('placeholder') || '';
		    if(a.type=='checkbox') a.checked=vv;
		    else if(a.type=='radio') a.checked=(a.value==vv?1:0);
		    else a.value=vv;
		addEvent(a,'change',function(){
		    f_save(this.getAttribute('ramsave'), ( this.type=='checkbox' || (this.type!='radio' && this.checked) ? (this.checked?1:0) : this.value ) );
		});
	}
}

    attr=a.getAttribute('title')||a.getAttribute('alt');

    if(attr=='play') {
	var za=a.innerHTML,url=za.split(' ')[0],text=za.substring(url.length+1),cls;
	if(text=='') text=url;
	if(/(mp3|ogg|wav|flac)$/.test(url)) { // mp3
	    cls='ll pla';
	    if(text.indexOf('<')<0) text="<img style='vertical-align:middle;padding-right:10px;' src='"+www_design+"img/play.png' width='22' height='22'>"+text;
	} else {
	    cls='ll plv';
	    if(text.indexOf('<')<0) text="<i style='vertical-align:middle;padding-right:10px;' class='e_play-youtube'></i>"+text;
	}
	a.className=cls;
	a.setAttribute('media-url',url);
	a.setAttribute('media-text',text);
	addEvent(a,'click',function(){ changemp3x('','',this); });
	dom.s(a,text);
	a.style.margin='10px';
	tip_a_set(a,'Play Media');
	a.style.display='block';
    }

    else tip_a_set(a,attr);

}}}
}

function erimg(e){ e.onerror='';
tip_a_set(e,'image error<br>'+h(e.src));
e.src=www_design+'img/kgpg_photo.png';
}

function tip_pos(){ posdiv('tip',mouse_x-35,mouse_y+25); }

function tip_a_set(a,s) { if(s && a.onMouseOver==undefined) {
    a.setAttribute('tiptitle',s); a.removeAttribute('title'); a.removeAttribute('alt');
    addEvent(a,'mouseover',function(){ dom('rtip').innerHTML=s; tip_pos(); });
    addEvent(a,'mouseout',function(){ dom.off('tip') });
    addEvent(a,'mousemove',function(){ tip_pos() });
    addEvent(a,'dblclick',function(){ salert(this.getAttribute('tiptitle'),5000); });
}}

page_onstart.push("init_tip()");

window.onload=function(e) { e=e||window.event;

// document.onkeyup = function(e){ };
document.onkeydown = function(e) { e=e||window.event;
    var kod=(e.code?e.code:null),ct=e.metaKey+2*e.altKey+4*e.shiftKey+8*e.ctrlKey;

    // if(keyalert) { setTimeout("talert('Code: "+kod+" Alt: "+ct+"',2000)",50); return false; }

    for(var i in hotkey) if( hotkey[i][0]==kod && hotkey[i][1]==(hotkey[i][1]&ct)) {
        if(!hotkey[i][4]) return true; // навигация отключена для навигационных
        setTimeout("hotkey["+i+"][2]('"+kod+" "+ct+"')",50);
        return hotkey[i][3];
    }
};

// === / KEYBOARD ===
window.onresize=function(){ screenWidth=document.body.clientWidth; }; window.onresize();

for(var inok=page_onstart.length-1;inok>=0;inok--) { var F=page_onstart[inok],TF=typeof(F);
    try{
	if(TF=='function') F();
	else if(TF=='string') eval(F);
	else ErrorUnknownOnstartCallFunction();
    } catch(e){ salert('Error ostart: '+h(e.name+":"+e.message)+"<br>"+h(e.stack)+'<p>'+h(page_onstart[inok])+"<hr>"+F); }
} page_onstart=[];

};
// end window.onload

onstart=function(F) { page_onstart.push(F); return page_onstart.length-1; }

function salert(l,t) {
    var p=dom('salert');
    if(p){ p.querySelector('.textbody'); if(p) { p.innerHTML=p.innerHTML+'<hr>'+l; return false; } }
    helpc('salert',"<div style='padding:20px' class='textbody'>"+l+"</div>");
    if(t) setTimeout("dom.del('salert')",t);
    return false;
}

function talert(s,t){ mkdiv('talert',s,'qTip'); posdiv('talert',-1,-1); if(t) setTimeout("dom.del('talert')",t); }

function gethash_c(){ return 1*document.location.href.replace(/^.*?#(\d+)$/g,'$1'); }

function plays(url,silent){ // silent: 1 - только загрузить, 0 - петь, 2 - петь НЕПРЕМЕННО, невзирая на настройки
    var audio = new Audio(url);
    if(silent!=1) audio.play();
}

function go(s) { window.top.location=s; }

function h(s){
    return (''+s).replace(/\&/g,'&'+'amp;').replace(/\</g,'&'+'lt;').replace(/\>/g,'&'+'gt;').replace(/\'/g,'&'+'#039;').replace(/\"/g,'&'+'#034;'); // '
}
function uh(s){ return s.replace(/\&lt\;/g,'<').replace(/\&gt\;/g,'>').replace(/\&\#039\;'/g,"'").replace(/\&\#034\;"/g,'"').replace(/\&amp\;/g,'&'); }

// {_PLAY:

var youtubeapiloaded=0;
var mp3imgs={play:www_design+'img/play.png',pause:www_design+'img/play_pause.png',playing:www_design+'img/play_go.gif'};

stopmp3x=function(ee){ ee.src=mp3imgs.play; setTimeout("dom.del('audiosrcx_win')",50); };

changemp3x=function(url,name,ee,mode,viewurl,download_name) { //  // strt

    if(url=='') url=ee.getAttribute('media-url');
    if(name=='') name=ee.getAttribute('media-text'); if(!name) name='';

    if(-1!=name.indexOf('</i>')) name=name.substring(name.split('</i>')[0].length+4);
    // else if(-1!=name.indexOf('<img ')) name=name.substring(name.split('>')[0].length+1); 
    name=name.replace(/<[^>]+>/gi,'');

    var start=0,e;
    var s=name.replace(/^\s*([\d\:]+)\s.*$/gi,'$1'); if(s!=name&&-1!=s.indexOf(':')) { s=s.split(':'); for(var i=0;i<s.length;i++) start=60*start+1*s[i]; }

    var WWH="style='width:"+(Math.floor((getWinW()-50)*0.9))+"px;height:"+(Math.floor((getWinH()-50)*0.9))+"px;'";

    if(/(youtu\.be\/|youtube\.com\/)/.test(url) || (url.indexOf('.')<0 && /(^|\/)(watch\?v\=|)([^\s\?\/\&]+)($|\"|\'|\?.*|\&.*)/.test(url))) { // "

 	var tt=url.split('?start='); if(tt[1]) { start=1*tt[1]; url=tt[0]; } // ?start=1232343 в секундах
	else {
	  var exp2=/[\?\&]t=([\dhms]+)$/gi; if(exp2.test(url)) { var tt=url.match(exp2)[0]; // ?t=7m40s -> 460 sec
	    if(/\d+s/.test(tt)) start+=1*tt.replace(/^.*?(\d+)s.*?$/gi,"$1");
	    if(/\d+m/.test(tt)) start+=60*tt.replace(/^.*?(\d+)m.*?$/gi,"$1");
	    if(/\d+h/.test(tt)) start+=3600*tt.replace(/^.*?(\d+)h.*?$/gi,"$1");
	  }
	}

	if(-1!=url.indexOf('://youtu') || -1!=url.indexOf('://www.youtu')) url=url.match(/(youtu\.be\/|youtube\.com\/)(embed\/|watch\?v\=|)([^\?\/]+)/)[3];

	return ohelpc('audiosrcx_win','YouTube '+h(name),"<div id=audiosrcx><center>\
<iframe "+WWH+" src=\"https://www.youtube.com/embed/"+h(url)+"?rel=0&autoplay=1"+(start?'&start='+start:'')+"\" frameborder='0' allowfullscreen></iframe>\
</center></div>");
    }

    if(/([0-9a-z]{8}\-[0-9a-z]{4}\-[0-9a-z]{4}\-[0-9a-z]{4}\-[0-9a-z]{12})/.test(url)) { // Peertube
	return ohelpc('audiosrcx_win','PeerTube '+h(name),"<div id=audiosrcx><center>\
<iframe "+WWH+" sandbox='allow-same-origin allow-scripts allow-popups' src=\""+h(url)+"\" frameborder='0' allowfullscreen></iframe>\
</div>");
    }

    if(/\.(mp4|avi|webm|mkv)$/.test(url)) s='<div>'+name+'</div><div><center><video controls autoplay id="audiidx" src="'+h(url)+
'" width="640" height="480"><span style="border:1px dotted red">ВАШ БРАУЗЕР НЕ ПОДДЕРЖИВАЕТ MP4, МЕНЯЙТЕ ЕГО</span></video></center></div>';

    else if(/\.(jpg)$/.test(url)) { // panorama JPG
	s='<div>'+name+"</div><div id='panorama' "+WWH+"></div>";
	ohelpc('audiosrcx_win','<a class=r href="'+h(url)+'" title="download">'+h(url.replace(/^.*\//g,''))+'</a>','<div id=audiosrcx>'+s+'</div>');
	return LOADS(["//cdnjs.cloudflare.com/ajax/libs/three.js/r69/three.min.js",wwwhost+'extended/panorama.js'],function(){panorama_jpg('panorama',url)});
    }

else s='<div>'+name+'</div><div><center><audio controls autoplay id="audiidx"><source src="'+h(url)+
'" type="audio/mpeg; codecs=mp3"><span style="border:1px dotted red">ВАШ БРАУЗЕР НЕ ПОДДЕРЖИВАЕТ MP3, МЕНЯЙТЕ ЕГО</span></audio></center></div>';

// if(viewurl) url=viewurl;

if(!viewurl) viewurl=url.replace(/^.*\//g,'');
if(!download_name) download_name=url.replace(/^.*\//g,'');

if(e=dom('audiidx')) {
    if(ee && ee.src && -1!=ee.src.indexOf('play_pause')){ ee.src=mp3imgs.playing; return e.play(); }
    if(ee && ee.src && -1!=ee.src.indexOf('play_go')){ ee.src=mp3imgs.pause; return e.pause(); }
    dom.s('audiosrcx',s);
    posdiv('audiosrcx_win',-1,-1);
    e=dom('audiidx');
    e.currentTime=start;
} else {
    ohelpc('audiosrcx_win','<a class=r href="'+h(url)+'" title="Download: '+h(download_name)+'" download="'+h(download_name)+'">'+h(viewurl)+'</a>','<div id=audiosrcx>'+s+'</div>');
    e=dom('audiidx');
    e.currentTime=start;
}

if(ee) addEvent(e,'ended',function(){ stopmp3x(ee) });
if(ee) addEvent(e,'pause',function(){ if(e.currentTime==e.duration) stopmp3x(ee); else ee.src=mp3imgs.pause; });
if(ee) addEvent(e,'play',function(){ ee.src=mp3imgs.playing; });
}

/*********************** majax ***********************/

var ajaxmgif = "<img src='https://lleo.me/design/img/ajaxm.gif'>";
var ajaxgif = "<img src='https://lleo.me/design/img/ajax.gif'>";
function ajaxon(){ var id='ajaxgif'; mkdiv(id,ajaxgif,'popup'); posdiv(id,15+mouse_x,15+mouse_y); } // @
function ajaxoff(){ dom.del('ajaxgif'); } // @

get_pole_ara=function(w,onlych) { var k=0,ara={names:''}; var el=['input','textarea','select']; w=dom(w);
        for(var j=0;j<el.length;j++){ var e=w.getElementsByTagName(el[j]); for(i=0;i<e.length;i++)
                        if(typeof(e[i].name)!='undefined' && e[i].name!=''
&& ( onlych!=1 || e[i].type=='hidden' || typeof(e[i].defaultValue)=='undefined' || e[i].value!=e[i].defaultValue)
) {
    var b=el[j]+':'+e[i].type;

    if(b=='input:radio' && !e[i].checked) continue; // только нажатые

    else if(b=='input:file') {
	if(e[i].value=='') continue; // пустых файлов нам не надо
	var p=e[i].files,nf=e[i].name.replace(/\[\]/g,'_'),q; for(q=0;q<p.length;q++) { ara[nf+q]=p[q]; ara['names']+=' '+nf+q; k++; }
	continue;
    } else if(b=='input:checkbox') {
	ara[e[i].name]=e[i].checked?1:0;
    } else {
        ara[e[i].name]=e[i].value;
	if(typeof(e[i].defaultValue)!='undefined') e[i].defaultValue=e[i].value;
    }

    ara['names']+=' '+e[i].name; k++;
}
        }
        return (k==0?false:ara);
};

function send_this_form(e,mjphp,m,onlych) {
    while(e.tagName!='FORM'&&e.parentNode!=undefined) e=e.parentNode;
    if(e.parentNode==undefined) return false; var ara=get_pole_ara(e,onlych);
    if(ara===false) return false; for(var i in m) ara[i]=m[i]; majax(mjphp,ara); return false;
}

/***************** MAJAX NEW **********************/
progress=function(name,now,total,text) { name='progress'+(name?'_'+name:'');
    if(!dom(name)) { if(!total) return;
            helpc(name,"\
<div id='"+name+"_proc' style='text-align:center;font-size:23px;font-weight:bold;color:#555;'>0 %</div>\
<div id='"+name+"_tab' style='width:"+Math.floor(getWinW()/2)+"px;border:1px solid #666;'>\
<div id='"+name+"_bar' style='width:0;height:10px;background-color:red;'></div></div>");
    } else if(!total) return dom.del(name);
    var proc=Math.floor(1000*(now/total))/10;
    var W=1*dom(name+'_tab').style.width.replace(/[^\d]+/g,'');
    dom(name+'_bar').style.width=Math.floor(proc*(W/100))+'px';
    if(!text) text=''+proc+' %'; else text=text.replace(/\%\%/g,proc);
    dom.s(name+'_proc',text);
};

function sizer(x) {  var i=0; for(;x>=1024;x/=1024,i++){} return Math.round(x,2)+['b','Kb','Mb','Gb','Tb','Pb'][i]; } // если отправка более 30кб - показывать прогресс

ProgressFunc=function(e){ progress('ajax',e.loaded,e.total,sizer(e.total)+': %% %'); };

function catcherr(txt,e,code){ ohelpc('JSerr','JS error: '+h(txt),"<font color=red><b><big>"+h(e.name)+": "+h(e.message)+"</big></b></font>"
+"<div style='border:1px dotted red'>"+h(e.stack)+"</div>"
+h(code).replace(/\n/g,"<br>")); }

// ##############
function majax(url,ara,js,METHOD,form) { if(!url.indexOf) { alert('Majax error url: '+url); return false; } url=urlajax(url);

    if(!METHOD) { // выбрать метод
	var ara_len=0; for(var i in ara) ara_len++;
	var DD=Math.max(36*ara_len,256); // сколько байт добавит POST form-data?
	U=0; for(var i in ara) {
	    if(typeof(ara[i])=='object') { METHOD='FORM'; break; }
	    U+=(encodeURIComponent(i+ara[i]).length - (i+ara[i]).length); // сколько байт добавит каждый следующий form-urlencoded?
	    if(U>DD) { METHOD='FILE'; break; } // как только стало дороже - FILE
	}
	if(!METHOD) { if(U<256 && (''+document.location).substring(0,4)!='http') METHOD='GET'; else METHOD='POST'; } // если речь о копейках, то просто GET, иначе POST form-urlencoded
    }

    ajaxon();

    var x = new XMLHttpRequest();

    x.onload=x.onerror=function(){
        if(this.status==200) {
	    ajaxoff();
	    progress('ajax');
	    if(js) { try{ if(typeof(js)=='string') eval(js); else if(js(x.responseText)===true) return; } catch(e){catcherr("Majax JS",e,js)} }
	    var m=x.responseText.split('**'+'/');
	    if(!m[1]&&m[0]!='/'+'**') { var er='',ev=m[0]; }
	    else { var er=m[0].replace(/^\/[\*]+/g,''),ev=m[1]; }
	    if(er!='') ohelpc('SerErr','Server Error',h(er).replace(/\n/g,"<p>"));
	    ev=ev.replace(/\&\#10017\;\&\#10017;\//g,'**'+'/');
	    try{eval(ev)}catch(e){catcherr("Majax RESULT",e,ev)}
	} else { salert('Majax Error ['+url+']: '+this.status+': '+this.statusText,2000); ajaxoff(); }
      };

    if(METHOD=='GET') {
	var o=''; for(var i in ara) o+='&'+h(i)+'='+encodeURIComponent(ara[i]); o='zi='+arazig(ara)+o; // кидаем зигу
	x.open("GET",url+'?'+o,true);
	x.send();
	return; // нельзя false!!!!
    }

    if(METHOD=='POST') {
	var o=''; for(var i in ara) o+='&'+h(i)+'='+encodeURIComponent(ara[i]); o='zi='+arazig(ara)+o.replace(/%20/g,'+'); // кидаем зигу
	x.open("POST",url,true);
	x.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	// x.setRequestHeader('Content-length',o.length);
	// x.setRequestHeader('Connection','close');
	x.send(o);
	return; // нельзя false!!!!
    }

    if(METHOD=='FILE') {
	var boundary=md5(String(Math.random()).slice(2));
	var o=['\r\n']; for(var i in ara) o.push('Content-Disposition: form-data; name="'+i+'"\r\n\r\n'+ara[i]+'\r\n');
	o.push('Content-Disposition: form-data; name="zi"\r\n\r\n'+arazig(ara)+'\r\n');
	o=o.join('--'+boundary+'\r\n')+'--'+boundary+'--\r\n';

	if(o.length>20*1024) x.upload.onprogress=ProgressFunc;
	x.open("POST",url,true);
	x.setRequestHeader('Content-Type','multipart/form-data; boundary='+boundary);
	x.setRequestHeader('Content-length',o.length);
	x.setRequestHeader('Connection','close');
	x.send(o);
	return; // нельзя false!!!!
    }

    if(METHOD=='FORM') {
	// if(!form) { idie('majax error: FORM'); return false; }

	var FD=new FormData();
	var a=(form ? get_pole_ara(form) || {} : {});

	for(var i in ara) a[i]=ara[i];
	var size=0; for(var i in a) { FD.append(i,a[i]); size+=typeof(a[i])=='object'?a[i].size:(''+a[i]).length; }
	if(size>20*1024) x.upload.onprogress=ProgressFunc;
	FD.append('zi',arazig(a)); // кидаем зигу
	x.open("POST",url,true);
	x.send(FD);
	return false;
    }

    idie('Majax: unknoun method');
    return false;
}


// AJAX from ESP8266 v3
AJAX=function(url,opt,s) {
  if(!opt) opt={}; else if(typeof(opt)=='function') opt={callback:opt};
  var async=(opt.async!==undefined?opt.async:true);
  try{
    if(!async && !opt.callback) opt.callback=function(){};
    if(!opt.noajax) ajaxon();
    var xhr=new XMLHttpRequest();

    xhr.onreadystatechange=function(){
      // idie('readyState='+this.readyState+' status='+this.status);
    try{
      if(this.readyState==4) {
        if(!opt.noajax) ajaxoff();
	progress('ajax');
	if(this.status==200 && this.responseText!=null) {
            if(this.callback) this.callback(this.responseText,url,s);
            else eval(this.responseText);
	} else if(this.status==500) {
	    if(this.onerror) this.onerror(this.responseText,url,s);
	    else if(opt.callback) opt.callback(false,url,s);
	}
      }
     } catch(e){alert('Error Ajax: '+this.responseText);}
    };

    for(var i in opt) xhr[i]=opt[i];
    // if(opt.error) xhr.onerror=opt.error;
    // if(opt.timeout) xhr.timeout=opt.timeout;
    // if(opt.ontimeout) xhr.ontimeout=opt.ontimeout;
    // dier(xhr);

    xhr.open((opt.method?opt.method:(s?'POST':'GET')),url,async);

    if(s) {
        if(typeof(s)=='object' && !(s instanceof FormData) ) {
          var formData = new FormData();
          for(var i in s) formData.append(i,s[i]);
          var k=0; Array.from(formData.entries(),([key,D])=>(k+=(typeof(D)==='string'?D.length:D.size)));
          if(k>20*1024) xhr.upload.onprogress=ProgressFunc;
          xhr.send(formData);
        } else xhr.send(s);
    } else xhr.send();

    if(!async) return ( (xhr.status == 200 && xhr.readyState == 4)?xhr.responseText:false ); //xhr.statusText=='OK' // в хроме не работает блять

  } catch(e) { if(!async) return false; }
};

function AGET(url,s) { return AJAX(url,{noajax:1,async:false},s); } // асинхронно просто вернуть результат

function AJ(url,callback,s) { AJAX(url,{callback:callback,noajax:1},s); }

function AJC(name,period,url,callback,s) { if(!period) period=600;
    var t=1*(f_read(name+'_time'));
    var V=''+f_read(name);
    var T=parseInt(new Date().getTime()/1000);
    if( (T < (t+period) ) && V!='') { if(callback) callback(V,url); } // вернуть кэш
    // иначе начать AJAX
    var xhr=new XMLHttpRequest(); xhr.onreadystatechange=function(){ if(this.readyState==4 && this.status==200 && this.responseText!=null) {
            f_save(name,this.responseText);
            f_save(name+'_time',T);
            if(callback) callback(this.responseText,url);
    }};
    xhr.open((s?'POST':'GET'),url);
    if(s) xhr.send(s); else xhr.send();
}


// ==============================================
function mpers(s,a) {
    return s.replace(/\{([^\{\}]+)\}/g,function(t0,t1){
        if(typeof(a[t1])!='undefined') return a[t1]; // есть есть такое {значение} - вернуть его
        if(t1.match(/[\s\,\.]+/g)!==null) return t0; // если и имена переменных что-то через запятую - то просто вернуть
	var f=t1.substring(0,1),i=t1.substring(1);
	if(f=='#') return (typeof(a[i])=='undefined'?'': h(a[i]) );
        return '';
    });
}

// скопировать
cpbuf=function(e,message){ if(typeof(e)=='object') e=e.innerHTML; // navigator.clipboard.writeText(e);
    var area = document.createElement('textarea');
    document.body.appendChild(area);
    area.value = e;
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
    if(message===undefined) message=1000;
    if(message) salert('Copypasted:<p><b>'+h(e)+'</b>',1*message);
};

function lightgreen(s) { return "<font color='lightgreen'>"+s+"</font>"; }
function green(s) { return "<font color='green'>"+s+"</font>"; }
function red(s) { return "<font color='red'>"+s+"</font>"; }

// новые окна
// onMoveObject(elem,fn,fntest)
// elem - элемент, который предлагается двигать по экрану (видимо него position:absolute должно быть)
// fn(e,x,y) - сама функция движения элемента e по смещению x и y, лучше поставить false и довериться дефолтной
// fntest(e) - функция проверки: если разрешено двигать за этот элемент, возвращает элемент, иначе false
//    это сделано потому, что в основном элементе могут быть всякие поля и внутренности, за которые двигать не надо
//    эти две функции можно не указывать
npx=function(s) { return 1 * (s ? (''+s).replace(/[^\d\-\.]/g,'') : 0); }; // parseFloat('0'+s);
onMoveObject=function(elem,fn,fntest) { elem=dom(elem);
    elem.style.cursor='move';

    if(!fn) fn=function(e,dx,dy) {
	var x,max=20;
	x=npx(e.style.left)+dx; x=Math.max(x,max-npx(e.clientWidth)); x=Math.min(x,getDocW()-max); e.style.left=x+'px';
	x=npx(e.style.top)+dy; x=Math.max(x,max-npx(e.clientHeight)); x=Math.min(x,getDocH()-max); e.style.top=x+'px';
    };

    var m="touchstart touchmove touchend mousedown".split(' ');
    for(var l of m) elem.addEventListener(l,function(event) {
	var e=event.target;
        if(fntest && (e=fntest(e))===false) return;
        try{ event.preventDefault(); event.stopPropagation(); }catch(er){}

        var mStart=function(x,y) { e.LastMovX=x; e.LastMovY=y; e.classList.add('active-mov'); };
        var fnRun=function(x,y) { fn(e, x-e.LastMovX, y-e.LastMovY); e.LastMovX=x; e.LastMovY=y; };

        var pnt=e; while(pnt.parentNode) pnt=pnt.parentNode; // Ищем Адама

        var fnMove=function(ev) { fnRun(ev.clientX,ev.clientY); try { ev.preventDefault(); }catch(er){} return false; };
        var fnUp=function(){ e.classList.remove('active-mov');pnt.removeEventListener("mousemove",fnMove); pnt.removeEventListener("mouseup",fnUp); };
        // нажали пальцем
        if(event.type == 'touchstart') { mStart(event.targetTouches[0].pageX, event.targetTouches[0].pageY); }
        // нажали мышь
        if(event.type == 'mousedown') { mStart(event.clientX, event.clientY); pnt.addEventListener("mousemove",fnMove); pnt.addEventListener("mouseup",fnUp); }
        // отпустили палец
        if(event.type == 'touchend') { e.classList.remove('active-mov'); }
        // тянем пальцем
        if(event.type == 'touchmove') { // только 1 касание
            if(event.targetTouches.length == 1) fnRun(event.targetTouches[0].pageX,event.targetTouches[0].pageY);
        }
    });
};
