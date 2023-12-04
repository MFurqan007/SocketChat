import './App.css';
import {useEffect, useState} from 'react';
import io from "socket.io-client";
import {v4} from 'uuid'; 

const PORT = 3001; 
const socket = io(`http://localhost:${PORT}`);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");
  const [chatIsVisible, setChatIsVisible] = useState(false);
  const [message, setMessage] = useState([]);
  
  const generateRandomUsername = () => {
    const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let username = '';
    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * alphanumeric.length);
      username += alphanumeric.charAt(randomIndex);
    }
    return username;
  };

  useEffect(() => {
    const randomUsername = generateRandomUsername();
    setUser(randomUsername);
  }, []);

  useEffect(() => {
    console.log('connected:', socket.connected)
    socket.on('connect', () => {
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    }
  }, {isConnected})

  useEffect(() => {
    socket.on("recieve_msg", ({user, message}) => {
      const msg = `${user} send: ${message}`
      setMessage(prevState => [msg, ...prevState])
    });
  }, {socket});

  const handleEnterChatRoom = () =>{
    if(user !== "" && room !== ""){
      setChatIsVisible(true)
      socket.emit("join_room", {user,room});
    }
  }

  const handleSendMessage = () => {
    const newMsgData = {
      room: room,
      user: user,
      message: newMessage
    }
    socket.emit("send_msg", newMsgData)
    const msg = `${user} send: ${newMessage}`
    setMessage(prevState => [msg, ...prevState])
    setNewMessage("")
  }
  return (
    <div style={{padding:20}} class="Background">
      {!chatIsVisible ?
        <>
          <div class="Wrapper">
            <p class="Heading">Chat Room</p>
            <input 
              type = "text" 
              placeholder='user' 
              class="Input" 
              value= {user} 
              disabled={true}
              onChange = {e => setUser(e.target.value)}/>
            <br/>
            <input type = "text" placeholder='room' class="Input" value= {room} onChange = {e => setRoom(e.target.value)}/>
            <br/>
            <button class="Button" onClick={handleEnterChatRoom}>Enter</button>
          </div>

        </>
        :
        <>
          <div class="Wrapper2">
            <div class="Left">
              <div class="LTop">
                <p class="Head2">Room | </p> 
                <p class="Cont2">|  {room}</p>
              </div>
              <div className='LTop'>
                <p class="Head2">User |</p>
                <p class="Cont2">|  {user}</p>
              </div>

            </div>
            <div class="Right">
              <div
                style={{
                  height:330,
                  width:480,
                  border:"1px solid #000",
                  overflowY: "scroll",
                  marginBottom:10,
                  padding:10
                }}
              >
                {message.map( el => <div class="MsgBox" key={v4()}>{el}</div>)}
              </div>
              <div class="Msg">
                <input
                  type ="text"
                  placeholder='Message Input'
                  value={newMessage}
                  class="MsgInput"
                  onChange = {e=> setNewMessage(e.target.value)}
                />
                <button 
                  onClick={handleSendMessage}
                  class="MsgBtn"
                >Send</button>
              </div>
              
            </div>
          </div>
          
        </>
      }
    </div>
  );
}

export default App;
