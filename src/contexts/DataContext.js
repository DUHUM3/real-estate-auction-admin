// src/contexts/DataContext.js
import React, { createContext, useContext, useReducer } from 'react';

const DataContext = createContext();

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DASHBOARD_DATA':
      return {
        ...state,
        dashboard: {
          data: action.payload,
          lastUpdated: new Date(),
          isLoading: false
        }
      };
    case 'SET_LOADING':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          isLoading: action.payload
        }
      };
    case 'CLEAR_DASHBOARD_DATA':
      return {
        ...state,
        dashboard: {
          data: null,
          lastUpdated: null,
          isLoading: false
        }
      };
    default:
      return state;
  }
};

const initialState = {
  dashboard: {
    data: null,
    lastUpdated: null,
    isLoading: false
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};