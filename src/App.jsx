//import './App.css'
import React, { useState } from 'react';
import { dates } from './utils/dates';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickers, setTickers] = useState([]);

  const fetchReport = async (data) => {
    const messages = [
      {role: 'system', content: 'You are a trading guru. Given data on share prices over the past 3 days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell.'},
      {role: 'user', content: `${data}`}
    ];

    setLoading(true);;
    try {
      const workerURL = 'https://openai-api-worker.ediazgallego93.workers.dev/';
      const response = await fetch(workerURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        setDisplayText(`Error: ${response}`)
        throw new Error(`Error: ${response.status}`);
        
      }

      const data = await response.json();
      setDisplayText(data.content || 'No result returned');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleTickersAddButton = () => {
    setTickers([...tickers, inputValue]);
    setInputValue(''); // Clear the input
  }

  const handleButtonClick = async () => {
    try {
      const stockData = await Promise.all(tickers.map(async (ticker) => {
        
        const polygonWorkerURL = `https://polygon-api-worker.ediazgallego93.workers.dev/?ticker=${ticker}&startDate=${dates.startDate}&endDate=${dates.endDate}`;
        const response = await fetch(polygonWorkerURL);

        if(!response.ok) {
          const errMsg = await response.text();
          throw new Error('Worker error:', errMsg);
        }
        return response.text();
      }))
      fetchReport(stockData.join(''));
    } catch (err) {
      console.log('Worker error:', err.message)
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder='Type a stock name.'
        style={{ padding: '8px', fontSize: '16px', marginRight: '10px' }}
      />
      <button
        onClick={handleTickersAddButton}
        style={{
          padding: '8px 16px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '5px'
        }}
      >
        Add
      </button>
      <button
        onClick={handleButtonClick}
        style={{
          padding: '8px 16px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        disabled={loading || tickers.length === 0}
      >
        {loading ? 'Loading..' : 'Generate report'}
      </button>
      <section
        style={{
          marginTop: '20px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {displayText && <p style={{ whiteSpace: 'pre-wrap' }}>{displayText}</p>}
      </section>
    </div>
  )
}

export default App
