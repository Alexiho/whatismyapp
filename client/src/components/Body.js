import "../styles/Body.css"
import MessageItem from "./MessageItem";
import MessageForm from "./MessageForm";
import useEventBus from "../hooks/useSockJS";
import React, { useState } from "react";

const Body = () => {
  const { connected, messages, sendMessage } = useEventBus();
  return (
    <div className="whatismyapp-body">

      <ul className="whatismyapp-message-history">
        {messages.map((messageItem, index) => {
          // Compatibilité : le hook renvoie des objets normalisés {id, author, date, content}
          // mais on garde des fallbacks si la forme diffère.
          const msg = (messageItem && (messageItem.content ?? messageItem.message)) || '';
          const user = (messageItem && (messageItem.author ?? messageItem.userName)) || 'Unknown';
          const key = (messageItem && (messageItem.id ?? messageItem._id)) || index;

          return (
            <li key={key}><MessageItem message={msg} userName={user} /></li>
          );
        })
        }
      </ul>
      <MessageForm onNewMessage={sendMessage} connected={connected}/>
    </div>
  )
}

export default Body;
