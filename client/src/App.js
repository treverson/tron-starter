import React, { Component } from 'react';
import './App.css';

import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import Home from './Home';
import Edit from './Edit';

import TronWeb from 'tronweb';
import Utils from './utils';
const FOUNDATION_ADDRESS = 'TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg';



const styles = theme => ({
  appBar: {
    position: 'relative',
  },
  toolbarTitle: {
    flex: 1,
  },
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
  },
})

const EditBtn = withRouter(({ history }) => (
  <Button color="inherit" onClick={() => { history.push('/edit') }}>
    Edit
  </Button>
))

const HomeBtn = withRouter(({ history }) => (
  <Button color="inherit" onClick={() => { history.push('/') }}>
    Home
  </Button>
))

class App extends Component {
  state = {
    tronWeb: {
        installed: false,
        loggedIn: false
    }
  }

  async componentDidMount() {
      await new Promise(resolve => {
          const tronWebState = {
              installed: !!window.tronWeb,
              loggedIn: window.tronWeb && window.tronWeb.ready
          };

          if(tronWebState.installed) {
              this.setState({
                  tronWeb:
                  tronWebState
              });

              return resolve();
          }

          let tries = 0;

          const timer = setInterval(() => {
              if(tries >= 10) {
                  const TRONGRID_API = 'https://api.trongrid.io';

                  window.tronWeb = new TronWeb(
                      TRONGRID_API,
                      TRONGRID_API,
                      TRONGRID_API
                  );

                  this.setState({
                      tronWeb: {
                          installed: false,
                          loggedIn: false
                      }
                  });

                  clearInterval(timer);
                  return resolve();
              }

              tronWebState.installed = !!window.tronWeb;
              tronWebState.loggedIn = window.tronWeb && window.tronWeb.ready;

              if(!tronWebState.installed)
                  return tries++;

              this.setState({
                  tronWeb: tronWebState
              });

              resolve();
          }, 100);
      });

      if(!this.state.tronWeb.loggedIn) {
          // Set default address (foundation address) used for contract calls
          // Directly overwrites the address object as TronLink disabled the
          // function call
          window.tronWeb.defaultAddress = {
              hex: window.tronWeb.address.toHex(FOUNDATION_ADDRESS),
              base58: FOUNDATION_ADDRESS
          };

          window.tronWeb.on('addressChanged', () => {
              if(this.state.tronWeb.loggedIn)
                  return;

              this.setState({
                  tronWeb: {
                      installed: true,
                      loggedIn: true
                  }
              });
          });
      }

      Utils.setTronWeb(window.tronWeb);
      let data = await Utils.fetchStoredData();
      data = data.toNumber()
      console.log("===> storedData: ", data);
      this.props.gotStoredValue(data);
      // this.startEventListener();
      // this.fetchMessages();
  }

  render() {
    const { classes } = this.props;
    return (
      <Router>
        <div className="App">
          <CssBaseline />
          <AppBar position="static" color="default" className={classes.appBar}>
            <Toolbar>
              <Typography variant="h6" color="inherit" align="left" noWrap className={classes.toolbarTitle}>
                Tron Dapp
              </Typography>
              <HomeBtn />
              <EditBtn />
            </Toolbar>
          </AppBar>
          <main>
            <Route exact path="/"
              // render={(props) => <Home {...props} storedData={this.state.storedData} />}
              component={Home}
            />
            <Route path="/edit" component={Edit} />
          </main>
          <p> Built by alant with <span role="img" aria-label="Love">❤️</span> </p>
        </div>
      </Router>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = function(state) {
  return {
    storedData: state.dappReducer.storedValue
  }
}

const mapDispatchToProps = dispatch => {
  return {
    gotStoredValue: (value) => dispatch({ type: "GOT_STORED_VALUE", storedValue: value })
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App));
