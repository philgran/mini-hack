var anxs = window.anxs || {};

function isValidEmail(s) {
	var emailRegEx = /^((\w+\+*\-*)+\.?)+@((\w+\+*\-*)+\.?)*[\w-]+\.[a-z]{2,6}$/;
	return emailRegEx.test(s);
}

var find_object_by_col = function(objects, col, val) {
	var found_item = false;
	if (objects) {
		$.each(objects, function(i, item) {
			if (item[col] == val) {
				found_item = item;
			}
		});
		if (found_item) {
			return found_item;
		} else {
			throw col + ' with value ' + val + ' not found';
		}
	}
}

function AssertException(message) {this.message = message;}
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}

var zebra = function(table_id) {
	if (!$.browser.msie && !$(table_id).is(".use-zebra-function")) {
		return false;
	} else {
		$("#" + table_id + " tbody tr").removeClass('odd even');
		$("#" + table_id + " tbody tr:visible").each(function(i, item) {
			$(item).addClass(i % 2 == 0 ? 'even' : 'odd');
		});
	}
}

var zebra_children = function(table_id) {
	if (!$.browser.msie && !$(table_id).is(".use-zebra-function")) {
		return false;
	} else {
		$(table_id + ' tbody tr').removeClass('odd even');
		$(table_id + ' tbody tr:visible').each(function(i, item) {
			$(item).addClass(i % 2 == 0 ? 'even' : 'odd');
		});
	}
}

anxs.capitalize = function(s) {
	//capitalize the first character in s.
	if (typeof s === 'string'){
		return s.charAt(0).toUpperCase() + s.slice(1);
	} else {
		return;
	}
}

anxs.capitalizeAll = function(s) {
	//capitalize all words (anything after a space) in s.
	var pos = 0;
	if (typeof s === 'string'){
		s = s.charAt(0).toUpperCase() + s.substring(1);
		while(pos < s.lastIndexOf(' ')){
			pos = s.indexOf(' ', pos);
			pos++;
			s = s.substring(0, pos) + s.charAt(pos).toUpperCase() + s.substring(pos+1);
		}
		return s;
	} else {
		return;
	}
}

$(document).ajaxComplete(function(ev, xhr, s) {
	
	function _redirToLogout() {
		alert("Your session has timed out.\n\nPlease log back in to AppNexus Console to continue.");
		var redir = encodeURIComponent(document.location.href);
		document.location.href = '/index/signout?redir=' + redir;
	}
	
	try {
		var response = eval('(' + xhr.responseText + ')');
		if (response != null) {
			if (response.login_required != null && response.login_required == true) {
				_redirToLogout();
			}
		}
	} catch (e) {}
});

var close_dialog_actions = function(parent_selector) {
	var parent = $(parent_selector);
	
	parent.find(".input").val('');
	parent.find(".hide").hide();
	parent.find(".remove-on-close").remove();
	parent.find(".hide-on-close").hide();
	parent.find(".show-on-close").show();
	parent.find(".check-on-close").attr('checked', true);
	parent.find(".select-on-close").attr('selected', true);
	parent.find(".uncheck-on-close").attr('checked', false);
	parent.find(".disable-on-close").attr('disabled', true);
	parent.find(".enable-on-close").attr('disabled', false);
	parent.find(".set-title-as-value-on-close").each(function(i, item) {
		var $item = $(item);
		$item.val($item.attr('title'));
		if ($item.hasClass('change-on-close')) {
			$item.trigger('change');
		}
	});
}

var minutes_to_mhd = function(minutes, plural_only_on_multiple) {
	if (plural_only_on_multiple === null) {
		plural_only_on_multiple = false;
	}
	var vals = {};
	switch(true) {
		case minutes % 1440 == 0:
			vals = {
				value: minutes / 1440,
				unit: 'day'
			}
			break;
		case minutes % 60 == 0:
			vals = {
				value: minutes / 60,
				unit: 'hour'
			}
			break;
		default:
			vals = {
				value: minutes,
				unit: 'minute'
			}
			break;
	}
	if (plural_only_on_multiple) {
		if (vals.value !== 1) {
			vals.unit = vals.unit + 's';
		}
	} else {
		vals.unit += 's';
	}
	return vals;
}



String.prototype.template = function (o) {
	if (!o) {
		return this.toString();
	}
	return this.replace(/{([^{}]*)}/g,
		function (a, b) {
			var levels = b.split('.');
			var r = o;
			$.each(levels, function(i, _level){
				r = r[_level];
				/* Need this check because if we go two levels too deep
				 * then JS will throw a TypeError.
				 */
				if (typeof(r) == 'undefined'){
					return false;
				}
			});
			//var r = o[b];
			if (r === null) {
				return '';
			} else {
				return typeof r === 'string' || typeof r === 'number' ? r : a;
			}
		}
	);
};

/**
 * Session Monitor takes care of warning and logging users out.
 * Relies on server controller "/index/last-activity' returning
 * amount of time (in seconds) that the user has been idle.
 * 
 * To enable it, simple call SessionMonitor.init({
 * 		time_til_timeout: 60*60,
 * 		time_til_warning: 60*55
 * })
 * 
 * All units in seconds.
 */
SessionMonitor = {
	time_til_timeout: null,
	time_til_warning: null,
	init: function(params){//units in seconds, please.
		if (!params) params = {};
		this.time_til_timeout = params.time_til_timeout || 60*60;
		this.time_til_warning = params.time_til_warning || 55*60;
		this.restart(0);
		
		//set up session sign out warning dialog
		var me = this;
		$("#renew-session").dialog({
			autoOpen: false,
			width: 500,
			modal: true,
			buttons: {
				'Continue Session': function() {
					$(this).dialog('close');
					//tell server to update activity to now.
					$.get('/index/continue-session');
					//restart timer
					me.restart(0);
				}
			},
			open: function(){
				this.old_title = document.title;
				document.title = "[Continue Session?] " + this.old_title;
			},
			close: function(){
				document.title = this.old_title || anxs.page_title;
			}
		});
	},

	//sets a timeout for either to warning time, or the logout time
	//calls checkTime() when it fires.
	timeout: null,
	restart: function(time_idle){
		if (time_idle > this.time_til_warning){
			//set timeout to be at logout time
			var temp = this.time_til_timeout - time_idle;
		}else{
			//set timeout to be at warning time
			var temp = this.time_til_warning - time_idle;
		}
		
		clearTimeout(this.timeout);
		var me = this;
		this.timeout = setTimeout(
			function(){me.checkTime();},
			(temp+5) * 1000 
		);	//we add a 5 second buffer to make sure we don't call too early.
	},
	
	//finds out how long user has globally been inactive
	//and takes action accordingly
	checkTime: function(){
		var me = this;
		clearTimeout(this.timeout);
		$.get('/index/get-idle-time', function(data) {
			if (data.status !== "OK") {
				//force log out by setting time_idle to be expired.
				data.time_idle = me.time_til_timeout + 1;
			}
			
			var time_idle = data.time_idle;
			if (time_idle > me.time_til_timeout){
				//force log out.
				var redir = encodeURIComponent(document.location.href);
				document.location.href = '/index/signout?redir=' + redir;
			} else if (time_idle > me.time_til_warning){ 
				//show warning dialog.
				$("#renew-session").dialog('open');
				me.restart(time_idle);
			} else { 
				//close dialog (if it's open)
				$("#renew-session").dialog('close');
				me.restart(time_idle);
			}
		}, 'json');
	}
}

var dialog_save_process_working = function() {
	$(".button-Save").attr("disabled", "disabled");
	$(".button-Confirm").attr("disabled", "disabled");
}

var dialog_save_process_complete = function() {
	$(".button-Save").removeAttr("disabled");
	$(".button-Confirm").removeAttr("disabled");
	$(window).unbind('keyup');
}

var dialog_save_on_enter = function() {
	$(dialog_name + " form input:visible:not(':disabled'):first").focus();
};

// Global height calculation
$(function(){
	var setMasterHeight = function(from_resize) {
		var $panes = $('#panes'),
			$win = $(window),
			$mainInner = $('#main-inner'),
			$toolbar = $('#main-inner > .toolbar'),
			gth = $('.global-toolbar').outerHeight(true),
			mdh = $('#main').outerHeight(true) - $('#main').height(),
			fth = $('#footer').outerHeight(true),
			tbh = 0,
			panes_height = 445,
			total_height = $win.height();

		// Do different stuff if this is not the initial page load
		if (from_resize) {
			tbh = $toolbar.outerHeight(true) + 1;
		} else {
			$toolbar.height(parseInt($toolbar.css('min-height')));
			tbh = $toolbar.outerHeight(true) + 1;
			$toolbar.height('auto');
		}

		// console.log(total_height, gth, mdh, tbh, fth);
		panes_height = total_height - (gth + mdh + tbh + fth);
		
		$panes.height(panes_height);

		if ($panes.length === 0) {
			$mainInner.height(panes_height);
		}
	};
	
	setMasterHeight(false);
	
	$(window).bind('resize.masterHeight', function(){
		setMasterHeight(true);
	});
	
	anxs.setMasterPaneHeight = setMasterHeight;
	anxs.setMasterHeight = setMasterHeight;
	anxs.unsetMasterHeight = function() {
	        $(window).unbind('.masterHeight');
	        $('#main-inner').height('auto');
	};
});

var hide_selected_pane = function(row) {
	var treenav_checked_item_count = $(".select-for-edit:checked").length;
	$('.lower-pane-unselected').show();
	$('.lower-pane-selected').hide();
	$('#breadcrumb-bar').hide();
	if (treenav_checked_item_count > 0) {
		if(row && row.attr('id').indexOf('placement') != -1){
			//if we selected a placement hide the site details data
			$("#site-details-container").hide();
			//and hide the full edit button
			$('.site-view').find('.controls').hide();
		}
		$(".lower-pane-unselected p").html('<b>' + treenav_checked_item_count + (treenav_checked_item_count > 1 ? ' items' : ' item') +' selected.<\/b> ' + (treenav_checked_item_count > 1 ? 'Use the toolbar above to bulk edit applicable items.' : 'Click the item\'s row to view details, or use the toolbar above to bulk edit applicable items.'));
	} else {
		$(".lower-pane-unselected p").html("<b>Click on an item in the pane above.</b> You will be able to view and edit the selected item's details.");
		$('.persistent-toolbar-container').addClass('hide');
	}
}


var resize_creative_iframe = function(page_type, layout, cr_width, cr_height) {
	$("." + layout + " .creative-preview iframe").width(cr_width).height(cr_height);
	$("." + layout + " .creative-preview").width(cr_width);
	var pane_width = '';
	if (page_type === 'creative') {
		pane_width = $(".ui-layout-inner-center").width();
		if (cr_width / pane_width < .5 || pane_width - cr_width - 32 > 300) {
			$("#creative-details .creative-information").width(pane_width - cr_width - 32);
		}
	} else if (page_type === 'placement') {
		//should no longer be in use
		pane_width = $(".ui-layout-inner-south").width();
		if (cr_width / pane_width > .5 || pane_width - cr_width - 32 < 300) {
			$("#inline-placement-form").width('100%');
		}
		else {
			$("#inline-placement-form").width('45%');
		}
	}
}

// Mapping jQuery-extended serializeJSON to framework method
$.fn.serializeJSON = function() {
	return anx.Util.serializeJSON(this);
};

var timeouts = {};
$.postpone = function(name, time, fn){
	clearTimeout(timeouts[name]);
	timeouts[name] = setTimeout(fn, time);
}

$.fn.setValue = function(val, val_on_null) {
	if (val_on_null === undefined) {
		val_on_null = '';
	}
	$(this).val(val === null ? val_on_null : val);
	return this;
}
