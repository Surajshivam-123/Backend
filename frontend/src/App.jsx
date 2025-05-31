import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'
function App() {
  const [jokes, setjokes] = useState([]);
  useEffect((response)=>{
  axios.get('/api/jokes')
  .then((response)=>{
    setjokes(response.data);
  })
  .catch((error)=>{
    console.log(error);
  })})

  return (
    <>
      <h1>Backend By Suraj</h1>
      <h3>Joke length:{jokes.length}</h3>
      {
      jokes.map((jok,index) => (
        <div key={jok.id}>
          <h1>{jok.joke}</h1>
          <p>{jok.answer}</p>
        </div>
        
      ))
      }

    </>
  )
}

export default App
