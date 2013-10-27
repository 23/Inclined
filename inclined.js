"use strict";

/*
* Inclined is a tour, help or guide mode for the browsers.
* It takes any web page and makes it easy to create a guided
* tour of elements and features within it.
*
* MIT Licensed
* http://www.23developer.com/opensource
* http://github.com/23/inclined
* Steffen Tiedemann Christensen, steffen@23company.com
*/

var Inclined = (function($) {
  return function(defaultPage, parent, width, height, skew, rotate, borderWidth){    
    var $this = this;

    // BOOTSTRAP
    $this.defaultPage = defaultPage||'';
    $this.width = width||1600;
    $this.height = height||1330;
    $this.skew = skew||20;
    $this.rotate = rotate||-10;
    $this.borderWidth = borderWidth||10;
    $this.parent = $(parent||'body');
    $this.screen = null;
    $this.iframe = null;



    /* POSSIBLY SHOW LINKS TO THE TOUR */
    $this.showTourLinks = function(){
      $('.inclined-link').toggle($this.supported && ($this.defaultPage.length || $('meta[name=inclined_title]').length>0));
    }
    
    // SUPPORTED OR NOT?
    // Simple functional test for whether 3d transforms are supported
    var has3d = function(){
      try {
        var el = document.createElement('p'),
        has3d,
        transforms = {
          'webkitTransform':'-webkit-transform',
          'OTransform':'-o-transform',
          'msTransform':'-ms-transform',
          'MozTransform':'-moz-transform',
          'transform':'transform'
        };
        document.body.insertBefore(el, null);
        for(var t in transforms){
          if( el.style[t] !== undefined ){
            el.style[t] = 'translate3d(1px,1px,1px)';
            has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
          }
        }
        document.body.removeChild(el);
        return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
      }catch(e){
        return false;
      }
    }
    $this.supported = has3d() && $(window).width()>800;
    $this.showTourLinks();
    if(!$this.supported) return $this;


    // Create basic containers for the Inclined object
    $this.container = $(document.createElement('div')).attr('id', 'inclined').css({display:'none'});
    $this.parent.append($this.container);


    /* HANDLE SHOW AND HIDE OF THE FULL UI */
    $this.show = function(){
      if(!$this.supported) return;

      $this.container.show();
      $this.update();
      $this.parent.css({overflow:'hidden'});
      return $this;
    }
    $this.hide = function(){
      if(!$this.supported) return;

      $this.container.hide();
      $this.parent.css({overflow:''});
      return $this;
    }
    $this.visible = function(){
      return ($this.container.css('display') != 'none');
    }
    

    /* BUILD THE UI ON FIRST LOAD */
    $this.build = function(){
      if(!$this.supported||$this.screen) return;
              
      // Create the background for the screen
      $this.container.append($(document.createElement('div')).attr('class', 'inclined-background'));
      // Create the screen
      $this.container.append($(document.createElement('div')).html('<div></div>').attr('class', 'inclined-screen'));
      $this.screen = $('.inclined-screen div');
              
      // Hide the UI until prompted
      $this.container.hide();
              
      // Create a shadow div
      $this.screen.append($(document.createElement('div')).html('<span></span>').attr('class', 'inclined-shadow'));
      // Create border divs
      for (var i=1; i<=$this.borderWidth; i++) {
        var transformProperty = 'translate(-'+i+'px,'+i+'px)';
        $this.screen.append($(document.createElement('div')).css({
          '-webkit-transform':transformProperty,
          '-ie-transform':transformProperty,
          '-moz-transform':transformProperty,
          '-o-transform':transformProperty,
          'transform':transformProperty
        }));
      }
      // Create a iframe
      $this.iframeBackground = $(document.createElement('div')).addClass('inclined-iframe-background');
      $this.iframe = $(document.createElement('iframe')).attr('scrolling', 'no').css({visibility:'hidden', opacity:0});
      $this.iframe.load(function(){
        // Update content of the tour
        $this._setIntroduction();
        $this._handleFlow();
        $this._placePins();
        $this._attachIframeKeyEvents();
        $this.iframe.css({visibility:'visible', opacity:1});
      });
      $this.iframeBackground.append($this.iframe)
      $this.screen.append($this.iframeBackground);
      // Create a blind
      $this.screen.append($(document.createElement('div')).attr('class', 'inclined-blind'));
      
      // Create text nodes
      $this.container.append($(document.createElement('div')).attr('class', 'inclined-introduction').html('<h1></h1><p></p>'));

      // Create previous and next
      var previousLink = $(document.createElement('a')).attr('class', 'inclined-previous-link').attr('href', '#').hide();
      $this.container.append(previousLink);
      previousLink.click(function(){
        $this.showPreviousUrl();
        return false;
      });
      var nextLink = $(document.createElement('a')).attr('class', 'inclined-next-link').attr('href', '#').hide();
      $this.container.append(nextLink);
      nextLink.click(function(){
        $this.showNextUrl();
        return false;
      });

      // Create close link
      var closeLink = $(document.createElement('a')).attr('class', 'inclined-close').attr('href', '#').html('End tour');
      $this.container.append(closeLink);
      closeLink.click(function(){
        $this.hide();
        return false;
      });

      // Update UI
      $this.update();
      
      return $this;
    }


    /* UPDATE THE UI ON EVERY LOAD */
    $this.update = function(){
      $this.showTourLinks();
      if(!$this.supported||!$this.screen) return;

      // Set the size of the iframe, borders and shadows
      $('#inclined .inclined-screen iframe, #inclined .inclined-screen div div').height($this.height).width($this.width);
      // Skew and rotate the screen
      var transformProperty = 'skew('+$this.skew+'deg) rotate('+$this.rotate+'deg)';
      $this.screen.css({
        '-webkit-transform':transformProperty,
        '-ie-transform':transformProperty,
        '-moz-transform':transformProperty,
        '-o-transform':transformProperty,
        'transform':transformProperty
      });
      // Set the height of the screen
      var _w = $('#inclined .inclined-screen').width();
      var _h = $('#inclined .inclined-screen').height();
      var scale = Math.floor(Math.min(_h/$this.height*.7, _w/$this.width*.5)*100)/100.0;
      var transformProperty = 'scale('+scale+')';
      $('#inclined .inclined-screen').css({
        '-webkit-transform':transformProperty,
        '-ie-transform':transformProperty,
        '-moz-transform':transformProperty,
        '-o-transform':transformProperty,
        'transform':transformProperty,
        top:(_h*-.1)+'px', 
        left:(_w*-.08)+'px'
      });
      // Update pins
      $this._placePins();
      
      return $this;
    }
    $(window).resize($this.update);
    $(window).load($this.update);


    /* HELPER METHODS FOR MANAGING UI STATE */
    $this._clearPins = function(){
      $this.container.find('.inclined-pin').remove();
    }
    $this._placePins = function(){
      $this._clearPins();
      var $$ = $this.iframe[0].contentWindow.jQuery; // reference to the jQuery instance within the loaded iframe; no `$$` is not a good name.
      if($$===undefined) return;
      $$('*[inclined_headline]').each(function(i,el){
        // First, place a div within the skewed area to hit the middle of the zone
        var dummyTop = $$(el).offset().top + ($$(el).height()/2);
        var dummyLeft = $$(el).offset().left + ($$(el).width()/2);
        var dummy = $(document.createElement('span')).css({position:'absolute', width:'1px', height:'1px', top:dummyTop+'px', left:dummyLeft+'px'});
        $this.screen.append(dummy);
        var pinTop = dummy.offset().top - 25;
        var pinLeft = dummy.offset().left - 25;
        dummy.remove();
        // Now place the pin in the same spot, but unskewed
        var pin = $(document.createElement('div')).addClass('inclined-pin').html('<div><h2></h2><p></p></div>').css({top:pinTop+'px', left:pinLeft+'px'});
        pin.attr('inclined_priority', $(el).attr('inclined_priority')||1);
        pin.find('h2').html($$(el).attr('inclined_headline'));
        pin.find('p').html($$(el).attr('inclined_body'));
        pin.mouseover(function(){
          $this.setActivePin(pin);
        });
        $this.container.append(pin);
      });
      
      // Show the first pin, please
      $this.setActivePin(1);
    }
    $this._handleFlow = function(){
      $this.nextUrl = '';
      $this.previousUrl = '';
      var $$ = $this.iframe[0].contentWindow.jQuery; // reference to the jQuery instance within the loaded iframe; no `$$` is not a good name.
      if($$!==undefined) {
        $$('meta[name=inclined_next_url]').each(function(i,el){
          $this.nextUrl = $$(el).attr('content');
        });
        $$('meta[name=inclined_previous_url]').each(function(i,el){
          $this.previousUrl = $$(el).attr('content');
        });
      }
      $('#inclined .inclined-next-link').toggle($this.nextUrl.length>0);
      $('#inclined .inclined-previous-link').toggle($this.previousUrl.length>0);
    }
    $this._setIntroduction = function(headline, description){
      var $$ = $this.iframe[0].contentWindow.jQuery; // reference to the jQuery instance within the loaded iframe; no `$$` is not a good name.
      if($$===undefined) return;
      $('#inclined .inclined-introduction h1').html('');
      $$('meta[name=inclined_title]').each(function(i,el){
        $('#inclined .inclined-introduction h1').html($$(el).attr('content'));
      });
      $('#inclined .inclined-introduction p').html('');
      $$('meta[name=inclined_description]').each(function(i,el){
        $('#inclined .inclined-introduction p').html($$(el).attr('content'));
      });
      return $this;
    }


    /* MANAGE THE PAGE/URL OF THE TOUR */
    $this.nextUrl = '';
    $this.previousUrl = '';
    $this.showNextUrl = function(){
      if($this.nextUrl.length>0) $this.href($this.nextUrl);
    }
    $this.showPreviousUrl = function(){
      if($this.previousUrl.length>0) $this.href($this.previousUrl);
    }
    $this.href = function(href){
      if(!$this.supported) return;
      $this.build();

      $this._clearPins();

      // Clear next/previous
      $this.previousUrl = $this.nextUrl = '';
      $('#inclined .inclined-next-link, #inclined .inclined-previous-link').hide();

      if(!href) {
        if($('meta[name=inclined_title]').length||!$this.defaultPage.length) {
          href = location.href.split('#')[0];
        } else {
          href = $this.defaultPage;
        }
      }
      $this.iframe.css({visibility:'hidden', opacity:0}).attr('src', href + (/\?/.test(href) ? '&' : '?') + 'inclinedframe='+Math.random());
      return $this;
    }


    /* MANAGE PINS WITHIN THE TOUR */
    $this.prioritizedPins = function(){
      var priorities = [];
      $.each($('#inclined .inclined-pin'), function(i,el){
        var priority = $(el).attr('inclined_priority')||1;
        if(!priorities[priority]) priorities[priority] = [];
        priorities[priority].push(el);
      });
      return $.map(priorities, function(n){return n;});
    }
    $this.activePin = null;
    $this.setActivePin = function(el){
      $('#inclined .inclined-pin.inclined-active').removeClass('inclined-active');
      var all = $this.prioritizedPins();
      var count = all.length;
      if(count==0) {
        $this.activePin = null;
        return;
      }
      // By number
      if(!isNaN(el)) {
        if(el>count) {
          if(this.nextUrl.length>0) {
            $this.showNextUrl();
            return;
          } else {
            el = 1;
          }
        }
        if(el<=0) {
          if(this.previousUrl.length>0) {
            $this.showPreviousUrl();
            return;
          } else {
            el = 1;
          }
        }
        el = all[el-1];
      }
      // By element
      $(el).addClass('inclined-active');
      // Update index
      $this.activePin = ($.inArray(el, all))+1;
    }
    $this.nextActivePin = function(){
      if($this.activePin) {
        $this.setActivePin($this.activePin+1);
      } else {
        $this.setActivePin(1);
      }
    }
    $this.previousActivePin = function(){
      if($this.activePin) {
        $this.setActivePin($this.activePin-1);
      } else {
        $this.setActivePin(1);
      }
    }

    // Manage keyboard events to navigate tour.
    $this._keyHandler = function(e){
      if(!$this.supported || !$this.visible()) return;
      if(!e.ctrlKey && !e.altKey && !e.metaKey) {
        if(e.charCode==32 || e.keyCode==13 || e.keyCode==32||e.keyCode==39) {
          $this.nextActivePin();          
        }
      }
      if(e.keyCode==37) {
        $this.previousActivePin();
      }
    }
    $this._attachIframeKeyEvents = function(){
      // This is incredible ugly, but after loading the page iframe
      // keyboard focus is stolen away from the parent frame; and the 
      // only solution is to listen to keyboard events from the iframe
      // itself.
      try {
        var cw = $this.iframe[0].contentWindow;
        if(cw.jQuery) {
          cw.jQuery(cw).keypress($this._keyHandler);
          cw.jQuery(cw).keydown($this._keyHandler);
        }
      }catch(e){}
    }
    $(document).keypress($this._keyHandler);
    $(document).keydown($this._keyHandler);
            



    if(window.location.hash=='#inclined') $this.href().show();
    return $this;
  }
}(jQuery)); 