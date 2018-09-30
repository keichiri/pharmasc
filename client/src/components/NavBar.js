import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import IconButton from '@material-ui/core/IconButton';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';


const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};


const menuItems = [
  <ListSubheader key="1">Admin</ListSubheader>,
  <Link key="2" to="/add_medicine">
    <MenuItem>Add medicine</MenuItem>,
  </Link>,
  <ListSubheader key="3">Producer</ListSubheader>,
  <Link key="4" to="/register_batch">
    <MenuItem>Register batch</MenuItem>
  </Link>,
  <Link key="5" to="/list_batches">
    <MenuItem>List batches</MenuItem>
  </Link>,
  <ListSubheader key="6">Consumer</ListSubheader>,
  <Link key="7" to="/list_medicines">
    <MenuItem>List medicines</MenuItem>
  </Link>,
  <Link key="8" to="/search_medicines">
    <MenuItem>Search medicines</MenuItem>
  </Link>
];

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleToggle = () => {
    console.log('TOGGLING!');
    this.setState({open: !this.state.open});
  }

  render() {
    return (
      <div style={styles.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              onClick={this.handleToggle}
              style={styles.menuButton}
              color="inherit"
              aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit">
              Pharmachain
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          id="drawer-left-menu"
          ref="leftNav"
          open={this.state.open}
          ModalProps={{ onBackdropClick: this.handleToggle }}>
          <MenuList>
            {menuItems}
          </MenuList>
        </Drawer>
      </div>
    )
  }
}


export default NavBar;