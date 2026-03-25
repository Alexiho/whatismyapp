import {useState} from "react";

const UserNameForm = ({onSubmit}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onSubmit(name);
    console.log("Registration as "+name+" successful");
  }

  return (
    <div>
      <h2>Enter your name to join the chat</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}/>
        <button type="submit" className="btn btn-primary">Join</button>
      </form>
    </div>
  )
}


export default UserNameForm;
