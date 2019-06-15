import React, { useEffect, Fragment } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getCurrentProfile } from "../../actions/profile";

const Dashboard = ({
  isAuthenticated,
  getCurrentProfile,
  profile: { profile, loading },
  auth: { user }
}) => {
  useEffect(() => {
    getCurrentProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading && profile == null ? (
    <p>Loading...</p>
  ) : isAuthenticated ? (
    <Fragment>
      <h1>Dashboard</h1>
      <p> Welcome {user && user.name}</p>
      <p> Address: {profile && profile.address}</p>
    </Fragment>
  ) : (
    <Redirect to="/landing" />
  );
};

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  profile: state.profile,
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(
  mapStateToProps,
  { getCurrentProfile }
)(Dashboard);
