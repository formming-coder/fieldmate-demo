import baseProperties from '../mock/properties.json'
import baseTasks from '../mock/tasks.json'
import baseUsers from '../mock/users.json'
import baseNotifications from '../mock/notifications.json'
import { Property, Task, User, Notification } from '../types'

const delay = (ms = 350) => new Promise(res => setTimeout(res, ms))

const STORAGE_KEY = 'fieldmate:properties'
const channelName = 'fieldmate:properties'

function readStoredProperties(): Property[]{
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw) return JSON.parse(raw) as Property[]
  }catch(e){/* ignore */}
  return baseProperties as Property[]
}

function writeStoredProperties(list: Property[]){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }catch(e){}
}

const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null

export async function fetchProperties(): Promise<Property[]>{
  await delay(200)
  return readStoredProperties()
}

export async function fetchPropertyById(id: string): Promise<Property | undefined>{
  await delay(120)
  return readStoredProperties().find(p => p.id === id)
}

export async function fetchTasks(): Promise<Task[]>{
  await delay(160)
  return baseTasks as Task[]
}

export async function fetchUser(): Promise<User | undefined>{
  await delay(80)
  return (baseUsers as User[])[0]
}

export async function fetchNotifications(): Promise<Notification[]>{
  await delay(120)
  return baseNotifications as Notification[]
}

export async function saveProperty(p: Partial<Property>): Promise<Property>{
  await delay(200)
  const current = readStoredProperties()
  const id = p.id || `prop-${Date.now()}`
  const now = new Date().toISOString()
  const prop: Property = {
    id,
    owner: p.owner || 'Unknown',
    province: p.province || 'Unknown',
    latitude: p.latitude || 0,
    longitude: p.longitude || 0,
    marketPrice: p.marketPrice || 0,
    appraisalPrice: p.appraisalPrice || 0,
    status: p.status || 'inspected',
    lastInspection: p.lastInspection || now,
    images: p.images || []
  }
  const updated = [prop, ...current]
  writeStoredProperties(updated)
  // broadcast
  try{ bc?.postMessage({ type: 'properties:update', payload: prop }) }catch(e){/*ignore*/}
  return prop
}

export function subscribeProperties(cb: (p: Property) => void){
  if(!bc) return ()=>{}
  const handler = (ev: MessageEvent) => {
    const data = ev.data
    if(data?.type === 'properties:update') cb(data.payload as Property)
  }
  bc.addEventListener('message', handler)
  return () => bc.removeEventListener('message', handler)
}

export default { fetchProperties, fetchPropertyById, fetchTasks, fetchUser, fetchNotifications, saveProperty, subscribeProperties }
