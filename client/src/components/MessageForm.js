import "../styles/MessageForm.css";
import React, {useState, useEffect} from "react";

const MessageForm = ({onNewMessage, connected, user}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); //Cause une erreur pour une raison inconnue, le formulaire se soumet quand même et rafraîchit la page

    if (!text) return;
    try {
      console.log("Envoi du message : ", text, "en tant que ", user);
      onNewMessage(user, text);
      setText("");
      console.log("Message envoyé, attente de 500ms pour réinitialiser le formulaire");
    } catch (err) {
      console.error("Envoi impossible : ", err)
    }
  }
  return (
    <div className="whatismyapp-message-form">
      <form id="whatismyapp-message-form-form" onSubmit={handleSubmit}>
        <textarea wrap="soft" placeholder="Type your message here..."
                  onChange={e => setText(e.target.value)} value={text}></textarea>
        <button type="submit" className="btn btn-primary" disabled={!connected}>Send</button>
      </form>
    </div>
  )
}

export default MessageForm;
