import "../styles/Body.css"
import MessageItem from "./MessageItem";
import MessageForm from "./MessageForm";

const Body = ({messageList}) => {
  return (
    <div className="whatismyapp-body">

      <ul className="whatismyapp-message-history">
        {messageList.map((messageItem, index) => {
          return (
            <li><MessageItem message={messageItem.message} userName={messageItem.userName} key={index}/></li>
          );
        })
        }
        <li><MessageItem message={"Hello, how are you?"} userName={"Me"} key="test1"/></li>
        <li><MessageItem
            message={"I'm good, thanks! How abojwoshjjqsgjqhgjqhjnqjghqrvuiqeruioqerghuiqrhgqjbhlqdjghqjghqdmfjbhmqdjbhqdjbqmdjbmqdjqmdgjqdlbnqdlbnqlrjbioqshjpios<jposl<jgpoi<sdbjpoimsjpoidbjpodhbpqoidlmjbd<bjdqbjqdlkfbjlwmdkbjmldkffbjm<lkdfbjmdlfkbjmqdfjbmdwlfbjmwlkdfbjlwkdfjblut you?"}
            userName={"José"}
            key = "test2"/></li>
      </ul>
      <MessageForm/>
    </div>
  )
}

export default Body;
