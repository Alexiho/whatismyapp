import "../styles/MessageItem.css";

const MessageItem = ({message, userName}) => {
  return (
    <div className="whatismyapp-message-item">
      <p className="whatismyapp-user-name">{userName}</p>
      <div className="whatismyapp-message-content">
        <p >{message}</p>
      </div>
    </div>
  )
}

export default MessageItem;
