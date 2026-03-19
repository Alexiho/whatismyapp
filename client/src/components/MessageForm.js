import "../styles/MessageForm.css";

const MessageForm = () => {
  return (
    <div className="whatismyapp-message-form">
      <form method="post">
        <textarea wrap="soft" placeholder="Type your message here..."></textarea>
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  )
}

export default MessageForm;
