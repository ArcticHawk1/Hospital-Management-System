import Immutable from "immutable";
import storage from '../lib/storage';
import config from '../config/config';

import { LogoutUser } from "./auth";

/** ********************************************
 ** Constants                                **
 ******************************************** */

const FETCH_USER = Symbol();
const FETCH_USER_ERR = Symbol();

const UPDATE_USER_ERR = Symbol();
const UPDATE_USER_SUCCESS = Symbol();
const UPDATE_COMPLETED = Symbol();

const defaultState = Immutable.fromJS({
  profile: {},
  updated: false,
  updateSuccess: false,
  fetchSuccess: false,
  error: null,
});

/** ********************************************
 ** User States                              **
 ******************************************** */

class State {
  static FetchUser(error, user) {
    return {
      type: error ? FETCH_USER_ERR : FETCH_USER,
      user: error ? undefined : user,
      error: error || undefined,
    };
  }

  static UpdateUser(error) {
    return {
      type: error ? UPDATE_USER_ERR : UPDATE_USER_SUCCESS,
      error: error || undefined,
    };
  }
}

/** ********************************************
 ** Actions                                  **
 ******************************************** */

const FetchUser = () => async (dispatch) => {
  try {
    const response = await fetch(config.apiRoutes.API_URL + config.apiRoutes.user.user, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${storage.get("token")}`,
      },
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      return dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    dispatch(State.FetchUser(null, data.user));
  } catch (err) {
    dispatch(State.FetchUser(err.message));
  }
};

const UpdateUser = (user) => async (dispatch) => {
  try {
    const response = await fetch(config.apiRoutes.API_URL + config.apiRoutes.user.user, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${storage.get("token")}`,
      },
      body: JSON.stringify({ user }),
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      return dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    dispatch(State.FetchUser(null, data.user));
    dispatch(State.UpdateUser());
  } catch (err) {
    dispatch(State.UpdateUser(err.message));
  }
};

/** ********************************************
 ** User Reducer                             **
 ******************************************** */

const User = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_USER:
      return state.withMutations((val) => {
        val.set("error", null);
        val.set("profile", action.user);
        val.set("fetchSuccess", true);
      });

    case FETCH_USER_ERR:
      return state.withMutations((val) => {
        val.set("error", action.error);
        val.set("profile", {});
        val.set("fetchSuccess", false);
      });

    case UPDATE_USER_ERR:
      return state.withMutations((val) => {
        val.set("error", action.error);
        val.set("updated", true);
        val.set("updateSuccess", false);
      });

    case UPDATE_USER_SUCCESS:
      return state.withMutations((val) => {
        val.set("error", null);
        val.set("updated", true);
        val.set("updateSuccess", true);
      });

    case UPDATE_COMPLETED:
      return state.withMutations((val) => {
        val.set("updated", false);
      });

    default:
      return state;
  }
};

const UserUpdateDone = () => ({ type: UPDATE_COMPLETED });
export { User, FetchUser, UpdateUser, UserUpdateDone };
