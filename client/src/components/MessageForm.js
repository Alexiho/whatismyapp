import "../styles/MessageForm.css";
import React, {useState, useEffect} from "react";

const MessageForm = ({onNewMessage, updateMessage, connected, user}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const submitButton = document.getElementById("whatismyapp-message-form-form-button")

    if (submitButton.value === "") handleSendSubmit()
    else handleUpdateSubmit()
  }

  const handleSendSubmit = () => {
    if (!text) return;
    try {
      console.log("Envoi du message : ", text, "en tant que ", user);
      onNewMessage(user, text);
      setText("");
      console.log("Message envoyé, attente de 500ms pour réinitialiser le formulaire");
      const scrollable = document.getElementById("whatismyapp-body-container")
      scrollable.scrollTo({
        top: scrollable.scrollHeight,
        behavior: "smooth"
      })
    } catch (err) {
      console.error("Envoi impossible : ", err)
    }
  }

  const handleUpdateSubmit = () => {
    if (!text) return;
    try {
      const submitButton = document.getElementById("whatismyapp-message-form-form-button")

      console.log("Envoi du message modifié : ", text, "en tant que ", user)
      const id = parseInt(submitButton.value)
      submitButton.value = ""
      updateMessage(id, user, text)
      setText("")
      submitButton.innerText = "Send"
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
              handleSubmit()
            }
          }}> < /textarea>
        <button value="" onClick={handleSubmit} id="whatismyapp-message-form-form-button" type="button" className="btn btn-primary" disabled={!connected}>Send</button>
      </form>
    </div>
  )
}

export default MessageForm;
