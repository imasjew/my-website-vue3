<template>
  <div class="page-wrapper">
    <router-view />
    <div class="song-controller" v-show="showController">
      <musicplayer></musicplayer>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import httpService from "@/service/http.service";
import musicplayer from "@/components/MusicPlayer.vue";
import Bus from "@/bus";
import { useRouter } from 'vue-router';
import { formatSongDetail } from '@/utils/musicUtils'

export default {
  name: "music",
  components: { musicplayer },
  setup() {
    const showController = ref("true");
    const router = useRouter();

    onMounted(() => {
      setBusListener();
      window.addEventListener(
        "popstate",
        () => {
          setBusListener();
        },
        false
      );
    });

    onUnmounted(() => {
      document.body.removeEventListener("popstate", setBusListener, false);
      Bus.all.clear();
    })

    const setBusListener = () => {
      Bus.on("addSongDetail", (songId) => {
        addSongDetail(songId);
      });
      Bus.on("goToLyric", (songId) => {
        goToLyric(songId);
      });
      Bus.on("goToMusicList", (songTitle) => {
        goToMusicList(songTitle);
      });
    }
    const addSongDetail = (songId: number) => {
      httpService.getFullSongDetail(songId).then(
        (res) => {
          const songDetail = formatSongDetail(res);
          Bus.emit("playerAddSong", songDetail);
        },
        (err) => {
          console.log("getSongDetail获取失败", err);
        }
      );
    }

    const goToLyric = (songId: number) => {
      router.push({
        path: "/home/music/musiclyric",
        query: { id: songId },
      });
    }
    const goToMusicList = (title: string) => {
      router.push({
        path: "/home/music/musiclist",
        query: { name: title },
      });
    }

    return {
      showController,
    };
  },

};
</script>

<style lang="less">
.page-wrapper {
  position: relative;
  width: 100%;
}
.song-controller {
  position: fixed;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
}
</style>
