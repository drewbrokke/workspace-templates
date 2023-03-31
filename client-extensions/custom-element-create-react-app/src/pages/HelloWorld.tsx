import React from 'react';

const HelloWorld: React.FC<{}> = () => (
	<div className="hello-world">
		<h1>Hello <span className="hello-world-name">World</span></h1>
	</div>
);

export default HelloWorld;