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
        let $hTrack = null;

        let horizontals = [];
        let scrollVertical = $(document).scrollTop();
        let scrollHorizontal = 0;
        let horizontalScrollComplete = [];
        let horizontalScrollIndex = 0;
        let scrollTotal = 0;
        let fullHeight = 0;
        let trackHeight = $track.height();
        let windowHeight = $(window).height();
        let timer = 0;
        let moveYDisabled = false;

        refreshHeight();

        $scroll.scrollTotal = scrollTotal;
        $scroll.scrollHorizontal = scrollHorizontal;
        $scroll.scrollVertical = scrollVertical;

        $(document).bind('mousewheel wheel', handleMouseWheel);

        function handleMouseWheel(e) {
            let wheelDelta = -getWheelDelta(e);
            let dir = wheelDelta < 0 ? -1 : 1;

            if($hTrack && !scrollHorizontal && wheelDelta < 0) {
                $hTrack = null;
                moveYDisabled = false;
            }

            if($hTrack && Math.abs(scrollHorizontal) >= $hTrack.width() - $(window).width() && wheelDelta > 0) {
                horizontalScrollComplete.push(horizontalScrollIndex);
                horizontalScrollIndex++;
                scrollHorizontal = 0;
                $hTrack = null;
                moveYDisabled = false;
            }

            if($hTrack) {
                let dirX = $hTrack.parent().data('dir') || 1;

                scrollHorizontal += dirX * dir * o.horizontalSpeed;

                if((dirX > 0 && scrollHorizontal < 0) || (dirX < 0 && scrollHorizontal > 0)) {
                    scrollHorizontal = 0;
                }

                if(Math.abs(scrollHorizontal) > $hTrack.width() - $(window).width()) {
                    scrollHorizontal = dirX * ($hTrack.width() - $(window).width());
                }

                if(dirX > 0) {
                    $hTrack.css('left', -scrollHorizontal);
                } else {
                    $hTrack.css('right', scrollHorizontal);
                }
            } else {
                let tmp = dir * o.verticalSpeed;

                moveY(tmp);
            }

            scrollTotal = scrollVertical + Math.abs(scrollHorizontal);

            horizontalScrollComplete.forEach(i => {
                scrollTotal += horizontals[i].$track.width() - $(window).width();
            });
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
                        $hTrack = h.$track;
                        horizontalScrollComplete.pop();
                        horizontalScrollIndex--;

                        scrollHorizontal = h.dir * ($hTrack.width() - $(window).width());
                        scrollVertical = h.$base[0].offsetTop;

                        moveYDisabled = true;
                    }

                    if(h.$base[0].offsetTop <= scrollVertical && horizontalScrollComplete.indexOf(i) < 0) {
                        $hTrack = h.$track;
                        scrollVertical = h.$base[0].offsetTop;
                        moveYDisabled = true;
                    }
                });

                target -= dir;

                $track.css('top', -scrollVertical);

                timer = setTimeout(function(){
                    moveY(target);
                }, 1);
            }
        }

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

            if($hTrack && !tmpScrollHorizontal && partScroll < 0) {
                $hTrack = null;
            }

            if($hTrack && Math.abs(tmpScrollHorizontal) >= $hTrack.width() - $(window).width() && partScroll > 0) {
                horizontalScrollComplete.push(horizontalScrollIndex);
                horizontalScrollIndex++;
                scrollHorizontal = tmpScrollHorizontal = 0;
                $hTrack = null;
            }

            if($hTrack) {
                oddScroll = partScroll;
                partScrollHorizontal = partScroll - oddScrollHorizontal;

                let dir = $hTrack.parent().data('dir') || 1;

                tmpScrollHorizontal = (partScrollHorizontal * dir) + scrollHorizontal;

                if((dir > 0 && tmpScrollHorizontal < 0) || (dir < 0 && tmpScrollHorizontal > 0)) {
                    tmpScrollHorizontal = 0;
                }

                if(Math.abs(tmpScrollHorizontal) > $hTrack.width() - $(window).width()) {
                    tmpScrollHorizontal = dir * ($hTrack.width() - $(window).width());
                }

                if(dir > 0) {
                    $hTrack.css('left', -tmpScrollHorizontal);
                } else {
                    $hTrack.css('right', tmpScrollHorizontal);
                }
            } else {
                tmpScroll = partScroll - oddScroll + scrollVertical;

                if(tmpScroll < 0) tmpScroll = 0;

                if(tmpScroll > $track.height() - $(window).height()) {
                    tmpScroll = $track.height() - $(window).height();
                }

                $track.css('top', -tmpScroll);

                horizontals.forEach((h, i) => {
                    if(h.$base.offset().top >= 0 && partScroll < 0 && horizontalScrollComplete.indexOf(i) >= 0) {
                        $hTrack = h.$track
                        tmpScrollHorizontal = scrollHorizontal= h.dir * ($hTrack.width() - $(window).width());
                        horizontalScrollComplete.pop();
                        horizontalScrollIndex--;

                        tmpScroll += h.$base.offset().top;
                        $track.css('top', -tmpScroll);
                    }

                    if(h.$base.offset().top <= 0 && horizontalScrollComplete.indexOf(i) < 0) {
                        $hTrack = h.$track;
                        tmpScroll += h.$base.offset().top;
                        $track.css('top', -tmpScroll);
                        oddScrollHorizontal = partScroll;
                    }
                });
            }

            tmpScrollTotal = tmpScroll + Math.abs(tmpScrollHorizontal);

            horizontalScrollComplete.forEach(i => {
                tmpScrollTotal += horizontals[i].$track.width() - $(window).width();
            });

            $scroll.scrollTotal = tmpScrollTotal;
            $scroll.scrollHorizontal = tmpScrollHorizontal;
            $scroll.scrollVertical = tmpScroll;

            $scroll.trigger('custom-scroll');
        }

        function refreshHeight() {
            fullHeight = $track.height() - $(window).height();

            $horizontal.each(function(){
                let obj = {
                    $base: $(this),
                    $track: $(this).find(o.selectors.horizontalTrack),
                    dir: $(this).data('dir') || 1
                };

                horizontals.push(obj);

                fullHeight += obj.$track.width() - $(window).width();
            });

            $scroll.fullHeight = fullHeight;
        }

        return $scroll;
    };

    function getWheelDelta(event) {
        return event.wheelDelta || -event.detail || event.originalEvent.wheelDelta || -event.originalEvent.detail || -(event.originalEvent.deltaY * 25) || null;
    }
}( jQuery ));