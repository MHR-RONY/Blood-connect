/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string
	readonly NODE_ENV: string
	// Add more environment variables here as needed
	// readonly VITE_CLOUDINARY_CLOUD_NAME: string
	// readonly VITE_GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
