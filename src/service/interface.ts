export interface SongDetail {
	title: string;
	duration: number;
	author: string;
	albumName: string;
	id: number;
	albumPicture?: string;
	url?: string;
}
export interface StorageInfo {
	songList?: SongDetail[];
	currentIndex: number;
	currentVolume: number;
	loopMode: number;
}

export interface FormedLyric {
	time: number;
	lyric: string;
}