(function ( $ ) {

    $.fn.customScroll = function( options ) {
        let o = $.extend({
            selectors: {
                scroll: '.scroll',
                scrollTrack: '.scroll-track',
                horizontal: '.horizontal',
                horizontalTrack: '.horizontal-track'
            },
            verticalSpeed: 50,
            horizontalSpeed: 50
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

        refreshHeight();

        $scroll.scrollTotal = scrollTotal;
        $scroll.scrollHorizontal = scrollHorizontal;
        $scroll.scrollVertical = scrollVertical;

        $(document).bind('mousewheel wheel', handleMouseWheel);

        function handleMouseWheel(e) {
            let wheelDelta = -getWheelDelta(e);
            let dir = wheelDelta < 0 ? -1 : 1;

            if(activeHorizontal && !scrollHorizontal && dir < 0) {
                activeHorizontal = null;
                moveYDisabled = false;
            }

            if(activeHorizontal && Math.abs(scrollHorizontal) >= activeHorizontal.trackWidth - windowWidth && dir > 0) {
                horizontalScrollComplete.push(horizontalScrollIndex);
                horizontalScrollIndex++;
                scrollHorizontal = 0;
                activeHorizontal = null;
                moveYDisabled = false;
            }

            if(activeHorizontal) {
                let tmp = activeHorizontal.dir * dir * o.horizontalSpeed;
                moveX(tmp, activeHorizontal.dir);
            } else {
                let tmp = dir * o.verticalSpeed;
                moveY(tmp);
            }
        }

        function moveY(target) {
            if(target && !moveYDisabled) {
                let dir = target < 0 ? -1 : 1;

                scrollVertical+=dir;

                if(scrollVertical < 0) scrollVertical = 0;

                if(scrollVertical > trackHeight - windowHeight) {
                    scrollVertical = trackHeight - windowHeight;
                }

                horizontals.forEach(function(h, i) {
                    if(h.$base[0].offsetTop >= scrollVertical && dir < 0 && horizontalScrollComplete.indexOf(i) >= 0) {
                        activeHorizontal = horizontals[i];
                        horizontalScrollComplete.pop();
                        horizontalScrollIndex--;

                        scrollHorizontal = h.dir * (h.trackWidth - windowWidth);
                        scrollVertical = h.$base[0].offsetTop;

                        moveYDisabled = true;
                    }

                    if(h.$base[0].offsetTop <= Math.ceil(scrollVertical) && horizontalScrollComplete.indexOf(i) < 0) {
                        activeHorizontal = horizontals[i];
                        scrollVertical = h.$base[0].offsetTop;
                        moveYDisabled = true;
                    }
                });

                target -= dir;

                $track.css('top', -scrollVertical);

                updateTotals(scrollHorizontal, scrollVertical);

                setTimeout(function(){
                    moveY(target);
                }, 1);
            }
        }

        function moveX(target, dirX) {
            if(target && activeHorizontal) {
                let dir = target < 0 ? -1 : 1;

                scrollHorizontal += dir;

                if((dirX > 0 && scrollHorizontal < 0) || (dirX < 0 && scrollHorizontal > 0)) {
                    scrollHorizontal = 0;
                }

                if(Math.abs(scrollHorizontal) > activeHorizontal.trackWidth - windowWidth) {
                    scrollHorizontal = dirX * (activeHorizontal.trackWidth - windowWidth);
                }

                target -= dir;

                if(dirX > 0) {
                    activeHorizontal.$track.css('left', -scrollHorizontal);
                } else {
                    activeHorizontal.$track.css('right', scrollHorizontal);
                }

                updateTotals(scrollHorizontal, scrollVertical);

                setTimeout(function(){
                    moveX(target, dirX);
                }, 1);
            }
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

        function refreshHeight() {
            fullHeight = $track.height() - $(window).height();

            $horizontal.each(function(){
                let $track = $(this).find(o.selectors.horizontalTrack);

                let obj = {
                    $base: $(this),
                    $track: $track,
                    trackWidth: $track.width(),
                    dir: $(this).data('dir') || 1
                };

                horizontals.push(obj);

                fullHeight += obj.trackWidth - $(window).width();
            });

            $scroll.fullHeight = fullHeight;
        }

        function updateTotals(x, y) {
            scrollTotal = y + Math.abs(x);

            horizontalScrollComplete.forEach(i => {
                scrollTotal += horizontals[i].trackWidth - windowWidth;
            });

            $scroll.scrollTotal = scrollTotal;

            $scroll.trigger('custom-scroll');
        }

        return $scroll;
    };

    function getWheelDelta(event) {
        return event.wheelDelta || -event.detail || event.originalEvent.wheelDelta || -event.originalEvent.detail || -(event.originalEvent.deltaY * 25) || null;
    }
}( jQuery ));