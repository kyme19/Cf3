import {
  createCampaign,
  dashboard,
  logout,
  payment,
  profile,
  withdraw,
} from "../assets";

import { 
  BsCashCoin,
  BsCashStack,
  BsWallet
} from 'react-icons/bs';

export const navlinks = [
  {
    name: "dashboard",
    imgUrl: dashboard,
    link: "/",
  },
  {
    name: "campaign",
    imgUrl: createCampaign,
    link: "/create-campaign",
  },
  {
    name: 'withdraw',
    IconComponent: BsCashStack,
    link: '/campaign/1/withdraw', // For viewing withdrawal requests
  },
  {
    name: 'create-withdraw',
    IconComponent: BsCashCoin,
    link: '/campaign/1/withdraw/create', // For creating new withdrawal request
  },
  {
    name: "profile",
    imgUrl: profile,
    link: "/profile",
  },
  {
    name: "logout",
    imgUrl: logout,
    link: "/",
    disabled: true,
  },
];