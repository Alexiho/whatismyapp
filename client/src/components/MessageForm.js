import "../styles/MessageForm.css";
import React, {useState, useEffect} from "react";

const MessageForm = ({onNewMessage, updateMessage, connected, user}) => {
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

  const handleUpdateSubmit = (e) => {
    e.preventDefault(); //Cause une erreur pour une raison inconnue, le formulaire se soumet quand même et rafraîchit la page

    if (!text) return;
    try {
      const sendButton = document.getElementById("whatismyapp-message-form-form-button-send")
      const editButton = document.getElementById("whatismyapp-message-form-form-button-edit")

      console.log("Envoi du message modifié : ", text, "en tant que ", user)
      const id = parseInt(editButton.value)
      setText("")
      editButton.classList.add("hidden")
      editButton.disabled = true
      editButton.value = ""
      sendButton.classList.remove("hidden")
      sendButton.disabled = false
      updateMessage(id, user, text)
      console.log("Modification envoyée")
    } catch (err) {
      console.error("Modification impossible : ", err)
    }
  }

  return (
    <div className="whatismyapp-message-form">
      <form id="whatismyapp-message-form-form">
        <textarea
          id="whatismyapp-message-form-form-textarea"
          wrap="soft"
          placeholder="Type your message here..."
          onChange={e => setText(e.target.value)}
          value={text}
          onKeyDown={(event) => {
            if (event.ctrlKey && event.key === 'Enter') {
              if (document.getElementById("whatismyapp-message-form-form-button-send").disabled) {
                handleUpdateSubmit(event);
              } else {
                handleSubmit(event);
              }
            }
          }}> < /textarea>
        <button onSubmit={handleSubmit} id="whatismyapp-message-form-form-button-send" type="submit" className="btn btn-primary" disabled={!connected}>Send</button>
        <button value="" onSubmit={handleUpdateSubmit} id="whatismyapp-message-form-form-button-edit" type="button" className="btn btn-primary hidden" disabled>Edit</button>
      </form>
    </div>
  )
}

export default MessageForm;
