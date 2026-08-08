export const cameraService = {
  isSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
  },

  permissionInstructions() {
    if (typeof navigator === 'undefined') return 'เปิดสิทธิ์กล้องในการตั้งค่าของเบราว์เซอร์ แล้วกลับมาลองอีกครั้ง'
    const agent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(agent)) {
      return 'ไปที่ การตั้งค่า > Safari > กล้อง แล้วเลือก อนุญาต จากนั้นกลับมาเปิดหน้านี้ใหม่'
    }
    if (/android/.test(agent)) {
      return 'แตะไอคอนรูปกุญแจข้างที่อยู่เว็บไซต์ เลือก สิทธิ์ > กล้อง > อนุญาต แล้วโหลดหน้าใหม่'
    }
    return 'เปิดการตั้งค่าเว็บไซต์ของเบราว์เซอร์ อนุญาตสิทธิ์กล้อง แล้วโหลดหน้าใหม่'
  },
}