import Ember from 'ember';
import layout from 'ember-tooltips/templates/components/tooltip-on-element';

export const INTERACTION_EVENT_TYPES = ['mouseenter', 'click', 'focusin'];

export default Ember.Component.extend({
	layout,

	event: 'hover',

	enableLazyRendering: false,
	hasUserInteracted: false,
	shouldRender: Ember.computed('enableLazyRendering', 'hasUserInteracted', function() {
		if (!this.get('enableLazyRendering')) {
			// users must opt-in to enableLazyRendering
			return true;
		} else {
			return this.get('hasUserInteracted');
		}
	}),
	didInsertElement() {
		this._super(...arguments);

		if (this.get('hasUserInteracted')) {
			return;
		}

		const $element = this.$();
		const $parent = $element.parent();

		INTERACTION_EVENT_TYPES.forEach((eventType) => {
			$parent.on(`${eventType}.lazy-ember-tooltip`, () => {
				if (!this.get('hasUserInteracted')) {
					this.set('hasUserInteracted', true);
					Ember.run.next(() => {
						$element.trigger(eventType);
					});
				} else {
					$parent.off(`${eventType}.lazy-ember-tooltip`);
				}
			});
		});
	},

	willDestroyElement() {
		this._super(...arguments);

		const $parent = this.$().parent();
		INTERACTION_EVENT_TYPES.forEach((eventType) => {
			$parent.off(`${eventType}.lazy-ember-tooltip`);
		});

	},
});
