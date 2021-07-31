(function($){
    let timer = 0;

    $(window).on('load', function(){
        console.log('window loaded');

        if(!$('.login').hasClass('del') && !$('.login .pin').length) {
            init();

            clearInterval(timer);

            $(".login").addClass("del");
            $("#section-1").addClass("active");
            $("body").removeClass("fixed");
        }
    });
    $(document).ready(function(){
        if($('.login__title').length) timer = addWaiting($('.login__title'), 'Loading');

        window.scrollTo(0, 0);

        let pinCheck = false;

        $('.inp').keydown(function(){
            if(pinCheck) return false;
        });

        $(".inp").keyup(function () {
            if(pinCheck) return false;

            var inp1 = $("#inp1").val(),
                inp2 = $("#inp2").val(),
                inp3 = $("#inp3").val(),
                inp4 = $("#inp4").val();

            $(".pin").removeClass("error");

            if(inp1 && inp2 && inp3 && inp4) {
                disablePin();
                $.ajax({
                    type: 'post',
                    url: '/wp-admin/admin-ajax.php',
                    data: {
                        action: 'load_page',
                        pin: [inp1, inp2, inp3, inp4].join('')
                    },
                    success: function(res) {
                        console.log(res);
                        if(!res) {
                            $(".pin").addClass("error");
                            $(".pin__title").text("Wrong PIN. Try again");
                            enablePin();
                        } else {
                            $('#main').html(res);

                            init();

                            setTimeout(function () {
                                $(".login").addClass("del");
                                $("#section-1").addClass("active");

                                $("body").removeClass("fixed");

                                enablePin();
                            }, 1000);
                        }
                    },
                    fail: function (err) {
                        console.log(err);
                    }
                });
            }
        });

        function disablePin() {
            pinCheck = true;
            $(".inp").attr('disabled', true);
            $('.inp').closest('.input__box').addClass('disabled');

            timer = addWaiting($('.pin__title'), 'Waiting');
        }

        function enablePin() {
            pinCheck = false;
            $(".inp").attr('disabled', false);
            $('.inp').closest('.input__box').removeClass('disabled');

            clearInterval(timer);
        }
    });

    function addWaiting($el, text) {
        let p = '';

        return setInterval(function(){
            p += '.';
            $el.text(text + p);

            if(p === '...') p = '';
        }, 250);
    }

    function tablesInit() {
        try {
            let tablesContainer = document.createElement('div'),
                tables = document.querySelectorAll('.wp-block-table');

            tablesContainer.className = 'table__bx-block';

            if(tables) {
                tables[0].parentNode.insertBefore(tablesContainer, tables[0]);

                tables.forEach(table => {
                    let caption = table.querySelector('figcaption');
                    let title = document.createElement('h3');
                    let tableNode = table.querySelector('table');

                    table.className = 'table__bx';
                    tableNode.className = 'table';

                    title.innerHTML = caption.innerHTML;
                    caption.remove();

                    table.insertBefore(title, tableNode);

                    table.querySelectorAll('thead th').forEach(th => {
                        let td = document.createElement('td');

                        td.innerHTML = th.innerHTML;

                        th.parentNode.insertBefore(td, th);
                        th.remove();
                    });

                    tableNode.querySelectorAll('tr').forEach(tr => {
                        tableNode.querySelector('tbody').appendChild(tr);
                    });

                    table.querySelector('thead').remove();

                    tablesContainer.appendChild(table);
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    function init() {
        tablesInit();

        if($(window).width() > 1280) {
            var s = document.querySelector(".im-20");

            window.addEventListener("mousemove", function (t) {
                var e = t.clientX / window.innerWidth,
                    i = t.clientY / window.innerHeight;
                s.style.transform = "translate(-" + 70 * e + "px, -" + 20 * i + "px)";
            });
        }

        var im8 = document.querySelector(".im-8");
        window.addEventListener("mousemove", function (t) {
            var e = t.clientX / window.innerWidth,
                i = t.clientY / window.innerHeight;

            im8.style.transform = "translate(-" + 30 * e + "px, -" + 20 * i + "px)";
        });
        var im9 = document.querySelector(".im-9");
        window.addEventListener("mousemove", function (t) {
            var e = t.clientX / window.innerWidth,
                i = t.clientY / window.innerHeight;

            im9.style.transform = "translate(" + 30 * e + "px, " + 20 * i + "px)";
        });
        $(".worth__wrapper li").hover(function () {
            $(".worth__wrapper li").removeClass("active");

            $(this).addClass("active");
        });

        $(".piker-2").click(function () {
            $(this).toggleClass("active"), $(".managtwo__wrapper").toggleClass("active");
        });

        $(".piker-1").click(function () {
            $(this).toggleClass("active"), $(".managtwo__inner").toggleClass("active");
        });

        var a = {};
        (a.pointsAnimation = {
            init: function () {
                (this.points = $(".point")),
                    (this.pointWidth = this.points.first().width()),
                    (this.pointHeight = this.points.first().height()),
                    (this.document_ = $(document)),
                    console.log("init"),
                    this.trackMouse(),
                    this.playInitial(),
                    this.attachEvents();
            },
            trackMouse: function () {
                var t = this;
                this.document_.on("mousemove.track", function (e) {
                    (t.lastCursorPosX = e.pageX), (t.lastCursorPosY = e.pageY);
                });
            },
            attachEvents: function () {
                var t = this,
                    e = 0;
                this.document_.on("mousemove", function (e) {
                    (t.cursorPosX = e.pageX),
                        (t.cursorPosY = e.pageY),
                        t.points.each(function () {
                            t.calculatePointScale(t.cursorPosX, t.cursorPosY, this);
                        });
                }),
                    $(window).on("scroll", function () {
                        clearTimeout(e),
                            (e = setTimeout(function () {
                                var e = $(document).scrollLeft(),
                                    i = $(document).scrollTop(),
                                    o = t.cursorPosX + e - t.winX,
                                    n = t.cursorPosY + i - t.winY;
                                (t.winX = e),
                                    (t.winY = i),
                                    t.points.each(function () {
                                        t.calculatePointScale(o, n, this);
                                    });
                            }, 50));
                    });
            },
            playInitial: function () {
                var t = this;
                jQuery("body").addClass("with_trans"),
                    window.setTimeout(function () {
                        t.points.addClass("animated");
                    }, 200),
                    window.setTimeout(function () {
                        t.lastCursorPosX
                            ? t.untrackMouse()
                            : $(document).on("mousemove.initial", function (e) {
                                (t.lastCursorPosX = e.pageX), (t.lastCursorPosY = e.pageY), t.untrackMouse(), $(document).off("mousemove.initial");
                            });
                    }, 850),
                    setTimeout(function () {
                        t.points.removeClass("animated"),
                            setTimeout(function () {
                                jQuery("body").removeClass("with_trans");
                            }, 800);
                    }, 800);
            },
            untrackMouse: function () {
                this.document_.off("mousemove.track");
            },
            calculatePointScale: function (t, e, i) {
                var o = $(i);
                if (!o.parents(".event").hasClass("active")) {
                    var n = o.offset(),
                        s = n.left + this.pointWidth,
                        a = n.top + this.pointHeight,
                        r = Math.sqrt(Math.pow(t - s, 2) + Math.pow(e - a, 2)),
                        c = 100 - Math.min(Math.max(Math.round((r / 700) * 100), 0), 100),
                        l = (Math.round(60 * c) / 100 + 100) / 100;
                    o.css({ "-webkit-transform": "scale(" + l + ") ", transform: "scale(" + l + ") rotate(0.02deg)" });
                }
            },
        }),
            a.pointsAnimation.init();

        // update

        $(this).click(function(e) {
            if(!$(e.target).closest('.managtwo__block, .piker').length) {
                $('.managtwo__block.active, .picker.active').removeClass('active');
            }
        });

        let $cs = $.fn.customScroll();

        $cs.on('custom-scroll', function(){
            $('#myBar').css('width', (($cs.scrollTotal * 100) / $cs.fullHeight) + '%');

            $('.air__clouds-1').css('transform', 'translateY(-' + $cs.scrollVertical + 'px) ');
            $('.air__clouds-2').css('transform', 'translateY(-' + $cs.scrollVertical/2 + 'px) translateX(' + -($cs.scrollHorizontal/64) + 'px)');
            $('.buyin-front').css('transform', 'translateX(-' + $cs.scrollHorizontal/6 + 'px)');
            $('.buyin-back').css('transform', 'translateX(' + $cs.scrollHorizontal/3 + 'px)');

            if($cs.scrollVertical) {
                $(".section").each(function () {
                    var t = this.getAttribute("data-name");
                    var i = this.getAttribute('data-invert');

                    if($cs.scrollVertical >= $(this)[0].offsetTop - ($(window).height()/2) && $cs.scrollVertical < $(this)[0].offsetTop + $(this).height()) {
                        if(t) {
                            $('.title .on').text(t);
                            $('.box').removeClass('disabled');
                        } else {
                            $('.box').addClass('disabled');
                        }

                        if(i) {
                            $('.title').addClass('invert');
                        } else {
                            $('.title').removeClass('invert');
                        }
                    }
                });
            }

            if($cs.scrollHorizontal) {
                $('.buyin').find('li').each(function () {
                    var t = this.getAttribute("data-name");
                    var i = this.getAttribute("data-invert");

                    if($cs.scrollHorizontal <= this.offsetLeft - $('#horiz_container').width() + $(this).width() + ($(this).width()/2) && $cs.scrollHorizontal >= this.offsetLeft - $('#horiz_container').width() + $(this).width()) {
                        if(t) {
                            $('.title .on').text(t);
                            $('.box').removeClass('disabled');
                        } else {
                            $('.box').addClass('disabled');
                        }

                        if(i) {
                            $('.title').addClass('invert');
                        } else {
                            $('.title').removeClass('invert');
                        }
                    }
                });
            }

            let scrolledPrice = $cs.scrollVertical - $('.section.price')[0].offsetTop;

            if(scrolledPrice >= 0) {
                $('.box').css({
                    height: scrolledPrice + ($(window).height() - (50*2)),
                    top: -scrolledPrice + 50,
                    transform: 'translate(-50%, 0%)'
                });
            } else {
                $('.box').css({
                    height: '',
                    top: '',
                    transform: ''
                });
            }
        });
    }
})(jQuery);

