import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import SockJS from "sockjs-client";

ReactDOM.render(
  <React.StrictMode>
    <App messageList={
      [
        {
          message: "Hello, how are you?",
          userName: "Me"
        },
        {
          message: "I'm good, thanks! How about you?",
          userName: "José"
        }
      ]
    }/>
  </React.StrictMode>,
  document.getElementById("root")
);


