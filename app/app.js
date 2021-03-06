/*
 * Speech recognition, recording and service call
 * Pocketsphinx is in the service dir. It's called from there.
 * The service copies the recorded file from /media/internal/pocketsphinx/temp/data.wav to the service's data/data.wav
 *
 * The actual recognition is done by pocketsphinx_batch, part of CMU sphinx (http://cmusphinx.sourceforge.net/), wich is released under the BSD license. 
 * The audio recording is based on the MediaCapture sample from the sdk (BSD license) and the Palm txjs-fortunecookie sample (https://github.com/palm/txjs-fortunecookie, BSD license).
 *
 * This app is distributed as is, under the BSD license.

Copyright (c) 2013, KappLine.nl
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of KappLine.nl nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE REGENTS AND CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */

 enyo.kind({
	name: "FortuneCookieApp",
	kind: "VFlexBox",
	components: [
		{ kind: "FortuneService", name: "fortunes" },
		{ kind: "Header", content: "Pocketsphinx for webOS - speech recognition" },
		
		{kind: "enyo.MediaCapture", name: "mediaCaptureSound", onInitialized: "loadMediaCap", onLoaded: "mediaCapLoaded",onError: "someErrorOccured",onAudioCaptureComplete:"captureComplete"},
		{kind: "ApplicationEvents", onLoad: "onLoad"},
		{kind: "HtmlContent", name: "output", flex: 1, className: "fortuneCookie", content: "Press record, to record your audio. Press again to recognise it." },
		{kind: "Button", name:"recordSoundButton",className: "enyo-button-negative",caption: "Record",  onclick: "recordClicked"},
	],
	
	onLoad: function(){	
		this.load();
	},
	load: function(){	
		this.$.mediaCaptureSound.initialize();
		
	},
	unload: function(){	
		this.$.mediaCaptureSound.unload();
	},
	loadMediaCap: function(inSender, inResponse){
		
		for (var format in inResponse){
			console.log("ENDA " + format)
			if(format.search("audio")==0){
				md = inResponse[format].deviceUri; 
				for (i = 0; inResponse[format].supportedAudioFormats.length != i; ++i) {
					fmt = inResponse[format].supportedAudioFormats[i];
					
					if (fmt.mimetype == "audio/vnd.wave") {
						break;
					}
				}
				console.log(JSON.stringify(fmt));
				break;	
			}			
		}
		this.$.mediaCaptureSound.load(md, fmt);
	},
	mediaCapLoaded: function(){
		this.showScrim(false);
		var can = this.$.canvas.hasNode();
	},
	recordClicked:function()
	{
		if (!this.recording) {
			this.$.recordSoundButton.caption = "Recording...";
			this.$.recordSoundButton.render();
			this.recording = true;
			timestamp = new Date().getTime();
			var file = "/media/internal/pocketsphinx/temp/data.wav";
			var audioCaptureOptions = {"mimetype":"audio/vnd.wave","codecs":"1","bitrate":128000,"samplerate":8000};
			
			this.$.mediaCaptureSound.startAudioCapture(file, audioCaptureOptions);
			this.timestart = new Date().getTime()
			this.timer = window.setInterval(this.updateTime1.bind(this), 1000);
			
		}else{			
			console.log("WTF")
			this.recording = false;
			this.$.mediaCaptureSound.stopAudioCapture();
			window.clearInterval(this.timer);
			
			this.$.output.setContent("Recognising ..."); 
			this.$.fortunes.fetchNewFortune(enyo.bind(this, 
			function(fortune) { 
				this.$.output.setContent(fortune); 
			}));
		}	
	},
	captureComplete:function()
	{
		console.log("WTF COMPLETE")
		this.$.recordSoundButton.setContent( "Record");
	},
	updateTime1: function(insender){
		if(!this.timestart){
			this.timestart = new Date();
		}
		var timeend = new Date();
		var timedifference = timeend.getTime() - this.timestart
		timeend.setTime(timedifference);
		var minutes_passed = timeend.getMinutes();
		if(minutes_passed < 10){
			minutes_passed = "0" + minutes_passed;
		}
		var seconds_passed = timeend.getSeconds();
		if(seconds_passed < 10){
			seconds_passed = "0" + seconds_passed;
		}	
		
		this.$.recordSoundButton.setContent ( "Recording... " +  minutes_passed + ":" + seconds_passed);
	},
 });
 
