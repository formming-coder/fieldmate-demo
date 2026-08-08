import React, { ChangeEvent, DragEvent, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCurrentOfficerQuery, useSavePropertyMutation } from '../hooks/useBackendQueries'
import { useDeviceCamera } from '../hooks/useDeviceCamera'
import { useLiveLocation } from '../hooks/useLiveLocation'
import { formatThaiDate, formatThaiDateTime, formatThaiTime } from '../lib/locale'
import { processPhotoAsset } from '../lib/media/imagePipeline'
import { SurveyPhotoType } from '../types'
import { photoRepository } from '../repositories'
import CameraView from '../components/camera/CameraView'
import CaptureModes, { CaptureMode } from '../components/camera/CaptureModes'
import TopCameraBar from '../components/camera/TopCameraBar'
import BottomToolbar from '../components/camera/BottomToolbar'
import CameraOverlay from '../components/camera/CameraOverlay'
import GPSOverlay from '../components/camera/GPSOverlay'
import QualityIndicator from '../components/camera/QualityIndicator'
import OCRPreview from '../components/camera/OCRPreview'
import UploadProgress from '../components/camera/UploadProgress'
import SurveyAICamera from '../components/camera/SurveyAICamera'
import 'leaflet/dist/leaflet.css'
import '../styles/camera.css'

const PhotoReview = lazy(() => import('../components/camera/PhotoReview'))
const AnnotationTools = lazy(() => import('../components/camera/AnnotationTools'))
const VoiceRecorder = lazy(() => import('../components/camera/VoiceRecorder'))
const AISummaryCard = lazy(() => import('../components/camera/AISummaryCard'))

type Detection = {
	id: string
	label: string
	confidence: number
	x: number
	y: number
	w: number
	h: number
}

type PhotoItem = {
	id: string
	url: string
	thumbnailUrl: string
	originalBytes: number
	compressedBytes: number
	file?: File
	compressedBlob?: Blob
	thumbnailBlob?: Blob
	metadata?: {
		latitude: number
		longitude: number
		capturedAtIso: string
		device: string
		accuracyMeters?: number
		heading?: number
	}
	mode: CaptureMode
	createdAt: string
	quality: {
		blur: number
		brightness: number
		exposure: number
		angle: number
		distance: number
		resolution: number
		gpsAvailable: boolean
	}
	detections: Detection[]
	ocrLines: string[]
}

type UploadItem = {
	id: string
	name: string
	progress: number
	status: 'queued' | 'uploading' | 'done' | 'error'
}

function randomIn(min: number, max: number) {
	return Math.round(min + Math.random() * (max - min))
}

function createDetections(mode: CaptureMode): Detection[] {
	const classes = [
		'บ้าน',
		'อาคาร',
		'ที่ดิน',
		'ถนน',
		'เสาไฟ',
		'ประตู',
		'รั้ว',
		'เอกสาร',
		'ยานพาหนะ',
		'ใบหน้าถูกปิดบัง',
		'ป้ายทะเบียนถูกปิดบัง',
	]

	const count = mode === 'document' || mode === 'title-deed' || mode === 'house-registration' ? 2 : 4
	return Array.from({ length: count }).map((_, index) => ({
		id: `${Date.now()}-${index}`,
		label: classes[(index + randomIn(0, classes.length - 1)) % classes.length],
		confidence: Number((0.61 + Math.random() * 0.35).toFixed(2)),
		x: randomIn(8, 65),
		y: randomIn(12, 65),
		w: randomIn(16, 30),
		h: randomIn(12, 26),
	}))
}

function mockOCRLines(mode: CaptureMode): string[] {
	if (mode === 'document' || mode === 'title-deed' || mode === 'house-registration') {
		return [
			'รหัสทรัพย์: FM-982133',
			'เจ้าของ: สมชาย ประดิษฐ์',
			'ขนาดที่ดิน: 1 ไร่ 72 ตร.ว.',
			'สถานะสาธารณูปโภค: น้ำและไฟฟ้าพร้อมใช้งาน',
		]
	}
	return ['มุมภาพภายนอกมีความนิ่ง', 'มองเห็นตัวอาคารชัดเจน', 'บันทึกทางเข้าออกครบถ้วน', 'สภาพแวดล้อมโดยรอบชัดเจน']
}

function formatFileSize(bytes: number) {
	if (!bytes) return '0 KB'
	if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
	return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function revokeBlobUrl(url: string) {
	if (url.startsWith('blob:')) {
		URL.revokeObjectURL(url)
	}
}

async function createCenteredCrop(source: Blob): Promise<File> {
	const image = await new Promise<HTMLImageElement>((resolve, reject) => {
		const objectUrl = URL.createObjectURL(source)
		const node = new Image()
		node.onload = () => {
			URL.revokeObjectURL(objectUrl)
			resolve(node)
		}
		node.onerror = () => {
			URL.revokeObjectURL(objectUrl)
			reject(new Error('ไม่สามารถโหลดรูปเพื่อครอปได้'))
		}
		node.src = objectUrl
	})

	const targetRatio = 4 / 5
	const imageRatio = image.width / image.height
	let cropWidth = image.width
	let cropHeight = image.height

	if (imageRatio > targetRatio) {
		cropWidth = Math.round(image.height * targetRatio)
	} else {
		cropHeight = Math.round(image.width / targetRatio)
	}

	const cropX = Math.max(0, Math.round((image.width - cropWidth) / 2))
	const cropY = Math.max(0, Math.round((image.height - cropHeight) / 2))

	const canvas = document.createElement('canvas')
	canvas.width = cropWidth
	canvas.height = cropHeight
	const context = canvas.getContext('2d')
	if (!context) {
		throw new Error('ไม่สามารถครอปรูปได้')
	}

	context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
	if (!blob) {
		throw new Error('ไม่สามารถสร้างไฟล์ครอปได้')
	}

	return new File([blob], `fieldmate-crop-${Date.now()}.jpg`, { type: 'image/jpeg' })
}

function StandaloneAICamera({ activePropertyId, returnPath }: { activePropertyId: string; returnPath: string }) {
	const navigate = useNavigate()
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const photosRef = useRef<PhotoItem[]>([])
	const {
		videoRef,
		permission,
		error: cameraError,
		torchEnabled,
		torchAvailable,
		loading: cameraLoading,
		requestCamera,
		switchCamera,
		toggleTorch,
		capturePhoto,
	} = useDeviceCamera()
	const [mode, setMode] = useState<CaptureMode>('exterior')
	const [offline, setOffline] = useState(() => !navigator.onLine)
	const [battery] = useState(() => randomIn(72, 96))
	const [gpsReady, setGpsReady] = useState(false)
	const [gps, setGps] = useState({ lat: 13.736717, lon: 100.523186, accuracy: 4.2, altitude: 11.2, direction: 23 })
	const { location, accuracyLevel, requestCurrentPosition } = useLiveLocation({ highAccuracy: true, watch: true, timeoutMs: 12000 })
	const [officer, setOfficer] = useState('เจ้าหน้าที่ภาคสนาม')
	const [photos, setPhotos] = useState<PhotoItem[]>([])
	const [activeIndex, setActiveIndex] = useState(0)
	const [flashActive, setFlashActive] = useState(false)
	const [captureProgress, setCaptureProgress] = useState(0)
	const [reviewMode, setReviewMode] = useState(false)
	const [analysisMode, setAnalysisMode] = useState(false)
	const [savedMode, setSavedMode] = useState(false)
	const [zoom, setZoom] = useState(1)
	const [rotate, setRotate] = useState(0)
	const [cropEnabled, setCropEnabled] = useState(false)
	const [annotationTool, setAnnotationTool] = useState<'draw' | 'arrow' | 'circle' | 'rectangle' | 'text' | 'number'>('draw')
	const [voiceOpen, setVoiceOpen] = useState(false)
	const [recording, setRecording] = useState(false)
	const [voiceSeconds, setVoiceSeconds] = useState(0)
	const [hasClip, setHasClip] = useState(false)
	const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
	const [ocrProgress, setOcrProgress] = useState(0)
	const [ocrStatus, setOcrStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
	const [busyMessage, setBusyMessage] = useState('')
	const [toast, setToast] = useState('')
	const { data: currentOfficer } = useCurrentOfficerQuery()
	const savePropertyMutation = useSavePropertyMutation()

	useEffect(() => {
		if (currentOfficer?.name) setOfficer(currentOfficer.name)
	}, [currentOfficer?.name])

	useEffect(() => {
		void requestCamera('environment')
	}, [requestCamera])

	useEffect(() => {

		const syncNetwork = () => setOffline(!navigator.onLine)
		window.addEventListener('online', syncNetwork)
		window.addEventListener('offline', syncNetwork)

		return () => {
			window.removeEventListener('online', syncNetwork)
			window.removeEventListener('offline', syncNetwork)
		}
	}, [])

	useEffect(() => {
		if (!location) return
		setGpsReady(true)
		setGps({
			lat: location.latitude,
			lon: location.longitude,
			accuracy: location.accuracy,
			altitude: Number((location.altitude || 10).toFixed(1)),
			direction: Number((location.heading || 24).toFixed(0)),
		})
	}, [location])

	useEffect(() => {
		if (!recording) return
		const timer = window.setInterval(() => setVoiceSeconds((current) => current + 1), 1000)
		return () => window.clearInterval(timer)
	}, [recording])

	useEffect(() => {
		if (!toast) return
		const timer = window.setTimeout(() => setToast(''), 2600)
		return () => window.clearTimeout(timer)
	}, [toast])

	useEffect(() => {
		photosRef.current = photos
	}, [photos])

	useEffect(() => {
		return () => {
			photosRef.current.forEach((photo) => {
				revokeBlobUrl(photo.url)
				revokeBlobUrl(photo.thumbnailUrl)
			})
		}
	}, [])

	useEffect(() => {
		if (!uploadItems.length) return

		const timer = window.setInterval(() => {
			setUploadItems((current) =>
				current.map((item) => {
					if (item.status === 'queued') return { ...item, status: 'uploading', progress: 8 }
					if (item.status === 'uploading') {
						const next = Math.min(100, item.progress + randomIn(12, 28))
						if (next >= 100) {
							const failed = Math.random() < 0.08
							return { ...item, progress: 100, status: failed ? 'error' : 'done' }
						}
						return { ...item, progress: next }
					}
					return item
				})
			)
		}, 850)

		return () => window.clearInterval(timer)
	}, [uploadItems.length])

	const activePhoto = photos[activeIndex]

	const liveDetections = useMemo(() => {
		return activePhoto?.detections || createDetections(mode)
	}, [activePhoto, mode])

	const timestamp = useMemo(
		() => formatThaiDateTime(new Date(), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
		[photos.length, mode]
	)

	const aiSummary = useMemo(() => {
		const first = activePhoto
		const confidence = first ? Math.min(97, Math.max(70, first.quality.resolution - 3)) : 82
		const completeness = Math.min(100, photos.length * 18 + (mode === 'document' ? 14 : 8))

		return {
			propertyType: mode === 'land' ? 'แปลงที่ดิน' : mode === 'document' ? 'เอกสารทรัพย์สิน' : 'บ้านเดี่ยว',
			condition: confidence > 84 ? 'สภาพโดยรวมดี' : 'ควรถ่ายมุมเพิ่มเติม',
			risk: mode === 'road' ? 'มีความเสี่ยงด้านการจราจร' : mode === 'land' ? 'ควรตรวจแนวเขตเพิ่มเติม' : 'ความเสี่ยงโครงสร้างต่ำ',
			comments: 'AI แนะนำให้เพิ่มภาพมุมด้านข้างและภาพมิเตอร์สาธารณูปโภคเพื่อให้ข้อมูลประเมินครบถ้วน',
			completeness,
			confidence,
		}
	}, [activePhoto, mode, photos.length])

	const currentQuality = activePhoto?.quality || {
		blur: 79,
		brightness: 75,
		exposure: 81,
		angle: 77,
		distance: 83,
		resolution: 88,
		gpsAvailable: gpsReady,
	}

	const buildPhotoItem = async (url: string, file?: File): Promise<PhotoItem> => {
		const sourceBlob: Blob = file ? file : await fetch(url).then((response) => response.blob())
		const processed = await processPhotoAsset(sourceBlob, {
			latitude: gps.lat,
			longitude: gps.lon,
			accuracyMeters: gps.accuracy,
			heading: gps.direction,
		})
		const compressedUrl = URL.createObjectURL(processed.compressed)
		const ocrLines = await photoRepository.runOcr(activePropertyId, compressedUrl).catch(() => mockOCRLines(mode))
		const thumbnailUrl = URL.createObjectURL(processed.thumbnail)

		return {
			id: `cap-${Date.now()}`,
			url: compressedUrl,
			thumbnailUrl,
			originalBytes: sourceBlob.size,
			compressedBytes: processed.compressed.size,
			file,
			compressedBlob: processed.compressed,
			thumbnailBlob: processed.thumbnail,
			metadata: processed.metadata,
			mode,
			createdAt: new Date().toISOString(),
			quality: {
				blur: randomIn(58, 95),
				brightness: randomIn(55, 94),
				exposure: randomIn(56, 95),
				angle: randomIn(54, 93),
				distance: randomIn(59, 95),
				resolution: randomIn(63, 97),
				gpsAvailable: gpsReady,
			},
			detections: createDetections(mode),
			ocrLines,
		}
	}

	const processCapturedPhoto = async (photo: PhotoItem) => {
		setOcrStatus('running')
		setOcrProgress(8)
		setAnalysisMode(true)
		setReviewMode(false)

		await new Promise<void>((resolve) => {
			let progress = 8
			const timer = window.setInterval(() => {
				progress = Math.min(96, progress + randomIn(8, 18))
				setOcrProgress(progress)
				if (progress >= 96) {
					window.clearInterval(timer)
					resolve()
				}
			}, 180)
		})

		setOcrProgress(100)
		setOcrStatus('done')
		setAnalysisMode(false)
		setToast('วิเคราะห์ภาพสำเร็จ')
	}

	const handleCapture = async () => {
		if (permission !== 'granted') {
			setToast('กรุณาอนุญาตกล้องก่อนถ่ายภาพ')
			return
		}

		setFlashActive(true)
		setCaptureProgress((current) => Math.min(100, current + 8))
		window.setTimeout(() => setFlashActive(false), 220)
		setBusyMessage('กำลังประมวลผลภาพและบีบอัดไฟล์...')

		try {
			const captured = await capturePhoto()
			if (!captured) {
				setToast('ไม่สามารถถ่ายรูปได้ กรุณาลองใหม่อีกครั้ง')
				return
			}

			const next = await buildPhotoItem(captured.url, captured.file)
			revokeBlobUrl(captured.url)

			setPhotos((current) => [next, ...current])
			setActiveIndex(0)
			setSavedMode(false)
			setReviewMode(true)
			setCropEnabled(false)
			setOcrStatus('idle')
			setToast('ถ่ายภาพสำเร็จ')
		} finally {
			setBusyMessage('')
		}
	}

	const openGalleryPicker = () => {
		fileInputRef.current?.click()
	}

	const appendSelectedFiles = async (files: FileList | File[]) => {
		const selectedFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
		if (!selectedFiles.length) return
		setBusyMessage('กำลังเตรียมรูปจากแกลเลอรี...')

		try {
			const photoItems = await Promise.all(
				selectedFiles.map((file) => buildPhotoItem('local-file', file))
			)

			setPhotos((current) => [...photoItems, ...current])
			setActiveIndex(0)
			setReviewMode(true)
			setSavedMode(false)
			setCropEnabled(false)
			setToast('เพิ่มรูปภาพเรียบร้อยแล้ว')
		} finally {
			setBusyMessage('')
		}
	}

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return
		await appendSelectedFiles(event.target.files)
		event.target.value = ''
	}

	const handleDrop = async (event: DragEvent<HTMLButtonElement>) => {
		event.preventDefault()
		if (!event.dataTransfer.files?.length) return
		await appendSelectedFiles(event.dataTransfer.files)
	}

	const downloadActivePhoto = () => {
		if (!activePhoto) return
		const anchor = document.createElement('a')
		anchor.href = activePhoto.url
		anchor.download = activePhoto.file?.name || `fieldmate-${activePhoto.id}.jpg`
		anchor.click()
		setToast('บันทึกรูปลงอุปกรณ์แล้ว')
	}

	const applyCropOnActivePhoto = async () => {
		if (!activePhoto) return
		setBusyMessage('กำลังครอปและบีบอัดรูป...')
		try {
			let sourceBlob: Blob
			if (activePhoto.compressedBlob) {
				sourceBlob = activePhoto.compressedBlob
			} else if (activePhoto.file) {
				sourceBlob = activePhoto.file
			} else {
				sourceBlob = await fetch(activePhoto.url).then((response) => response.blob())
			}
			const croppedFile = await createCenteredCrop(sourceBlob)
			const croppedItem = await buildPhotoItem(URL.createObjectURL(croppedFile), croppedFile)

			setPhotos((current) => {
				const target = current[activeIndex]
				if (target) {
					revokeBlobUrl(target.url)
					revokeBlobUrl(target.thumbnailUrl)
				}
				return current.map((photo, index) => (index === activeIndex ? croppedItem : photo))
			})
			setCropEnabled(false)
			setZoom(1)
			setRotate(0)
			setToast('ครอปรูปสำเร็จแล้ว')
		} catch {
			setToast('ไม่สามารถครอปรูปได้ กรุณาลองอีกครั้ง')
		} finally {
			setBusyMessage('')
		}
	}

	const saveInspection = async () => {
		if (!photos.length) return
		const payloadImages = photos.map((photo) => photo.url)
		await savePropertyMutation.mutateAsync({
			owner: officer,
			province: 'Bangkok',
			latitude: gps.lat,
			longitude: gps.lon,
			marketPrice: 7800000,
			appraisalPrice: 7450000,
			status: 'pending',
			type: aiSummary.propertyType,
			images: payloadImages,
			lastInspection: new Date().toISOString(),
		})

		const initialUploads = photos.map((photo, index) => ({
			id: `up-${Date.now()}-${index}`,
			name: `Inspection-${index + 1}.jpg`,
			progress: 0,
			status: offline ? 'queued' as const : 'uploading' as const,
		}))
		setUploadItems(initialUploads)

		if (!offline) {
			await Promise.all(
				photos.map(async (photo, index) => {
					const uploadId = initialUploads[index].id
					const uploadBlob = photo.compressedBlob || photo.file
					if (!uploadBlob) return

					try {
						await photoRepository.uploadPhoto(uploadBlob, {
							propertyId: 'PROP-BKK-2208',
							thumbnail: photo.thumbnailBlob,
							metadata: photo.metadata,
							onProgress: (progress) => {
								setUploadItems((current) => current.map((item) => item.id === uploadId ? { ...item, progress, status: progress >= 100 ? 'done' : 'uploading' } : item))
							},
						})
					} catch {
						setUploadItems((current) => current.map((item) => item.id === uploadId ? { ...item, status: 'error' } : item))
					}
				})
			)
		}

		setSavedMode(true)
		setAnalysisMode(false)
		setReviewMode(false)
		setToast('บันทึกข้อมูลตรวจสอบสำเร็จ')
	}

	const retryUpload = (id: string) => {
		setUploadItems((current) => current.map((item) => (item.id === id ? { ...item, status: 'uploading', progress: 14 } : item)))
	}

	return (
		<Layout title="กล้อง AI" immersive hideAssistant hideBottomNavigation>
			<div className="cam-page">
				<input ref={fileInputRef} className="cam-hidden-input" type="file" accept="image/*" multiple onChange={handleFileChange} />
				<CameraView
					flashActive={flashActive}
					processing={analysisMode || Boolean(busyMessage) || cameraLoading}
					processingMessage={analysisMode ? `กำลังวิเคราะห์ภาพ... ${ocrProgress}%` : busyMessage || 'กำลังเปิดกล้อง...'}
					media={(
						<>
							<video ref={videoRef} className={`cam-live-video ${permission === 'granted' ? 'is-visible' : ''}`} autoPlay playsInline muted />
							{permission !== 'granted' ? (
								<div className="cam-permission-state">
									<strong>{cameraLoading ? 'กำลังเปิดกล้อง...' : permission === 'denied' ? 'ปฏิเสธสิทธิ์กล้อง' : 'พร้อมเปิดกล้องสำหรับการสำรวจ'}</strong>
									<span>{cameraError || 'รองรับ Android, iPhone, PWA และ Cloudflare Pages พร้อมทางเลือกเลือกรูปจากแกลเลอรีเสมอ'}</span>
									<div className="cam-permission-actions">
										<button type="button" className="cam-save-btn" onClick={() => void requestCamera('environment')}>ลองเปิดกล้องอีกครั้ง</button>
										<button type="button" className="cam-save-btn" onClick={openGalleryPicker}>เลือกจากแกลเลอรี</button>
									</div>
								</div>
							) : null}
						</>
					)}
				>
					<TopCameraBar
						offline={offline}
						aiEnabled
						battery={battery}
						gpsReady={gpsReady}
						flashEnabled={torchEnabled}
						flashAvailable={torchAvailable}
						onToggleFlash={() => void toggleTorch()}
						onSwitchCamera={() => void switchCamera()}
						onBack={() => (reviewMode || analysisMode || savedMode ? (setReviewMode(false), setAnalysisMode(false), setSavedMode(false)) : navigate(returnPath))}
					/>

					<CameraOverlay
						aid="FM-AI-2092"
						propertyId={activePropertyId}
						level={Math.sin((Date.now() / 1000) * 1.6) * 22}
						compass={gps.direction}
						gpsAccuracy={gps.accuracy}
						timestamp={timestamp}
						detections={liveDetections}
					/>

					<GPSOverlay lat={gps.lat} lon={gps.lon} altitude={gps.altitude} direction={gps.direction} accuracy={gps.accuracy} />

					<div className="cam-overlay-bottom">
						<CaptureModes active={mode} onChange={setMode} />
						<BottomToolbar
							onGallery={openGalleryPicker}
							onCapture={() => void handleCapture()}
							onAIScan={() => activePhoto ? void processCapturedPhoto(activePhoto) : setToast('กรุณาถ่ายรูปหรือเลือกรูปก่อน')}
							onVoice={() => setVoiceOpen((current) => !current)}
							onMore={() => setReviewMode(true)}
							captureProgress={captureProgress}
						/>
					</div>
				</CameraView>

				<section className="cam-panel-stack">
					<button type="button" className="cam-dropzone" onClick={openGalleryPicker} onDragOver={(event) => event.preventDefault()} onDrop={(event) => void handleDrop(event)}>
						<strong>ถ่ายรูป หรือเลือกรูปจากอุปกรณ์</strong>
						<span>รองรับการเลือกจากคลังรูปภาพ และลากวางไฟล์บนเดสก์ท็อป</span>
					</button>

					{reviewMode ? (
						<Suspense fallback={<div className="cam-lazy">กำลังโหลดตัวอย่างภาพ...</div>}>
							<PhotoReview
								photos={photos}
								index={activeIndex}
								zoom={zoom}
								rotate={rotate}
								cropEnabled={cropEnabled}
								onPrev={() => setActiveIndex((current) => Math.max(0, current - 1))}
								onNext={() => setActiveIndex((current) => Math.min(photos.length - 1, current + 1))}
								onZoom={setZoom}
								onRotate={() => setRotate((current) => current + 90)}
								onToggleCrop={() => setCropEnabled((current) => !current)}
								onApplyCrop={() => void applyCropOnActivePhoto()}
								onRetake={() => {
									if (!photos[activeIndex]) return
									const removed = photos[activeIndex]
									revokeBlobUrl(removed.url)
									revokeBlobUrl(removed.thumbnailUrl)
									setPhotos((current) => current.filter((_, index) => index !== activeIndex))
									setReviewMode(false)
									setZoom(1)
									setRotate(0)
									setCropEnabled(false)
									setActiveIndex(0)
									setToast('ลบภาพเดิมแล้ว พร้อมถ่ายภาพใหม่')
								}}
								onAccept={() => {
									if (activePhoto) {
										void processCapturedPhoto(activePhoto)
									}
								}}
								onDelete={() => {
									if (!photos[activeIndex]) return
									const removed = photos[activeIndex]
									revokeBlobUrl(removed.url)
									revokeBlobUrl(removed.thumbnailUrl)
									setPhotos((current) => current.filter((_, index) => index !== activeIndex))
									setActiveIndex(0)
									setToast('ลบรูปภาพแล้ว')
								}}
								onSaveImage={downloadActivePhoto}
							/>
						</Suspense>
					) : null}

					{reviewMode ? (
						<Suspense fallback={null}>
							<AnnotationTools active={annotationTool} onChange={setAnnotationTool} />
						</Suspense>
					) : null}

					{voiceOpen ? (
						<Suspense fallback={null}>
							<VoiceRecorder
								recording={recording}
								seconds={voiceSeconds}
								hasClip={hasClip}
								onRecord={() => setRecording(true)}
								onStop={() => {
									setRecording(false)
									setHasClip(true)
								}}
								onPlay={() => undefined}
								onAttach={() => setVoiceOpen(false)}
							/>
						</Suspense>
					) : null}

					<QualityIndicator metrics={currentQuality} />

					<OCRPreview text={activePhoto?.ocrLines || mockOCRLines(mode)} documentDetected={mode === 'document' || mode === 'title-deed' || mode === 'house-registration'} progress={ocrProgress} status={ocrStatus} />

					{analysisMode ? (
						<Suspense fallback={<div className="cam-lazy">กำลังวิเคราะห์ภาพ...</div>}>
							<AISummaryCard
								propertyType={aiSummary.propertyType}
								condition={aiSummary.condition}
								risk={aiSummary.risk}
								comments={aiSummary.comments}
								completeness={aiSummary.completeness}
								confidence={aiSummary.confidence}
							/>
							<button type="button" className="cam-save-btn" onClick={saveInspection}>บันทึกข้อมูลตรวจสอบ</button>
						</Suspense>
					) : null}

					{savedMode ? (
						<>
							<UploadProgress items={uploadItems} onRetry={retryUpload} />
							<button type="button" className="cam-save-btn" onClick={() => navigate('/assessment')}>ไปยังหน้าประเมิน AI</button>
							<button type="button" className="cam-save-btn" onClick={() => navigate('/shared-intelligence')}>เปิดข้อมูลทรัพย์สินส่วนกลาง</button>
						</>
					) : null}

					<section className="cam-metadata">
						<h3>ข้อมูลภาพถ่าย</h3>
						<div className="cam-metadata-grid">
							<div><span>วันที่</span><strong>{formatThaiDate(new Date())}</strong></div>
							<div><span>เวลา</span><strong>{formatThaiTime(new Date())}</strong></div>
							<div><span>ผู้ใช้งาน</span><strong>{officer}</strong></div>
							<div><span>โครงการ</span><strong>ฟีลด์เมต ไพรม์</strong></div>
							<div><span>รหัสทรัพย์</span><strong>{activePropertyId}</strong></div>
							<div><span>สภาพอากาศ</span><strong>เมฆมาก 31 องศา</strong></div>
							<div><span>ตำแหน่ง</span><strong>{gps.lat.toFixed(5)}, {gps.lon.toFixed(5)}</strong></div>
							<div><span>ความแม่นยำ</span><strong>{accuracyLevel === 'high' ? 'สูง' : accuracyLevel === 'medium' ? 'ปานกลาง' : 'ต่ำ'} ({gps.accuracy} ม.)</strong></div>
							<div><span>อุปกรณ์</span><strong>{activePhoto?.metadata?.device ? 'สมาร์ตโฟน (บันทึกข้อมูลอุปกรณ์แล้ว)' : 'สมาร์ตโฟน'}</strong></div>
							<div><span>แนวภาพ</span><strong>แนวตั้ง</strong></div>
							<div><span>ขนาดภาพเดิม</span><strong>{activePhoto ? formatFileSize(activePhoto.originalBytes) : 'ยังไม่มีภาพ'}</strong></div>
							<div><span>หลังบีบอัด</span><strong>{activePhoto ? formatFileSize(activePhoto.compressedBytes) : 'ยังไม่มีภาพ'}</strong></div>
						</div>
						<button type="button" className="cam-save-btn" onClick={requestCurrentPosition}>อัปเดตตำแหน่ง GPS</button>
					</section>

					{toast ? <div className="cam-toast">{toast}</div> : null}
				</section>
			</div>
		</Layout>
	)
}

export default function AICamera() {
	const [searchParams] = useSearchParams()
	const propertyId = searchParams.get('propertyId')
	const surveyId = searchParams.get('surveyId')
	const sourcePhotoId = searchParams.get('photoId') || undefined
	const initialCategory = searchParams.get('category') || undefined
	const returnTo = searchParams.get('returnTo') === 'assessment' ? 'assessment' as const : 'survey' as const

	if (propertyId && surveyId) return <SurveyAICamera propertyId={propertyId} surveyId={surveyId} sourcePhotoId={sourcePhotoId} initialCategory={initialCategory as SurveyPhotoType | undefined} returnTo={returnTo} />
	return <StandaloneAICamera activePropertyId="PROP-BKK-2208" returnPath="/map" />
}
