const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
const socketService = require('../../services/socket.service')

async function query(filterBy) {
  try {
    const criteria = {}

    const collection = await dbService.getCollection('order')
    var orders = await collection.find(criteria).toArray()
    orders = orders.map((order) => {
      order.createdAt = ObjectId(order._id).getTimestamp()
      return order
    })
    orders = orders.sort((o1, o2) => {
      return o2.createdAt - o1.createdAt
    })
    return orders
  } catch (err) {
    logger.error('cannot find orders', err)
    throw err
  }
}

async function getById(orderId) {
  try {
    const collection = await dbService.getCollection('order')
    const order = collection.findOne({ _id: ObjectId(orderId) })
    return order
  } catch (err) {
    logger.error(`while finding order ${orderId}`, err)
    throw err
  }
}

async function remove(orderId) {
  try {
    const collection = await dbService.getCollection('order')
    await collection.deleteOne({ _id: ObjectId(orderId) })
    return orderId
  } catch (err) {
    logger.error(`cannot remove order ${orderId}`, err)
    throw err
  }
}

async function add(order) {
  console.log('order from order service', order)
  try {
    let collection = await dbService.getCollection('order')
    let addedOrder = await collection.insertOne(order)
    addedOrder = addedOrder.ops[0]
    addedOrder.createdAt = ObjectId(addedOrder._id).getTimestamp()

    socketService.emitToUser({
      type: 'new-order-seller',
      data: addedOrder,
      userId: addedOrder.seller._id,
    })
    socketService.emitToUser({
      type: 'new-order-buyer',
      data: addedOrder,
      userId: addedOrder.buyer._id,
    })

    return addedOrder
  } catch (err) {
    logger.error('cannot insert order', err)
    throw err
  }
}

async function update(order) {
  try {
    var id = ObjectId(order._id)
    var temp = order._id
    delete order._id
    const collection = await dbService.getCollection('order')
    await collection.updateOne({ _id: id }, { $set: { ...order } })
    order._id = temp
    return order
  } catch (err) {
    logger.error(`cannot update order ${order._id}`, err)
    throw err
  }
}

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
}