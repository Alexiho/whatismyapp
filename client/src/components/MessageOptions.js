import "../styles/MessageOptions.css";

const MessageOptions = ({onDeleteMessage, handleUpdateQuery, id}) => {
  const handleDelete = () => {
    try {
      console.log("Demande de suppression du message : ", id)
      onDeleteMessage(id)
      console.log("Demande de suppression envoyée")
    } catch (err) {
      console.error("Suppression impossible : ", err)
    }
  }

  const handleUpdate = () => {
    try {
      console.log("Demande de modification d'un message : ", id)
      handleUpdateQuery()
      console.log("Demande de modification envoyée")
    } catch (err) {
      console.error("Modification impossible : ", err)
    }
  }

  return (
    <div className="message-options">
      <button onClick={handleUpdate} className="option-button">Edit</button>
      <button onClick={handleDelete} className="option-button">Delete</button>
    </div>
  );
}

export default MessageOptions;
