import { SongDetail, StorageInfo } from '../service/interface'

export const formatSongDetail = (originInfo: any) => {
	const songBasicInfo = originInfo[0].songs[0];
	const songUrl = originInfo[1].data[0].url;
	const song: SongDetail = {
		title: songBasicInfo.name,
		duration: songBasicInfo.dt / 1000,
		author: songBasicInfo.ar[0].name,
		albumName: songBasicInfo.al.name,
		id: songBasicInfo.id,
		albumPicture: songBasicInfo.al.picUrl,
		url: songUrl,
	};
	return song;
}

export const formatSongList = (songs: any) => {
	// 暂时不做翻页，只用前24首
	const length = songs.length > 24 ? 24 : songs.length;
	const songList: SongDetail[] = []
	for (let i = 0; i < length; i++) {
		const song: SongDetail = {};
		song.id = songs[i].id;
		song.title = songs[i].name;
		song.duration = songs[i].duration / 1000;
		song.author = songs[i].artists[0].name;
		song.albumName = songs[i].album.name;
		songList.push(song);
	}
	return songList
};

export const getStorageInfo = () => {
	const storageList = dealStorageItem("playList");
	const currentIndex = dealStorageItem("currentIndex", mapValToNumber);
	const storageVolumeRate = dealStorageItem("volumeRate", mapValToNumber);
	const storageLoopMode = dealStorageItem("loopMode", mapValToNumber);

	const defaultCurrentIndex = 0;
	const defaultCurrentValue = 20;
	const defaultMaxVolume = 100;
	const defaultLoopMode = 0;

	const storageInfo: StorageInfo = {};
	storageInfo.songList = (storageList !== null) ? JSON.parse(storageList) : [];
	storageInfo.currentIndex = (currentIndex !== null) ? currentIndex : defaultCurrentIndex;
	storageInfo.currentVolume = (storageVolumeRate !== null) ? storageVolumeRate * defaultMaxVolume : defaultCurrentValue;
	storageInfo.loopMode = (storageLoopMode !== null) ? storageLoopMode : defaultLoopMode

	return storageInfo;
};

function dealStorageItem(itemName: string): string | null
function dealStorageItem<T>(itemName: string, mapper: (val: string | null) => T): T | null
function dealStorageItem<T>(itemName: string, mapper?: (val: string | null) => T): T | string | null {
	const storageItem = localStorage.getItem(itemName)
	return mapper ? mapper(storageItem) : storageItem
}

const mapValToNumber = (val: string | null): number | null => val ? Number(val) : null;

