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
  return function(parent, width, height, skew, rotate, borderWidth){    
    var $this = this;
    
    $this.supported = $.support.opacity; // This is not the best functional test, but it's kinda simple
    
    $this.width = width||1600;
    $this.height = height||1330;
    $this.skew = skew||20;
    $this.rotate = rotate||-10;
    $this.borderWidth = borderWidth||10;
    $this.parent = $(parent||'body');
    $this.container = $(document.createElement('div')).attr('id', 'inclined');
    $this.parent.append($this.container);
    $this.screen = null;
    $this.iframe = null;
            
    $this.show = function(){
      if(!$this.supported) return;

      $this.container.show();
      $this.parent.css({overflow:'hidden'});
      return $this;
    }
    $this.hide = function(){
      if(!$this.supported) return;

      $this.container.hide();
      $this.parent.css({overflow:''});
      return $this;
    }
    $this.build = function(){
      if(!$this.supported||$this.screen) return;
              
      // Create the background for the screen
      $this.container.append($(document.createElement('div')).attr('class', 'background'));
      // Create the screen
      $this.container.append($(document.createElement('div')).html('<div></div>').attr('class', 'screen'));
      $this.screen = $('.screen div');
              
      // Hide the UI until prompted
      $this.container.hide();
              
      // Create a shadow div
      $this.screen.append($(document.createElement('div')).html('<span></span>').attr('class', 'shadow'));
      // Create border divs
      for (var i=1; i<=$this.borderWidth; i++) {
        $this.screen.append($(document.createElement('div')).css({transform:'translate(-'+i+'px,'+i+'px)'}));
      }
      // Create a iframe
      $this.iframe = $(document.createElement('iframe')).attr('scrolling', 'no');
      $this.iframe.load(function(){
        $this.setIntroduction()
        $this.placePins()
      });
      $this.screen.append($this.iframe);
      // Create a blind
      $this.screen.append($(document.createElement('div')).attr('class', 'blind'));
      
      // Create text nodes
      $this.container.append($(document.createElement('div')).attr('class', 'introduction').html('<h1></h1><p></p>'));

      // Create close link
      var closeLink = $(document.createElement('a')).attr('class', 'close').attr('href', '#').html('End tour');
      $this.container.append(closeLink);
      closeLink.click(function(){
        $this.hide();
        return false;
      });
      
      return $this;
    }
    $this.update = function(){
      if(!$this.supported) return;

      // Set the size of the iframe, borders and shadows
      $('#inclined .screen iframe, #inclined .screen div div').height($this.height).width($this.width);
      // Skew and rotate the screen
      $this.screen.css({transform:'skew('+$this.skew+'deg) rotate('+$this.rotate+'deg)'});
      // Set the height of the screen
      var _w = $('#inclined .screen').width();
      var _h = $('#inclined .screen').height();
      var scale = Math.floor(Math.min(_h/$this.height*.7, _w/$this.width*.5)*100)/100.0;
      $('#inclined .screen').css({transform:'scale('+scale+')', top:(_h*-.1)+'px', left:(_w*-.08)+'px'});
      // Update pins
      $this.placePins();
      
      return $this;
    }
    $(window).resize($this.update);
    $(window).load($this.update);

    $this.clearPins = function(){
      $this.container.find('.pin').remove();
    }
    $this.placePins = function(){
      $this.clearPins();
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
        var pin = $(document.createElement('div')).addClass('pin').html('<div><h2></h2><p></p></div>').css({top:pinTop+'px', left:pinLeft+'px'});
        pin.find('h2').html($$(el).attr('inclined_headline'));
        pin.find('p').html($$(el).attr('inclined_body'));
        $this.container.append(pin);
      });
    }

    $this.setIntroduction = function(headline, description){
      var $$ = $this.iframe[0].contentWindow.jQuery; // reference to the jQuery instance within the loaded iframe; no `$$` is not a good name.
      if($$===undefined) return;
      $('#inclined .introduction h1').html('');
      $$('meta[name=inclined_title]').each(function(i,el){
        $('#inclined .introduction h1').html($$(el).attr('content'));
      });
      $('#inclined .introduction p').html('');
      $$('meta[name=inclined_description]').each(function(i,el){
        $('#inclined .introduction p').html($$(el).attr('content'));
      });
      return $this;
    }
    
    $this.href = function(href){
      if(!$this.supported) return;

      $this.iframe.attr('src', href||location.href);
      return $this;
    }
            
    $this.build();
    $this.update();
    return $this;
  }
}(jQuery)); 