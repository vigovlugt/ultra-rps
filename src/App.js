import React, { Component } from 'react';
import socketIOClient from 'socket.io-client'
import './App.css';

class App extends Component {
  componentDidMount(){
     const socket = this.socket = socketIOClient("http://localhost:3001")
     socket.emit("choice",0)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header navbar navbar-light bg-light">
        <span className="navbar-brand mb-0 h1">Ultra-RPS</span>
        </header>
      </div>
    );
  }
}

export default App;
