/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import StartStopIcon from '@material-ui/icons/DirectionsTransit';
import EndStopIcon from '@material-ui/icons/Flag';
import { handleGraphParams } from '../actions';
import { ROUTE, DIRECTION, FROM_STOP, TO_STOP, Path } from '../routeUtil';
import { Colors } from '../UIConstants';
import ReactSelect from './ReactSelect';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: '100%',
  },
}));

function ControlPanel(props) {
  const { routes, graphParams } = props;
  let secondStopList = [];

  /**
   * Sets the direction
   */
  function setDirectionId(event) {
    const directionId = event.target.value;

    const path = new Path();
    path.buildPath(DIRECTION, directionId).commitPath();
    return props.onGraphParams({
      directionId,
      startStopId: null,
      endStopId: null,
    });
  }

  function getSelectedRouteInfo() {
    const routeId = props.graphParams.routeId;
    return routes ? routes.find(route => route.id === routeId) : null;
  }

  const selectedRoute = getSelectedRouteInfo();

  function getStopsInfoInGivenDirection(mySelectedRoute, directionId) {
    return mySelectedRoute.directions.find(dir => dir.id === directionId);
  }

  function generateSecondStopList(mySelectedRoute, directionId, stopId) {
    const secondStopInfo = getStopsInfoInGivenDirection(
      mySelectedRoute,
      directionId,
    );
    const secondStopListIndex = stopId
      ? secondStopInfo.stops.indexOf(stopId)
      : 0;
    return secondStopInfo.stops.slice(secondStopListIndex + 1);
  }

  function onSelectFirstStop(option) {
    const stopId = option.value;

    const directionId = props.graphParams.directionId;
    const secondStopId = props.graphParams.endStopId;
    const mySelectedRoute = { ...getSelectedRouteInfo() };

    secondStopList = generateSecondStopList(
      mySelectedRoute,
      directionId,
      stopId,
    );
    const path = new Path();
    path.buildPath(FROM_STOP, stopId);

    if (secondStopId) {
      path.buildPath(TO_STOP, secondStopId);
    }

    path.commitPath();
    props.onGraphParams({
      startStopId: stopId,
      endStopId: secondStopId,
    });
  }

  function onSelectSecondStop(option) {
    const endStopId = option.value;

    const path = new Path();
    path.buildPath(TO_STOP, endStopId).commitPath();

    props.onGraphParams({ endStopId });
  }

  function setRouteId(event) {
    const routeId = event.target.value;

    const mySelectedRoute = props.routes
      ? props.routes.find(route => route.id === routeId)
      : null;

    if (!mySelectedRoute) {
      return;
    }

    const directionId =
      mySelectedRoute.directions.length > 0
        ? mySelectedRoute.directions[0].id
        : null;
    // console.log('sRC: ' + selectedRoute + ' dirid: ' + directionId);
    const path = new Path();
    path
      .buildPath(ROUTE, routeId)
      .buildPath(DIRECTION, directionId)
      .commitPath();
    props.onGraphParams({
      routeId,
      directionId,
      startStopId: null,
      endStopId: null,
    });
  }

  let selectedDirection = null;
  if (selectedRoute && selectedRoute.directions && graphParams.directionId) {
    selectedDirection = selectedRoute.directions.find(
      dir => dir.id === graphParams.directionId,
    );
  }

  if (selectedDirection) {
    secondStopList = generateSecondStopList(
      selectedRoute,
      graphParams.directionId,
      graphParams.startStopId,
    );
  }

  const classes = useStyles();

  return (
    <div className="ControlPanel">
      <Grid container>
        <Grid item xs>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="route">Route</InputLabel>
            <Select
              value={graphParams.routeId || 0}
              onChange={setRouteId}
              input={<Input name="route" id="route" />}
            >
              {(routes || []).map(route => (
                <MenuItem key={route.id} value={route.id}>
                  {route.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {selectedRoute ? (
          <Grid item xs>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="direction">Direction</InputLabel>
              <Select
                value={graphParams.directionId || 1}
                onChange={setDirectionId}
                input={<Input name="direction" id="direction" />}
              >
                {(selectedRoute.directions || []).map(direction => (
                  <MenuItem key={direction.id} value={direction.id}>
                    {direction.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ) : null}
        {selectedDirection ? (
          <Grid container>
            <Grid item xs>
              <Box ml={1}>
                <StartStopIcon fontSize="small" htmlColor={Colors.INDIGO} />
                <FormControl className={classes.formControl}>
                  <ReactSelect
                    onChange={onSelectFirstStop}
                    inputId="fromstop"
                    textFieldProps={{
                      label: 'From Stop',
                      InputLabelProps: {
                        htmlFor: 'fromstop',
                        shrink: true,
                      },
                    }}
                    options={(selectedDirection.stops || []).map(
                      firstStopId => ({
                        value: firstStopId,
                        label: (
                          selectedRoute.stops[firstStopId] || {
                            title: firstStopId,
                          }
                        ).title,
                      }),
                    )}
                    stopId={graphParams.startStopId}
                  />
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs>
              <Box ml={1}>
                <EndStopIcon fontSize="small" htmlColor={Colors.INDIGO} />
                <FormControl className={classes.formControl}>
                  <ReactSelect
                    onChange={onSelectSecondStop}
                    inputId="tostop"
                    textFieldProps={{
                      label: 'To Stop',
                      InputLabelProps: {
                        htmlFor: 'tostop',
                        shrink: true,
                      },
                    }}
                    options={(secondStopList || []).map(secondStopId => ({
                      value: secondStopId,
                      label: (
                        selectedRoute.stops[secondStopId] || {
                          title: secondStopId,
                        }
                      ).title,
                    }))}
                    stopId={graphParams.endStopId}
                  />
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        ) : null}
      </Grid>
    </div>
  );
}

// for this entire component, now using graphParams values in Redux instead of local state.
const mapStateToProps = state => ({
  graphParams: state.routes.graphParams,
});

const mapDispatchToProps = dispatch => {
  return {
    onGraphParams: params => dispatch(handleGraphParams(params)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ControlPanel);
