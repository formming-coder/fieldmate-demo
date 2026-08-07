import React, { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../components/Layout'
import s from './AICameraV2.module.css'
import { useCurrentOfficerQuery, useSavePropertyMutation } from '../hooks/useBackendQueries'
import { MapContainer, Marker, TileLayer, useMap, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const propertyTypes = [
  { key: 'land', label: 'ที่ดินว่าง', emoji: '🏞' },
  { key: 'house', label: 'บ้านเดี่ยว', emoji: '🏠' },
  { key: 'semi', label: 'บ้านแฝด/บ้านต่อเนื่อง', emoji: '🏡' },
  { key: 'townhouse', label: 'ทาวน์เฮาส์', emoji: '🏘' },
  { key: 'commercial', label: 'ร้านค้า/อาคารพาณิชย์', emoji: '🏬' },
  { key: 'condo', label: 'คอนโดมิเนียม', emoji: '🏢' },
]

const defaultLocation: [number, number] = [13.736717, 100.523186]

function CenterMap({ position }: { position: [number, number] }){
  const map = useMap()
  useEffect(()=>{ map.setView(position, map.getZoom()) }, [position, map])
  return null
}

export default function AICameraV2(){
  const [images, setImages] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [propertyType, setPropertyType] = useState<string>('land')
  const [price, setPrice] = useState('')
  const [phones, setPhones] = useState<string[]>([''])
  const [phoneInput, setPhoneInput] = useState('')
  const [landArea, setLandArea] = useState({ rai:'0', ngan:'0', wah:'0' })
  const [usableArea, setUsableArea] = useState('')
  const [floors, setFloors] = useState('1')
  const [projectName, setProjectName] = useState('')
  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')
  const [location, setLocation] = useState<[number, number]>(defaultLocation)
  const [accuracy, setAccuracy] = useState('')
  const [address, setAddress] = useState({ house:'', road:'', subdistrict:'', district:'', province:'' })
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().slice(0,10))
  const [remark, setRemark] = useState('')
  const [officer, setOfficer] = useState('ชื่อเจ้าหน้าที่')
  const [history, setHistory] = useState<Array<{id:string;action:string;time:string}>>([])
  const fileRef = useRef<HTMLInputElement | null>(null)
  const { data: currentOfficer } = useCurrentOfficerQuery()
  const savePropertyMutation = useSavePropertyMutation()

  useEffect(()=>{
    if(currentOfficer?.name) setOfficer(currentOfficer.name)
  }, [currentOfficer?.name])

  useEffect(()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos => {
        setLocation([pos.coords.latitude, pos.coords.longitude])
        setAccuracy(`${Math.round(pos.coords.accuracy)} m`)
      }, ()=>{}, { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 })
    }
  }, [])

  const addHistory = (action: string) => {
    setHistory(prev => [{ id: `${Date.now()}`, action, time: new Date().toLocaleString() }, ...prev])
  }

  const pickFiles = () => fileRef.current?.click()
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(!files) return
    const urls = Array.from(files).map(file => URL.createObjectURL(file))
    setImages(prev => [...prev, ...urls])
    addHistory('เพิ่มภาพถ่ายแล้ว')
  }

  const removePhoto = (index:number) => {
    setImages(prev => prev.filter((_,i) => i !== index))
    addHistory('ลบภาพถ่ายแล้ว')
  }

  const movePhoto = (index:number, direction: -1|1) => {
    setImages(prev => {
      const next = [...prev]
      const swap = next[index + direction]
      if(!swap) return next
      next[index + direction] = next[index]
      next[index] = swap
      return next
    })
    addHistory('จัดลำดับภาพแล้ว')
  }

  const addPhoneNumber = () => {
    if(!phoneInput.trim()) return
    setPhones(prev => [...prev, phoneInput.trim()])
    setPhoneInput('')
    addHistory('เพิ่มเบอร์โทรแล้ว')
  }

  const removePhone = (index:number) => {
    setPhones(prev => prev.filter((_,i)=>i!==index))
    addHistory('ลบเบอร์โทรแล้ว')
  }

  const setCurrentLocation = () => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos => {
        const coords:[number,number] = [pos.coords.latitude, pos.coords.longitude]
        setLocation(coords)
        setAccuracy(`${Math.round(pos.coords.accuracy)} m`)
        addHistory('อัปเดตพิกัดปัจจุบันแล้ว')
      })
    }
  }

  const handleUpload = async () => {
    setIsAnalyzing(true)
    setTimeout(async () => {
      const prop = await savePropertyMutation.mutateAsync({
        owner: officer,
        province: address.province || 'ไม่ระบุจังหวัด',
        latitude: location[0],
        longitude: location[1],
        marketPrice: Number(price) || 0,
        appraisalPrice: Number(price) || 0,
        status: 'pending',
        lastInspection: new Date().toISOString(),
        type: propertyType,
        images,
      })
      addHistory('อัปโหลดแบบร่างทรัพย์สินแล้ว')
      setIsAnalyzing(false)
      alert(`บันทึกเรียบร้อยแล้ว: ${prop.id}`)
    }, 700)
  }

  const handleSearchLocation = () => {
    addHistory('เปิดการค้นหาสถานที่แล้ว')
    alert('กำลังเตรียมหน้าค้นหาสถานที่')
  }

  const selectedTypeLabel = useMemo(() => propertyTypes.find(type => type.key === propertyType)?.label || '', [propertyType])

  return (
    <Layout title="บันทึกทรัพย์สิน">
      <div className={s.pageWrap}>
        <section className={s.heroSection}>
          <div className={s.heroTopBar}>
            <button className={s.iconBtn} onClick={() => window.history.back()}>←</button>
            <div className={s.heroTitle}>บันทึกทรัพย์สิน</div>
            <div className={s.heroActions}>
              <button className={s.iconBtn}>⚡</button>
              <button className={s.iconBtn}>🖼</button>
            </div>
          </div>

          {previewImage ? (
            <div className={s.previewFrame} style={{ backgroundImage: `url(${previewImage})` }}>
              <div className={s.previewOverlay}>
                <div className={s.previewBadge}>ตัวอย่าง</div>
                <div className={s.previewButtons}>
                  <button className={s.secondaryBtn} onClick={() => setPreviewImage(null)}>ถ่ายใหม่</button>
                  <button className={s.primaryBtn} onClick={() => { addHistory('บันทึกตัวอย่างแล้ว'); setPreviewImage(null) }}>ดำเนินการต่อ</button>
                </div>
              </div>
            </div>
          ) : (
            <div className={s.cameraFrame}>
              <div className={s.cameraOverlay}>
                <div className={s.statusPill}>ใช้งานถ่ายภาพสด</div>
                <div className={s.statusPill}>พร้อม GPS</div>
              </div>
              <div className={s.cameraFooter}>
                <button className={s.captureBtn} onClick={() => {
                  const sample = images[0] || 'https://placehold.co/900x1400?text=ภาพถ่ายทรัพย์'
                  setPreviewImage(sample)
                  setIsAnalyzing(true)
                  setTimeout(() => setIsAnalyzing(false), 900)
                }}>●</button>
                <button className={s.galleryThumb} onClick={pickFiles}>แกลเลอรี</button>
              </div>
            </div>
          )}

          <div className={s.infoStrip}>
            <div><div className={s.infoLabel}>พิกัด GPS</div><div>{location[0].toFixed(4)}, {location[1].toFixed(4)}</div></div>
            <div><div className={s.infoLabel}>ความแม่นยำ</div><div>{accuracy || '—'}</div></div>
            <div><div className={s.infoLabel}>เจ้าหน้าที่</div><div>{officer}</div></div>
          </div>
        </section>

        {isAnalyzing && (
          <section className={s.section}>
            <div className={s.sectionHeader}>
              <div>
                <div className={s.stepTitle}>วิเคราะห์ด้วย AI</div>
                <div className={s.sectionTitle}>กำลังวิเคราะห์...</div>
              </div>
            </div>
            <div className={s.loadingBar}><span /></div>
          </section>
        )}

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>OCR</div>
              <div className={s.sectionTitle}>ผล OCR</div>
            </div>
            <button className={s.ghostBtn} onClick={() => addHistory('รัน OCR แล้ว')}>AI OCR</button>
          </div>
          <div className={s.ocrGrid}>
            <div><label>เบอร์โทร</label><input className={s.input} value={phones[0] || ''} onChange={e=>setPhones([e.target.value, ...phones.slice(1)])} /></div>
            <div><label>ราคาขาย</label><input className={s.input} value={price} onChange={e=>setPrice(e.target.value)} /></div>
            <div><label>ชื่อโครงการ</label><input className={s.input} value={projectName} onChange={e=>setProjectName(e.target.value)} /></div>
            <div><label>เลขที่บ้าน</label><input className={s.input} value={address.house} onChange={e=>setAddress(prev=>({...prev, house:e.target.value}))} /></div>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 2</div>
              <div className={s.sectionTitle}>ประเภททรัพย์สิน</div>
            </div>
          </div>
          <div className={s.typeGrid}>
            {propertyTypes.map(type => (
              <button key={type.key} type="button" className={`${s.typeCard} ${propertyType===type.key ? s.typeSelected : ''}`} onClick={()=>{setPropertyType(type.key); addHistory(`เลือกประเภท ${type.label}`)}}>
                <div className={s.typeEmoji}>{type.emoji}</div>
                <div>{type.label}</div>
              </button>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 3</div>
              <div className={s.sectionTitle}>ข้อมูลการขาย</div>
            </div>
          </div>
          <div className={s.fieldRow}><label>ราคาขาย</label><div className={s.amountInput}><span>บาท</span><input value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" /></div></div>
          <div className={s.fieldColumn}>
            <label>เบอร์โทรของผู้ขาย</label>
            {phones.map((phone,index) => (
              <div key={index} className={s.phoneRow}>
                <input value={phone} readOnly className={s.input} />
                <button type="button" className={s.smallBtn} onClick={()=>removePhone(index)}>ลบ</button>
              </div>
            ))}
            <div className={s.phoneAddRow}>
              <input value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} placeholder="เพิ่มเบอร์โทร" className={s.input} />
              <button type="button" className={s.smallBtn} onClick={addPhoneNumber}>เพิ่ม</button>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 4</div>
              <div className={s.sectionTitle}>ข้อมูลทรัพย์สิน</div>
            </div>
          </div>
          <div className={s.fieldGrid}>
            <div>
              <label>พื้นที่ดิน</label>
              <div className={s.inlineGrid}>
                <input className={s.input} value={landArea.rai} onChange={e=>setLandArea(prev=>({...prev, rai:e.target.value}))} placeholder="ไร่" />
                <input className={s.input} value={landArea.ngan} onChange={e=>setLandArea(prev=>({...prev, ngan:e.target.value}))} placeholder="งาน" />
                <input className={s.input} value={landArea.wah} onChange={e=>setLandArea(prev=>({...prev, wah:e.target.value}))} placeholder="วา" />
              </div>
            </div>
            {propertyType !== 'land' && (
              <>
                <div>
                  <label>พื้นที่ใช้สอย (ตร.ม.)</label>
                  <input className={s.input} value={usableArea} onChange={e=>setUsableArea(e.target.value)} placeholder="เช่น 180" />
                </div>
                <div>
                  <label>จำนวนชั้น</label>
                  <input className={s.input} value={floors} onChange={e=>setFloors(e.target.value)} placeholder="เช่น 2" />
                </div>
              </>
            )}
            {propertyType === 'condo' && (
              <>
                <div>
                  <label>ชื่อโครงการ</label>
                  <input className={s.input} value={projectName} onChange={e=>setProjectName(e.target.value)} />
                </div>
                <div>
                  <label>อาคาร</label>
                  <input className={s.input} value={building} onChange={e=>setBuilding(e.target.value)} />
                </div>
                <div>
                  <label>ชั้น</label>
                  <input className={s.input} value={floor} onChange={e=>setFloor(e.target.value)} />
                </div>
              </>
            )}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 5</div>
              <div className={s.sectionTitle}>ตำแหน่ง GPS</div>
            </div>
          </div>
          <div className={s.mapPanel}>
            <MapContainer center={location} zoom={15} style={{height:'220px', borderRadius:'18px'}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <CenterMap position={location} />
              <Marker position={location} draggable eventHandlers={{ dragend: (event) => {
                const latlng = event.target.getLatLng()
                setLocation([latlng.lat, latlng.lng])
                addHistory('ย้ายพิน GPS แล้ว')
              } }}>
                <Popup>ลากเพื่อปรับตำแหน่ง</Popup>
              </Marker>
            </MapContainer>
            <div className={s.mapActions}>
              <button type="button" className={s.smallBtn} onClick={setCurrentLocation}>ใช้พิกัดปัจจุบัน</button>
              <button type="button" className={s.smallBtn} onClick={handleSearchLocation}>ค้นหาสถานที่</button>
            </div>
            <div className={s.gpsInfo}>
              <div>ละติจูด {location[0].toFixed(6)}</div>
              <div>ลองจิจูด {location[1].toFixed(6)}</div>
              <div>ความแม่นยำ {accuracy || '—'}</div>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 6</div>
              <div className={s.sectionTitle}>ที่อยู่</div>
            </div>
          </div>
          <div className={s.fieldGrid}>
            <div><label>เลขที่บ้าน</label><input className={s.input} value={address.house} onChange={e=>setAddress(prev=>({...prev, house:e.target.value}))} /></div>
            <div><label>ถนน</label><input className={s.input} value={address.road} onChange={e=>setAddress(prev=>({...prev, road:e.target.value}))} /></div>
            <div><label>ตำบล</label><input className={s.input} value={address.subdistrict} onChange={e=>setAddress(prev=>({...prev, subdistrict:e.target.value}))} /></div>
            <div><label>อำเภอ</label><input className={s.input} value={address.district} onChange={e=>setAddress(prev=>({...prev, district:e.target.value}))} /></div>
            <div><label>จังหวัด</label><input className={s.input} value={address.province} onChange={e=>setAddress(prev=>({...prev, province:e.target.value}))} /></div>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 7</div>
              <div className={s.sectionTitle}>วันที่ตรวจสอบ</div>
            </div>
          </div>
          <input type="date" className={s.input} value={inspectionDate} onChange={e=>{ setInspectionDate(e.target.value); addHistory('อัปเดตวันที่ตรวจสอบแล้ว') }} />
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 8</div>
              <div className={s.sectionTitle}>หมายเหตุ</div>
            </div>
          </div>
          <textarea className={s.textarea} value={remark} onChange={e=>setRemark(e.target.value)} placeholder="ป้อนบันทึกการตรวจสอบ รายละเอียดสภาพแวดล้อม หรือข้อสังเกตไซต์" />
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 9</div>
              <div className={s.sectionTitle}>เจ้าหน้าที่</div>
            </div>
          </div>
          <div className={s.officerCard}>
            <div className={s.badge}>{officer.slice(0,2).toUpperCase()}</div>
            <div>
              <div style={{fontWeight:700}}>{officer}</div>
              <div style={{color:'var(--muted)'}}>เจ้าหน้าที่ประเมินทรัพย์สิน</div>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 10</div>
              <div className={s.sectionTitle}>ประวัติการเปลี่ยนแปลง</div>
            </div>
          </div>
          <div className={s.historyList}>
            {history.length ? history.map(item => (
              <div key={item.id} className={s.historyItem}>
                <div>{item.action}</div>
                <div className={s.historyMeta}>{item.time}</div>
              </div>
            )) : <div className={s.muted}>ยังไม่มีประวัติการเปลี่ยนแปลง</div>}
          </div>
        </section>
      </div>

      <div className={s.actionFooter}>
        <button className={s.secondaryBtn} onClick={()=>addHistory('บันทึกร่างแล้ว')}>บันทึกร่าง</button>
        <button className={s.primaryBtn} onClick={handleUpload}>อัปโหลด</button>
        <button className={s.secondaryBtn} onClick={()=>window.location.reload()}>ยกเลิก</button>
      </div>
    </Layout>
  )
}
