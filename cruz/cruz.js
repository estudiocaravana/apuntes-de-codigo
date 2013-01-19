$(function () {

	'use strict';

	var $navegador,
		$container,
		$textSlider,
		navegadorFixed = false,
		limiteHeader;

	$navegador = $("#navegador-principal");
	$container = $("#container");
	limiteHeader = 156;

	function mostrarVisor($visor, altura, callback) {
		$visor.animate({height: altura + "px"}, {
			duration: 1000,
			complete: callback
		});
	}

	function ocultarVisor($visor) {
		mostrarVisor($visor, 0, function () {
			$visor.css('background', '');
		});
	}

	// Navegador sticky

	$(window).scroll(function () {
		var $this = $(this);

		if (!navegadorFixed && $this.scrollTop() >= limiteHeader) {
			$navegador.css({
				position : "fixed",
				top: "0px"
			});
			$container.css({
				"padding-top": $navegador.height()
			});
			navegadorFixed = true;
		} else {
			if (navegadorFixed && $this.scrollTop() < limiteHeader) {
				$navegador.attr("style", "");
				$container.attr("style", "");
				navegadorFixed = false;
			}
		}
	});

	$navegador.find('a').click(function (e) {
		var $seccionASaltar,
			top;

		e.preventDefault();

		$seccionASaltar = $(this.hash);
		top = $seccionASaltar.offset().top - $navegador.outerHeight() / 2;
		$("html,body").animate({scrollTop: top}, 1000);
	});

	$('section').each(function () {
		var $this = $(this);

		$this.find('.contenido').responSlider({
			movingSlides: 1,
			mediaQueries: {
				"@media screen and (min-width: 960px)": 3,
				"@media screen and (max-width: 960px) and (min-width: 636px)": 2,
				"@media screen and (max-width: 636px)": 1
			},
			previousSlideAction: $this.find('.titulo .ant'),
			nextSlideAction: $this.find('.titulo .sig')
		});
	});

	$('.oculta').click(function (e) {
		var $this = $(this);

		e.preventDefault();
		$this.parent().children('div').not('.seccion').toggle();
	});

	$('.destacada a').click(function (e) {
		var $this = $(this),
			$section,
			$pilaFotos,
			$visor,
			$visorFotos,
			loadingImages;

		e.preventDefault();

		$section = $this.parents('section');

		$pilaFotos = $section.find('.pila-fotos div');

		$visor = $section.next();

		$visorFotos = $visor.find('.visor-fotos');

		if (parseInt($visor.css('height'), 10) > 0) {
			ocultarVisor($visor);
		} else {
			$visorFotos.html('');
			mostrarVisor($visor, 460);

			loadingImages = $pilaFotos.length;

			$pilaFotos.each(function () {
				var $this = $(this),
					$img = $('<img />'),
					$marco = $('<div class="marco" />'),
					$slide = $('<div class="slide" />');

				$img.attr('src', $this.data('src'));

				$marco.append($img);
				$slide.append($marco);
				$visorFotos.append($slide);

				$img.load(function () {
					loadingImages = loadingImages - 1;

					if (loadingImages <= 0) {
						$visorFotos.show().responSlider({
							verticallyCentered: true,
							horizontallyCentered: true,
							previousSlideAction: $visor.find('.visor-top .ant'),
							nextSlideAction: $visor.find('.visor-top .sig')
						});
						$visor.css('background', '#fff');
					}
				});
			});
		}

		$visor.find('.x').click(function () {
			ocultarVisor($visor);
		});

	});

});

