// Do not modify this file;

import { MyApp } from './customElement';
import "./widget.scss";

export const ELEMENT_ID = 'gs-starter';

if (!customElements.get(ELEMENT_ID)) {
	customElements.define(ELEMENT_ID, MyApp);
}
