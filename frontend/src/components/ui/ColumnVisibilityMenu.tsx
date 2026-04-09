import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import {
  Button,
  Checkbox,
  Divider,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { useMemo, useState, type MouseEvent } from 'react';

export interface ColumnVisibilityMenuItem {
  id: string;
  label: string;
  visible: boolean;
  canHide: boolean;
}

interface ColumnVisibilityMenuProps {
  columns: ColumnVisibilityMenuItem[];
  onToggle: (columnId: string) => void;
  onRestoreDefaults: () => void;
}

export function ColumnVisibilityMenu({
  columns,
  onToggle,
  onRestoreDefaults,
}: ColumnVisibilityMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hiddenCount = useMemo(
    () => columns.filter((column) => !column.visible).length,
    [columns]
  );

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ViewColumnOutlinedIcon />}
        onClick={openMenu}
      >
        Columns{hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ''}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            onRestoreDefaults();
            closeMenu();
          }}
        >
          Restore defaults
        </MenuItem>
        <Divider />
        {columns.map((column) => (
          <MenuItem
            key={column.id}
            dense
            disabled={!column.canHide}
            onClick={() => {
              if (!column.canHide) {
                return;
              }
              onToggle(column.id);
            }}
          >
            <Checkbox size="small" edge="start" checked={column.visible} tabIndex={-1} disableRipple />
            <ListItemText primary={column.canHide ? column.label : `${column.label} (fixed)`} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
