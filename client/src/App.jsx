import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';


const WS_URL = 'ws://127.0.0.1:8000';
function App() {
    const [messages, setMessages] = useState([])
    
    useEffect(() => {
      console.log ("App working")
    }, [])
    

    const {sendMessage} = useWebSocket(WS_URL)

  useWebSocket(WS_URL, {
    // make connection when App initiated
    onOpen : () => {
      console.log('WebSocket connection established.');
    },
    // action when receiving message
    onMessage : (event) => {
      console.log("message", event.data)
      setMessages([...messages, event.data])
    }
  })

  function handleForm (event) {
    event.preventDefault()
    const form = new FormData(event.target)
    sendMessage(form.get('player'))
  }

  return (
    <>
      <h1>The Prisoner Dilemma</h1>
      <h3>What do snitches get?</h3>
      <div>You and a fellow criminal gang member have been arrested. The police don't have enough evidence to convict on the principal charge. But they can definitely get you both a year in prison on a lesser charge.
        <br></br>You are in solitary, but can get messages to each other.
        <br></br> The police are offering a bargain: if you testify against your partner, you will go free while your partner will get three years in prison on the main charge. 
        <br></br>But there is a catch ... If you both testify against each other, you will both get two years. 
        <br></br>You have both been offered the same deal. How can you minimise your sentence?</div>
      <form onSubmit={handleForm}>
        <label>Send message to the other prisoner</label>
        <input type="text" name="player" id="player"/>
        <button>Submit</button>
      </form>
        <button>No comment</button>
        <button>OK. Here's what happened ...</button>

      {messages.map((message) => <p>{message}</p>)}
    </>
  )
}

export default App
