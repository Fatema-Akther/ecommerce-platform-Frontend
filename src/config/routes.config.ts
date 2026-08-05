import type { IconType } from "react-icons";
import { FaShoppingBag } from "react-icons/fa";
import { IoIosContacts } from "react-icons/io";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { RiInformation2Fill } from "react-icons/ri";

export interface NavSubItem {
  title: string;
  path: string;
  icon?: IconType;
  element?: React.ElementType;
}

export interface NavGroup {
  title: string;
  path?: string;
  icon?: IconType;
  element?: React.ElementType;
  submenu?: NavSubItem[];
}

export const menuItems: NavGroup[] = [
  // { title: "Home", path: "/"  },
  { title: "All", path: "/products" },
  // { title: "About", path: "/about", icon: RiInformation2Fill },
  // { title: "Contact", path: "/contact", icon: IoIosContacts },
];