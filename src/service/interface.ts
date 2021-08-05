export interface SongDetail {
	title?: string;
	duration?: number;
	author?: string;
	albumName?: string;
	id?: number;
	albumPicture?: string;
	url?: string;
};
export interface StorageInfo {
	songList?: object;
	currentIndex?: number;
	currentVolume?: number;
	loopMode?: number;
}