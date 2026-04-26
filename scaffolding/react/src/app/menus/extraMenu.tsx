import {
  createMenuType,
  IMenuConfig,
  MenuTypes,
} from '@digitaldefiance/express-suite-react-components';
import { Dashboard, Email } from '@mui/icons-material';

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
    {
      id: 'admin-emails',
      label: 'Admin Emails',
      icon: <Email />,
      link: '/admin/emails',
      requiresAuth: true,
      includeOnMenus: [ExtraMenu, MenuTypes.SideMenu],
      index: 1,
    },
  ],
};
