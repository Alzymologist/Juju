// Fucking browser policy: audio input work in https only
var l=document.location.href; if(l.split('://')[0]=='http') document.location.href=l.replace(/^http/g,'https');


JU={
    datalen: 2048, // размер буфера данных
    time: 0.9, // частота опроса
    fft: 512, // 512, // fft фурье
    range: {
	range1: 0,
	width1: 0,
	range2: 0,
	width2: 0,
    },

//    file: "/try.mp3",
    file: false,
    filename: "/juju.ogg",

    size: false,
    height: 512,
    ku: 1,
    init: function() {
	// разобраться с canvas
	JU.grid=grid();
	var d = dom('canvas');
        JU.size = (JU.fft / 2) *2;
	d.width = JU.size;
        d.style.width=getWinW()-55+'px'; // '100%';    //  d.width+'px';
        d.height=JU.height;
        d.style.height=JU.height+'px';

	// выставить ползунки
	JU.range={
	    range1: 1*dom('range1').value,
	    range2: 1*dom('range2').value,
	    width1: 1*dom('width1').value,
	    width2: 1*dom('width2').value,
	};
        JU.rerange();

	// включить движение ползунков
        var elemove=function(e,dx,dy) {
	    var W=npx(dom('canvas').clientWidth), k=W / (JU.fft/2);

	    if(e.id=='rang1' || e.id=='rang2') {
		var x=npx(e.style.left)+dx; x=Math.max(x,2); x=Math.min(x,W-1);
    		var l=Math.round(x/k);
		var n=(e.id=='rang1'?'range1':'range2');
		JU.range[n]=l; f_save(n,l);
		dom(n).value=l; dom.s(n+'t',l);
		e.style.left=x+'px';
		return;
	    }

	    if(e.id=='rang1w' || e.id=='rang2w') {
		var ee=e.parentNode;
		var x=npx(ee.style.width)+dx; x=Math.max(x,1); // x=Math.min(x,W-1);
    		var l=Math.round(x/k);
		var n=(e.id=='rang1w'?'width1':'width2');
		JU.range[n]=l; f_save(n,l);
		dom(n).value=l; dom.s(n+'t',l);
		ee.style.width=x+'px';
		return;
	    }

	};
        onMoveObject('rang1',elemove);
        onMoveObject('rang2',elemove);

	// запустить анализ
	JU.Analyse();
    },

    draw: function(data) {
        JU.ku++;
	var c = dom('canvas').getContext('2d');
//        c.globalAlpha = 1.0;
	c.fillStyle = "#EEE"; c.fillRect(0,0,JU.size,JU.height);

//	var ss=''; for(var i=0; i<data.length; i++) ss+=(data[i]==0?'_':'#')+((i+1)%128?'':'<br>');
//	dom.s('buka',JU.ku+'. '+' '+data.length+"<div style='font-size:8px'>"+ss+'</div>');

	var cm = JU.grid.length / data.length;
	var r1=0,r2=0,
	    i1=JU.range.range1, i1e=i1+JU.range.width1,
	    i2=JU.range.range2, i2e=i2+JU.range.width2 ; // считаем результаты
        for (var i = 0; i < data.length; i++) {
	    var x = data[i]+1; // if(x>JU.height) x=JU.height;

	    if(i >= i1 && i < i1e) r1+=data[i];
	    if(i >= i2 && i < i2e) r2+=data[i];

	    var col=JU.grid[ Math.round(i*cm) ]; if(!col) col='FFaa88';
	    c.fillStyle = '#'+col;
	    c.fillRect(i*2,JU.height-x*2,1,x*2+1 );
	}

	dom.s('result1t',r1);
	dom.s('result2t',r2);


	var rr = r1+r2;
	var prc = (rr==0 ? 0 : 100/(r1+r2));
	// var q=(r1?r2/r1:100
	dom.s('resdiv1',Math.floor(prc*r1)+'%');
	dom.s('resdiv2',Math.floor(prc*r2)+'%');

/*
        c.globalAlpha = 0.1;
	c.fillStyle = "red";
        c.fillRect(JU.range.range1*2, 0, JU.range.width1*2, JU.height);
	c.fillStyle = "green";
        c.fillRect(JU.range.range2*2, 0, JU.range.width2*2, JU.height);
*/


    },

    get_ctx: function( stream ) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
	// Создаем аудио-контекст
	JU.ctx = new AudioContext();
	// Создаем анализатор
	JU.analyser = JU.ctx.createAnalyser();

	JU.analyser.smoothingTimeConstant = JU.time; // 0.3 частота опроса с которой анализатор будет требовать данные
	JU.analyser.fftSize = JU.fft; // 512 размерность преобразования Фурье (сколько данных анализа получить: fftSize/2) 

//	JU.analyser.fftSize=2048; // The desired initial size of the FFT for frequency-domain analysis.
//	JU.analyser.maxDecibels=-30; // The desired initial maximum power in dB for FFT analysis.
//	JU.analyser.minDecibels=-100; // The desired initial minimum power in dB for FFT analysis.
//	JU.analyser.smoothingTimeConstant=0.8; // The desired initial smoothing constant for the FFT analysis.

	JU.processor = JU.ctx.createScriptProcessor(JU.datalen, 1, 1); // 2048
	JU.bands = new Uint8Array(JU.analyser.frequencyBinCount); // это будет 256

        JU.processor.connect(JU.ctx.destination); // cвязываем все с выходом AudioContext.destination — звуковой выход по умолчанию
        JU.processor.onaudioprocess = function () { // подписываемся на событие изменения входных данных
            JU.analyser.getByteFrequencyData(JU.bands); // копирует данные анализатора в массив
            if( !(JU.mp3 && JU.mp3.paused) ) JU.draw(JU.bands);
        };

	if( JU.file ) { // file
	    if(JU.mp3) JU.mp3.removeEventListener("play",JU.get_ctx);
	    JU.source = JU.ctx.createMediaElementSource(JU.mp3); // отправляем на обработку в AudioContext
	    JU.source.connect(JU.ctx.destination); // выводить звук в колонки, если файл
	} else { // mic
	    JU.source = JU.ctx.createMediaStreamSource( stream ); // отправляем на обработку в AudioContext
	}

        JU.source.connect(JU.analyser); // связываем источник и анализатором
        // JU.source.connect(JU.processor); // связываем анализатор с интерфейсом, из которого он будет получать данные
        // JU.analyser.connect(JU.ctx.destination);
        JU.analyser.connect(JU.processor);
    },

    rerange: function(){
	var W=npx(dom('canvas').clientWidth), k=W / (JU.fft/2);
	var fn=function(n) {
	    var rl=JU.range['range'+n],rw=JU.range['width'+n];
	    dom('range'+n).value=rl;
	    dom('width'+n).value=rw;
	    dom.s('range'+n+'t',rl);
	    dom.s('width'+n+'t',rw);

	    var x=Math.floor(k*rl);
	    var w=Math.floor(k*rw);
	    if( x+w > W ) x = W-w;
	    dom('rang'+n).style.left = 2+x+'px';
	    dom('rang'+n).style.width = w+'px';
	};
	fn(1);
	fn(2);
    },

    www_range: function(mode,e) {
     if(mode) {
	var name=e.id;
	var val=e.value;
	JU.range[name]=val;
	dom.s(name+'t',val);
     }
     JU.rerange();

    },

    www_play: function(e) {
	alert(e.innerHTML);
    },

    www_cb: function(e) {
        if(!JU.mp3) {
		JU.mp3 = new Audio();
		JU.mp3.id='mp3';
		JU.mp3.src = JU.filename;
		JU.mp3.controls = true;
		// document.body.insertBefore(JU.mp3,document.body.firstChild);
		dom('mp3player').appendChild(JU.mp3);
        }

	if( e.checked ) {
	    dom('mp3player').style.display='none';
	    JU.file=false;
	} else {
	    JU.file=JU.filename;
	    dom('mp3player').style.display='block';
	}
	JU.Analyse();
    },

    Analyse: function () {
	if(JU.file) {
	    JU.mp3.addEventListener("play", JU.get_ctx ); // canplay Подписываемся на событие
	} else { // mic
	    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	    navigator.getUserMedia( { audio: true, video: false }, JU.get_ctx , function(e){ alert('error122') } );
	}
    },

};


function grid() {
    function FF(x) { return x.toString(16).toUpperCase().padStart(2,'0'); }
    var x,m=[];
    for(x=0;x<256;x++) m.push('FF'+FF(x)+'00');
    for(x=255;x>=0;x--) m.push(FF(x)+'FF00');
    for(x=0;x<256;x++) m.push('00FF'+FF(x));
    for(x=255;x>=0;x--) m.push('00'+FF(x)+'FF');
    for(x=0;x<256;x++) m.push(FF(x)+'00FF');
    return m;
}

// E N D