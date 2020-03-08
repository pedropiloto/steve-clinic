/**
 * Object mapping of known possible inboxes for the user
 */
export const NavigationItems = [
  {
    id: "welcome",
    icon: "/img/icon/apps.svg",
    label: "navBar.welcome",
    to: "/welcome"
  },
  {
    id: "photo-management",
    icon: "/img/people.svg",
    label: "Photos",
    to: "/photo-management"
  },
  {
    id: "health-data",
    icon: "/img/people.svg",
    label: "Health Data",
    to: "/health-data"
  }
];

export const ProfileOptions = [
  {
    label: "navBar.profile",
    onClick: "profileRedirect",
    icon: "cog"
  },
  {
    label: "navBar.formModelConvert",
    onClick: "formModelConvertRedirect"
  },
  {
    label: "navBar.formModelRender",
    onClick: "formModelRenderRedirect"
  },
  {
    label: "navBar.logOut",
    onClick: "logOut",
    icon: "lock"
  }
];
