export interface MenuItem {
  label: string;
  icon?: string;
  command?: () => void;
  items?: MenuItem[];
}
