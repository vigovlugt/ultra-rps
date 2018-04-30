import React, { Component } from 'react';
import socketIOClient from 'socket.io-client'
import './App.css';
import { setInterval, log } from 'core-js/library/web/timers';
import { clearInterval } from 'timers';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {socket:null,lobbys:[],game:null,stats:{kd:0}}
  }

  componentDidMount(){
     const socket = socketIOClient()
     this.setState({socket:socket});
     socket.emit("choice",0)
     socket.on("lobbys",(lobbys)=>{
       this.setState({lobbys})
     })
     socket.on("game",(game)=>{
       this.setState({game});
       if(game.stage === 1){
        setInterval(()=>{
          this.setState({game:null});
          window.location.href = window.location.href;
        },5000)
       }
       
     })
    //  let progressInterval = setInterval(()=>{
    //    let game = this.state.game;
    //    game.timeSinceStart = ((Date.now() - game.gameStart) + 15) / 1000; 
    //    this.setState(game);
    //    //this.forceUpdate()
    //    console.log(this.state.game.timeSinceStart);
    //    if(this.state.game.timeSinceStart >= 15){
    //    clearInterval(progressInterval);
    //    }
    //  },1/60 * 1000)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header navbar navbar-light bg-light" style={{marginBottom:"20px"}}>
        <span className="navbar-brand mb-0 h1">Ultra-RPS</span>
        </header>

        <div className="row" style={{marginLeft:"0px",marginRight:"0px"}}>
          <div className="col-1"></div>
          <div className="col-8">
            <div className="card bg-light">
              <div className="card-body">
                {this.state.game == null ?
                  (//SHOW STATS
                    <p>stats</p>
                  )
                  : this.state.game.stage === 0 ?
                  (//GAME
                    <div>
                      <div className="row">
                      {
                        ["Rock","Paper","Scissors"].map((item,index)=>{
                          return (
                            <div className="col-4" key={index}>
                              <button className="btn" onClick={()=>{this.chooseItem(index)}} style={{width:"100%",height:"232px"}}>{item}</button>
                            </div>
                          )
                        })
                      }
                      </div>
                      <div className="row" style={{marginTop:"20px",marginLeft:"0px",marginRight:"0px"}}>
                        <div className="progress" style={{width:"100%"}}>
                          <div className="progress-bar" role="progressbar" style={{width:this.state.game.timeSinceStart * (100/15) +"%"}} aria-valuenow={this.state.game.timeSinceStart * (100/15)} aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                      </div>
                    </div>
                  )
                  :
                  (//SHOW GAME END
                    <p>Winner: {this.state.game.winner} {this.state.game.winner == this.state.socket.id ? "You won!" : "You lost :("}</p>
                  )
                }
              </div>
            </div>
          </div>
          <div className="col-3">{/* LOBBY MENU */}
            <div className="card">
              <div className="card-body">
                <button className="btn btn-primary" style={{width:"100%"}} onClick={this.createLobby.bind(this)}>Create a lobby</button>
                <div className="row mt-3"/>
                <ul className="list-group">
                  {this.state.lobbys.map((lobby,index)=>{
                    return (
                    <li className="list-group-item" key={index}>
                      <span style={{fontSize:"20px"}}>  
                        {lobby.owner} 
                      </span>
                      {this.state.socket.id === lobby.owner ? null :
                        (
                        <button onClick={()=>{this.joinLobby(lobby.owner)}} className="btn btn-primary" style={{width:"60px",float:"right",padding:"3px 12px"}}>
                          Join
                        </button>
                        )
                      }
                    </li>)
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  createLobby(){
    this.state.socket.emit("createLobby",{})
  }

  joinLobby(id){
    this.state.socket.emit("joinLobby",{lobbyOwner:id})
  }

  chooseItem(item){
    this.state.socket.emit("chooseItem",item);
  }
}

export default App;
