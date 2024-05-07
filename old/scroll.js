(function ( $ ) {

    $.fn.customScroll = function( options ) {
        let o = $.extend({
            selectors: {
                scroll: '.scroll',
                scrollTrack: '.scroll-track',
                horizontal: '.horizontal',
                horizontalTrack: '.horizontal-track'
            },
            verticalSpeed: 10,
            horizontalSpeed: 8
        }, options);

        let $scroll = $(o.selectors.scroll);
        let $track = $(o.selectors.scrollTrack);
        let $horizontal = $(o.selectors.horizontal);
        let activeHorizontal = null;

        let horizontals = [];
        let scrollVertical = $(document).scrollTop();
        let scrollHorizontal = 0;
        let horizontalScrollComplete = [];
        let horizontalScrollIndex = 0;
        let scrollTotal = 0;
        let fullHeight = 0;
        let trackHeight = $track.height();
        let windowHeight = $(window).height();
        let windowWidth = $(window).width();
        let moveYDisabled = false;
        let oldDir = 0;
        let timer = 0;

        $horizontal.each(function(){
            let $track = $(this).find(o.selectors.horizontalTrack);

            let obj = {
                $base: $(this),
                $track: $track,
                dir: $(this).data('dir') || 1
            };

            horizontals.push(obj);
        });

        $scroll.scrollTotal = scrollTotal;

        resize();

        $(window).bind('resize', resize);

        $(document).bind('mousewheel wheel', handleMouseWheel);

        let wd = 0,
            speedY = o.verticalSpeed,
            speedX = o.horizontalSpeed,
            ayMax = speedY/2,
            axMax = speedX/2,
            ax = 0,
            ay = 0;

        function handleMouseWheel(e) {
            wd = -getWheelDelta(e) < 0 ? -1 : 1;

            if(activeHorizontal) {
                ax = wd > 0 ? Math.min(axMax, ax + wd) : Math.max(-axMax, ax + wd);
            }

            if(!activeHorizontal || activeHorizontal && !scrollHorizontal && wd < 0) {
                ay = wd > 0 ? Math.min(ayMax, ay + wd) : Math.max(-ayMax, ay + wd);
            }
        }

        run();

        function run() {
            if(activeHorizontal && !scrollHorizontal && wd < 0) {
                activeHorizontal = null;
            }

            if(activeHorizontal && Math.abs(scrollHorizontal) >= activeHorizontal.trackWidth - windowWidth && wd > 0) {
                horizontalScrollComplete.push(horizontalScrollIndex);
                horizontalScrollIndex++;
                scrollHorizontal = 0;
                activeHorizontal = null;
            }

            if(activeHorizontal) {
                scrollHorizontal += activeHorizontal.dir * ax * speedX;

                if((activeHorizontal.dir > 0 && scrollHorizontal < 0) || (activeHorizontal.dir < 0 && scrollHorizontal > 0)) {
                    scrollHorizontal = 0;
                }

                if(Math.abs(scrollHorizontal) > activeHorizontal.trackWidth - windowWidth) {
                    scrollHorizontal = activeHorizontal.dir * (activeHorizontal.trackWidth - windowWidth);
                }
            }

            scrollVertical += ay * speedY;

            if(scrollVertical < 0) scrollVertical = 0;

            if(scrollVertical > trackHeight - windowHeight) {
                scrollVertical = trackHeight - windowHeight;
            }

            horizontals.forEach(function(h, i) {
                if(h.$base[0].offsetTop >= scrollVertical && wd < 0 && horizontalScrollComplete.indexOf(i) >= 0) {
                    activeHorizontal = horizontals[i];
                    horizontalScrollComplete.pop();
                    horizontalScrollIndex--;

                    scrollHorizontal = h.dir * (h.trackWidth - windowWidth);
                }

                if(h.$base[0].offsetTop <= Math.ceil(scrollVertical) && horizontalScrollComplete.indexOf(i) < 0) {
                    activeHorizontal = horizontals[i];
                }
            });

            if(activeHorizontal) {
                scrollVertical = activeHorizontal.$base[0].offsetTop;
            }

            $track.css('transform', 'translate3d(0, ' + (-scrollVertical) + 'px, 0)');

            if(activeHorizontal) {
                activeHorizontal.$track.css('transform', 'translate3d(' + (-scrollHorizontal) + 'px, 0, 0)');
            }

            ay -= wd * (speedY/100);
            ax -= wd * (speedX/100);

            if((wd > 0 && ay <= 0) || (wd < 0 && ay >= 0)) {
                ay = 0;
            }

            if((wd > 0 && ax <= 0) || (wd < 0 && ax >= 0)) {
                ax = 0;
            }

            updateTotals(scrollHorizontal, scrollVertical);

            window.requestAnimationFrame(run);
        }

        // Touch part
        let touchStart = false;
        let tmpScroll = 0;
        let tmpScrollHorizontal = 0;
        let tmpScrollTotal = 0;
        let partScroll = 0;
        let partScrollHorizontal = 0;
        let oddScrollHorizontal = 0;
        let oddScroll = 0;

        $(document).on('touchstart', function (e){
            touchStart = e.originalEvent.touches[0].clientY;
        });

        $(document).on('touchmove', function(e){
            if(touchStart) {
                customScrollTouch(e);
            }
        });

        $(document).on('touchend', function (e){
            touchStart = false;

            if(!scrollHorizontal || (scrollHorizontal && tmpScroll)) {
                scrollVertical = tmpScroll;
            }

            scrollHorizontal = tmpScrollHorizontal;
            partScroll = partScrollHorizontal = 0;
            oddScroll = oddScrollHorizontal = 0;
        });

        function customScrollTouch(e) {
            partScroll = -(e.originalEvent.touches[0].clientY - touchStart);

            if(activeHorizontal && !tmpScrollHorizontal && partScroll < 0) {
                activeHorizontal = null;
            }

            if(activeHorizontal && Math.abs(tmpScrollHorizontal) >= activeHorizontal.trackWidth - windowWidth && partScroll > 0) {
                horizontalScrollComplete.push(horizontalScrollIndex);
                horizontalScrollIndex++;
                scrollHorizontal = tmpScrollHorizontal = 0;
                activeHorizontal = null;
            }

            if(activeHorizontal) {
                oddScroll = partScroll;
                partScrollHorizontal = partScroll - oddScrollHorizontal;

                tmpScrollHorizontal = (partScrollHorizontal * activeHorizontal.dir) + scrollHorizontal;

                if((activeHorizontal.dir > 0 && tmpScrollHorizontal < 0) || (activeHorizontal.dir < 0 && tmpScrollHorizontal > 0)) {
                    tmpScrollHorizontal = 0;
                }

                if(Math.abs(tmpScrollHorizontal) > activeHorizontal.trackWidth - windowWidth) {
                    tmpScrollHorizontal = activeHorizontal.dir * (activeHorizontal.trackWidth - windowWidth);
                }

                if(activeHorizontal.dir > 0) {
                    activeHorizontal.$track.css('left', -tmpScrollHorizontal);
                } else {
                    activeHorizontal.$track.css('right', tmpScrollHorizontal);
                }
            } else {
                tmpScroll = partScroll - oddScroll + scrollVertical;

                if(tmpScroll < 0) tmpScroll = 0;

                if(tmpScroll > trackHeight - windowHeight) {
                    tmpScroll = trackHeight - windowHeight;
                }

                $track.css('top', -tmpScroll);

                horizontals.forEach((h, i) => {
                    if(h.$base.offset().top >= 0 && partScroll < 0 && horizontalScrollComplete.indexOf(i) >= 0) {
                        activeHorizontal = horizontals[i];
                        tmpScrollHorizontal = scrollHorizontal= h.dir * (h.trackWidth - windowWidth);
                        horizontalScrollComplete.pop();
                        horizontalScrollIndex--;

                        tmpScroll += h.$base.offset().top;
                        $track.css('top', -tmpScroll);
                    }

                    if(h.$base.offset().top <= 0 && horizontalScrollComplete.indexOf(i) < 0) {
                        activeHorizontal = horizontals[i];
                        tmpScroll += h.$base.offset().top;
                        $track.css('top', -tmpScroll);
                        oddScrollHorizontal = partScroll;
                    }
                });
            }

            updateTotals(tmpScrollHorizontal, tmpScroll);
        }

        function updateTotals(x, y) {
            scrollTotal = y + Math.abs(x);

            horizontalScrollComplete.forEach(i => {
                scrollTotal += horizontals[i].trackWidth - windowWidth;
            });

            $scroll.scrollTotal = scrollTotal;
            $scroll.scrollVertical = y;
            $scroll.scrollHorizontal = x;

            $scroll.trigger('custom-scroll');
        }

        function resize() {
            trackHeight = $track.height();
            windowHeight = $(window).height();
            windowWidth = $(window).width();
            fullHeight = trackHeight - windowHeight;

            horizontals.forEach(h => {
                h.trackWidth = h.$track.width();

                fullHeight += h.trackWidth - windowWidth;
            });

            $scroll.fullHeight = fullHeight;

            $scroll.trigger('custom-scroll');
        }

        return $scroll;
    };

    function getWheelDelta(event) {
        return event.wheelDelta || -event.detail || event.originalEvent.wheelDelta || -event.originalEvent.detail || -(event.originalEvent.deltaY * 25) || null;
    }
}( jQuery ));