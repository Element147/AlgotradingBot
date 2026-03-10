import React, { useState } from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Science as TestIcon, TrendingUp as LiveIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { setEnvironmentMode, type EnvironmentMode } from './environmentSlice';
import { accountApi } from '../account/accountApi';

interface EnvironmentSwitchProps {
  onSwitch?: (mode: EnvironmentMode) => void;
}

export const EnvironmentSwitch: React.FC<EnvironmentSwitchProps> = ({ onSwitch }) => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state: RootState) => state.environment.mode);
  const connectedExchange = useSelector((state: RootState) => state.environment.connectedExchange);
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<EnvironmentMode | null>(null);

  const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: EnvironmentMode | null) => {
    if (newMode && newMode !== currentMode) {
      setPendingMode(newMode);
      setConfirmDialogOpen(true);
    }
  };

  const handleConfirm = () => {
    if (pendingMode) {
      dispatch(setEnvironmentMode(pendingMode));
      dispatch(accountApi.util.invalidateTags(['Balance', 'Performance', 'Positions', 'Trades']));
      setConfirmDialogOpen(false);
      
      // Call optional callback
      if (onSwitch) {
        onSwitch(pendingMode);
      }
      
      setPendingMode(null);
    }
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setPendingMode(null);
  };

  const getEnvironmentLabel = () => {
    if (currentMode === 'live' && connectedExchange) {
      return connectedExchange.charAt(0).toUpperCase() + connectedExchange.slice(1);
    }
    return currentMode === 'test' ? 'Test Environment' : 'Live Trading';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <ToggleButtonGroup
        value={currentMode}
        exclusive
        onChange={handleModeChange}
        aria-label="environment mode"
        size="small"
      >
        <ToggleButton value="test" aria-label="test environment">
          <TestIcon sx={{ mr: 1 }} />
          Test/Backtest
        </ToggleButton>
        <ToggleButton value="live" aria-label="live trading">
          <LiveIcon sx={{ mr: 1 }} />
          Live Trading
        </ToggleButton>
      </ToggleButtonGroup>

      <Chip
        label={getEnvironmentLabel()}
        color={currentMode === 'live' ? 'error' : 'default'}
        size="small"
        variant="outlined"
      />

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancel}
        aria-labelledby="environment-switch-dialog-title"
        aria-describedby="environment-switch-dialog-description"
      >
        <DialogTitle id="environment-switch-dialog-title">
          Switch to {pendingMode === 'live' ? 'Live Trading' : 'Test/Backtest'} Environment?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="environment-switch-dialog-description">
            {pendingMode === 'live' ? (
              <>
                You are about to switch to <strong>Live Trading</strong> mode. This will display real trading data 
                from your connected exchange account. All data will be reloaded.
              </>
            ) : (
              <>
                You are about to switch to <strong>Test/Backtest</strong> mode. This will display simulated 
                trading data for strategy validation. All data will be reloaded.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
            Confirm Switch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


