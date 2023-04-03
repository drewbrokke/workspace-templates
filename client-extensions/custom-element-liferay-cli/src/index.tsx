import React from 'react';
import ReactDOM from 'react-dom';

import AppComponent from './AppComponent';

class CustomElement extends HTMLElement {
	constructor() {
		super();

		const root = document.createElement('div');

		ReactDOM.render(
			<AppComponent />,
			root
		);

		this.appendChild(root);
	}
}

const ELEMENT_NAME = 'custom-element-liferay-cli';

if (customElements.get(ELEMENT_NAME)) {
	console.log(
		'Skipping registration for <custom-element-liferay-cli> (already registered)'
	);
} else {
	customElements.define(ELEMENT_NAME, CustomElement);
}
