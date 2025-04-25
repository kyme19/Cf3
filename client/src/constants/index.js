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
    text: 'View Withdrawals',
    link: '/campaign/:id/withdraw', // For viewing and voting on withdrawal requests
  },
  {
    name: 'create-withdraw',
    IconComponent: BsCashCoin,
    text: 'Request Withdrawal',
    link: '/campaign/:id/withdraw/create', // For creating new withdrawal request
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