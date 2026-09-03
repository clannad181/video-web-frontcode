import request from './request'

export async function getDisplayConfig() {
  return await request.get('/client/config/display')
}
