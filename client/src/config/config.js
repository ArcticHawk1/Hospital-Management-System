import { lazy } from 'react'
import locales from './locales'
import apiRoutes from './apiRoutes'
import routes from './routes'
import getMenuItems from './menuItems'
import themes from './themes'
import parseLanguages from 'base-shell/lib/utils/locale'

const config = {
  auth: {
    signInURL: '/',
  },
  apiRoutes,
  routes,
  locale: {
    locales,
    defaultLocale: parseLanguages( 'en'),
    onError: (e) => {
      //console.warn(e)
      return
    },
  },
  menu: {
    getMenuItems,
  },
  theme: {
    themes,
    defaultThemeID: 'default',
    defaultType: 'light',
  },
  pages: {
    LandingPage: lazy(() => import('../pages/LandingPage/LandingPage')),
    PageNotFound: lazy(() => import('../pages/PageNotFound/PageNotFound')),
  },
}

export default config
