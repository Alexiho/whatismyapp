import '../styles/App.css';
import Header from './Header';
import Body from './Body';
import Footer from './Footer';

function App({ messageList }) {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
        <Body messageList={ messageList }/>
        <Footer/>
      </header>
    </div>
  );
}

export default App;
