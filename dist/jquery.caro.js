/*! caro.js - v0.7.2 - 2012-12-11
* http://bebraw.github.com/caro.js/
* Copyright (c) 2012 Juho Vepsalainen; Licensed MIT */

(function ($) {
    function horizontalCaro($elem, opts) {
        caroize($elem, opts, 'left', 'width');
    }

    function verticalCaro($elem, opts) {
        caroize($elem, opts, 'top', 'height');
    }

    function caroize($elem, opts, dir, axis) {
        var $slideContainer = $('.slides:first', $elem);
        var $slides = $slideContainer.children().append($('<div>'));
        var $wrapper = $('<div>').append($slides).appendTo($slideContainer);
        var $navi = $('.' + opts.naviClass + ':last', $elem);
        var amount = $slides.length;
        var pos = 0;

        initCSS($slideContainer, axis, $wrapper, dir, $slides);
        initTitles($slides, $navi, moveTemplate, opts.autoNavi, opts.buttonClass);
        initNavi($elem, $wrapper, moveTemplate);
        initPlayback($elem, $wrapper, moveTemplate, opts.autoPlay, opts.still);

        if(opts.resize) {
            $slideContainer.height($slides.eq(pos).height() || undefined);
        }

        update(pos, opts.buttonClass);
        disableSelection($elem);

        function moveTemplate(indexCb, animCb) {
            return function() {
                if(opts.cycle) {
                    pos = indexCb(pos, amount - 1);
                    if(pos < 0) pos = amount - 1;
                    if(pos > amount - 1) pos = 0;
                }
                else pos = clamp(indexCb(pos, amount - 1), 0, amount - 1);

                var animProps = {};
                animProps[dir] = (pos * -100) + '%';
                $wrapper.animate(animProps, opts.delay, animCb);

                update(pos, opts.buttonClass);
            };
        }

        function update(i, buttonClass) {
            updateNavi($navi, i, buttonClass);
            if(!opts.cycle) updateButtons($elem, i, amount);
            updateSlides($slides, i);

            if(opts.resize) {
                $slideContainer.animate({
                    'height': $slides.eq(i).height() || undefined
                }, opts.resizeDelay, function() {
                    $elem.parents('.slides').siblings('.navi').
                        find('.selected.' + buttonClass + ':first').trigger('click');
                });
            }
        }
    }

    function clamp(i, min, max) {
        return Math.min(Math.max(i, min), max);
    }

    function initCSS($slideContainer, axis, $wrapper, dir, $slides) {
        $slideContainer.css('overflow', 'hidden');
        var wrapperOpts = {
            position:'relative'
        };
        wrapperOpts[axis] = $slides.length * 100 + '%';
        wrapperOpts[dir] = 0 + '%';
        $wrapper.css(wrapperOpts);

        var slideOpts = {
            display: dir == 'top'? 'auto': 'inline-block',
            'vertical-align':'top'
        };
        var len = 100 / $slides.length;
        slideOpts[axis] = parseInt(len, 10) + '%';

        // opera hack! opera rounds width so we need to deal with that using some
        // padding
        if(axis == 'width') {
            slideOpts['padding-right'] = len - parseInt(len, 10) + '%';
        }
        else {
            slideOpts['padding-bottom'] = len - parseInt(len, 10) + '%';
        }
        $slides.each(function (i, e) {
            $(e).css(slideOpts).addClass('slide');
        });
    }

    function initTitles($slides, $navi, move, autoNavi, buttonClass) {
        $slides.each(function (i, k) {
            var $e = $('<a>', {href: '#'}).css('display', 'inline').bind('click',
                function(e) {
                    e.preventDefault();

                    move(function () {
                        return i;
                    })();
                }).appendTo($navi).addClass('title ' + buttonClass);

            if(autoNavi) {
                $(k).clone().appendTo($e);
            }
            else {
                $e.text($(k).attr('title') || i + 1);
            }
        });
    }

    function initNavi($elem, $wrapper, move) {
        function bind(sel, cb) {
            $elem.find(sel).bind('click', function (e) {
                e.preventDefault();
                $wrapper.clearQueue();
                move(cb)();
            });
        }

        bind('.prev', function (a) {
            return a - 1;
        });
        bind('.next', function (a) {
            return a + 1;
        });
        bind('.first', function () {
            return 0;
        });
        bind('.last', function (a, len) {
            return len;
        });
    }

    function initPlayback($elem, $wrapper, move, autoPlay, still) {
        var anim = move(function (a, len) {
            return a == len ? 0 : a + 1;
        }, function () {
            $(this).delay(still).queue(function() {
                anim();
                $(this).dequeue();
            });
        });

        $elem.find('.play').bind('click', function(e) {
            e.preventDefault();

            anim();
        });
        $elem.find('.stop').bind('click', function(e) {
            e.preventDefault();

            $wrapper.clearQueue();
        });
    }

    function updateNavi($navi, i, buttonClass) {
        var $titles = $navi.find('.title.' + buttonClass);

        $titles.removeClass('selected');
        $titles.eq(i).addClass('selected');
    }

    function updateButtons($elem, i, amount) {
        var $begin = $elem.find('.first,.prev');
        var $end = $elem.find('.last,.next');

        if(i === 0) $begin.addClass('disabled');
        else $begin.removeClass('disabled');

        if(i == amount - 1) $end.addClass('disabled');
        else $end.removeClass('disabled');
    }

    function updateSlides($slides, i) {
        $slides.each(function (j, e) {
            $(e).removeClass('prev').removeClass('next');

            if(j == i - 1) {
                $(e).addClass('prev');
            }

            if(j == i) {
                $(e).addClass('current');
            }

            if(j == i + 1) {
                $(e).addClass('next');
            }
        });
    }

    function disableSelection($e) {
        // http://stackoverflow.com/questions/2700000/how-to-disable-text-selection-using-jquery
        return $e.each(function() {
            $(this).attr('unselectable', 'on').css({
                   '-moz-user-select':'none',
                   '-webkit-user-select':'none',
                   'user-select':'none'
               }).each(function() {
                   this.onselectstart = function() { return false; };
               });
        });
    }

    $.fn.caro = function (options) {
        return this.each(function () {
            var $elem = $(this);
            var opts = $.extend({
                dir: 'horizontal', // either 'horizontal' or 'vertical'
                delay: 300, // in ms
                still: 1000, // how long slide stays still in playback mode
                autoPlay: false,
                naviClass: 'navi',
                buttonClass: 'button',
                autoNavi: false,
                cycle: false,
                resize: true,
                resizeDelay: 300 // in ms
            }, options);

            var caro = opts.dir == 'horizontal' ? horizontalCaro : verticalCaro;
            caro($elem, opts);
        });
    };
})(jQuery);
