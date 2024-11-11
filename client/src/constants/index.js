import {
  createCampaign,
  dashboard,
  logout,
  payment,
  profile,
  withdraw,
  money,
} from "../assets";

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
    imgUrl: payment,
    link: '/campaign/1/withdraw', // For viewing withdrawal requests
  },
  {
    name: 'create-withdraw',
    imgUrl: money,
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