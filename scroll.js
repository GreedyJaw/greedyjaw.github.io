(function ( $ ) {

    $.fn.customScroll = function( options ) {
        let o = $.extend({
            selectors: {
                scroll: '.scroll',
                scrollTrack: '.scroll-track',
                horizontal: '.horizontal',
                horizontalTrack: '.horizontal-track'
            },
            verticalSpeed: 150,
            horizontalSpeed: 150
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

        refreshHeight();

        $scroll.scrollTotal = scrollTotal;

        $(document).bind('mousewheel wheel', handleMouseWheel);

        function handleMouseWheel(e) {
            let wheelDelta = -((getWheelDelta(e) / 4) / 100);

            if($hTrack && !scrollHorizontal && wheelDelta < 0) {
                $hTrack = null;
            }

            if($hTrack && Math.abs(scrollHorizontal) >= $hTrack.width() - $(window).width() && wheelDelta > 0) {
                horizontalScrollComplete.push(horizontalScrollIndex);
                horizontalScrollIndex++;
                scrollHorizontal = 0;
                $hTrack = null;
            }

            if($hTrack) {
                let dir = $hTrack.parent().data('dir') || 1;

                scrollHorizontal += wheelDelta * dir * o.horizontalSpeed;

                if((dir > 0 && scrollHorizontal < 0) || (dir < 0 && scrollHorizontal > 0)) {
                    scrollHorizontal = 0;
                }

                if(Math.abs(scrollHorizontal) > $hTrack.width() - $(window).width()) {
                    scrollHorizontal = dir * ($hTrack.width() - $(window).width());
                }

                if(dir > 0) {
                    $hTrack.css('left', -scrollHorizontal);
                } else {
                    $hTrack.css('right', scrollHorizontal);
                }
            } else {
                scrollVertical += wheelDelta * o.verticalSpeed;

                if(scrollVertical < 0) scrollVertical = 0;

                if(scrollVertical > $track.height() - $(window).height()) {
                    scrollVertical = $track.height() - $(window).height();
                }

                $track.css('top', -scrollVertical);

                horizontals.forEach(function(h, i) {
                    if(h.$base.offset().top >= 0 && wheelDelta < 0 && horizontalScrollComplete.indexOf(i) >= 0) {
                        $hTrack = h.$track;
                        scrollHorizontal = h.dir * ($hTrack.width() - $(window).width());
                        horizontalScrollComplete.pop();
                        horizontalScrollIndex--;

                        scrollVertical += h.$base.offset().top;
                        $track.css('top', -scrollVertical);
                    }

                    if(h.$base.offset().top <= 0 && horizontalScrollComplete.indexOf(i) < 0) {
                        $hTrack = h.$track;
                        scrollVertical += h.$base.offset().top;
                        $track.css('top', -scrollVertical);
                    }
                });
            }

            scrollTotal = scrollVertical + Math.abs(scrollHorizontal);

            horizontalScrollComplete.forEach(i => {
                scrollTotal += horizontals[i].$track.width() - $(window).width();
            });

            $scroll.trigger('custom-scroll', 'test');

            $scroll.scrollTotal = scrollTotal;
        }

        let touchStart = false;
        let tmpScroll = 0;
        let tmpScrollHorizontal = 0;
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