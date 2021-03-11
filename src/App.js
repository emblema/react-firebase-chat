import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  // your firebase config
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>
          ⚛️🔥
          {!user && <span>Superchat</span>}
        </h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sing-in" onClick={signInWithGoogle}>
        Iniciar sesión con Google
      </button>
      <p>No rompas las reglas de la comunidad o seras banneado para siempre!</p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Salir
      </button>
    )
  );
}

function ChatRoom() {
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(1000);
  const [messages] = useCollectionData(query, { idField: "id" });

  const [inputText, setInputText] = useState("");

  const endOfList = useRef();

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: inputText,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setInputText("");
  };

  useEffect(() => {
    endOfList.current.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={endOfList}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="di algo bonito"
        />

        <button type="submit" disabled={!inputText}>
          💬
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  );
}

export default App;
