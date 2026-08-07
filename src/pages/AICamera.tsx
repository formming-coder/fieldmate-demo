import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCurrentOfficerQuery, useSavePropertyMutation } from '../hooks/useBackendQueries'
import CameraView from '../components/camera/CameraView'
import CaptureModes, { CaptureMode } from '../components/camera/CaptureModes'
import TopCameraBar from '../components/camera/TopCameraBar'
import BottomToolbar from '../components/camera/BottomToolbar'
import CameraOverlay from '../components/camera/CameraOverlay'
import GPSOverlay from '../components/camera/GPSOverlay'
import QualityIndicator from '../components/camera/QualityIndicator'
import OCRPreview from '../components/camera/OCRPreview'
import UploadProgress from '../components/camera/UploadProgress'
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
		'House',
		'Building',
		'Land',
		'Road',
		'Pole',
		'Gate',
		'Fence',
		'Document',
		'Vehicle',
		'Blurred Face',
		'Blurred Plate',
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
			'Property ID: FM-982133',
			'Owner: Somchai Pradit',
			'Land Area: 1 Rai 72 Sq.wah',
			'Utility Status: Active Water/Electric',
		]
	}
	return ['Exterior frame stable', 'Facade visibility good', 'Road access captured', 'Environment context clear']
}

const DEMO_FRAMES = [
	'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=960&q=80',
	'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=960&q=80',
	'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=960&q=80',
	'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=960&q=80',
]

export default function AICamera() {
	const navigate = useNavigate()
	const [mode, setMode] = useState<CaptureMode>('exterior')
	const [offline, setOffline] = useState(() => !navigator.onLine)
	const [battery] = useState(() => randomIn(72, 96))
	const [gpsReady, setGpsReady] = useState(false)
	const [gps, setGps] = useState({ lat: 13.736717, lon: 100.523186, accuracy: 4.2, altitude: 11.2, direction: 23 })
	const [officer, setOfficer] = useState('Field Officer')
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
	const { data: currentOfficer } = useCurrentOfficerQuery()
	const savePropertyMutation = useSavePropertyMutation()

	useEffect(() => {
		if (currentOfficer?.name) setOfficer(currentOfficer.name)
	}, [currentOfficer?.name])

	useEffect(() => {

		const syncNetwork = () => setOffline(!navigator.onLine)
		window.addEventListener('online', syncNetwork)
		window.addEventListener('offline', syncNetwork)

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				setGpsReady(true)
				setGps({
					lat: position.coords.latitude,
					lon: position.coords.longitude,
					accuracy: Number(position.coords.accuracy.toFixed(1)),
					altitude: Number((position.coords.altitude || 10).toFixed(1)),
					direction: Number((position.coords.heading || 24).toFixed(0)),
				})
			})
		}

		return () => {
			window.removeEventListener('online', syncNetwork)
			window.removeEventListener('offline', syncNetwork)
		}
	}, [])

	useEffect(() => {
		if (!recording) return
		const timer = window.setInterval(() => setVoiceSeconds((current) => current + 1), 1000)
		return () => window.clearInterval(timer)
	}, [recording])

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
		() => new Date().toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
		[photos.length, mode]
	)

	const aiSummary = useMemo(() => {
		const first = activePhoto
		const confidence = first ? Math.min(97, Math.max(70, first.quality.resolution - 3)) : 82
		const completeness = Math.min(100, photos.length * 18 + (mode === 'document' ? 14 : 8))

		return {
			propertyType: mode === 'land' ? 'Land Plot' : mode === 'document' ? 'Property Document' : 'Detached House',
			condition: confidence > 84 ? 'Well maintained' : 'Needs follow-up capture',
			risk: mode === 'road' ? 'Road congestion risk' : mode === 'land' ? 'Boundary uncertainty' : 'Low structural risk',
			comments: 'AI suggests adding one side-angle image and one utility meter close-up for complete valuation evidence.',
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

	const capturePhoto = () => {
		setFlashActive(true)
		setCaptureProgress((current) => Math.min(100, current + 8))
		window.setTimeout(() => setFlashActive(false), 220)

		const next: PhotoItem = {
			id: `cap-${Date.now()}`,
			url: DEMO_FRAMES[(photos.length + randomIn(0, DEMO_FRAMES.length - 1)) % DEMO_FRAMES.length],
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
			ocrLines: mockOCRLines(mode),
		}

		setPhotos((current) => [next, ...current])
		setActiveIndex(0)
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

		setUploadItems(payloadImages.map((_, index) => ({
			id: `up-${Date.now()}-${index}`,
			name: `Inspection-${index + 1}.jpg`,
			progress: 0,
			status: offline ? 'queued' : 'uploading',
		})))

		setSavedMode(true)
		setAnalysisMode(false)
		setReviewMode(false)
	}

	const retryUpload = (id: string) => {
		setUploadItems((current) => current.map((item) => (item.id === id ? { ...item, status: 'uploading', progress: 14 } : item)))
	}

	return (
		<Layout title="AI Camera Pro" immersive hideAssistant hideBottomNavigation>
			<div className="cam-page">
				<CameraView flashActive={flashActive} processing={analysisMode}>
					<TopCameraBar
						offline={offline}
						aiEnabled
						battery={battery}
						gpsReady={gpsReady}
						onBack={() => (reviewMode || analysisMode || savedMode ? (setReviewMode(false), setAnalysisMode(false), setSavedMode(false)) : navigate('/map'))}
					/>

					<CameraOverlay
						aid="FM-AI-2092"
						propertyId="PROP-BKK-2208"
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
							onGallery={() => setReviewMode(true)}
							onCapture={capturePhoto}
							onAIScan={() => setAnalysisMode(true)}
							onVoice={() => setVoiceOpen((current) => !current)}
							onMore={() => setReviewMode(true)}
							captureProgress={captureProgress}
						/>
					</div>
				</CameraView>

				<section className="cam-panel-stack">
					{reviewMode ? (
						<Suspense fallback={<div className="cam-lazy">Loading review...</div>}>
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
								onRetake={() => {
									setReviewMode(false)
									setZoom(1)
									setRotate(0)
								}}
								onAccept={() => {
									setAnalysisMode(true)
									setReviewMode(false)
								}}
								onDelete={() => {
									if (!photos[activeIndex]) return
									setPhotos((current) => current.filter((_, index) => index !== activeIndex))
									setActiveIndex(0)
								}}
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

					<OCRPreview text={activePhoto?.ocrLines || mockOCRLines(mode)} documentDetected={mode === 'document' || mode === 'title-deed' || mode === 'house-registration'} />

					{analysisMode ? (
						<Suspense fallback={<div className="cam-lazy">Analyzing...</div>}>
							<AISummaryCard
								propertyType={aiSummary.propertyType}
								condition={aiSummary.condition}
								risk={aiSummary.risk}
								comments={aiSummary.comments}
								completeness={aiSummary.completeness}
								confidence={aiSummary.confidence}
							/>
							<button type="button" className="cam-save-btn" onClick={saveInspection}>Save Inspection</button>
						</Suspense>
					) : null}

					{savedMode ? (
						<>
							<UploadProgress items={uploadItems} onRetry={retryUpload} />
							<button type="button" className="cam-save-btn" onClick={() => navigate('/assessment')}>Continue to AI Property Assessment</button>
							<button type="button" className="cam-save-btn" onClick={() => navigate('/shared-intelligence')}>Open Shared Property Intelligence</button>
						</>
					) : null}

					<section className="cam-metadata">
						<h3>Capture Metadata</h3>
						<div className="cam-metadata-grid">
							<div><span>Date</span><strong>{new Date().toLocaleDateString('th-TH')}</strong></div>
							<div><span>Time</span><strong>{new Date().toLocaleTimeString('th-TH')}</strong></div>
							<div><span>User</span><strong>{officer}</strong></div>
							<div><span>Project</span><strong>Fieldmate Prime</strong></div>
							<div><span>Property</span><strong>PROP-BKK-2208</strong></div>
							<div><span>Weather</span><strong>Cloudy 31C</strong></div>
							<div><span>Location</span><strong>{gps.lat.toFixed(5)}, {gps.lon.toFixed(5)}</strong></div>
							<div><span>Device</span><strong>iPhone Pro</strong></div>
							<div><span>Orientation</span><strong>Portrait</strong></div>
						</div>
					</section>
				</section>
			</div>
		</Layout>
	)
}
