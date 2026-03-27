import "../styles/Body.css"
import MessageItem from "./MessageItem";
import MessageForm from "./MessageForm";
import UserNameForm from "./UserNameForm";
import useEventBus from "../hooks/useSockJS";
import React, {useState} from "react";

const Body = () => {
  const {connected, messages, sendMessage} = useEventBus();
  const [myName, setMyName] = useState("");
  return (
    <div className="whatismyapp-body">
      {myName === "" ?
        <UserNameForm onSubmit={setMyName}/>
        : <div>
          <ul className="whatismyapp-message-history">
            {messages.map((messageItem, index) => {
                const msg = (messageItem && (messageItem.content ?? messageItem.message)) || '';
                const user = (messageItem && (messageItem.author ?? messageItem.userName)) || 'Unknown';
                const key = (messageItem && (messageItem.id ?? messageItem._id)) || index;
                const messageClass = user === myName ? "whatismyapp-my-messages" : "whatismyapp-their-messages";
                console.log("Rendering message from ", user, " with content : ", msg, " with class : ", messageClass);
                return (
                  <li className={"whatismyapp-message " + messageClass } key={key}><MessageItem message={msg} userName={user} myName={myName} id={key}/></li>
                );

              }
            )
            }
          </ul>

          <div className="whatismyapp-gap"></div>
          <MessageForm onNewMessage={sendMessage} connected={connected} user={myName}/>
        </div>
      }
    </div>
  )
}

export default Body;
