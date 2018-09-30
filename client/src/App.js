import React, { Component } from 'react';
import NavBar from './components/NavBar';
import AddMedicineForm from './components/AddMedicineForm';
import MedicinesList from './components/MedicinesList';
import { Router, Switch, Route } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

const history = createBrowserHistory();


class App extends Component {
  render() {
    return (
      <div>
        <Router history={history}>
          <Switch>
            <Route exact path="/">
              <NavBar/>
            </Route>
            <Route exact path="/add_medicine">
              <AddMedicineForm/>
            </Route>
            <Route exact path="/list_medicines">
              <MedicinesList/>
            </Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App;
