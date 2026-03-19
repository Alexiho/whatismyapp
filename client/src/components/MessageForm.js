import "../styles/MessageForm.css";

const MessageForm = () => {
  return (
    <div className="whatismyapp-message-form">
      <form>
        <input type="text" placeholder="Type your message here..."/>
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  )
}

export default MessageForm;
