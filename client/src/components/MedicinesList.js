import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import NavBar from './NavBar';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';


const styles = theme => ({
  heroUnit: {
    backgroundColor: theme.palette.background.paper,
  },
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
  },
  heroButtons: {
    marginTop: theme.spacing.unit * 4,
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
      width: 1100,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%',
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing.unit * 6,
  },
});


const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

class MedicinesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      medicines: [],
    }
  }

  componentDidMount = async () => {
    console.log("Fetching medicines");
    try {
      let resp = await axios.get("http://localhost:9300/medicines");
      if (resp.data.medicines) {
        console.log(`Got ${resp.data.medicines.length} medicines`);
        this.setState({medicines: resp.data.medicines});
      }
    } catch (error) {
      console.log("Error while fetching medicines: " + error);
    }
  }

  render = () => {
    return (
      <div>
        <NavBar/>
        <main>
          <div className={this.props.classes.heroUnit}>
            <div className={this.props.classes.heroContent}>
              <Typography variant="display3"
                          align="center"
                          color="textPrimary"
                          gutterBottom>
                Available Medicines
              </Typography>
              <Typography variant="title"
                          align="center"
                          color="textSecondary"
                          paragraph>
                Check all of the available medicines. For more details
                click on individual medicines.
              </Typography>
              <div className={this.props.classes.heroButtons}>
                <Grid container spacing={16} justify="center">
                  <Grid item>
                    <Button variant="contained" color="primary">
                      Click here
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="primary">
                      Or here
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
          <div className={classNames(this.props.classes.layout, this.props.classes.cardGrid)}>
            <Grid container spacing={40}>
              {this.state.medicines.map(medicine => (
                <Grid item key={medicine.id} sm={6} md={4} lg={3}>
                  <Card className={this.props.classes.card}>
                    <CardMedia className={this.props.classes.cardMedia}
                               image="http://www.pure-chemical.com/blog/wp-content/uploads/2015/07/medicines-1024x576.jpg"
                               title="Image title"/>
                    <CardContent className={this.props.classes.cardContent}>
                      <Typography variant="headline"
                                  component="h2"
                                  gutterBottom>
                        {medicine.name}
                      </Typography>
                      <Typography>
                        {medicine.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        {medicine.type}
                      </Button>
                      <Button size="small" color="primary">
                        batches
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </main>
        <footer className={this.props.classes.footer}>
          <Typography variant="title"
                      align="center"
                      gutterBottom>
            Footer
          </Typography>
          <Typography variant="subheading"
                      align="center"
                      color="textSecondary"
                      component="p">
            Some description here!
          </Typography>
        </footer>
      </div>
    )
  }
}

MedicinesList.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(MedicinesList);