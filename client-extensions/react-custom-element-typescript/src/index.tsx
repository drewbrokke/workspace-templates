import React from 'react';
import { createRoot } from 'react-dom/client';

import HelloBar from './pages/HelloBar';
import HelloFoo from './pages/HelloFoo';
import HelloWorld from './pages/HelloWorld';

import './styles/index.scss';

interface IProps {
	route: string | null
}

const App: React.FC<IProps> = ({ route }) => {
	if (route === 'hello-bar') {
		return <HelloBar />;
	}

	if (route === 'hello-foo') {
		return <HelloFoo />;
	}

	return (
		<div>
			<HelloWorld />
		</div>
	);
};

class WebComponent extends HTMLElement {
	connectedCallback() {
		createRoot(this).render(
			<App
				route={this.getAttribute('route')}
			/>
		);
	}
}

const ELEMENT_ID = '';

if (!customElements.get(ELEMENT_ID)) {
	customElements.define(ELEMENT_ID, WebComponent);
}