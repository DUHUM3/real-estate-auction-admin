  // src/contexts/DataContext.js
  import React, { createContext, useContext, useReducer } from 'react';

  const DataContext = createContext();

  const dataReducer = (state, action) => {
    switch (action.type) {
      // بيانات Dashboard
      case 'SET_DASHBOARD_DATA':
        return {
          ...state,
          dashboard: {
            data: action.payload,
            lastUpdated: new Date(),
            isLoading: false
          }
        };
      case 'SET_DASHBOARD_LOADING':
        return {
          ...state,
          dashboard: {
            ...state.dashboard,
            isLoading: action.payload
          }
        };

      // بيانات المستخدمين
      case 'SET_USERS_DATA':
        return {
          ...state,
          users: {
            data: action.payload.data,
            pagination: action.payload.pagination,
            filters: action.payload.filters,
            lastUpdated: new Date(),
            isLoading: false
          }
        };
      case 'SET_USERS_LOADING':
        return {
          ...state,
          users: {
            ...state.users,
            isLoading: action.payload
          }
        };
      case 'UPDATE_USERS_FILTERS':
        return {
          ...state,
          users: {
            ...state.users,
            filters: action.payload
          }
        };
      case 'CLEAR_USERS_DATA':
        return {
          ...state,
          users: {
            data: [],
            pagination: null,
            filters: {},
            lastUpdated: null,
            isLoading: false
          }
        };

      // بيانات المزادات
      case 'SET_AUCTIONS_DATA':
        return {
          ...state,
          auctions: {
            data: action.payload.data,
            pagination: action.payload.pagination,
            filters: action.payload.filters,
            lastUpdated: new Date(),
            isLoading: false
          }
        };
      case 'SET_AUCTIONS_LOADING':
        return {
          ...state,
          auctions: {
            ...state.auctions,
            isLoading: action.payload
          }
        };
      case 'UPDATE_AUCTIONS_FILTERS':
        return {
          ...state,
          auctions: {
            ...state.auctions,
            filters: action.payload
          }
        };
      case 'CLEAR_AUCTIONS_DATA':
        return {
          ...state,
          auctions: {
            data: [],
            pagination: null,
            filters: {},
            lastUpdated: null,
            isLoading: false
          }
        };

      // بيانات طلبات الاهتمام
      case 'SET_INTERESTS_DATA':
        return {
          ...state,
          interests: {
            data: action.payload.data,
            pagination: action.payload.pagination,
            filters: action.payload.filters,
            filtersData: action.payload.filtersData,
            lastUpdated: new Date(),
            isLoading: false
          }
        };
      case 'SET_INTERESTS_LOADING':
        return {
          ...state,
          interests: {
            ...state.interests,
            isLoading: action.payload
          }
        };
      case 'UPDATE_INTERESTS_FILTERS':
        return {
          ...state,
          interests: {
            ...state.interests,
            filters: action.payload
          }
        };
      case 'UPDATE_INTERESTS_FILTERS_DATA':
        return {
          ...state,
          interests: {
            ...state.interests,
            filtersData: action.payload
          }
        };
      case 'CLEAR_INTERESTS_DATA':
        return {
          ...state,
          interests: {
            data: [],
            pagination: null,
            filters: {},
            filtersData: {
              status_options: [],
              properties: []
            },
            lastUpdated: null,
            isLoading: false
          }
        };
      case 'UPDATE_INTEREST_STATUS':
        return {
          ...state,
          interests: {
            ...state.interests,
            data: state.interests.data.map(interest =>
              interest.id === action.payload.interestId
                ? { ...interest, status: action.payload.status, admin_notes: action.payload.adminNote }
                : interest
            )
          }
        };

        case 'SET_CLIENTS_DATA':
    return {
      ...state,
      clients: {
        data: action.payload.data,
        pagination: action.payload.pagination,
        lastUpdated: new Date(),
        isLoading: false
      }
    };
  case 'SET_CLIENTS_LOADING':
    return {
      ...state,
      clients: {
        ...state.clients,
        isLoading: action.payload
      }
    };
  case 'ADD_CLIENT':
    return {
      ...state,
      clients: {
        ...state.clients,
        data: [action.payload, ...state.clients.data]
      }
    };
  case 'DELETE_CLIENT':
    return {
      ...state,
      clients: {
        ...state.clients,
        data: state.clients.data.filter(client => client.id !== action.payload)
      }
    };
  case 'CLEAR_CLIENTS_DATA':
    return {
      ...state,
      clients: {
        data: [],
        pagination: null,
        lastUpdated: null,
        isLoading: false
      }
    };


    case 'SET_LAND_REQUESTS_DATA':
    return {
      ...state,
      landRequests: {
        data: action.payload.data,
        pagination: action.payload.pagination,
        filters: action.payload.filters,
        filtersData: action.payload.filtersData,
        lastUpdated: new Date(),
        isLoading: false
      }
    };
  case 'SET_LAND_REQUESTS_LOADING':
    return {
      ...state,
      landRequests: {
        ...state.landRequests,
        isLoading: action.payload
      }
    };
  case 'UPDATE_LAND_REQUESTS_FILTERS':
    return {
      ...state,
      landRequests: {
        ...state.landRequests,
        filters: action.payload
      }
    };
  case 'UPDATE_LAND_REQUESTS_STATUS':
    return {
      ...state,
      landRequests: {
        ...state.landRequests,
        data: state.landRequests.data.map(request =>
          request.id === action.payload.requestId
            ? { ...request, status: action.payload.status }
            : request
        )
      }
    };
  case 'CLEAR_LAND_REQUESTS_DATA':
    return {
      ...state,
      landRequests: {
        data: [],
        pagination: null,
        filters: {},
        filtersData: {
          regions: [],
          cities: [],
          purposes: [],
          types: [],
          statuses: []
        },
        lastUpdated: null,
        isLoading: false
      }
    };
      // يمكنك إضافة المزيد من الشاشات هنا
      default:
        return state;
    }
  };

  const initialState = {
    dashboard: {
      data: null,
      lastUpdated: null,
      isLoading: false
    },
    users: {
      data: [],
      pagination: null,
      filters: {
        search: '',
        status: 'all',
        user_type_id: 'all',
        sort_field: 'created_at',
        sort_direction: 'desc',
        page: 1
      },
      lastUpdated: null,
      isLoading: false
    },
    auctions: {
      data: [],
      pagination: null,
      filters: {
        search: '',
        status: 'all',
        region: 'all',
        date: '',
        sort_field: 'created_at',
        sort_direction: 'desc',
        page: 1,
        per_page: 10
      },
      lastUpdated: null,
      isLoading: false
    },
    interests: {
      data: [],
      pagination: null,
      filters: {
        search: '',
        status: 'all',
        property_id: 'all',
        date_from: '',
        date_to: '',
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 1,
        per_page: 10
      },
      filtersData: {
        status_options: [],
        properties: []
      },
      lastUpdated: null,
      isLoading: false
    },

    clients: {
    data: [],
    pagination: null,
    lastUpdated: null,
    isLoading: false
  },

  landRequests: {
    data: [],
    pagination: null,
    filters: {
      search: '',
      region: 'all',
      city: 'all',
      purpose: 'all',
      type: 'all',
      status: 'all',
      area_min: '',
      area_max: '',
      start_date: '',
      end_date: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      per_page: 10
    },
    filtersData: {
      regions: [],
      cities: [],
      purposes: [],
      types: [],
      statuses: []
    },
    lastUpdated: null,
    isLoading: false
  }
    // يمكنك إضافة المزيد من الشاشات هنا
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