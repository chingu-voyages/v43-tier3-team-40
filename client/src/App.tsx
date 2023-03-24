
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
      <h1>Page Count: {count}</h1>
    </div>
  );
}

export default App;
