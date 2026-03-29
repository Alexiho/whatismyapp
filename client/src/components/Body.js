import "../styles/Body.css"
import MessageItem from "./MessageItem";
import MessageForm from "./MessageForm";
import UserNameForm from "./UserNameForm";
import useEventBus from "../hooks/useSockJS";
import React, {useState} from "react";

const Body = () => {
  const {connected, messages, sendMessage, deleteMessage, updateMessage} = useEventBus();
  const [myName, setMyName] = useState("");

  const updateMessageForm = (id, message) => {
    const textarea = document.getElementById("whatismyapp-message-form-form-textarea")
    const submitButton = document.getElementById("whatismyapp-message-form-form-button")

    textarea.value = message
    textarea.innerHTML = message
    submitButton.value = id
    submitButton.innerText = "Edit"
  }

  return (
    <div id="whatismyapp-body-container" className="whatismyapp-body">
      {myName === "" ?
        <UserNameForm onSubmit={setMyName}/>
        : <div>
          <ul className="whatismyapp-message-history">
            {messages.map((messageItem, index) => {
                const msg = (messageItem && (messageItem.content ?? messageItem.message)) || '';
                const user = (messageItem && (messageItem.author ?? messageItem.userName)) || 'Unknown';
                const key = (messageItem && (messageItem.id ?? messageItem._id)) || index;
                const date = (messageItem && (messageItem.date)) || "";
                const time = (messageItem && (messageItem.time)) || "";
                const messageClass = user === myName ? "whatismyapp-my-messages" : "whatismyapp-their-messages";
                console.log("Rendering message from ", user, " with date : ", date, " with content : ", msg, " with class : ", messageClass);
                return (
                  <li className={"whatismyapp-message " + messageClass } key={key}><MessageItem message={msg} userName={user} myName={myName} id={key} date={date} time={time} deleteMessage={deleteMessage} updateMessageForm={updateMessageForm}/></li>
                );

              }
            )
            }
          </ul>

          <div className="whatismyapp-gap"></div>
          <MessageForm onNewMessage={sendMessage} updateMessage={updateMessage} connected={connected} user={myName}/>
        </div>
      }
    </div>
  )
}

export default Body;
