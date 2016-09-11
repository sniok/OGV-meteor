

import './menu_new.html'
import './menu_new.css'

Template.newMenu.helpers({
    activeIfTemplateIs(template) {
        const currentRoute = Router.current().route.getName()
        return currentRoute && template === currentRoute ? 'active' : ''
    },
})
