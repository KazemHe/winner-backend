import { gigService } from './services/gig.service.js'
import { userService } from './services/user.service.js'
import { utilService } from './services/util.service.js'

console.log('Simple driver to test some API calls')

window.onLoadGigs = onLoadGigs
window.onLoadUsers = onLoadUsers
window.onAddGig = onAddGig
window.onGetGigById = onGetGigById
window.onRemoveGig = onRemoveGig
window.onAddGigMsg = onAddGigMsg

async function onLoadGigs() {
    const gigs = await gigService.query()
    render('Gigs', gigs)
}
async function onLoadUsers() {
    const users = await userService.query()
    render('Users', users)
}

async function onGetGigById() {
    const id = prompt('Gig id?')
    if (!id) return
    const gig = await gigService.getById(id)
    render('Gig', gig)
}

async function onRemoveGig() {
    const id = prompt('Gig id?')
    if (!id) return
    await gigService.remove(id)
    render('Removed Gig')
}

async function onAddGig() {
    await userService.login({ username: 'muki', password: '123' })
    const savedGig = await gigService.save(gigService.getEmptyGig())
    render('Saved Gig', savedGig)
}

async function onAddGigMsg() {
    await userService.login({ username: 'muki', password: '123' })
    const id = prompt('Gig id?')
    if (!id) return

    const savedMsg = await gigService.addGigMsg(id, 'some msg')
    render('Saved Msg', savedMsg)
}

function render(title, mix = '') {
    console.log(title, mix)
    const output = utilService.prettyJSON(mix)
    document.querySelector('h2').innerText = title
    document.querySelector('pre').innerHTML = output
}

