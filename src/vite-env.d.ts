/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string
	readonly VITE_UPLOAD_BASE_URL: string
	readonly VITE_GOOGLE_MAPS_API_KEY: string
	readonly VITE_API_BASE_URL: string
	readonly VITE_R2_UPLOAD_BASE_URL: string
	readonly VITE_CLOUDFLARE_ENV: 'development' | 'production' | string
	readonly VITE_MS_CLIENT_ID: string
	readonly VITE_MS_AUTHORITY: string
	readonly VITE_MS_REDIRECT_URI: string
	readonly VITE_MS_SCOPES: string
	readonly VITE_ENTRA_CLIENT_ID: string
	readonly VITE_ENTRA_AUTHORITY: string
	readonly VITE_ENTRA_REDIRECT_URI: string
	readonly VITE_ENTRA_SCOPES: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
