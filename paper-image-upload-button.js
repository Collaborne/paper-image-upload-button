import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/iron-icon';
import '@polymer/iron-icons';

/**
 * Material Design upload button that previews the image (Polymer)
 *
 * @demo demo/index.html
 */
class PaperImageUploadButton extends GestureEventListeners(PolymerElement) {
	static get template() {
		return html`
		<style>
			:host {
				display: inline-block;
				position: relative;
				overflow: hidden;
				border-width: var(--paper-image-upload-button-border-width, 2px);;
				border-radius: var(--paper-image-upload-button-border-radius, 50%);
				border-style: var(--paper-image-upload-button-border-style, solid);
				border-color: var(--paper-image-upload-button-border-color, gray);
				transition: background-color 0.25s;
			}
			:host([can-upload]) {
				cursor: pointer;
			}
			:host([can-upload]:hover), :host([uploading]) {
				border-color: var(--paper-image-upload-button-hover-border-color, black);
			}

			#image {
				display: inline-block;
				@apply --layout-center-center;
				@apply --layout-vertical;
				width: var(--paper-image-upload-button-width, 92px);
				height: var(--paper-image-upload-button-height, 92px);
				box-sizing: border-box;
				color: white;
				background-size: var(--paper-image-upload-button-image-size, cover);
				background-position: var(--paper-image-upload-button-image-position, center);
				background-color: var(--paper-image-upload-button-background-color, black);
				background-repeat: no-repeat;
				transition: filter 0.25s, background-color 0.25s;
			}

			:host([can-upload]:hover) #image, :host([uploading]) #image {
				filter: brightness(40%);
				background-color: var(--paper-image-upload-button-hover-background-color, black);
			}

			.overlay {
				position: absolute;
				top: calc(50% - 12px);
				width: 100%;
				text-align: center;
				opacity: 0;
				transition: opacity 0.25s;
			}

			.icon {
				color: white;
			}
			:host([can-upload]:hover) .overlay, :host([can-upload][no-image]) .overlay, :host([uploading]) .overlay {
				opacity: 1;
			}

			@keyframes spinning {
				from {
					transform: rotate(0deg);
				}
				to {
					transform: rotate(360deg);
				}
			}
			:host([uploading]) .icon {
				animation: spinning 1s linear infinite;
			}
		</style>
		<div id="image" on-tap="_onTapUpload"></div>
		<div class="overlay">
			<iron-icon class="icon" icon="[[_computeIcon(icon, uploading)]]" on-tap="_onTapUpload"></iron-icon><br>
			<slot></slot>
		</div>
		<input id="file" type="file" accept="image/*" hidden="">`;
	}

	static get is() {
		return 'paper-image-upload-button';
	}

	static get properties() {
		return {

			/**
			 * Set to true if users should be allowed to upload images
			 */
			canUpload: {
				computed: '_computeCanUpload(disabled, uploading)',
				reflectToAttribute: true,
				type: Boolean,
			},

			/**
			 * Set to true if users should be allowed to upload images
			 */
			disabled: {
				type: Boolean,
				value: false,
			},

			/**
			 * Icon that is shown during hover
			 */
			icon: {
				type: String,
				value: 'icons:file-upload'
			},

			/**
			 * URL to the currently shown image
			 */
			image: String,

			/**
			 * True if no image is configured
			 */
			noImage: {
				computed: '_computeNoImage(image)',
				reflectToAttribute: true,
				type: Boolean,
				value: true,
			},

			/**
			 * True if the image is currently uploading
			 */
			uploading: {
				reflectToAttribute: true,
				type: Boolean,
				value: false,
			},
		};
	}

	static get observers() {
		return [
			'_onImageChanged(image)',
		];
	}

	ready() {
		super.ready();

		this.$.file.addEventListener('change', () => {
			const files = this.$.file.files;
			if (files.length > 0) {
				const file = files[0];
				const img = new Image();
				img.onload = () => {
					this.dispatchEvent(new CustomEvent('upload-image', {
						bubbles: true,
						composed: true,
						detail: {
							file,
							height: img.height,
							width: img.width,
						},
					}));
				};
				img.src = window.URL.createObjectURL(file);
			}
			// Reset file input element, so that the user can upload the same
			// file again (e.g. if the dialog was cancelled in between)
			this.$.file.value = '';
		});
	}

	_onImageChanged(image) {
		this.$.image.style.backgroundImage = image ? `url(${image})` : null;
	}

	_onTapUpload() {
		if (!this.canUpload) {
			return;
		}

		// Trigger file upload
		this.$.file.click();
	}

	_computeCanUpload(disabled, uploading) {
		return !disabled && !uploading;
	}

	_computeIcon(icon, uploading) {
		return !uploading ? icon : 'icons:refresh';
	}

	_computeNoImage(image) {
		return !image || image.length === 0;
	}
}
window.customElements.define(PaperImageUploadButton.is, PaperImageUploadButton);
