const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

// async function query(filterBy) {
//     console.log(' filter from service query :', filterBy)
//     try {
//         const criteria = _buildCriteria(filterBy)

//         console.log('criteria ', criteria)
//         const collection = await dbService.getCollection('gig')
//         var gigs = await collection.find(criteria).toArray()
//         return gigs
//     } catch (err) {
//         logger.error('cannot find gigs', err)
//         throw err
//     }
// }



async function query(filterBy) {
    console.log(' filter from service query :', filterBy)
    try {
        const criteria = _buildCriteria(filterBy)
        console.log('criteria ', criteria)
        const collection = await dbService.getCollection('gig')
        let query = collection.find(criteria)

        // Add sort option if it exists in filterBy
        if (filterBy.sortBy === 'Best Price') {
            query = query.sort({ price: 1 })
        } else if (filterBy.sortBy === 'DeliveryTime') {
            query = query.sort({ daysToMake: 1 })
        }

        const gigs = await query.toArray()
        return gigs
    } catch (err) {
        logger.error('cannot find gigs', err)
        throw err
    }
}





async function getById(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        const gig = collection.findOne({ _id: ObjectId(gigId) })
        return gig
    } catch (err) {
        logger.error(`while finding gig ${gigId}`, err)
        throw err
    }
}

async function remove(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        await collection.deleteOne({ _id: ObjectId(gigId) })
        return gigId
    } catch (err) {
        logger.error(`cannot remove gig ${gigId}`, err)
        throw err
    }
}

async function add(gig) {
    try {
        const collection = await dbService.getCollection('gig')
        await collection.insertOne(gig)
        return gig
    } catch (err) {
        logger.error('cannot insert gig', err)
        throw err
    }
}

async function update(gig) {
    try {
        const gigToSave = {
            titler: gig.titler,
            price: gig.price
        }
        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ _id: ObjectId(gig._id) }, { $set: gigToSave })
        return gig
    } catch (err) {
        logger.error(`cannot update gig ${gigId}`, err)
        throw err
    }
}

async function addGigMsg(gigId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ _id: ObjectId(gigId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add gig msg ${gigId}`, err)
        throw err
    }
}

async function removeGigMsg(gigId, msgId) {
    try {
        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ _id: ObjectId(gigId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add gig msg ${gigId}`, err)
        throw err
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addGigMsg,
    removeGigMsg
}

// function _buildCriteria(filterBy = { title: '', category: null, budget: { min: '', max: '' }, DeliveryTime: '' }) {
//     const { title, category, budget, DeliveryTime } = filterBy

//     const criteria = {}

//     if (title) {
//         criteria.title = { $regex: title, $options: 'i' }
//     }

//     if (category && category.length > 0) {
//         const categoryCrit = category.map(category => ({
//             category: { $elemMatch: { title: category } },
//         }))

//         criteria.$and = category
//     }



//     return criteria
// }

// function _buildCriteria(filterBy = { title: '', category: null, DeliveryTime: '', min: '', max: '' }) {
//     const { title, category, min, max, DeliveryTime } = filterBy

//     const criteria = {}

//     // If a title is provided, add a regex search for it
//     if (title) {
//         criteria.title = { $regex: title, $options: 'i' }
//     }

//     // If a category is provided, add an elemMatch query for each category
//     // if (category && category.length > 0) {
//     //     const categoryCrit = category.map(cat => ({
//     //         category: { $elemMatch: { title: cat } },
//     //     }))
//     //     criteria.$and = categoryCrit
//     // }

//     // if (category) {

//     //     console.log('caegory filter ', category)

//     //     criteria.category = { $elemMatch: { tags: { $in: tags } } }
//     // }


//     if (category) {
//         criteria.category = { $elemMatch: { title: category } }
//     }
//     // If a budget range is provided, add a query for it
//     if (min && max) {
//         criteria.price = {}
//         if (min) criteria.price.$gte = Number(min)
//         if (max) criteria.price.$lte = Number(max)
//     }

//     // If a delivery time is provided, add an exact match query for it
//     if (DeliveryTime) {
//         criteria.DeliveryTime = { $lte: Number(DeliveryTime) }
//     }

//     return criteria
// }


// if (labels && labels.length > 0) {
//     const labelsCrit = labels.map(label => ({
//         labels: { $elemMatch: { title: label } },
//     }))

//     criteria.$and = labelsCrit
// }


function _buildCriteria(filterBy = { title: '', category: null, DeliveryTime: '', min: '', max: '', sortBy: '' }) {
    const { title, category, min, max, DeliveryTime, sortBy } = filterBy

    const criteria = {}

    // If a title is provided, add a regex search for it
    if (title) {
        criteria.title = { $regex: title, $options: 'i' }
    }

    // If a category is provided, add an elemMatch query for each category
    if (category) {
        criteria.category = { $elemMatch: { tags: { $in: category } } }
    }

    // If a budget range is provided, add a query for it
    if (min && max) {
        criteria.price = {}
        if (min) criteria.price.$gte = Number(min)
        if (max) criteria.price.$lte = Number(max)
    }

    // If a delivery time is provided, add an exact match query for it
    if (DeliveryTime) {
        criteria.DeliveryTime = { $lte: Number(daysToMake) }
    }

    // If sorting by price is requested, add sorting rule to criteria
    if (sortBy === 'Best price') {
        criteria.sort = { price: 1 } // 1 for ascending, -1 for descending
    }
    if (sortBy === 'Delivery Time') {
        criteria.sort = { daysToMake: 1 } // 1 for ascending, -1 for descending
    }

    return criteria
}
