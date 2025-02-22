
// DOSGames.com custom Javascript
// Darren Hewer 2018

/*!
* screenfull
* v3.3.2 - 2017-10-27
* (c) Sindre Sorhus; MIT License
*/
!function(){"use strict";var a="undefined"!=typeof window&&void 0!==window.document?window.document:{},b="undefined"!=typeof module&&module.exports,c="undefined"!=typeof Element&&"ALLOW_KEYBOARD_INPUT"in Element,d=function(){for(var b,c=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],d=0,e=c.length,f={};d<e;d++)if((b=c[d])&&b[1]in a){for(d=0;d<b.length;d++)f[c[0][d]]=b[d];return f}return!1}(),e={change:d.fullscreenchange,error:d.fullscreenerror},f={request:function(b){var e=d.requestFullscreen;b=b||a.documentElement,/ Version\/5\.1(?:\.\d+)? Safari\//.test(navigator.userAgent)?b[e]():b[e](c&&Element.ALLOW_KEYBOARD_INPUT)},exit:function(){a[d.exitFullscreen]()},toggle:function(a){this.isFullscreen?this.exit():this.request(a)},onchange:function(a){this.on("change",a)},onerror:function(a){this.on("error",a)},on:function(b,c){var d=e[b];d&&a.addEventListener(d,c,!1)},off:function(b,c){var d=e[b];d&&a.removeEventListener(d,c,!1)},raw:d};if(!d)return void(b?module.exports=!1:window.screenfull=!1);Object.defineProperties(f,{isFullscreen:{get:function(){return Boolean(a[d.fullscreenElement])}},element:{enumerable:!0,get:function(){return a[d.fullscreenElement]}},enabled:{enumerable:!0,get:function(){return Boolean(a[d.fullscreenEnabled])}}}),b?module.exports=f:window.screenfull=f}();



$(document).ready(function(){

    "use strict";

    
    
    // ----------------------------------------------------------------------
    // Open/close accordion boxes
    
    $(document).on('click', '.faq-q', function(){
        $(this).toggleClass('selected').next().slideToggle();
    });
    
    
    
    // ----------------------------------------------------------------------
    // Search autocomplete setup
    
    $('#terms, #sterms, .mobileSearch').focusin(function(){
        if (typeof searchData !== 'undefined') {
            var self = $(this);
            self.autocomplete({
                lookup: searchData,
                minChars: 2,
                width: 'flex',
                showNoSuggestionNotice: true,
                noSuggestionNotice: 'No games found with matching name',
                formatResult: function (suggestion, currentValue) {
                    return '<a href="/game/' + suggestion.data + '">' + suggestion.value + '</a>';
                },
                beforeRender: function(container, suggestions) {
                    if (suggestions.length > 0) {
                        container.prepend('<div class="autocomplete-header">Games that match:</div>');
                    }
                }
                //onSelect: function (suggestion) {
                //}
            });
        }
    });



    // ----------------------------------------------------------------------
    // Initialize Bootstrap popover & tooltip
    
    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();

    // Close popover on any click outside
    $('html').on('click', function(e) {
        if (!$(e.target).is('[data-toggle="popover"]') && $(e.target).closest('.popover').length === 0) {
            $('[data-toggle="popover"]').popover('hide');
        }
    });

    
    
    // ----------------------------------------------------------------------
    // Header & mobile search placeholder color on focus
    
    var headerSearch = $('.headerSearch input, .mobileSearch');
    headerSearch.on('focusin', function(){
        $(this).addClass('focused');
    });
    headerSearch.on('focusout', function(){
        $(this).removeClass('focused');
    });

    
    
    // ----------------------------------------------------------------------
    // Ratings
    
    // Add rating titles
    $('[data-target="#modalRate"]').attr('title', 'Click to rate this game');

    // Rating modal
    $('#modalRate').on('show.bs.modal', function (e) {
        var clicked = $(e.relatedTarget),
            id = clicked.attr('data-gid'),
            name = clicked.attr('data-gname');
        // Truncate name
        if (name.length > 26) {
            name = name.slice(0,25).trim() + '...';
        }
        $('#modalRate .modalRate-gameName').text(name);
        $('#modalRate .rateSubmit').attr('disabled', 'disabled');
        $('#modalRate').attr('aria-labelledby', 'Rate '+name);
        $('input#gid').val(id);
    });
    $('#modalRate').on('hide.bs.modal', function () {
        $('.rateButtons input').prop("checked", false);
    });
    $('.rateButtons label').click(function(){
        setTimeout(function(){
            var dis = true;
            $('.rateButtons input').each(function(){
                if ($(this).prop('checked')) {
                    $('#modalRate .rateSubmit').prop("disabled", false).attr('title','Click to submit your rating!');
                    dis = false;
                }
            });
            if (dis) { $('#modalRate .rateSubmit').prop("disabled", true); }
        }, 50);
    });
    $('#modalRate .rateCancel').click(function(){
        $('#modalRate').modal('hide');
    });

    // Submit form via AJAX (jQuery)
    var savingDots;
    $('.rateSubmit').click(function(){
        var gid = $("input#gid").val(),
            rating = $("input[name=userRate]:checked").val(),
            ajaxTime = new Date().getTime();
        $("#modalRate").modal('hide');
        // Show dots while saving
        savingDots = setInterval(function(){
            $('#modalSaving .savingDots').append('.');
        }, 250);
        $('#modalSaving').modal('show');
        $.ajax({
            url: '/save-rating.php',
            type: 'post',
            data: {
                gid: gid,
                rating: rating
            },
            success: function(data) {
                var errormsg = '', splitdata;
                if (data.startsWith("OK")) {
					//console.log(data);
                    var totalTime = new Date().getTime()-ajaxTime,
                        waitTime = 2000 - totalTime;
                    if (waitTime < 0) { waitTime = 0; }
                    setTimeout(function(){
                        $('[data-target="#modalRate"][data-gid="'+gid+'"]')
                            .attr('data-modal','').attr('data-target','')
                            .attr('title', 'Thanks for rating this game!')
                            .addClass('alreadyRated');
                        clearTimeout(savingDots);
                        $('#modalSaving .savingDots').append(' <span class="color-cyan">DONE!</span>');
						// Remove link from stars
						$('.stars-'+gid).parent().contents().unwrap();
						$('.stars-thanks-'+gid).show();
						splitdata = data.split('-');
						// Update count
						$('.vote-count-'+gid).text(splitdata[1]);
						// Update rating
						if (splitdata[1] === '1') {
							$('.zeroRatings-'+gid).html('<span class="stars-'+gid+' alreadyRated">'+splitdata[2]+'</span>');
						} else {
							$('.stars-'+gid).html(splitdata[2]);
						}
						// Finally close the modal!
                        setTimeout(function(){
                            $("#modalSaving").modal('hide');
                            $('#modalSaving .savingDots').text('');
                        }, 2000);
                    }, waitTime);
                } else {
                    // Error?
                    if (data === 'BAD-ID') {
                        errormsg = "The game ID provided is invalid.";
                    } else if (data === 'BAD-RATING')  {
                        errormsg = "The rating provided is invalid.";
                    } else if (data === 'ID-NOT-FOUND') {
                        errormsg = "The game ID was not found.";
                    } else if (data === 'BAD-DB') {
                        errormsg = "There was a problem with the database.";
                    } else if (data === 'DUP') {
                        errormsg = "A rating for this game from your IP address was found.";
                    } else {
                        errormsg = "An unknown error occurred.";
                    }
                    clearTimeout(savingDots);
                    $('#modalSaving .savingDots').html('<span class="color-red">ERROR:</span> ' + errormsg);
                    $("#modalSaving").modal('hide');
                    setTimeout(function(){
                        $("#modalSaving").modal('hide');
                        $('#modalSaving .savingDots').text('');
                    }, 5000);
                    console.error(data);
                }
            } // end success
        }); // end AJAX call
    }); // end rateSubmit AJAX

    
    
    // ----------------------------------------------------------------------
    // Toggle mobile MENU button color on click
    
    function toggleOverlay(){
        if ($('.navbar-dark .navbar-toggler').hasClass('focus')) {
            $('.overlay').fadeIn();
        } else {
            $('.overlay').fadeOut();
        }
    }
    
    $('.navbar-dark .navbar-toggler').click(function(){
        $(this).toggleClass('focus');
        toggleOverlay();
    });


    
    // ----------------------------------------------------------------------
    // Toggle MENU off when user clicks outside dropdown menu
    // Source: https://stackoverflow.com/a/46741117/3884381
    
    $(document).click(function (event) {
        var clickover = $(event.target);
        var _opened = $(".navbar-collapse").hasClass("show");
        if (_opened === true && !clickover.hasClass("navbar-toggler")) {
            $(".navbar-toggler").click();
            toggleOverlay();
        }
    });


    
    // ----------------------------------------------------------------------
    // Show download help message
    
    $('.btn-download').click(function(){
        $('.downloadMessage').slideDown();
    });
    
    
    
    // ----------------------------------------------------------------------
    // Show message on contact form when doing error report
    
    $('#reason').change(function(){
        if ($('#reason').val() === 'broken_link') {
            $('.reportMessage').show();
        } else {
            $('.reportMessage').hide();
        }
    });
    
    
    
    // ----------------------------------------------------------------------
    // Filters box show/hide

    // Hide box if user previously hid it via localstorage
    if (localStorage.getItem("filters") === "closed" && $('body').attr('data-template') !== 'search') {
        $('.hideFilters').html('<span class="i-filter"></span>Show filters');
        $('.filters-container').hide();
    }
    
    // Show/hide filters container on click
    $(document).on('click', '.hideFilters', function(e){
        var form = $('.filters-container');
        e.preventDefault();
        if (form.is(":visible")) {
            form.slideUp();            
            $(this).html('<span class="i-filter"></span>Show filters');
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem("filters", "closed");
            }
        } else {
            form.slideDown();
            $(this).html('<span class="i-cancel"></span>Hide filters');
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem("filters", "open");
            }
        }
    });
    
    
    
    // ----------------------------------------------------------------------
    // Sortby submit if changed when filters list is closed
    
    $(document).on('change', '#sortby', function(){
        if (!$('.filters-container').is(":visible")) {
            $('#filtersForm').submit();
            console.log('go');
        }
    });

    
    
    // ----------------------------------------------------------------------
    // Smiley easter egg
    
    var smileyee = false;
    $('.smileyee').click(function(e){
        var sm = $(this),
            x = e.clientX,
            y = e.clientY,
            steps = 12, // # of pixels to move per interval
            wait = 50, // Delay 
            dir_x = Math.round(Math.random()) === 0 ? -1 : 1,
            dir_y = Math.round(Math.random()) === 0 ? -1 : 1,
            max_x = (typeof window.outerWidth != 'undefined')?Math.max(window.outerWidth, $(window).width()):$(window).width(),
            max_y = (typeof window.outerHeight != 'undefined')?Math.max(window.outerHeight, $(window).height()):$(window).height(),
            ssize_x, ssize_y;
        // Start smiley run
        if (smileyee === false) {
            sm.addClass('smileyee-lg').css('top',y+'px').css('left',x+'px');
            ssize_x = sm.outerWidth();
            ssize_y = sm.outerHeight();
            smileyee = setInterval(function(){
                for(var q = 1; q <= steps; q++) {
                    // X hits right edge
                    if (x+dir_x >= max_x - ssize_x) {
                        x = max_x - ssize_x;
                        dir_x = -1;
                        if (steps > 1) steps -= 1;
                    // X hits left edge
                    } else if (x+dir_x <= 0) {
                        x = 0;
                        dir_x = 1;
                        if (steps > 1) steps -= 1;
                    }
                    // Y hits right edge
                    if (y+dir_y >= max_y - ssize_y) {
                        y = max_y - ssize_y;
                        dir_y = -1;
                        if (steps > 1) steps -= 1;
                    // Y hits left edge
                    } else if (y+dir_y <= 0) {
                        y = 0;
                        dir_y = 1;
                        if (steps > 1) steps -= 1;
                    }
                    // Move one pixel in the direction
                    x += dir_x;
                    y += dir_y;
                }
                sm.css('top',y+'px').css('left',x+'px');
            }, wait);
        // Stop smiley run
        } else {
            clearInterval(smileyee);
            smileyee = false;
            sm.removeClass('smileyee-lg');
        }
    });

    
    
    // ----------------------------------------------------------------------
    // Review screenshot modal window handling
    
    $('.review-screenshot, .content-screenshot, .catalog-screenshot, .screenshot').click(function(e){
        var src = $(this).attr('src'), target = "#modalScreen";
		e.preventDefault();
		if ($(this).closest('.modal').length !== 0) return;
		if ($(this).hasClass('catalog-screenshot')) target = "#modalCatalog";
		if ($(this).hasClass('screenshot')) target = "#modalGeneric";
        $(target).find('img').attr('src', src);
        $(target).modal('show');
    });
    $('.screenClose').click(function(e){
		e.preventDefault();
        $('#modalScreen, #modalCatalog, #modalGeneric').modal('hide');
    });
    

	
	// ----------------------------------------------------------------------
    // Load/run DOSBox on button click
	
	$(document).on('click', '.btn-playDOSBox', function(){
		$('.dosbox-game').fadeIn();
		$('.dosbox-infoAbove').fadeOut();
		$('.dosbox-controls').fadeIn();
		runDOSBox();
		if ($(this).hasClass('btn-playDOSBox--top')) {
			$(this).removeClass('btn-playDOSBox');
		}
	});
	// Go full screen!
	$('.dosbox-fullscreen').on('click', function(){
		var target = $('.dosbox-game')[0];
		if (screenfull.enabled) {
			screenfull.request(target);
		}
	});
	// Detect fullscreen change
	if (screenfull.enabled) {
		screenfull.on('change', function(){
			if (screenfull.isFullscreen) {
				$('.dosbox-game').addClass('fullscreen');
			} else {
				$('.dosbox-game').removeClass('fullscreen');
			}
		});
	}

	
	
    // ----------------------------------------------------------------------
	// Attempt to highight current page
	
	var currentPage = $('body').attr('data-url');
	if (currentPage.length) {
		$('a[href="'+currentPage+'"]').addClass('currentPage');
	}

	
	
    // ----------------------------------------------------------------------
    // Play the guessing game

    var guessCorrect = 0, firstLoad = true, guessTotal = 0;
    
    // Load a new game from the database
    function loadGuessingImage(){
		$('.dosguess-image img').hide();
		$.ajax({
			url: 'inc/ajax_guess.php',
			type: 'get',
			dataType: 'json',
			success: function(data) {
				$('.dosguess-image img').attr('src', 'screens/'+data.filename).attr('data-answer', data.game_name);
				// Reset form elements
				$('.dosguess-gamelink').hide();
				$('.dosguess-gamelink').attr('href','/game/'+data.slug+'/').text('View/download '+data.game_name+' on DOSGames.com');
				$('.dosguess-next').hide();
				$('.dosguess-smiley').hide();
				$('.dosguess-skip').show();
				$('#dosguess-userguess').prop('disabled', false).val('');
				$('.dosguess-image img').fadeIn();
				if (!firstLoad) {
					$('#dosguess-userguess').focus();
				} else {
					$('.dosguess-correct').html(guessCorrect);
					firstLoad = false;
				}
				guessTotal++;
				$('.dosguess-total').text(guessTotal);
			}
		});
    }
    
    // Start the game when button clicked
    $(document).on('click', '.dosguess-start button', function(){
        $('.dosguess-placeholder').slideUp();
        $('.dosguess-start').slideUp();
        $('.dosguess-input').slideDown();
        $('.dosguess-image').slideDown();
		$('#dosguess-userguess').focus();
    });
    
    // Check user's answer and fill in full name
    $(document).on('keyup', '#dosguess-userguess', function(){
        var guess = $(this).val(),
            answer = $('.dosguess-image img').attr('data-answer');
        if (guess.length > 2 && answer.toLowerCase().indexOf(guess.toLowerCase()) !== -1) {
			// Correct!
			guessCorrect++;
			$('.dosguess-correct').html(guessCorrect);
			$('#dosguess-userguess').prop('disabled', true).val(answer);
			$('.dosguess-next').show();
			$('.dosguess-smiley').show();
			$('.dosguess-skip').hide();
			$('.dosguess-gamelink').show();
        }
    });

    // Next button click
    $(document).on('click', '.dosguess-next', function(e){
		e.preventDefault();
        loadGuessingImage();
    });
    
    // Skip link click
    $(document).on('click', '.dosguess-skip', function(e){
        var answer = $('.dosguess-image img').attr('data-answer');
		e.preventDefault();
		$('#dosguess-userguess').prop('disabled', true).val(answer);
		$('.dosguess-correct').html(guessCorrect);
		$('.dosguess-next').show();
		$('.dosguess-smiley').hide();
		$('.dosguess-skip').hide();
		$('.dosguess-gamelink').show();
    });
    
	// Load initial game on page load
    if ($('.dosguess-image').length) {
        loadGuessingImage();
    }
	
	
	
    // ----------------------------------------------------------------------
    // Quick-n-dirty verify captcha on submit of contact form
	// (this is verified "for real" server-side)
	/*
	$('#submitcontact').click(function(e){
		var response;
		e.preventDefault();
		response = grecaptcha.getResponse();
		if (response.length !== 0) {
			$('#contactform').submit();
		} else {
			alert('Please complete the captcha before submitting.');
		}
	});
	*/
	
	
    // ----------------------------------------------------------------------
	// Facebook Comments
	
	// Show box if user previously showed it via localstorage
	if (typeof(Storage) !== "undefined" && localStorage.getItem("comments") === "show") {
		showComments();
	} else {
		$('.comments-blurb').show();
	}

	// Show comments on Facebook button click
	$(document).on('click', '.btn-loadFacebook', function(e){
		e.preventDefault();
        if (typeof(Storage) !== "undefined") {
			localStorage.setItem("comments", "show");
		}
		$('.comments-blurb').hide();
		$('.hide-comments').show();
		showComments();
	});
	
	// Hide comments
	$(document).on('click', '.btn-hideComments', function(e){
		e.preventDefault();
        if (typeof(Storage) !== "undefined") {
			localStorage.removeItem("comments");
		}
		$('.hide-comments').hide();
		$('.comments-blurb').show();
		$('#fb-root').hide();
		$('.fb-comments').hide();
	});
	
	// Load comments via Facebook API
	function showComments() {
		$('.comments-blurb').hide();
		$('.hide-comments').show();
		if (!($('body').attr('data-commentsloaded') === 'true')) {
			(function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s); js.id = id;
				js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0&appId=538214163239704';
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		}
		$('body').attr('data-commentsloaded', 'true');
		$('#fb-root').show();
		$('.fb-comments').show();
	}

    	

}); // end of document ready


