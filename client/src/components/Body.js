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
    const sendButton = document.getElementById("whatismyapp-message-form-form-button-send")
    const editButton = document.getElementById("whatismyapp-message-form-form-button-edit")

    textarea.value = message
    textarea.innerHTML = message
    sendButton.classList.add("hidden")
    sendButton.disabled = true
    editButton.value = id
    editButton.classList.remove("hidden")
    editButton.disabled = false
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
