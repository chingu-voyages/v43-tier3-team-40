import { useState, useEffect } from "react";


function App(): JSX.Element {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    fetch("/hello")
      .then((r) => r.json())
      .then((data) => setCount(data.count));
  }, []);

  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline text-red-600">Fitness Tracker</h1>
      <h1>Page Count: {count}</h1>
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8Zml0bmVzc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60" alt="Shoes" /></figure>
        <div className="card-body">
          <h2 className="card-title">Daisy UI CARD TEST </h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
