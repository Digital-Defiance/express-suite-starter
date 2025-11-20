import { createMenuType, IMenuConfig } from '@digitaldefiance/express-suite-react-components';
import { Dashboard } from '@mui/icons-material';

const ExtraMenu = createMenuType('ExtraMenu');

export const extraMenuConfig: IMenuConfig = {
  menuType: ExtraMenu,
  menuIcon: <Dashboard />,
  priority: 1,
  options: [
    {
      id: 'extra-option-1',
      label: 'Extra Option 1',
      link: '/extra-1',
      requiresAuth: true,
      includeOnMenus: [ExtraMenu],
      index: 0,
    },
  ],
};
