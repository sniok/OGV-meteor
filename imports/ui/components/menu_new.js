

import './menu_new.html'
import './menu_new.css'
import './notifications.js'

Template.newMenu.helpers({
    activeIfTemplateIs(template) {
        const currentRoute = Router.current().route.getName()
        return currentRoute && template === currentRoute ? 'active' : ''
    },
    toggle() {
        console.log('i runned')
    },
})

Template.newMenu.events({
    'click #log-out': function () {
        Meteor.logout(() => {
            sAlert.info('Bye!, See you back soon')
            Router.go('/')
        })
        return false
    },
    'click #notification-button': function () {
        $('.notifications').slideToggle('fast')
    },
    'click #navToggle': function () {
        Template.newMenu.toggle()
    },
})

Template.newMenu.toggle = function (hide) {
    if (hide) {
        $('.nav').addClass('smallNav')
        $('#main').addClass('smallMain')
    } else {
        $('.nav').toggleClass('smallNav')
        $('#main').toggleClass('smallMain')
    }
    if (Router.current().route.getName() === 'modelViewer') {
        setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 320)
    }
}
