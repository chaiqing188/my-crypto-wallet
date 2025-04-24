import { useState } from 'react'
import './App.css'
import Token from './components/token.tsx'

function App() {
  const [total, setTotal] = useState<string>(0);
  
  const calcBalance = (calculatedTotal: number) => {
      setTotal(calculatedTotal);
    };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
		<img className="w-10 h-10" src="/src/assets/logo.png"/>
		<span className="text-black-500 text-xl">crypto.com</span>
		<span className="test-gray font-bold">DEFI WALLET</span>
	  </div>
	  
	  <div className="text-gray-500 font-bold">
	    $ <span>{ total }</span>USD
	  </div>
	  
	  <Token onBalance={calcBalance} />
	  
    </>
  )
}

export default App
