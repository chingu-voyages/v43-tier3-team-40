import { useState, useEffect } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

function App(): JSX.Element {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    fetch("/hello")
      .then((r: Response) => r.json())
      .then((data: { count: number }) => setCount(data.count));
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Switch>
          <Route path="/testing">
            <h1>Test Route</h1>
          </Route>
          <Route path="/">
          <h1 className="text-6xl font-bold underline">
      Hello world!
    </h1>
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}


export default App;
