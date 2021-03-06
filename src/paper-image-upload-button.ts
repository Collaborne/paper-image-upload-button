import { css, customElement, html, LitElement, property } from 'lit-element';

import '@polymer/iron-icon';
import '@polymer/iron-icons';

/**
 * Material Design upload button that previews the image (Polymer)
 *
 * @demo demo/index.html
 */
@customElement('paper-image-upload-button')
export class PaperImageUploadButton extends LitElement {
	/**
	 * Set to true if users should be allowed to upload images
	 */
	@property({type: Boolean})
	public disabled: boolean = false;

	/**
	 * Icon that is shown during hover
	 */
	@property({type: String})
	public icon: string = 'icons:file-upload';

	/**
	 * URL to the currently shown image
	 */
	@property({type: String})
	public image?: string;

	/**
	 * True if the image is currently uploading
	 */
	@property({type: Boolean, reflect: true})
	public uploading: boolean = false;

	/**
	 * Set to true if element doesn't have an image
	 */
	@property({type: Boolean, reflect: true})
	protected noImage: boolean = true;

	/**
	 * Set to true if users should be allowed to upload images
	 */
	@property({type: Boolean, reflect: true})
	private canUpload: boolean = false;

	static get styles() {
		return css`
			:host {
				display: inline-block;
				position: relative;
				overflow: hidden;
				border-width: var(--paper-image-upload-button-border-width, 2px);
				border-radius: var(--paper-image-upload-button-border-radius, 50%);
				border-style: var(--paper-image-upload-button-border-style, solid);
				border-color: var(--paper-image-upload-button-border-color, gray);
				width: var(--paper-image-upload-button-width, 92px);
				height: var(--paper-image-upload-button-height, 92px);
				transition: background-color 0.25s;
			}
			:host([canupload]) label, :host([canupload]) .custom-overlay {
				cursor: pointer;
			}
			:host([canupload]:hover), :host([uploading]) {
				border-color: var(--paper-image-upload-button-hover-border-color, black);
			}

			#image {
				width: 100%;
				height: 100%;
				display: inline-block;
				border-radius: var(--paper-image-upload-button-border-radius, 50%);
				overflow: hidden;
				@apply --layout-center-center;
				@apply --layout-vertical;
				box-sizing: border-box;
				color: white;
				background-size: var(--paper-image-upload-button-image-size, cover);
				background-position: var(--paper-image-upload-button-image-position, center);
				background-color: var(--paper-image-upload-button-background-color, black);
				background-repeat: no-repeat;
				transition: filter 0.25s, background-color 0.25s;
			}

			:host([canupload]:hover) #image, :host([uploading]) #image {
				filter: brightness(40%);
				background-color: var(--paper-image-upload-button-hover-background-color, black);
			}

			.custom-overlay, .icon {
				position: absolute;
				opacity: 0;
				transition: opacity 0.25s;
			}
			.icon {
				top: calc(50% - 12px);
				left: calc(50% - 12px);
				color: white;
			}
			.custom-overlay {
				top: calc(50% + 12px);
				width: 100%;
				text-align: center;
			}

			:host([canupload]:hover) .icon, :host([canupload][noimage]) .icon, :host([uploading]) .icon, :host([canupload]:hover) .custom-overlay, :host([canupload][noimage]) .custom-overlay, :host([uploading]) .custom-overlay {
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
		`;
	}

	protected render() {
		const imageUrl = this.image ? `url(${this.image})` : null;
		const icon = !this.uploading ? this.icon : 'icons:refresh';

		return html`
			<label for="file" id="image" style="background-image: ${imageUrl}"></label>
			<label for="file" class="icon"><iron-icon icon="${icon}"></iron-icon></label>
			<div class="custom-overlay">
				<slot></slot>
			</div>
			<input
				id="file"
				type="file"
				accept="image/*"
				hidden
				@change="${this._onFileChange}"
				.disabled="${!this.canUpload}">`;
	}

	protected updated() {
		this.canUpload = !this.disabled && !this.uploading;
		this.noImage = !this.image || this.image.length === 0;
	}

	private _onFileChange() {
		const files = this.fileEl.files;
		if (!files || files.length === 0) {
			return;
		}

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

		// Reset file input element, so that the user can upload the same
		// file again (e.g. if the dialog was cancelled in between)
		this.fileEl.value = '';
	}

	private get fileEl(): HTMLInputElement {
		return this.shadowRoot!.getElementById('file')! as HTMLInputElement;
	}
}
