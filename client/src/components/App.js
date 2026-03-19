import '../styles/App.css';
import Header from './Header';
import Body from './Body';
import Footer from './Footer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
        <Body />
        <Footer/>
      </header>
    </div>
  );
}

export default App;
