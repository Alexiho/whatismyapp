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
      <button onClick={handleUpdate} className="option-button" title="Edit">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18" height="18"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          <path d="m15 5 4 4"/>
        </svg>
      </button>
      <button onClick={handleDelete} className="option-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18" height="18"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </button>
    </div>
  );
}

export default MessageOptions;
