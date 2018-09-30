import React, { Component } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FilledInput from '@material-ui/core/FilledInput';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import NavBar from './NavBar';


const style = {
  form: {
    marginLeft: 20,
    marginRight: 20,
  }
}

class AddMedicine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      creationDate: null  ,
      name: "",
      description: ""
    }
  }

  handleNameChange = event => {
    this.setState({name: event.target.value});
  }

  handleCreationDateChange = event => {
    this.setState({creationDate: event.target.value});
  }

  handleDescriptionChange = event => {
    this.setState({description: event.target.value});
  }

  handleSubmit = event => {
    event.preventDefault();

    let data = {
      name: this.state.name,
      creationDate: this.state.creationDate.toString(),
      description: this.state.description
    };
    console.log(`Submitting data: ${JSON.stringify(data)}`);
  }

  render() {
    return (
      <div>
        <NavBar/>
        <Paper>
          <Typography variant="display1" align="center" gutterBottom>Add Medicine</Typography>
          <form onSubmit={this.handleSubmit}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel>Name</InputLabel>
              <Input value={this.state.name}
                     id="name"
                     onChange={this.handleNameChange}
                     autoFocus/>
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <TextField label="Creation Date"
                         type="date"
                         // defaultValue="2017-05-24"
                         value={this.state.creationDate ||  "2017-05-24"}
                         InputLabelProps={{shrink: true}}
                         onChange={this.handleCreationDateChange}/>
            </FormControl>
            <FormControl margin="normal" fullWidth>
              <InputLabel>Description</InputLabel>
              <Input value={this.state.description}
                     id="description"
                     onChange={this.handleDescriptionChange}
                     autoFocus/>
            </FormControl>
            <Button type="submit"
                    color="primary"
                    variant="raised">Submit
            </Button>
          </form>
        </Paper>
      </div>
    )
  }
}


export default AddMedicine;