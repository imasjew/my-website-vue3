// import { SongList } from '../service/interface'
// interface SongDetail {
// 	title?: string;
// 	duration?: number;
// 	author?: string;
// 	albumName?: string;
// 	id?: number;
// 	albumPicture?: string;
// 	url?: string;
// }

export const formatSongDetail = (originInfo) => {
	const songBasicInfo = originInfo[0].songs[0];
	const songUrl = originInfo[1].data[0].url;
	const song = {
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

export const formatSongList = (songs) => {
	// 暂时不做翻页，只用前24首
	const length = songs.length > 24 ? 24 : songs.length;
	const songList = []
	for (let i = 0; i < length; i++) {
		let song;
		song.id = songs[i].id;
		song.title = songs[i].name;
		song.duration = songs[i].duration / 1000;
		song.author = songs[i].artists[0].name;
		song.albumName = songs[i].album.name;
		songList.push(song);
	}
	return songList
};