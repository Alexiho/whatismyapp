import "../styles/MessageForm.css";
import sendMessage from "../index";

const MessageForm = () => {
  return (
    <div className="whatismyapp-message-form">
      <form onSubmit={sendMessage}>
        <textarea wrap="soft" placeholder="Type your message here..."></textarea>
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  )
}

export default MessageForm;
