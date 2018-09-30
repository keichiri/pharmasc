import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import NavBar from './NavBar';


const styles = {
  root: {
    width: '100%',
    overflowX:' auto',
  },
  table: {
    minWidth: 700,
  },
};


class BatchesList extends Component {
  constructor(props) {
    super(props);
    this.classes = props.classes;
    this.items = props.items;
  }

  render = () => {
    return (
      <div>
        <NavBar/>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell component="th" scope="row">
                    {item.id}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    )
  }
}

BatchesList.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(BatchesList);