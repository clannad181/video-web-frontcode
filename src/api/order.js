import request from './request'

export const createOrder = (durationMonths) =>
  request.post('/client/order/create', { durationMonths })

export const payOrder = (orderNo, payMethod = 1) =>
  request
    .post('/client/order/pay', { orderNo, payMethod }, { returnFull: true })
    .then((res) => res.data || res.message)

export const getOrderDetail = (orderNo) =>
  request.get(`/client/order/detail/${orderNo}`)

export const getVipPlans = () => request.get('/client/vip/plans')
