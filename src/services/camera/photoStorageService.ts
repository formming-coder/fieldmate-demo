import { CapturedPhoto, ListingPropertyType, PropertySurvey, SurveyPhoto } from '../../types'

const DATABASE_NAME = 'fieldmate-local-media'
const STORE_NAME = 'survey-photos'

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onerror = () => reject(new Error('ไม่สามารถเปิดพื้นที่จัดเก็บรูปภาพได้'))
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
  })
}

async function saveMedia(photo: CapturedPhoto) {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(photo)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error('ไม่สามารถบันทึกรูปภาพในเครื่องได้'))
  })
  database.close()
}

export const photoStorageService = {
  async updatePropertyType(photoId: string, propertyType: ListingPropertyType) {
    const database = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(photoId)
      request.onsuccess = () => {
        const photo = request.result as CapturedPhoto | undefined
        if (!photo) {
          reject(new Error('ไม่พบรูปภาพที่เชื่อมโยงกับแบบฟอร์ม'))
          return
        }
        store.put({ ...photo, metadata: { ...photo.metadata, propertyType } })
      }
      request.onerror = () => reject(new Error('ไม่สามารถอัปเดตข้อมูลรูปภาพได้'))
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('ไม่สามารถอัปเดตข้อมูลรูปภาพได้'))
    })
    database.close()
  },
  async attachToSurvey(photo: CapturedPhoto) {
    await saveMedia(photo)
    const key = `fieldmate-survey-draft:${photo.metadata.propertyId}`
    const raw = window.localStorage.getItem(key)
    if (!raw) throw new Error('ไม่พบแบบสำรวจปัจจุบัน กรุณากลับไปเปิดจากหน้าสำรวจ')
    const survey = JSON.parse(raw) as PropertySurvey
    if (survey.id !== photo.metadata.surveyId) throw new Error('แบบสำรวจปัจจุบันไม่ตรงกับรูปภาพ')
    const surveyPhoto: SurveyPhoto = {
      id: photo.id,
      dataUrl: photo.image,
      thumbnailDataUrl: photo.thumbnail,
      latitude: photo.metadata.latitude,
      longitude: photo.metadata.longitude,
      capturedAt: photo.metadata.capturedAt,
      propertyId: photo.metadata.propertyId,
      surveyId: photo.metadata.surveyId,
      type: photo.metadata.category,
      ocrStatus: photo.ocrStatus,
      ocrResult: photo.ocrResult,
      quality: photo.quality,
    }
    const photos = survey.photos.filter((item) => item.id !== surveyPhoto.id).concat(surveyPhoto)
    const checklist = survey.checklist.map((item) => item.id === surveyPhoto.type ? { ...item, completed: true } : item)
    window.localStorage.setItem(key, JSON.stringify({ ...survey, photos, checklist, updatedAt: new Date().toISOString() }))
    window.dispatchEvent(new CustomEvent('fieldmate:survey-photo-updated', { detail: { propertyId: photo.metadata.propertyId, photoId: photo.id } }))
    return surveyPhoto
  },
}