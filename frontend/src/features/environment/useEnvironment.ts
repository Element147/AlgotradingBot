import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { setEnvironmentMode, setConnectedExchange, updateSyncTime, type EnvironmentMode } from './environmentSlice';

/**
 * Custom hook for accessing and managing environment state
 * 
 * @returns Environment state and actions
 */
export const useEnvironment = () => {
  const dispatch = useDispatch();
  const environment = useSelector((state: RootState) => state.environment);

  return {
    mode: environment.mode,
    connectedExchange: environment.connectedExchange,
    lastSyncTime: environment.lastSyncTime,
    isLiveMode: environment.mode === 'live',
    isTestMode: environment.mode === 'test',
    setMode: (mode: EnvironmentMode) => dispatch(setEnvironmentMode(mode)),
    setExchange: (exchange: string | null) => dispatch(setConnectedExchange(exchange)),
    updateSync: () => dispatch(updateSyncTime()),
  };
};
