var com;

if (!com) {
	com = {};
}

if (!com.estudiocaravana) {
	com.estudiocaravana = {};
}

com.estudiocaravana.Errata = {};

(function () {

	"use strict";

	var _ns = "com-estudiocaravana-errata-",
		_nsid = "#" + _ns,
		_selectedRange,
		_timeout,
		_allowMouseEvent = true,
		_letterToken = "LETTER",
		ns;

	// Obtiene los nodos de texto dentro del DOM
	function _getTextNodes(node) {

		var whitespace = /^\s*$/,
			textNodesStack = [];

		function _getTextNodesAux(node) {
			var i = 0;

			if (node.nodeType === 3) {
				if (!whitespace.test(node.nodeValue)) {
					textNodesStack.push(node);
				}
			} else {
				if (node.id !== 'com-estudiocaravana-errata-boxWrapper' && node.childNodes !== undefined) {
					for (i = 0; i < node.childNodes.length; i = i + 1) {
						_getTextNodesAux(node.childNodes[i]);
					}
				}
			}
		}

		_getTextNodesAux(node);
		return textNodesStack;
	}

	// Oculta y reinicia el formulario
	function hideBox() {
		if (_allowMouseEvent) {
			$(_nsid + "form").hide();
			$(_nsid + "boxWrapper").hide();
			$(_nsid + "correction").val("");
			$(_nsid + "status").children().hide();
			_allowMouseEvent = true;
		}
	}

	// Muestra el formulario
	function _showBox(event) {

		hideBox();

		$(_nsid + "title").show();
		$(_nsid + "boxWrapper")
			.css("left", event.pageX)
			.css("top", event.pageY)
			.show();
	}

	// Obtiene el texto seleccionado por el usuario
	function _getSelection() {

		var sel;

		if (window.getSelection) {
			sel = window.getSelection();
		} else if (document.getSelection) {
			sel = document.getSelection();
		} else if (document.selection) {
			sel = document.selection.createRange().text;
		}

		return sel;
	}

	// Inicializa y muestra el formulario cuando el usuario selecciona un texto
	function _getSelectedText(event) {
		var sel = _getSelection(),
			text = String() + sel,
			errata;

		if (text.length > 0) {
			clearTimeout(_timeout);

			_selectedRange = sel.getRangeAt(0);

			_showBox(event);
			errata = $(_nsid + 'errata');
			errata.html(text);
		} else {
			hideBox();
		}
	}

	// Modifica el mensaje de estado del formulario
	function _setStatus(status, allowMouseEvent) {
		_allowMouseEvent = allowMouseEvent;
		$(_nsid + "status").children().hide(1, function () {
			if (status !== undefined && status.length > 0) {
				var idStatus = _nsid + "status-" + status;
				$(idStatus).show();
			}
		});
	}

	// Obtiene el path del elemento seleccionado desde la raíz del DOM
	function _getElementPath(element) {
		return "/" + $(element).parents().andSelf().map(function () {
			var $this = $(this),
				$parent = $this.parent(),
				tagName = this.nodeName,
				nodePosition = 0;

			if (tagName !== undefined && $parent) {
				nodePosition = $parent.contents().filter(function () { return this.nodeName === tagName; }).index(this);
			}

			tagName += "_" + nodePosition;

			return tagName;

		}).get().join("/");
	}

	// Envía el error al gestor de errores en el servidor
	function sendErrata() {

		var errata = $.trim($(_nsid + "errata").text()),
			correction = $.trim($(_nsid + "correction").val()),
			email = $.trim($(_nsid + "email").val()),
			description = $.trim($(_nsid + "description").val()),
			hasErrors = false,
			url = "#",
			path,
			errataWrapper,
			html,
			ip,
			data,
			postID;

		// Control de errores
		if (errata.length === 0) {
			$(_nsid + "errata-error-noerrata").show();
			hasErrors = true;
		}
		if (correction.length === 0) {
			$(_nsid + "correction-error-nocorrection").show();
			hasErrors = true;
		}
		if (email.length !== 0) {
			if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
				$(_nsid + "email-error-invalidformat").show();
				hasErrors = true;
			}
		}

		if (!hasErrors) {

			$(_nsid + "title").hide();
			$(_nsid + "form").hide();
			_setStatus("sendingErrata", false);

			path = escape(
				_getElementPath(_selectedRange.startContainer) + '/' + _letterToken + '_' + _selectedRange.startOffset + "->" +
					_getElementPath(_selectedRange.endContainer) + '/' + _letterToken + '_' + _selectedRange.endOffset
			);

			data = "errata=" + encodeURIComponent(errata) +
				"&correction=" + encodeURIComponent(correction) +
				"&url=" + encodeURIComponent(document.URL) +
				"&path=" + encodeURIComponent(path);

			if (email.length > 0){
				data += "&email=" + encodeURIComponent(email)
			}

			if (description.length > 0){
				data += "&description=" + encodeURIComponent(description)
			}

			console.log("Sent message: " + data);

			// Simulamos la llamada por AJAX con un setTimeout

			setTimeout(function () {
				_setStatus("errataSent", true);
				_timeout = setTimeout(hideBox, 3000);
			}, 1000);

			// Llamada real

			// $.ajax({
			//	url: url,
			//	type: "POST",
			//	data: data
			//	}).done(function(msg){
			//	console.log("Returned message: '" + msg +"'");
			//	_setStatus("errataSent",true);
			//	_timeout = setTimeout(hideBox,3000);
			//});

		}
	}

	// Muestra el formulario de correción
	function showForm() {
		$("." + _ns + "error").hide();
		$(_nsid + 'form').show();
	}

	// Muestra el formulario para dar más detalles
	function showDetails() {
		$(_nsid + 'details').show();
	}

	function init() {

		$("html").append('<div id="com-estudiocaravana-errata-boxWrapper">' +
				'<div id="com-estudiocaravana-errata-box">' +
					'<a id="com-estudiocaravana-errata-title" href="javascript:errata.showForm()">Errata report</a>' +
					'<div id="com-estudiocaravana-errata-form">' +
						'Errata: <span id="com-estudiocaravana-errata-errata"></span>' +
						'<span id="com-estudiocaravana-errata-errata-error-noerrata" class="com-estudiocaravana-errata-error">An errata must be selected</span>' +
						'<br>' +
						'Correction:' +
						'<input type="text" name="com-estudiocaravana-errata-correction" value="" id="com-estudiocaravana-errata-correction"/>' +
						'<span id="com-estudiocaravana-errata-correction-error-nocorrection" class="com-estudiocaravana-errata-error">A correction must be written</span>' +
						'<br>' +
						'<a href="javascript:errata.showDetails()" class="com-estudiocaravana-errata-more">+ details</a>' +
						'' +
						'<div id="com-estudiocaravana-errata-details">' +
							'Description:' +
							'<br>' +
							'<textarea name="com-estudiocaravana-errata-description" id="com-estudiocaravana-errata-description"></textarea><br>' +
							'Email:' +
							'<input type="text" name="com-estudiocaravana-errata-email" value="" id="com-estudiocaravana-errata-email"/>' +
							'<span id="com-estudiocaravana-errata-email-error-invalidformat" class="com-estudiocaravana-errata-error">Invalid email format</span>' +
							'<br>' +
						'</div>' +
						'<a href="javascript:errata.sendErrata()" class="com-estudiocaravana-errata-send">Send errata report</a>' +
					'</div>' +
					'<div id="com-estudiocaravana-errata-status">' +
						'<span id="com-estudiocaravana-errata-status-sendingErrata">Sending errata report...</span>' +
						'<span id="com-estudiocaravana-errata-status-errataSent">Errata sent!</span>' +
					'</div>' +
				'</div>' +
			'</div>');

		var textNodes = _getTextNodes(document);
		textNodes = $(textNodes);
		textNodes.parent().mouseup(_getSelectedText);
	}

	ns = com.estudiocaravana.Errata;

	ns.showForm = showForm;
	ns.showDetails = showDetails;
	ns.sendErrata = sendErrata;
	ns.init = init;

}());

var errata;

$(function () {

	"use strict";

	errata = com.estudiocaravana.Errata;
	errata.init();

});


