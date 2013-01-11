/*
 *  This file contains snippets of code which we use to customize
 *  the jQuery UI components using the widget extend pattern.
 */


(function(global){
	/**
	 * AJAX prefilter added to all $.ajax requests.
	 * Added for debugging profile deleting problems.
	 */
	$.ajaxPrefilter(function(params, original_options, jqXHR){
		if (!original_options) { original_options.data = {}; }
		if (!original_options.data) { original_options.data = {}; }
		
		var new_data = {};
		var data = original_options.data;
		var add_validation_data = data !== null && typeof data === "object" && !(data instanceof Array);
		
		data.page_id = anxs.page_id;

		//prefix the ajax url with the version
		if(anxs.ui_version != undefined && anxs.is_mv){
			params.url = "/" + anxs.ui_version + params.url;
		}
		
		if (add_validation_data) {
			
			//first assign a unique request id
			data.request_id = "" + new Date().getTime() + Math.random()*100;
			
			//now add a body_length field so we can check to see if anything get's dropped
			//between here and the server.
			var body = $.param(data);
			var length = body.length;
			
			//13 is how many characters it takes to encode &body_length=
			length += 13;
			
			var old_length_num_chars = length.toString().length;
			
			//include the characters needed to encode the length itself
			length += old_length_num_chars;
			
			var new_length_num_chars = length.toString().length;
			length += (new_length_num_chars - old_length_num_chars);
			
			data.body_length = length;
			
			//create a new object with the validation fields
			//defined first so they get serialized first
			new_data.body_length = length;
			new_data.request_id = data.request_id;
			
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					if (key !== 'body_length' && key !== 'request_id') {
						new_data[key] = data[key];
					}
				}
			}
			
			original_options.data = new_data;
			
			params.data = $.param(original_options.data);
		}
		
	});

	/*
		Extending jQuery.ui.dialog to allow creation of addtional buttons
		and adding our custom loading spinner graphic.
	*/
	$.extend($.ui.dialog.prototype, (function(orig) {
		return {
			_createButtons: function(buttons) {
				var self = this,
					opts = this.options,
					hasButtons = false,
					hasNavButtons = false,
					uiDialogButtonPane = $('<div></div>')
						.addClass(
							'ui-dialog-buttonpane ' +
							'ui-widget-content ' +
							'ui-helper-clearfix'
						),
					uiButtonSet = $( "<div></div>" )
						.addClass( "ui-dialog-buttonset" )
						.appendTo( uiDialogButtonPane );

				// if we already have a button pane, remove it
				self.uiDialog.find('.ui-dialog-buttonpane').remove();
				uiDialogButtonPane.prepend(
					'<span class="dialog-loader">\
						<img src="/images/spinner.gif" />\
						<span class="status-text"></span>\
					</span>'
				);

				if (typeof buttons === 'object' && buttons !== null) {
					$.each(buttons, function() {
						return !(hasButtons = true);
					});
				}
				if (hasButtons) {
					$.each(buttons, function(name, props) {
						props = $.isFunction( props ) ?
							{click: props, text: name} :
							props;
						var button = $('<button type="button"></button>')
							.addClass('button-'+name)
							.attr( props, true )
							.unbind('click')
							.click(function() {
								props.click.apply(self.element[0], arguments);
							})
							.appendTo(uiButtonSet);
						if ($.fn.button) {
							button.button();
						}
					});
				}

				// Begin modified dialog buttons
				if (typeof opts.navbuttons === 'object' && opts.navbuttons !== null) {
					$.each(opts.navbuttons, function() {
						return !(hasNavButtons = true);
					});
				}
				if (hasButtons || hasNavButtons) {
					uiDialogButtonPane.appendTo(self.uiDialog);
				}
				if (hasNavButtons) {
					this._createNavButtons(opts.navbuttons);
				}
			},
			_createNavButtons: function(buttons) {
				var self = this,
					uiButtonSet = this.element.parent().find('.ui-dialog-buttonset');
				$('<div class="divider back-next"></div>').appendTo(uiButtonSet);
				$.each(buttons, function(name, props) {
					props = $.isFunction( props ) ?
						{click: props, text: name} :
						props;
					var navbutton = $('<button type="button"></button>')
						.addClass('navbutton back-next button-'+name)
						.attr( props, true )
						.unbind('click')
						.click(function() {
							props.click.apply(self.element[0], arguments);
						})
						.appendTo(uiButtonSet);
					if ($.fn.button) {
						navbutton.button();
					}
				});
				$('<div class="divider back-next"></div>').appendTo(uiButtonSet);
			},

			//methods to hide/show spinner and disable main button
			enterSavingMode: function(){
				this.enterLoadingMode('Saving...');
			},
			exitSavingMode: function(){
				this.exitLoadingMode();
			},
			enterLoadingMode: function(text){
				if (!text){ text=''; }
				this.uiDialog.find("button.button-Save, button.button-Confirm").attr("disabled", "disabled");
				this.uiDialog.find('.dialog-loader').show();
				this.uiDialog.find('span.status-text').text(text);
			},
			exitLoadingMode: function(){
				this.uiDialog.find("button.button-Save, button.button-Confirm").removeAttr("disabled");
				this.uiDialog.find('.dialog-loader').hide();
				this.uiDialog.find('span.status-text').empty();
			}
		}
	})($.ui.dialog.prototype['_createButtons']));


	// ##AutoTabber
	// Autotabbing extends dialog and creates tabs based on the structure
	// of the element that the dialog is being applied to. Autotab will
	// create the tab titles, and optionally the prev/next buttons.
	// 
	// Each "autotab" consists of a "autotab-title" and "autotab-content"
	// element, specified in the classname.  Example mark-up:
	// 
	// 	<div id="some-dialog" class="hide dialog">
	// 		<div class="autotab" tabname="tab1">
	// 			<a class="autotab-title" href="#">Title of Tab 1</a>
	// 			<div class="autotab-content">
	// 				Content for tab 1
	// 			</div>
	// 		</div>
	// 		<div class="autotab" tabname="export">
	// 			<a class="autotab-title" href="#">Title of Tab 2</a>
	// 			<div class="autotab-content">
	// 				Content for tab 2
	// 			</div>
	// 		</div>
	// 	</div>
	// 
	// To enable autotabs, simply specify "autoTab" in the dialog options to
	// something that evaluates to true.
	// 
	// Current options are:
	// 	addNavButtons:  true/false
	// 		Whether or not to prepend next/back buttons to the buttons
	// 		pane of the dialog.
	// 
	// Example usage:
	// 
	// 		$("#some-dialog").dialog({
	// 		autoOpen: false,
	// 		width: 700,
	// 		height: 500,
	// 		modal: true,
	// 		autoTab: {
	// 			addNavButtons: true
	// 		},
	// 		buttons: {
	// 			'Close': function(){
	// 				$(this).dialog('close');
	// 			}
	// 		}
	// 	});
	// 
	// 
	// open dialog, then switch to tab 2
	// 
	// `$("#some-dialog").dialog('open').dialog('openTab', 'tab2');`
	// 
	// you can also hide and show tabs
	// `..dialog('hideTab', 'tab1');`


	var AutoTabber = function(dialog, options){this.init(dialog, options)}
	AutoTabber.prototype = {
		onBeforeTabOpened: function() { },
		onTabOpened: function(){},
		canSwitchTabs: function(currentTab, requestedTab) {return true;},
		dialog: null,
		currentIndex: 0,
		tabs: [],

		init: function(dialog, options){
			this.dialog = dialog;
			this.tabs = [];

			var tabs = dialog.element.find(".autotab");
			var tabnav = dialog.uiDialogTitlebar.append('<div class="ui-dialog-tabnav"/>');
			for (var i=0; i<tabs.length; i++){
				var tab = tabs.eq(i);
				var title = tab.children(".autotab-title").hide();
				var content = tab.children(".autotab-content").hide();
				this.addTab(title.clone(), content, tab.attr("tabname"));
			}

			if (options.addNavButtons) {
				var me = this;
				var navbuttons = {
					'Next': function(){me.openNextTab();return false;},
					'Back': function(){me.openPrevTab();return false;}
				};
				dialog._createNavButtons(navbuttons);
			}

			if (options.onTabOpened){
				this.onTabOpened = options.onTabOpened;
			}
			if (options.onBeforeTabOpened) {
				this.onBeforeTabOpened = options.onBeforeTabOpened;
			}
			if (options.canSwitchTabs){
				this.canSwitchTabs = options.canSwitchTabs;
			}
		},

		// Adds a tab at the given index, which can be accessed with "openTab".
		addTab: function(title, content, name, index) {
			// If index is null or undefined, tab is added to the end.
			if (typeof index !== 'integer'){
				index = this.tabs.length;
			}
			// If name is null or undefined, name is not used.
			if (typeof name == 'undefined'){
				name = '';
			}

			// Splice in the tab at index.
			this.tabs.splice(index, 0, {
				title: title.show(),
				content: content,
				isVisible: true,
				name: name
			});

			// Add to title bar.
			if (index > 0) {
				// This tab is the first, append it to the title bar.
				this.tabs[index-1].title.after(title);
			} else {
				// This tab is the first, append it to the title bar.
				var titleBar = this.dialog.uiDialogTitlebar.children('.ui-dialog-tabnav');
				titleBar.append(title);
			}

			for (var i=0; i<this.tabs.length; i++){
				if (!this.tabs[i]) continue;
				this.tabs[i].index = i;
			}

			var me = this;
			title.click(function(){me.openTab(index);return false;});
		},
		_getTab: function(indexOrName){
			var index;
			if (typeof indexOrName === 'string'){
				for (var i=0; i<this.tabs.length; i++){
					if (!this.tabs[i]) continue;
					if (this.tabs[i].name==indexOrName){
						index = i;
						break;
					}
				}
			} else {
				index = indexOrName;
			}

			if (index < 0) index = this.tabs.length-1;
			if (index >= this.tabs.length) index = 0;

			var tab = this.tabs[index];
			if (!tab) return null;
			tab.index = index;
			return tab;
		},
		_getNextTab: function(){
			for (var i=this.currentIndex+1; i<this.tabs.length; i++){
				if (this._getTab(i).isVisible) return this._getTab(i);
			}
		},
		_getPrevTab: function(){
			for (var i=this.currentIndex-1; i>=0; i--){
				if (this._getTab(i).isVisible) return this._getTab(i);
			}
		},

		// Opens a tab based on the tab's name or index.
		openTab: function(indexOrName){
			var tab = this._getTab(indexOrName),
				lastTab = this._getTab(this.currentIndex);

			// Are we allowed to make the tab switch?
			if (this.currentIndex !== indexOrName) {
				if (this.canSwitchTabs(lastTab, tab) === false) {return;}
			}

			if (this.onBeforeTabOpened({ tab: tab, lastTab: lastTab }) === false) {
				// onBeforeTabOpened can return false to cancel the tab open.
				return;
			}

			// Reset all tabs, then show/enable this one.
			for (var i in this.tabs){
				var t = this.tabs[i];
				if (typeof t === 'function') break;
				t.title.removeClass("selected");
				t.content.hide();
			}

			tab.title.addClass("selected");
			tab.content.show();
			this.currentIndex = tab.index;

			this._refreshNavButtons();

			this.onTabOpened({tab: tab, lastTab: lastTab});
		},

		// Update the next/back buttons' enabled/disabled values.
		_refreshNavButtons: function() {
			var navpane = this.dialog.element.nextAll(".ui-dialog-buttonpane");
			var btn_back = navpane.find(".button-Back");
			var btn_next = navpane.find(".button-Next");

			btn_back.button( "option", "disabled", this._getPrevTab() ? false : true);
			btn_next.button( "option", "disabled", this._getNextTab() ? false : true);
		},

		// Toggles the visibility of the back and next buttons.
		toggleBackNextButtons: function(bool) {
			this.dialog.element.nextAll(".ui-dialog-buttonpane").find('.back-next').toggle(bool);
		},

		// Hides a tab.
		hideTab: function(indexOrName) {
			var tab = this._getTab(indexOrName);
			tab.isVisible = false;
			tab.title.hide();
			this._refreshNavButtons();
		},
		showTab: function(indexOrName) {
			var tab = this._getTab(indexOrName);
			tab.isVisible = true;
			tab.title.show();
			this._refreshNavButtons();
		},
		openNextTab: function() {
			var tab = this._getNextTab();
			if (tab) this.openTab(tab.index);
		},
		openPrevTab: function() {
			var tab = this._getPrevTab();
			if (tab) this.openTab(tab.index);
		}
	}

	// Extending jQuery ui.dialog with AutoTabber functionality.
	$.extend($.ui.dialog.prototype, (function(super_open) {
		return {
			initAutoTabber: function() {
				if (this.options.autoTab){
					// Create a new AutoTabber instance if one does not exist already.
					if (!this.AutoTabber) {
						this.AutoTabber = new AutoTabber(this, this.options.autoTab);
					}
					this.openTab(0);
				}
			},
			open: function() {
				// init autotab if it's set
				this.initAutoTabber();

				if (this._isOpen) {return;}

				var t = this.options.title;
				var $titleSpan = this.uiDialogTitlebar.children(':eq(0)');
				var $titleDiv = $('<div>')
					.html($titleSpan.html())
					.attr({
						'id': $titleSpan[0].id,
						'class': $titleSpan[0].className
					});
				$titleDiv[(t === ' ' || t === '' || t === '&nbsp;') ? 'hide' : 'show']();
				$titleSpan.replaceWith($titleDiv);

				// Begin jquery ui open function
				var self = this,
					options = self.options,
					uiDialog = self.uiDialog;

				self.overlay = options.modal ? new $.ui.dialog.overlay(self) : null;
				self._size();
				self._position(options.position);
				uiDialog.show(options.show);
				self.moveToTop(true);
				self._isOpen = true;
				self._trigger('open');

				return self;
			},
			openTab: function(indexOrName){
				if (!this.AutoTabber){throw new Error("AutoTabber is not yet initialized.  Call initAutoTabber or wait until dialog is first opened");}
				this.AutoTabber.openTab(indexOrName);
			},
			hideBackNextButtons: function(){
				if (!this.AutoTabber){throw new Error("AutoTabber is not yet initialized.  Call initAutoTabber or wait until dialog is first opened");}
				this.AutoTabber.toggleBackNextButtons(false);
			},
			showBackNextButtons: function(){
				if (!this.AutoTabber){throw new Error("AutoTabber is not yet initialized.  Call initAutoTabber or wait until dialog is first opened");}
				this.AutoTabber.toggleBackNextButtons(true);
			},
			hideTab: function(indexOrName){
				if (!this.AutoTabber){throw new Error("AutoTabber is not yet initialized.  Call initAutoTabber or wait until dialog is first opened");}
				this.AutoTabber.hideTab(indexOrName);
			},
			showTab: function(indexOrName){
				if (!this.AutoTabber){throw new Error("AutoTabber is not yet initialized.  Call initAutoTabber or wait until dialog is first opened");}
				this.AutoTabber.showTab(indexOrName);
			},
			getTab: function(indexOrName){
				if (!this.AutoTabber){throw new Error("AutoTabber is not yet initialized.  Call initAutoTabber or wait until dialog is first opened");}
				return this.AutoTabber._getTab(indexOrName);
			}
		}
	})($.ui.dialog.prototype.open));


	/*
		Overriding default ui.dialog resize handler
	*/
	// Remove ui.dialog resize handler
	// To avoid this IE-specific bug: http://bugs.jqueryui.com/ticket/4758
	$.extend($.ui.dialog.overlay.prototype.constructor, (function(superResize) {
		return {
			resize: function() {
				//console.log('EXTEND');
			}
		}
	})($.ui.dialog.overlay.prototype.constructor.resize));


	/*
		Extending jQuery.ui.autocomplete to fix problem with menu width when used inside dialogs
	*/
	$.extend($.ui.autocomplete.prototype, (function(orig) {
		return {
			_suggest: function(items) {
				var result = orig.call(this, items),
					textWidth = this.element.outerWidth();

				if (this.element.closest('.dialog').length > 0)
					this.menu.element.width(Math.max(200, textWidth));

				if (this.menu.element.hasClass('page-nav'))
					this.menu.element.width((this.menu.element.height() < parseInt(this.menu.element.css('max-height'))) ? 21 : 36);

				return this;
			}
		}
	})($.ui.autocomplete.prototype['_suggest']));


	// Case insensitive ":contains" selector
	jQuery.expr[':'].ci_contains = function(a,i,m){
	    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
	};
	
	// Create a function that toggles the visibility of an element and disables all the controls inside
	$.fn.toggleEnable = function(visible,all_enable) {	
		$(this).toggle(visible);
		return $(this).toggleForm(visible,all_enable);
	}
	
	$.fn.toggleForm = function(enable, all_enable) {
		var $formElements = $(this).find('input,textarea,select,button').add(this);
		if(enable) {
			if(!all_enable) $formElements = $formElements.filter(':visible');
			$formElements.removeAttr('disabled');
		} else {		
			$formElements.attr('disabled','disabled');		
		}
		return $(this);
	}
	
	// Reset a form to the default values
	$.fn.reset = function() {
		
		// Go through all the inputs and reset them to the default value
		var inputs = $(this).find('input[type="text"], input[type="password"], input[type="file"], textarea');
		inputs.each(function(i,item){
			if(typeof item.defaultValue !== undefined && item.defaultValue != null) {
				$(item).val(item.defaultValue);
			} else {
				$(item).val('');
			}
		});
		
		// Go through the check inputs and reset to their default value
		var checkInputs = $(this).find('input[type="checkbox"], input[type="radio"]');
		checkInputs.each(function(i,item){
			if(typeof item.defaultChecked !== undefined && item.defaultChecked !== null && item.defaultChecked) {
				$(item).attr('checked','checked');
			} else {
				$(item).removeAttr('checked');
			}
		});
		
		// Go through the select elements and reset to their defalt values
		var selectInputs = $(this).find('option');
		selectInputs.each(function(i,item) {
			if(typeof item.defaultSelected !== undefined && item.defaultSelected !== null && item.defaultSelected) {
				$(item).attr('selected','selected');
			} else {
				$(item).removeAttr('selected');
			}
		});
	}	
})(this);
