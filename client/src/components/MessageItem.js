import "../styles/MessageItem.css";
import MessageOptions from "./MessageOptions";


const MessageItem = ({message, userName, myName, id, deleteMessage, updateMessageForm}) => {

  const handleRightClick = (message, userName) => {
    console.log("Right click on message : ", message, " from user : ", userName);
    //TODO : Afficher un menu contextuel avec des options (copier le message, répondre, etc.)
    if (userName===myName) {
      let optionsMenu = document.getElementById("options-" + id);
      if (optionsMenu) {
        optionsMenu.hidden = !optionsMenu.hidden;
      }
    }
  }

  const onUpdateQuery = () => {
    updateMessageForm(id, message)
  }

  return (
    <div className="whatismyapp-message-item">
      <div
        itemID={id}
        className="whatismyapp-message-info"
        onAuxClick={(event) => {
          if (event.button === 2) {
            event.preventDefault();
            handleRightClick(message, userName, myName);
          }
        }}>
        <p className="whatismyapp-user-name">{userName}</p>
        <div className="whatismyapp-message-content">
          <p>{message}</p>
          <div className={"whatismyapp-message-item-options"} hidden={true} id={"options-" + id}>
          <MessageOptions onDeleteMessage={deleteMessage} handleUpdateQuery={onUpdateQuery} id={id}/>
        </div>
        </div>
      </div>
    </div>
  )
}

export default MessageItem;
