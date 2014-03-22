;(function(factory) {
	if (typeof define === "function" && define.amd) {
		// AMD anonymous module
		define(["knockout", "jquery"], factory);
	} else {
		// No module loader (plain <script> tag) - put directly in global namespace
		factory(window.ko, jQuery);
	}
})(function(ko, $) {
	var jqvs = {};
	
	/**
	 * visualState-binding
	 * 
	 * jQuery event "jqvs-init" will be triggered when ko.applyBindings has called.
	 * jQuery event "jqvs-changed" will be triggered when changed your ViewModel's property.
	 * Please handle each events with jQuery.
	 *
	 * 次のときにそれぞれの jQuery イベントが発火します。
	 * jQuery でハンドルして下さい
	 * 'jqvs-init': ko.applyBindings によって visualState がバインドされたとき
	 * 'jqvs-changed': visualState にバインドされたプロパティが変更されたとき
	 * 
	 * ex)
	 *   $('.foo').on('jqvs-init', function(e, state) {
	 *     ko.unwrap(state.shown) ? $(this).show() : $(this).hide();
	 *   }).on('jqvs-changed', function(e.state) {
	 *     ko.unwrap(state.shown) ? $(this).fadeIn() : $(this).fadeOut();
	 *   });
	 *
	 */
	ko.bindingHandlers['visualState'] = {
		init: function(element, valueAccessor) {
			$(element).trigger('jqvs-init', [ valueAccessor() ]);
		},
		update: function(element, valueAccessor) {
			ko.bindingHandlers.css.update(element, valueAccessor);
			$(element).trigger('jqvs-changed', [ valueAccessor() ]);
		}
	}
	
	// sequencers that grouped by group_id
	var sequencers = {};
	
	/**
	 * Sequencer that invokes functions in func_array one by one.
	 * Please call the function parameter "next" at the end of each functions process.
	 * 関数配列を逐次実行するためのシーケンサ
	 * 呼び出される関数では引数として受け取った next を
	 * 処理が終わった時点で呼び出してください。
	 *
	 * @constructor
	 * @param {[callback]} func_array
	 * @param {string} [group_id] when passed this, this Sequencer stops all sequencers that belongs same group_id when start has called.
	 */
	jqvs.Sequencer = function (func_array, group_id) {
		var self = this
			, i = 0
			, alive = true
			;
		function next() {
			if (alive && func_array[i]) {
				func_array[i++](arguments.callee);
			}
		}

		/**
		 * Stop this sequencer
		 * このシーケンサを中断します。
		 */
		self.stop = function() {
			alive = false;
		};

		/**
		 * Resume this sequencer from where it stopped.
		 * このシーケンサを、中断したところから再開します。
		 */
		self.resume = function() {
			alive = true;
			next();
		};

		/**
		 * Start this sequencer from the beginning.
		 * このシーケンサを最初から実行します。
		 */
		self.start = function() {
			if (group_id) {
				ko.utils.arrayForEach(sequencers[group_id], function(seq) { seq.stop(); });
			}
			i = 0;
			alive = true;
			next();
		};
		
		if (group_id) {
			sequencers[group_id] = sequencers[group_id] || [];
			sequencers[group_id].push(self);
		}
	}
	
	ko.jqvs = jqvs;
});
