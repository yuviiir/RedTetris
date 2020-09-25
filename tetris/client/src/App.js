import React from 'react';
import Tetris from './components/Tetris';

function App() {
	const ws = new WebSocket("ws://localhost:4000");

	return (
		<div className="App">
			<Tetris ws={ws}/>
		</div>
	)
}
export default App;