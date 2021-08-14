import { SongDetail, StorageInfo, FormedLyric } from '../service/interface'

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
		const song: SongDetail = {
			id: songs[i].id,
			title: songs[i].name,
			duration: songs[i].duration / 1000,
			author: songs[i].artists[0].name,
			albumName: songs[i].album.name,
		};
		songList.push(song);
	}
	return songList
};

export const dealLyric = (originLyric: any): FormedLyric[] => {
	// 歌词分句
	const lyricArray = originLyric.split("\n");
	lyricArray.pop();
	const dealedLyricArray: FormedLyric[] = [];
	// 每一句再通过"]"拆成时间+歌词
	for (const i in lyricArray) {
		lyricArray[i] = lyricArray[i].substring(1, lyricArray[i].length);
		lyricArray[i] = lyricArray[i].split("]");
		// 如果歌词中出现"]"造成多余拆分，合并之
		const nowArray = lyricArray[i];
		if (nowArray.length > 2) {
			while (nowArray.length > 2) {
				nowArray[1] = nowArray[1].concat(nowArray[2]);
				nowArray.splice(2, 1);
			}
		}
		dealedLyricArray.push({
			time: lyricTimeFormat(lyricArray[i][0]),
			lyric: lyricArray[i][1],
		});
	}
	return dealedLyricArray;
};

const lyricTimeFormat = (originTime: any) => {
	const splitedTime = originTime.split(/[:]/);
	const dealedTime = splitedTime[0] * 60 + parseFloat(splitedTime[1]);
	return dealedTime;
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

	const storageInfo: StorageInfo = {
		songList: (storageList !== null) ? JSON.parse(storageList) : [],
		currentIndex: (currentIndex !== null) ? currentIndex : defaultCurrentIndex,
		currentVolume: (storageVolumeRate !== null) ? storageVolumeRate * defaultMaxVolume : defaultCurrentValue,
		loopMode: (storageLoopMode !== null) ? storageLoopMode : defaultLoopMode
	};

	return storageInfo;
};

function dealStorageItem(itemName: string): string | null
function dealStorageItem<T>(itemName: string, mapper: (val: string | null) => T): T | null
function dealStorageItem<T>(itemName: string, mapper?: (val: string | null) => T): T | string | null {
	const storageItem = localStorage.getItem(itemName)
	return mapper ? mapper(storageItem) : storageItem
}

const mapValToNumber = (val: string | null): number | null => val ? Number(val) : null;

