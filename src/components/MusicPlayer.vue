<template>
  <div id="music-player-wrapper" @click.stop>
    <div class="controller-wrapper">
      <playlist
        ref="playlist"
        :songList="songList"
        :currentIndex="currentIndex"
        @remove="removeListSong($event)"
        @play="playListSong($event)"
        v-show="showList"
      ></playlist>
      <div class="controll-btn">
        <i class="el-icon-download backward" @click="switchSong(1)"></i>
        <i
          :class="[playButtonType, 'play-btn']"
          @click="isPlaying ? pauseSong() : playSong()"
        ></i>
        <i class="el-icon-download afterward" @click="switchSong(2)"></i>
      </div>
      <div class="album-picture">
        <img :src="albumPicture" alt="" @error="getReloadSong()" />
        <div class="img-mask"></div>
      </div>
      <div class="main-info">
        <div class="song-title-wrapper">
          <span class="song-title" @click="goToLyric()">{{ title }}</span>
        </div>
        <div class="song-process-wrapper">
          <audio
            ref="playerDom"
            :src="url"
            controls="controls"
            @canplay="audioLoaded()"
            @error="getReloadSong()"
            @ended="songLoop()"
            class="original-audio"
            v-show="false"
          ></audio>
          <div class="process-container">
            <Slider
              :barLength="500"
              :barWeight="8"
              :verticalMode="false"
              :currentPosition="processHandlePosition"
              :forbidden="duration == 0"
              :autoPlay="true"
              :isReady="songReady"
              @setPosition="setProcess($event)"
              @dragMouseDown="dragProcessMouseDown()"
              @dragMouseMove="dragProcessMouseMove($event)"
              @dragMouseUp="dragProcessMouseUp()"
            ></Slider>
          </div>
          <div class="process-duration">
            {{ $filters.formatDate(currentTime) }} /
            {{ $filters.formatDate(duration) }}
          </div>
        </div>
      </div>
      <div class="right-controller">
        <div class="icon-wrapper">
          <img
            class="volume-icon"
            @click="toggleVolumeController($event)"
            :src="volumeOn ? volumeOnIcon : volumeOffIcon"
            alt=""
          />
          <div v-if="showVolumeController" class="volume-controller-container">
            <Slider
              :barLength="130"
              :barWeight="6"
              :verticalMode="true"
              :currentPosition="volumeHandlePosition"
              :forbidden="false"
              :autoPlay="false"
              :isReady="true"
              @setPosition="setVolume($event)"
              @dragMouseMove="dragVolumeMouseMove($event)"
            ></Slider>
          </div>
        </div>
        <div class="icon-wrapper">
          <div v-if="loopMode == 1" class="loop-icon-num">1</div>
          <i
            :class="['loop-mode-icon', loopModeIcon]"
            @click="switchLoopMode()"
          ></i>
        </div>
        <div class="icon-wrapper">
          <i
            :class="[
              'show-list-icon',
              showList ? 'el-icon-s-fold' : 'el-icon-s-unfold',
            ]"
            @click="toggleList()"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import playlist from "@/components/PlayList.vue";
import Slider from "@/components/Slider.vue";
import { getStorageInfo } from "@/utils/musicUtils";
import Bus from "@/bus";
import volumeOnIconPng from "@/assets/icon/volume-on.png";
import volumeOffIconPng from "@/assets//icon/volume-off.png";
import { computed, onMounted, ref, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { SongDetail, StorageInfo } from '@/service/interface';

export default {
  name: "musicplayer",
  components: { playlist, Slider },

  setup() {
    const currentIndex = ref<number>(0); // 当前播放编号
    const songList = ref<SongDetail[] | any>([]); // 歌单
    const songReady = ref(false); // 歌曲加载状态
    const isPlaying = ref(false); // 播放状态
    const loopMode = ref(0); // 列表循环模式
    const showList = ref(false); // 列表显示开关
    const currentTime = ref(0); // 当前进度
    const duration = ref(0); // 歌曲总时长
    const processChecker = ref(); // 走条计时器
    const volumeOn = ref(true); // 音量开关
    const showVolumeController = ref(false); // 显示音量滑块
    const currentVolume = ref(70); // 当前音量
    const maxVolume = ref(100); // 最大音量
    const volumeOnIcon = ref(volumeOnIconPng); // 音量开图标
    const volumeOffIcon = ref(volumeOffIconPng); // 音量关图标
    const playerDom = ref(); // audio, 用HTMLAudioElement报错暂时不会修

    const route = useRoute();

    onMounted(() => {
      Bus.on("playerAddSong", (song) => {
        addSong(song);
      });
      Bus.on("skipByLyric", (process) => {
        setProcessByLyric(process);
      });
      const storageInfo: StorageInfo = getStorageInfo();
      setStorageInfo(storageInfo);
    });
    onUnmounted(() => clearInterval(processChecker.value));

    watch(currentIndex, (index) =>
      localStorage.setItem("currentIndex", String(index))
    );
    watch(currentVolume, (volume) => {
      const volumeRate = volume / maxVolume.value;
      playerDom.value.volume = volumeRate;
      localStorage.setItem("volumeRate", String(volumeRate));
    });
    watch(
      () => songList.value,
      (list) => {
        localStorage.setItem("playList", JSON.stringify(list));
      },
      { deep: true }
    );
    watch(loopMode, (mode) => localStorage.setItem("loopMode", String(mode)));
    watch(
      () => [songReady.value, isPlaying.value],
      ([readyState, playState]) => {
        if (readyState && playState) {
          setTimeout(() => {
            playerDom.value.play();
            Bus.emit("setPlayState", true);
          }, 10);
        } else {
          Bus.emit("setPlayState", false);
        }
      }
    );

    const title = computed(() => {
      if (songList.value.length === 0) {
        return "";
      }
      return songList.value[currentIndex.value].title || "";
    });
    const url = computed(() => {
      if (songList.value.length === 0) {
        return "";
      }
      return songList.value[currentIndex.value].url || "";
    });
    const albumPicture = computed(() => {
      if (songList.value.length === 0) {
        return "";
      }
      return songList.value[currentIndex.value].albumPicture || "";
    });
    const playButtonType = computed(() => {
      return isPlaying.value ? "el-icon-video-pause" : "el-icon-video-play";
    });
    const processHandlePosition = computed(() => {
      if (duration.value === 0) {
        return 0;
      } else {
        return (currentTime.value / duration.value) * 100;
      }
    });
    const loopModeIcon = computed(() => {
      switch (loopMode.value) {
        case 0:
          return "el-icon-refresh";
        case 1:
          return "el-icon-refresh-left";
        default:
          return "el-icon-refresh";
      }
    });
    const volumeHandlePosition = computed(() => {
      return (currentVolume.value / maxVolume.value) * 100;
    });

    const setStorageInfo = (storageInfo: StorageInfo) => {
      songList.value = storageInfo.songList ? storageInfo.songList : [];
      currentIndex.value = storageInfo.currentIndex;
      currentVolume.value = storageInfo.currentVolume;
      loopMode.value = storageInfo.loopMode;
    };
    const audioLoaded = () => {
      songReady.value = true;
      checkCurrentProcess();
    };
    const getReloadSong = () => {
      songReady.value = false;
      // 歌单为空时触发，强行获取id会报错
      if (songList.value.length === 0) {
        return;
      }
      const songId = songList.value[currentIndex.value].id;
      Bus.emit("addSongDetail", songId);
    };
    const addSong = (song: SongDetail) => {
      if (songList.value.length !== 0) {
        checkDuplicate(song);
      } else {
        songList.value.push(song);
        currentIndex.value = songList.value.length - 1;
      }
      playSong();
    };
    const checkDuplicate = (song: SongDetail) => {
      const listLength = songList.value.length;
      for (let i = 0; i <= listLength; i++) {
        if (song.id === songList.value[i].id) {
          songList.value[i] = song;
          currentIndex.value = i;
          i = listLength;
          return;
        }
        if (i === listLength - 1) {
          songList.value.push(song);
          currentIndex.value = songList.value.length - 1;
          return;
        }
      }
    };
    const playSong = () => {
      isPlaying.value = false;
      if (songList.value.length === 0) {
        return;
      }
      clearInterval(processChecker.value);
      isPlaying.value = true;
      processChecker.value = setInterval(() => {
        checkCurrentProcess();
      }, 200);
      if (route.name === "musiclyric") {
        Bus.emit("goToLyric", songList.value[currentIndex.value].id);
      }
    };
    const pauseSong = () => {
      isPlaying.value = false;
      playerDom.value.pause();
      clearInterval(processChecker.value);
    };
    const checkCurrentProcess = () => {
      duration.value = playerDom.value.duration;
      currentTime.value = playerDom.value.currentTime;
      Bus.emit("checkLyricProcess", currentTime.value);
    };
    const switchSong = (type: number) => {
      if (type === 1) {
        if (currentIndex.value === 0) {
          currentIndex.value = songList.value.length - 1;
        } else {
          currentIndex.value--;
        }
      }
      if (type === 2) {
        if (currentIndex.value === songList.value.length - 1) {
          currentIndex.value = 0;
        } else {
          currentIndex.value++;
        }
      }
      if (isPlaying.value) {
        playSong();
      } else {
        currentTime.value = 0;
      }
    };
    const switchLoopMode = () => {
      const modeCount = 2; // 现有2种播放顺序
      if (loopMode.value < modeCount - 1) {
        loopMode.value++;
      } else {
        loopMode.value = 0;
      }
    };
    const songLoop = () => {
      if (loopMode.value === 0) {
        switchSong(2);
      } else {
        playSong();
      }
    };
    const toggleList = () => {
      showList.value = !showList.value;
    };
    const removeListSong = (index: number) => {
      if (currentIndex.value === index) {
        return;
      }
      if (currentIndex.value > index) {
        currentIndex.value--;
      }
      songList.value.splice(index, 1);
    };
    const playListSong = (index: number) => {
      currentIndex.value = index;
      playSong();
    };

    // 进度条控制组件
    const setProcess = (barRate: number) => {
      currentTime.value = duration.value * barRate;
      playerDom.value.currentTime = currentTime.value;
    };
    const dragProcessMouseDown = () => {
      clearInterval(processChecker.value);
    };
    const dragProcessMouseMove = (barRate: number) => {
      currentTime.value = barRate * duration.value;
    };
    const dragProcessMouseUp = () => {
      playerDom.value.currentTime = currentTime.value;
      processChecker.value = setInterval(() => {
        checkCurrentProcess();
      }, 200);
    };
    // 点击歌词跳转进度
    const setProcessByLyric = (process: number) => {
      if (isPlaying.value) {
        playerDom.value.currentTime = process;
      }
    };
    // 音量控制组件
    const setVolume = (barRate: number) => {
      currentVolume.value = maxVolume.value * barRate;
      volumeOn.value = barRate !== 0;
    };
    const dragVolumeMouseMove = (barRate: number) => {
      setVolume(barRate);
    };
    //
    const toggleVolumeController = (e: Event) => {
      // 避免点击控制条时触发
      const targetElement = e.target as HTMLElement;
      if (targetElement.className !== "volume-icon") {
        return;
      }
      showVolumeController.value = !showVolumeController.value;
      if (showVolumeController.value) {
        document.body.addEventListener("click", removeVolumeController, false);
      }
    };
    const removeVolumeController = () => {
      showVolumeController.value = false;
      document.body.removeEventListener("click", removeVolumeController, false);
    };
    const goToLyric = () => {
      Bus.emit("goToLyric", songList.value[currentIndex.value].id);
      setTimeout(() => {
        if (isPlaying.value) {
          Bus.emit("setPlayState", true);
        }
      }, 10);
    };

    return {
      currentIndex,
      songList,
      songReady,
      isPlaying,
      loopMode,
      showList,
      currentTime,
      duration,
      processChecker,
      volumeOn,
      showVolumeController,
      currentVolume,
      maxVolume,
      volumeOnIcon,
      volumeOffIcon,
      playerDom,

      title,
      url,
      albumPicture,
      playButtonType,
      processHandlePosition,
      loopModeIcon,
      volumeHandlePosition,

      audioLoaded,
      getReloadSong,
      addSong,
      playSong,
      pauseSong,
      switchSong,
      switchLoopMode,
      songLoop,
      toggleList,
      removeListSong,
      playListSong,
      setProcess,
      dragProcessMouseDown,
      dragProcessMouseMove,
      dragProcessMouseUp,
      setProcessByLyric,
      setVolume,
      dragVolumeMouseMove,
      toggleVolumeController,
      goToLyric,
    };
  },
};
</script>

<style lang="less">
#music-player-wrapper {
  position: relative;
  width: 100%;
  text-align: center;
  border-top: 1px solid black;
  box-shadow: 0 0 4px black;
  background-color: rgba(0, 0, 0, 0.75);
  user-select: none;
}
.controller-wrapper {
  position: relative;
  width: 900px;
  margin: auto;
  cursor: default;
  .controll-btn {
    position: relative;
    font-size: 26px;
    line-height: 50px;
    color: #bbb;
    display: inline-block;
    i {
      cursor: pointer;
    }
    i:hover {
      color: white;
      text-shadow: 0 0 4px white;
    }
    .play-btn {
      font-size: 40px;
      line-height: 36px;
      color: #ddd;
    }
    .backward {
      line-height: 36px;
      transform: rotate(90deg);
    }
    .afterward {
      line-height: 36px;
      transform: rotate(-90deg);
    }
    i {
      vertical-align: middle;
    }
  }
  .album-picture {
    position: relative;
    margin: 4px 8px;
    width: 50px;
    height: 50px;
    line-height: 50px;
    background-color: black;
    border: 1px solid black;
    border-radius: 6px;
    box-shadow: 0 0 1px black;
    vertical-align: middle;
    overflow: hidden;
    display: inline-block;
    img {
      position: absolute;
      max-width: 100%;
      max-height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
    }
    .img-mask {
      width: 0;
      height: 0;
      border-top: 50px solid white;
      border-right: 50px solid transparent;
      opacity: 0.15;
    }
  }
  .main-info {
    position: relative;
    margin: 4px;
    width: 600px;
    height: 50px;
    text-align: left;
    vertical-align: middle;
    display: inline-block;
    .song-title-wrapper {
      position: relative;
      width: auto;
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      color: #e8e8e8;
      text-align: left;
      .song-title {
        width: 580px;
        display: inline-block;
        cursor: pointer !important;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .song-process-wrapper {
      position: relative;
      width: 600px;
      height: 16px;
      display: inline-block;
      .original-audio {
        position: absolute;
        top: -100px;
      }
      .process-container {
        position: relative;
        top: -4px;
        display: inline-block;
      }
      .process-duration {
        position: relative;
        top: -4px;
        margin-left: 12px;
        font-size: 12px;
        font-weight: 500;
        line-height: 12px;
        color: #999;
        display: inline-block;
      }
    }
  }
  .right-controller {
    position: relative;
    display: inline-block;
    .icon-wrapper {
      position: relative;
      margin: auto 0 auto 8px;
      display: inline-block;
      cursor: pointer;
      .volume-icon {
        position: relative;
        vertical-align: middle;
        width: 20px;
      }
      .volume-controller-container {
        position: absolute;
        padding-top: 16px;
        padding-bottom: 0px;
        left: -6px;
        top: -180px;
        width: 30px;
        height: 145px;
        background-color: rgba(0, 0, 0, 0.6);
        cursor: default;
      }
      .loop-mode-icon {
        position: relative;
        vertical-align: middle;
        font-size: 20px;
        color: #bbb;
        display: inline-block;
      }
      .loop-icon-num {
        position: absolute;
        color: #bbb;
        left: 7px;
        top: 4px;
        font-size: 6px;
        font-weight: 500;
      }
      .show-list-icon {
        position: relative;
        vertical-align: middle;
        font-size: 20px;
        color: #bbb;
        display: inline-block;
      }
    }
  }
}
</style>
