import { createContext, useContext, useReducer, type ReactNode } from "react";

export interface DelayedClient {
  clientId: string;
  clientName: string;
  delayedAt: Date;
}

export interface VisitRecord {
  clientId: string;
  clientName: string;
  status: string;
  notes: string;
  receiverName: string;
  receiverDoc: string;
  photos: string[];
  arrivalTime: Date;
  departureTime: Date;
}

interface RouteState {
  clientStatuses: Record<string, string>;
  delayedClients: DelayedClient[];
  visitHistory: VisitRecord[];
}

type RouteAction =
  | { type: "SET_CLIENT_STATUS"; clientId: string; status: string }
  | { type: "ADD_DELAYED"; client: DelayedClient }
  | { type: "REMOVE_DELAYED"; clientId: string }
  | { type: "ADD_VISIT"; visit: VisitRecord };

function routeReducer(state: RouteState, action: RouteAction): RouteState {
  switch (action.type) {
    case "SET_CLIENT_STATUS":
      return {
        ...state,
        clientStatuses: {
          ...state.clientStatuses,
          [action.clientId]: action.status,
        },
      };
    case "ADD_DELAYED": {
      const exists = state.delayedClients.some(
        (d) => d.clientId === action.client.clientId
      );
      if (exists) return state;
      return {
        ...state,
        delayedClients: [...state.delayedClients, action.client],
      };
    }
    case "REMOVE_DELAYED":
      return {
        ...state,
        delayedClients: state.delayedClients.filter(
          (d) => d.clientId !== action.clientId
        ),
      };
    case "ADD_VISIT":
      return {
        ...state,
        visitHistory: [...state.visitHistory, action.visit],
      };
    default:
      return state;
  }
}

const initialState: RouteState = {
  clientStatuses: {},
  delayedClients: [],
  visitHistory: [],
};

const RouteStateContext = createContext<{
  state: RouteState;
  dispatch: React.Dispatch<RouteAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

export function RouteStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(routeReducer, initialState);

  return (
    <RouteStateContext.Provider value={{ state, dispatch }}>
      {children}
    </RouteStateContext.Provider>
  );
}

export function useRouteState() {
  return useContext(RouteStateContext);
}